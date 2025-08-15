import * as AuthService from "../services/auth.service.js";
import User from "../models/user.model.js";
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";

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
        console.log('--- DEBUG CSRF (login) ---');
        console.log('x-xsrf-token header:', req.headers['x-xsrf-token']);
        console.log('x-csrf-token header:', req.headers['x-csrf-token']);
        console.log('cookies:', req.cookies);
        console.log('body._csrf:', req.body?._csrf);
        console.log('csrfToken() value (server):', typeof req.csrfToken === 'function' ? req.csrfToken() : 'no req.csrfToken');
        console.log('--------------------------');
        const { email, password } = req.body;
        const lowerEmail = email?.toLowerCase();
        const { token, refreshToken, userId, role } = await AuthService.authenticateUser(lowerEmail, password);
        logger.info(`/POST /login - Usuario ${userId} autenticado correctamente.`);
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
        };
        res.cookie('token', token, {
            ...cookieOptions,
            maxAge: 60 * 60 * 1000 // 1 hora
        });
        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });
        if (typeof req.csrfToken === 'function') {
            res.cookie('XSRF-TOKEN', req.csrfToken(), {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'None',
            });
        }
        res.status(200).json({ message: 'Inicio de sesión exitoso.', role });
    } catch (error) {
        logger.error(`/POST /login - ${error.message}`);
        res.status(401).json({ message: error.message });
    }
};

export const logout = (req, res) => {
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
    };
    res.clearCookie('token', options);
    res.clearCookie('refreshToken', options);
    res.clearCookie('XSRF-TOKEN', { ...options, httpOnly: false });
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
            sameSite: 'None',
            maxAge: 60 * 60 * 1000
        });
        res.status(200).json({ message: 'Token actualizado.' });
    } catch (error) {
        logger.error(`POST /refresh-token - ${error.message}.`);
        res.status(401).json({ message: 'Refresh token inválido o expirado.' });
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
        res.status(200).json({ message: 'Token válido.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        await AuthService.resetUserPassword(email, newPassword);
        res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(403).json({ message: 'Acceso denegado: token no proporcionado o inválido.' });
        }
        const user = await User.findById(req.user.id).select('email role isEmailVerified');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        return res.status(200).json({
            id: user._id,
            email: user.email,
            role: user.role,
            isEmailVerified: user.isEmailVerified
        });
    } catch (error) {
        logger.error(`GET /users/me - ${error.message}`);
        return res.status(500).json({ message: 'Error al obtener el perfil del usuario.' });
    }
};