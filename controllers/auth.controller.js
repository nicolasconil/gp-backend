import * as AuthService from "../services/auth.service.js";
import * as UserService from "../services/user.service.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";

const refreshSecretKey = process.env.REFRESH_SECRET_KEY;
if (!refreshSecretKey) {
    throw new Error('La clave REFRESH_SECRET_KEY debe estar definida.')
};

export const createUser = async (req, res) => {
    try {
        const email = req.body.email?.toLowerCase();
        req.body.email = email;
        const existingUser = await UserService.getByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.'});
        }
        const newUser = await AuthService.registerUser(req.body);
        logger.info(`POST /register - Usuario creado con ID: ${newUser._id}.`);
        res.status(201).json(newUser);
    } catch (error) {
        logger.error(`POST /register - ${error.message}`);  
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const lowerEmail = email?.toLowerCase();
        const { token, refreshToken, userId, role } = await AuthService.authenticateUser(lowerEmail, password);
        logger.info(`/POST /login - Usuario ${userId} autenticado correctamente.`);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 60 * 60 * 1000
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({ message: 'Inicio de sesión exitoso.', role });
    } catch (error) {
        logger.error(`/POST /login - ${error.message}`);
        res.status(401).json({ message: error.message });
    }
};

export const logout = (req, res) => {
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    logger.info(`POST /logout - Usuario deslogueado.`);
    res.status(200).json({ message: 'Sesión cerrada correctamente.' });
};

export const refreshAccessToken = (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'No se proporcionó refresh token.' });
        }
        const decoded = jwt.verify(refreshToken, refreshSecretKey);
        const newAccessToken = jwt.sign({
            id: decoded.id,
            role: decoded.role,
            isEmailVerified: decoded.isEmailVerified
        }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 60 * 60 * 1000
        });
        res.status(200).json({ message: 'Token actualizado.' });
    } catch (error) {
        logger.error(`POST /refresh-token - ${error.message}.`);
        res.status(401).json({ message: 'Refresh token inválido o expirado.' });
    }
};

export const verifyEmail = async (req, res) => {
    const { token } = req.query;
    try {
        await AuthService.verifyUserEmail(token);
        res.redirect(`${process.env.FRONTEND_URL}/verified-email`);
    } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/verification-error`);
    }
};

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        await AuthService.requestPasswordReset(email);
        res.status(200).json({ message: 'Correo de restablecimiento enviado.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const validateResetToken = async (req, res) => {
    const { token } = req.query;
    try {
        await AuthService.validateResetPasswordToken(token);
        res.status(200).json({ message: 'Token inválido.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        await AuthService.resetUserPassword(token, newPassword);
        res.status(200).json({ message: 'Token válido.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};