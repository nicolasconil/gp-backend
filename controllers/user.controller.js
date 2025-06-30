import * as UserService from "../services/user.service.js";
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
        const id  = req.user.id;
        const user = await UserService.getById(id);
        logger.info(`GET /users/${id} - Usuario obtenido.`);
        res.status(200).json(user);
    } catch (error) {
        logger.error(`GET /users/me - ${error.message}`);
        res.status(404).json({ message: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
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

