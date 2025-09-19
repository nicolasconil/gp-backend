import mongoose from "mongoose";
import * as OrderRepository from "../repositories/order.repository.js";
import * as StockMovementRepository from "../repositories/stockMovement.repository.js";
import * as ShippingService from "../services/shipping.service.js";
import { generateInvoice } from "../utils/invoiceGenerator.js";
import { sendOrderConfirmationEmail, sendShippingNotificationEmail, sendUpdateStatusEmail } from "../middleware/email.middleware.js";

import path from "path";
import crypto from "crypto";

export const create = async (orderData) => {
    const session = await mongoose.startSession();
    let committed = false;
    try {
        session.startTransaction();
        const cancelToken = crypto.randomBytes(24).toString('hex');
        orderData.cancelToken = cancelToken;

        const order = await OrderRepository.createOrder(orderData, session);
        if (!order || !order._id) {
            throw new Error('No se pudo crear la orden, la orden es inválida.');
        }
        const shipping = await ShippingService.createShippingForOrder(order._id, {}, session);
        order.shipping = shipping._id;
        await order.save({ session });
        for (const item of orderData.products) {
            await StockMovementRepository.createStockMovement(
                {
                    product: item.product,
                    size: item.size,
                    color: item.color,
                    quantity: Math.abs(item.quantity),
                    movementType: 'venta',
                    note: `Orden ${order._id} creada`,
                    createdBy: orderData.user,
                },
                session
            );
        }
        await session.commitTransaction();
        committed = true;
        session.endSession();
        return order;
    } catch (error) {
        if (!committed) {
            await session.abortTransaction();
        }
        session.endSession();
        throw new Error(`No se pudo crear la orden: ${error.message}`);
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
    try {
        const updatedOrder = await OrderRepository.updateOrderStatus(id, status);
        const email = updatedOrder.guestEmail;
        const name = updatedOrder.guestName || 'Cliente';
        if (email) {
            await sendUpdateStatusEmail(
                email,
                name,
                updatedOrder._id,
                status
            );
        }
        return updatedOrder;
    } catch (error) {
        throw new Error(`Error al actualizar el estado de la orden: ${error.message}`);
    }
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
    const order = await OrderRepository.getOrderById(id);
    if (!order) {
        throw new Error('Orden no encontrada.');
    }
    let shipping;
    if (order.shipping) {
        shipping = await ShippingService.getShippingById(order.shipping);
        if (!shipping) {
            throw new Error('El envío asociado no fue encontrado.');
        }
        shipping.trackingNumber = shippingTrackingNumber;
        shipping.status = 'en camino';
        await shipping.save();
    } else {
        shipping = await ShippingService.createShippingForOrder(order._id, {
            trackingNumber: shippingTrackingNumber,
            status: 'en camino',
        });
        order.shipping = shipping._id;
    }
    order.status = 'enviado';
    await order.save();
    try {
        const email = order.guestEmail;
        const name = order.guestName || 'Cliente';
        const carrier = shipping?.shippingMethod || 'N/A';
        if (email) {
            await sendShippingNotificationEmail(
                email,
                name,
                order._id,
                shippingTrackingNumber,
                carrier
            );
        }
    } catch (error) {
        throw new Error(`Error enviando email de despacho: ${error.message}.`);
    }
    const updatedOrder = await OrderRepository.getOrderById(order._id);
    return updatedOrder;
};

export const processAfterOrder = async (order) => {
    if (!order || !order._id) {
        throw new Error('Orden inválida para procesamiento posterior.');
    }
    try {
        const invoicePath = path.resolve(
            process.cwd(),
            'invoices',
            `comprobante-${order._id}.pdf`
        );
        await generateInvoice(order, invoicePath);

        const email = order.guestEmail || (order.user && order.user.email) || order.user?.email;
        const name = order.guestName || (order.user && order.user.name) || 'Cliente';

        if (email) {
            await sendOrderConfirmationEmail(
                email,
                name,
                order._id,
                order.totalAmount,
                invoicePath,
                order
            );
        } else {
            logger.warn(`No se envió comprobante por email: no se encontró email para orden ${order._id}`);
        }
    } catch (error) {
        throw new Error(`Error en procesar la orden: ${error.message}.`);
    }
};

export const getOrdersForShipping = async () => {
    return await OrderRepository.getOrdersForShipping();
};