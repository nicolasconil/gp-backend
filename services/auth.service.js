import * as UserRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateRefreshToken, generateToken } from "../middleware/auth.middleware.js";
import { sendPasswordResetEmail } from "../middleware/email.middleware.js";


export const authenticateUser = async (email, password) => {
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');
    const user = await UserRepository.getUserByEmailHash(emailHash);
    if (!user) throw new Error('Usuario no encontrado.');
    if (!['administrador', 'moderador'].includes(user.role)) {
        throw new Error('Acceso denegado: rol no autorizado.');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Contraseña incorrecta.');

    const token = generateToken(user._id, user.role, true);
    const refreshToken = generateRefreshToken(user._id, user.role);
    return { token, refreshToken, userId: user._id, role: user.role };
};

export const resetUserPassword = async (token, newPassword) => {
    const user = await UserRepository.findByResetToken(token);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
};

export const requestPasswordReset = async (email) => { // solicita el restablecimiento de la contraseña
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');
    const user = await UserRepository.getUserByEmailHash(emailHash);
    if (!user || !['administrador', 'moderador'].includes(user.role)) throw new Error('Usuario no encontrado o rol no autorizado.');
    
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = Date.now() + 3600000;
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
    await sendPasswordResetEmail(email, user.role, resetUrl)
};

export const validateResetPasswordToken = async (token) => {
    const user = await UserRepository.findByResetToken(token);
    if (!user || user.resetPasswordExpires < Date.now()) {
        throw new Error('Token inválido o expirado.');
    }
    return user;
};