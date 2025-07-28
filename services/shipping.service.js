import * as ShippingRepository from "../repositories/shipping.repository.js";
import Order from "../models/order.model.js";

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
    return await ShippingRepository.getShippingOrderById(orderId);
};

export const updateShipping = async (id, updateData) => {
    return await ShippingRepository.updateShipping(id, updateData);
};

export const updateShippingStatus = async (id, status) => {
    return await ShippingRepository.updateShipping(id, { status });
};

export const deleteShipping = async (id) => {
    return await ShippingRepository.deleteShipping(id);
};

export const updateShippingTracking = async (orderId, shippingTrackingNumber) => {
    const shipping = await ShippingRepository.getShippingOrderById(orderId);
    if (!shipping) throw new Error('Envío no encontrado para la orden.');
    return await ShippingRepository.updateShipping(shipping._id, { shippingTrackingNumber });
};

export const createShippingForOrder = async (orderId) => {
    if (!orderId) {
        throw new Error('ID de la orden no proporcionado.');
    }
    const order = await Order.findById(orderId);
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
    };
    return await ShippingRepository.createShipping(shippingData);
};