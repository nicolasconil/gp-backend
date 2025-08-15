import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import * as UserRepository from "../repositories/user.repository.js";

const secretKey = process.env.SECRET_KEY;
const refreshSecretKey = process.env.REFRESH_SECRET_KEY;

if (!secretKey || !refreshSecretKey) {
    throw new Error('Las claves SECRET_KEY y REFRESH_SECRET_KEY deben estar definidas.');
}

export const generateToken = (userId, role, isEmailVerified) => {
    return jwt.sign({ id: userId, role, isEmailVerified }, secretKey, {
        expiresIn: '1h',
    });
};

export const generateRefreshToken = (userId, role, isEmailVerified) => {
    return jwt.sign({ id: userId, role, isEmailVerified }, refreshSecretKey, {
        expiresIn: '7d',
    })
};

export const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado: token no proporcionado.' });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

export const verifyRefreshToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, refreshSecretKey);
        const user = await UserRepository.findUserByRefreshToken(refreshToken);
        if (!user) throw new Error('Refresh token inválido.');
        return decoded;
    } catch (error) {
        throw new Error('Refresh token inválido o expirado.');
    }
};

export const verifyRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Token no verificado.' });
        }
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: `Acceso denegado: se requiere rol de ${requiredRole}.`});
        }
        next();
    }
};

export const verifyAdmin = verifyRole('administrador');
export const verifyClient = verifyRole('cliente');
export const verifyModerator = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Token no verificado.'});
    }
    if (req.user.role === 'moderador' || req.user.role === 'administrador') {
        return next();
    }
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol de moderador o administrador.'});
};