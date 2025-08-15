import * as UserRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateRefreshToken, generateToken } from "../middleware/auth.middleware.js";

export const authenticateUser = async (email, password, userAgent) => {
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
    const user = await UserRepository.getUserByEmailHash(emailHash);
    if (!user) throw new Error('Usuario no encontrado.');
    if (!['administrador', 'moderador'].includes(user.role)) {
        throw new Error('Acceso denegado: rol no autorizado.');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Contraseña incorrecta.');
    const token = generateToken(user._id, user.role, true);
    const refreshToken = generateRefreshToken(user._id, user.role, true);
    await UserRepository.addSession(user._id, {
        refreshToken,
        userAgent,
        createdAt: new Date()
    });
    return { token, refreshToken, userId: user._id, role: user.role };
};

export const resetUserPassword = async (email, newPassword) => {
    const emailHash = crypto.createHash('sha256').update(email.toLowerCase()).digest('hex');
    const user = await UserRepository.getUserByEmailHash(emailHash);
    if (!user) throw new Error('Usuario no encontrado.');
    user.password = newPassword;
    await user.save();
};
