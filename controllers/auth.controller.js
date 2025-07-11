import * as AuthService from "../services/auth.service.js";
import User from "../models/user.model.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";

// Secret para el refresh token
const refreshSecretKey = process.env.REFRESH_SECRET_KEY;
if (!refreshSecretKey) {
    throw new Error('La clave REFRESH_SECRET_KEY debe estar definida.');
}

export const createUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = new User({
            email,
            password,
            role,
            isEmailVerified: true,
        });
        await user.save();
        res.status(201).json({ message: 'Usuario creado correctamente', userId: user._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const lowerEmail = email?.toLowerCase();

        // Autenticar usuario
        const { token, refreshToken, userId, role } = await AuthService.authenticateUser(lowerEmail, password);
        logger.info(`/POST /login - Usuario ${userId} autenticado correctamente.`);

        // Configurar cookies con tokens
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 60 * 60 * 1000 // 1 hora
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
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

        // Validar el refresh token
        const decoded = jwt.verify(refreshToken, refreshSecretKey);

        // Generar nuevo access token
        const newAccessToken = jwt.sign({
            id: decoded.id,
            role: decoded.role,
            isEmailVerified: decoded.isEmailVerified
        }, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.cookie('token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 60 * 60 * 1000 // 1 hora
        });

        res.status(200).json({ message: 'Token actualizado.' });
    } catch (error) {
        logger.error(`POST /refresh-token - ${error.message}.`);
        res.status(401).json({ message: 'Refresh token inválido o expirado.' });
    }
};

// Solicitar restablecimiento de contraseña
export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        await AuthService.requestPasswordReset(email);
        res.status(200).json({ message: 'Correo de restablecimiento enviado.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Validar el token de restablecimiento de contraseña
export const validateResetToken = async (req, res) => {
    const { token } = req.query;
    try {
        await AuthService.validateResetPasswordToken(token);
        res.status(200).json({ message: 'Token válido.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Restablecer la contraseña
export const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        await AuthService.resetUserPassword(email, newPassword);
        res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
