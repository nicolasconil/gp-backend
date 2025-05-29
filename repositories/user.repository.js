import mongoose from "mongoose";
import User from "../models/user.model.js";
import crypto from "crypto";

// validación de ObjectId antes de realizar la consulta
const validateObjectId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID inválido');
    }
};

export const getAllUsers = async () => {
    try {
        return await User.find();
    } catch (error) {
        throw new Error(`Error al obtener todos los usuarios: ${error.message}.`);
    }
};

export const getUserById = async (id) => {
    validateObjectId(id);
    try {
        return await User.findById(id);
    } catch (error) {
        throw new Error(`Error al obtener el usuario con ID ${id}: ${error.message}.`);
    }
};

export const getUserByEmailHash = async (emailHash) => {
    try {
        return await User.findOne({ emailHash });
    } catch (error) {
        throw new Error(`Error al obtener el usuario con emailHash ${emailHash}: ${error.message}.`);
    }
};

export const createUser = async (data) => {
    try {
        const emailHash = crypto.createHash('sha256').update(data.email.toLowerCase()).digest('hex');
        const user = new User({ ...data, emailHash });
        return await user.save();
    } catch (error) {
        throw new Error(`Error al crear el usuario: ${error.message}.`);
    }
};

export const updateUser = async (id, data) => {
    validateObjectId(id);
    try {
        return await User.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
        throw new Error(`Error al actualizar el usuario con ID ${id}: ${error.message}.`);
    }
};

export const deleteUser = async (id) => {
    validateObjectId(id);
    try {
        return await User.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(`Error al eliminar el usuario con ID ${id}: ${error.message}.`);
    }
};

export const findByVerificationToken = async (token) => {
    try {
        return await User.findOne({ verificationToken: token });
    } catch (error) {
        throw new Error(`Error al buscar el usuario por token de verificación: ${error.message}.`);
    }
};

export const findByResetToken = async (token) => {
    try {
        return await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
    } catch (error) {
        throw new Error(`Error al buscar el usuario por token de reset de contraseña: ${error.message}.`);
    }
};

export const getSubscribers = async () => {
    try {
        const subscribers = await User.find({ 'consent.newsletter': true }).select('email');
        return subscribers.map(user => user.email);
    } catch (error) {
        throw new Error(`Error al obtener los usuarios suscriptos al newsletter: ${error.message}`);
    }
};

export const getUserWithOrders = async (id) => {
    validateObjectId(id);
    try {
        return await User.findById(id).populate('orders');
    } catch (error) {
        throw new Error(`Error al obtener el usuario con ID ${id} y sus órdenes: ${error.message}.`);
    }
};
