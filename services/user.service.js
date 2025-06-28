import * as UserRepository from "../repositories/user.repository.js";
import crypto from "crypto";

export const getAll = async () => {
    return await UserRepository.getAllUsers();
};

export const getById = async (id) => {
    const user = await UserRepository.getUserById(id);
    if (!user) throw new Error('Usuario no encontrado.');
    return user;
};

export const getByEmail = async (email) => {
    const normalized = email.toLowerCase();
    const emailHash = crypto.createHash('sha256').update(normalized).digest('hex');
    const user = await UserRepository.getUserByEmailHash(emailHash);
    if (!user) throw new Error('Usuario no encontrado.');
    return user;
};

export const update = async (id, data) => {
    return await UserRepository.updateUser(id, data);
};

export const remove = async (id) => {
    const user = await UserRepository.getUserById(id);
    if (!user) throw new Error('Usuario no encontrado.');
    return await UserRepository.deleteUser(id);
};
