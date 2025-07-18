import mongoose from "mongoose";
import * as OrderRepository from "../repositories/order.repository.js";
import * as StockMovementRepository from "../repositories/stockMovement.repository.js";
import * as ShippingService from "../services/shipping.service.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { sendOrderConfirmationEmail, sendShippingNotificationEmail } from "../middleware/email.middleware.js";
import path from "path";
import crypto from "crypto";

export const create = async (orderData) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const cancelToken = crypto.randomBytes(24).toString('hex');
        orderData.cancelToken = cancelToken;
        for (const item of orderData.items) {
            await StockMovementRepository.createStockMovement(
                {
                    product: item.product,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                    movementType: 'venta',
                    note: `Orden en proceso`,
                    createdBy: orderData.user,
                }, session);
        }
        const order = await OrderRepository.createOrder(orderData, session);
        await session.commitTransaction();
        session.endSession();
        await processAfterOrder(order);
        return order;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(`Error procesando la orden: ${error.message}.`);
    }
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
        if (!updatedOrder.shipping) {
            await ShippingService.createShippingForOrder(updatedOrder._id);
        }
    }
    return updatedOrder;
};

export const updateFields = async (id, fields) => {
    const updatedOrder = await OrderRepository.updateOrder(id, fields);
    return updatedOrder;
};

export const dispatchOrder = async (id, shippingTrackingNumber) => {
    const updatedOrder = await OrderRepository.updateOrder(id, { status: 'enviado', 'shipping.shippingTrackingNumber': shippingTrackingNumber });
    try {
        const email = updatedOrder.guestEmail;
        const name = updatedOrder.guestName || 'Cliente';
        const carrier = updatedOrder.shipping?.shippingMethod || 'N/A';
        if (email) {
            await sendShippingNotificationEmail(
                email,
                name,
                updatedOrder._id,
                shippingTrackingNumber,
                carrier
            );
        }
    } catch (error) {
        throw new Error(`Error enviando email de despacho: ${error.message}`);
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

        const email = order.guestEmail;
        const name = order.guestName || 'Cliente';

        if (email) {
            await sendOrderConfirmationEmail(
                email,
                name,
                order._id,
                order.totalAmount,
                invoicePath,
                order.cancelToken
            );
        }
    } catch (error) {
        throw new Error(`Error en procesar la orden: ${error.message}.`);
    }
};

export const getOrdersForShipping = async () => {
    return await OrderRepository.getOrdersForShipping();
};