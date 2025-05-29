import * as UserService from "../services/user.service.js";
import * as AuthService from "../services/auth.service.js";
import { exportUserDataFile } from "../utils/exportUserData.js";
import logger from '../utils/logger.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await UserService.getAll();
        logger.info(`GET /users - ${users.length} usuarios obtenidos.`);
        res.status(200).json(users);
    } catch (error) {
        logger.error(`GET /users - ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserService.getById(id);
        logger.info(`GET /users/${id} - Usuario obtenido.`);
        res.status(200).json(user);
    } catch (error) {
        logger.error(`GET /users/${req.params.id} - ${error.message}`);
        res.status(404).json({ message: error.message });
    }
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
        logger.info(`POST /users - Usuario creado con ID: ${newUser._id}.`);
        res.status(201).json(newUser);
    } catch (error) {
        logger.error(`POST /users - ${error.message}`);  
        res.status(400).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const existingUser = await UserService.getById(id);
        if (!existingUser) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        const data = req.body;
        const updatedUser = await UserService.update(id, data);
        logger.info(`PUT /users/${id} - Usuario actualizado.`)
        res.status(200).json(updatedUser);
    } catch (error) {
        logger.info(`PUT /users/${req.params.id} - ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserService.getById(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        await UserService.remove(id);
        logger.info(`DELETE /users/${id} - Usuario eliminado.`);
        res.status(204).send();
    } catch (error) {
        logger.error(`DELETE /users/${req.params.id} - ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        await UserService.remove(req.user.id);
        logger.info(`/DELETE /account - Usuario ${req.user.id} eliminó su cuenta.`);
        res.clearCookie('token');
        res.status(200).json({ message: 'Cuenta eliminada con éxito.' });
    } catch (error) {
        logger.error(`DELETE /account - ${error.message}`);
        res.status(500).json({ message: 'Error al eliminar la cuenta.', error });
    }
};

export const exportUserData = async (req, res) => {
    try {
        const userId = req.user.id;
        const format = req.query.format || 'json';
        const allowedFormats = ['json', 'csv', 'pdf'];
        if (!allowedFormats.includes(format)) {
            return res.status(400).json({ message: 'Formato de exportación no válido.' });
        } 
        const file = await exportUserDataFile(userId, format);
        logger.info(`GET /users/export - Datos exportados en formato ${format} para el usuario ${userId}.`);
        res.setHeader('Content-Disposition', `attachment; filename=user-data.${format}`);
        res.setHeader('Content-Type', file.contentType);
        res.send(file.buffer);
    } catch (error) {
        logger.error(`GET /users/export - ${error.message}`);
        res.status(500).json({ message: 'Error a exportar los datos del usuario.', error: error.message });
    }
};

export const getUserWithOrders = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserService.getUserWithOrders(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        logger.info(`GET /users/${id}/orders - Usuario con órdenes obtenido.`);
        res.status(200).json(user);       
    } catch (error) {
        logger.error(`GET /users/${req.params.id}/orders - ${error.message}`);
        res.status(404).json({ message: error.message });
    }
};

export const updateConsent = async (req, res) => {
    try {
        const userId = req.user.id;
        const consentData = req.body;
        const updatedUser = await UserService.updateConsent(userId, consentData);
        logger.info(`PUT /users/consent - Consentimiento actualizado para el usuario ${userId}.`);
        res.status(200).json(updatedUser);
    } catch (error) {
        logger.error(`PUT /users/consent - ${error.message}`);
        res.status(404).json({ message: error.message });
    }
};


