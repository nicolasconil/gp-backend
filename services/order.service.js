import * as OrderRepository from "../repositories/order.repository.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { sendOrderConfirmationEmail, sendShippingNotificationEmail } from "../middleware/email.middleware.js";
import path from "path";
import { decryptText } from "../utils/encryption.js";

export const create = async (orderData) => {
    const order = await OrderRepository.createOrder(orderData);
    try {
        await processAfterOrder(order);
    } catch (error) {
        throw new Error(`Error procesando la orden: ${error.message}.`);
    }
    return order;
};

export const getAll = async (queryParams) => {
    return await OrderRepository.getAllOrders(queryParams);
};

export const getById = async (id) => {
    const order = await OrderRepository.getOrderById(id);
    if (!order) throw new Error('Pedido no encontrado');
    return order;
};

export const updateStatus = async (id, status) => {
    return await OrderRepository.updateOrderStatus(id, status);
};

export const remove = async (id) => {
    return await OrderRepository.deleteOrder(id);
};

export const getOrdersByUserId = async (userId) => {
    return await OrderRepository.getOrdersByUserId(userId);
};

export const updatePaymentInfo = async (orderId, paymentInfo) => {
    const updateData = {
        status: paymentInfo.status === 'approved' ? 'procesando' : 'pendiente',
        payment: paymentInfo
    };
    const updatedOrder = await OrderRepository.updateOrder(orderId, updateData);
    if (paymentInfo.status === 'approved') {
        await processAfterOrder(updatedOrder);
    }
    return updatedOrder;
};

export const updateFields = async (id, fields) => {
    const updatedOrder = await OrderRepository.updateOrder(id, fields);
    if (['enviado', 'entregado'].includes(fields.status)) {
        try {
            const email = updatedOrder.user?.email ? decryptText(updatedOrder.user.email) : updatedOrder.guestEmail;
            const name = updatedOrder.user?.name ? decryptText(updatedOrder.user.name) : 'Cliente';
            if (email) {
                await sendShippingNotificationEmail(email, name, updatedOrder._id, updatedOrder.shipping?.trackingNumber || 'N/A', updatedOrder.shipping?.method || 'N/A');
            }
        } catch (error) {
            throw new Error(`Error enviando la notificación de envío: ${error.message}.`);
        }
    }
    return updatedOrder;
};

export const dispatchOrder = async (id, shippingTrackingNumber) => {
    const order = await OrderRepository.getOrderById(id);
    if (!order) throw new Error('Orden no encontrada para despachar.');
    const updatedOrder = await OrderRepository.updateOrder(id, { status: 'enviado', 'shipping.trackingNumber': shippingTrackingNumber });
    try {
        const email = updatedOrder.user?.email ? decryptText(updatedOrder.user.email) : updatedOrder.guestEmail;
        const name = updatedOrder.user?.name ? decryptText(updatedOrder.user.name) : 'Cliente';
        if (email) {
            await sendShippingNotificationEmail(email, name, updatedOrder._id, shippingTrackingNumber, updatedOrder.shipping?.method || 'N/A');
        }
    } catch (error) {
        throw new Error(`Error enviando email de despacho: ${error.message}.`);
    }
    return updatedOrder;
};

export const processAfterOrder = async (order) => {
    try {
        const invoicePath = path.resolve(
            process.cwd(),
            'invoices',
            `factura-${order._id}.pdf`
        )
        await generateInvoice(order, invoicePath);
        const email = order.user?.email ? decryptText(order.user.email) : order.guestEmail;
        const name = order.user?.name ? decryptText(order.user.name) : 'Cliente';
        if (email) {
            await sendOrderConfirmationEmail(email, name, order._id, order.totalAmount, invoicePath);
        }
    } catch (error) {
        throw new Error(`Error en procesar la orden: ${error.message}.`);
    }
};