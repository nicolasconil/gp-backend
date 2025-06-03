import Shipping from "../models/shipping.model.js";
import { encryptGuestInfo, decryptGuestInfo, decryptUserFields } from "../utils/dataPrivacity.js";

const decryptShippingFields = (shippingObj) => {
    if (shippingObj.guestInfo) {
        shippingObj.guestInfo = decryptGuestInfo(shippingObj.guestInfo);
    }
    if (shippingObj.deliveryAddress) {
        decryptUserFields(shippingObj.deliveryAddress);
    }
    return shippingObj;
};

export const createShipping = async (data) => {
    if (data.guestInfo) {
        data.guestInfo = encryptGuestInfo(data.guestInfo);
    }
    const newShipping = await Shipping.create(data);
    const shipping = await Shipping.findById(newShipping._id).populate('order');
    return decryptShippingFields(shipping.toObject());
};

export const getAllShippings = async () => {
    const shippings = await Shipping.find().populate('order');
    return shippings.map((s) => decryptShippingFields(s.toObject()));
};

export const getShippingById = async (id) => {
    const shipping = await Shipping.findById(id).populate('order');
    if (!shipping) return null;
    return decryptShippingFields(shipping.toObject());
};

export const updateShipping = async (id, updateData) => {
    if (updateData.guestInfo) {
        updateData.guestInfo  = encryptGuestInfo(updateData.guestInfo);
    }
    const updatedShipping = await Shipping.findByIdAndUpdate(id, updateData, { new: true }).populate('order');
    if (!updateShipping) return null;
    return decryptShippingFields(updatedShipping.toObject());
};

export const deleteShipping = async (id) => {
    return await Shipping.findByIdAndDelete(id);
};

export const getShippingOrderById = async (orderId) => {
    const shipping = await Shipping.findOne({ order: orderId }).populate('order');
    if (!shipping) return null;
    return decryptShippingFields(shipping.toObject());
};