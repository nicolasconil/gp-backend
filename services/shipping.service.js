import * as ShippingRepository from "../repositories/shipping.repository.js";
import Order from "../models/order.model.js";
import { sendShippingNotificationEmail } from "../middleware/email.middleware.js";

export const createShipping = async (data) => {
    return await ShippingRepository.createShipping(data);
};

export const getAllShippings = async () => {
    return await ShippingRepository.getAllShippings();
};

export const getShippingById = async (id) => {
    return await ShippingRepository.getShippingById(id);
};

export const getShippingOrderById = async (orderId) => {
    const shipping = await ShippingRepository.getShippingOrderById(orderId);
    return shipping;
};

export const updateShipping = async (id, updateData) => {
    const shipping = await ShippingRepository.getShippingById(id);
    if (!shipping) {
        throw new Error('Envío no encontrado.');
    }
    shipping.status = updateData.status || shipping.status;
    shipping.shippingTrackingNumber = updateData.shippingTrackingNumber || shipping.shippingTrackingNumber;
    shipping.carrier = updateData.carrier || shipping.carrier;
    shipping.method = updateData.method || shipping.method;
    return await ShippingRepository.updateShipping(shipping._id, {
        status: shipping.status,
        shippingTrackingNumber: shipping.shippingTrackingNumber,
        carrier: shipping.carrier,
        method: shipping.method,
    });
};

export const updateShippingStatus = async (orderId, payload) => {
    const { status, shippingTrackingNumber, carrier, method } = payload;
    const shipping = await ShippingRepository.getShippingOrderById(orderId);
    if (!shipping) {
        throw new Error('Envío no encontrado.');
    }
    const previousStatus = shipping.status;
    shipping.status = status;
    if (shippingTrackingNumber) shipping.shippingTrackingNumber = shippingTrackingNumber;
    if (carrier) shipping.carrier = carrier;
    if (method) shipping.method = method;
    const updatedShipping = await ShippingRepository.updateShipping(shipping._id, {
        status: shipping.status,
        shippingTrackingNumber: shipping.shippingTrackingNumber,
        carrier: shipping.carrier,
        method: shipping.method
    });
    if (["en camino", "entregado"].includes(status)) {
        const order = await Order.findById(orderId);
        if (!order) throw new Error('Orden no encontrada para el envío.');
        const email = order.guestEmail || order.user?.email;
        const name = order.guestName || order.user?.name || 'Cliente';
        if (email) {
            await sendShippingNotificationEmail(
                email,
                name,
                order._id,
                shipping.shippingTrackingNumber,
                carrier,
                status === "entregado"
            );
        }
    }
    return updatedShipping;
};

export const deleteShipping = async (id) => {
    return await ShippingRepository.deleteShipping(id);
};

export const updateShippingTracking = async (orderId, shippingTrackingNumber) => {
    const shipping = await ShippingRepository.getShippingOrderById(orderId);
    if (!shipping) throw new Error('Envío no encontrado para la orden.');
    return await ShippingRepository.updateShipping(shipping._id, { shippingTrackingNumber });
};

export const createShippingForOrder = async (orderId, overrides = {}, session = null) => {
    if (!orderId) {
        throw new Error('ID de la orden no proporcionado.');
    }
    const order = await Order.findById(orderId).session(session);
    if (!order) {
        throw new Error('Orden no encontrada.');
    }
    const existingShipping = await ShippingRepository.getShippingOrderById(orderId);
    if (existingShipping) return existingShipping;
    const shippingData = {
        order: order._id,
        deliveryAddress: {
            fullName: order.guestName || order.user?.name || 'Cliente',
            phone: order.guestPhone || order.user?.phone || '',
            street: order.guestAddress?.street || '',
            number: order.guestAddress?.number || '',
            apartment: order.guestAddress?.apartment || '',
            city: order.guestAddress?.city || '',
            province: order.guestAddress?.province || '',
        },
        destinationPostalCode: order.guestAddress?.postalCode || '',
        shippingTrackingNumber: null,
        status: 'pendiente',
        ...overrides,
    };
    const newShipping = await ShippingRepository.createShipping(shippingData);
    order.shipping = newShipping._id;
    await order.save({ session });
    return newShipping;
};  