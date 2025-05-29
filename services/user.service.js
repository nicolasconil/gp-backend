import * as UserRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import { encryptUserFields, decryptUserFields } from "../utils/dataPrivacity.js";
import crypto from "crypto";

export const getAll = async () => {
    const users = await UserRepository.getAllUsers();
    return users.map(decryptUserFields);
};

export const getById = async (id) => {
    try {
        const user = await UserRepository.getUserById(id);
        if (!user) throw new Error('Usuario no encontrado.');
        return decryptUserFields(user);
    } catch (error) {
        throw new Error('ID inválido o usuario no encontrado.');
    }
};

export const getByEmail = async (email) => {
    const normalized = email.toLowerCase();
    const emailHash = crypto.createHash('sha256').update(normalized).digest('hex');
    const user = await UserRepository.getUserByEmailHash(emailHash);
    if (!user) throw new Error('Usuario no encontrado.');
    return user;
};

export const update = async (id, data) => {
    const encryptedData = encryptUserFields(data);
    const updated = await UserRepository.updateUser(id, encryptedData);
    return decryptUserFields(updated);
};

export const remove = async (id) => {
    try {
        const user = await UserRepository.getUserById(id);
        if (!user) throw new Error('Usuario no encontrado.');
        return await UserRepository.deleteUser(id);
    } catch (error) {
        throw new Error('ID inválido o usuario no encontrado.');
    }
};

export const setVerificationToken = async (userId, token, expires) => {
    return await UserRepository.updateUser(userId, {
        verificationToken: token,
        verificationExpires: expires
    });
};

export const setPasswordResetToken = async (userId, token, expires) => {
    return await UserRepository.updateUser(userId, {
        resetPasswordToken: token,
        resetPasswordExpires: expires
    });
};

export const verifyUserEmail = async (token) => {
    const user = await UserRepository.findByVerificationToken(token);
    if (!user) throw new Error('Token de verificación inválido o expirado.');
    if (new Date() > user.verificationExpires) {
        throw new Error('El token de verificación ha expirado.');
    }
    return await UserRepository.updateUser(user._id, {
        isEmailVerified: true,
        verificationToken: null,
        verificationExpires: null
    });
};

export const resetUserPassword = async (token, newPassword) => {
    const user = await UserRepository.findByResetToken(token);
    if (!user) throw new Error('Token de recuperación inválido o expirado.');
    if (new Date() > user.resetPasswordExpires) {
        throw new Error('El token de recuperación ha expirado.');
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    return await UserRepository.updateUser(user._id, {
        password: hash,
        resetPasswordToken: null,
        resetPasswordExpires: null
    });
};

export const updateConsent = async (userId, consentData) => {
    const user = await UserRepository.getUserById(userId);
    if (!user) throw new Error('Usuario no encontrado.');
    user.consent = {
        ...user.consent,
        ...consentData,
        acceptedAt: new Date()
    };
    await user.save();
    return decryptUserFields(user);
};

export const getSubscribers = async () => {
    try {
        return await UserRepository.getSubscribers();
    } catch (error) {
        throw new Error(`Error en el servicio de suscripciones: ${error.message}`);
    }
};

export const getUserWithOrders = async (id) => {
    try {
        const user = await UserRepository.getUserWithOrders(id);
        if (!user) throw new Error('Usuario no encontrado.');
        return decryptUserFields(user);
    } catch (error) {
        throw new Error('ID inválido o usuario no encontrado.');
    }
};