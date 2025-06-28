import Shipping from "../models/shipping.model.js";

export const createShipping = async (data) => {
    const newShipping = await Shipping.create(data);
    return await Shipping.findById(newShipping._id).populate('order');
};

export const getAllShippings = async () => {
    return await Shipping.find().populate('order');
};

export const getShippingById = async (id) => {
    return await Shipping.findById(id).populate('order');
};

export const updateShipping = async (id, updateData) => {
    return await Shipping.findByIdAndUpdate(id, updateData, { new: true }).populate('order');
};

export const deleteShipping = async (id) => {
    return await Shipping.findByIdAndDelete(id);
};

export const getShippingOrderById = async (orderId) => {
    return await Shipping.findOne({ order: orderId }).populate('order');
};