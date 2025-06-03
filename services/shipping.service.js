import * as ShippingRepository from "../repositories/shipping.repository.js";

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

export const updateShipppingStatus = async (id, status) => {
    return await ShippingRepository.updateShipping(id, { status });
};

export const deleteShipping = async (id) => {
    return await ShippingRepository.deleteShipping(id);
};