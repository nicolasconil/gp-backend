import mongoose from "mongoose";
import User from "../models/user.model.js";

// validación de ObjectId antes de realizar la consulta
const validateObjectId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('ID inválido');
    }
};

export const getAllUsers = async () => {
    return await User.find();
};

export const getUserById = async (id) => {
    validateObjectId(id);
    return await User.findById(id);
};

export const getUserByEmailHash = async (emailHash) => {
    return await User.findOne({ emailHash });
};

export const updateUser = async (id, data) => {
    validateObjectId(id);
    return await User.findByIdAndUpdate(id, data, { new: true });
};

export const deleteUser = async (id) => {
    validateObjectId(id);
    return await User.findByIdAndDelete(id);
};
