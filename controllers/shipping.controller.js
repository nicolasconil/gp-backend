import * as ShippingService from "../services/shipping.service.js";
import logger from "../utils/logger.js";

export const createShipping = async (req, res) => {
    try {
        const shippingData = req.body;
        const shipping = await ShippingService.createShipping(shippingData);
        logger.info(`POST /shippings - Envío creado con ID: ${shipping._id}.`);
        res.status(201).json(shipping);
    } catch (error) {
        logger.error(`POST /shippings - ${error.message}.`);
        res.status(500).json({ message: `Error al crear el envío: ${error.message}.` });
    }
};

export const getAllShippings = async (req, res) => {
    try {
        const shippings = await ShippingService.getAllShippings();
        logger.info(`GET /shippings - ${shippings.length} envíos obtenidos.`);
        res.status(200).json(shippings);
    } catch (error) {
        logger.error(`GET /shippings - ${error.message}`);
        res.status(500).json({ message: `Error al obtener los envíos: ${error.message}.` });
    }
};

export const getShippingOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const shipping = await ShippingService.getShippingOrderById(orderId);
        if (!shipping) {
            logger.warn(`GET /shippings/order/${orderId} - Envío no encontrado.`);
            return res.status(404).json({ message: 'Envío no encontrado.' });
        }
        logger.info(`GET /shippings/order/${orderId} - Envío obtenido correctamente.`);
        res.status(200).json(shipping);
    } catch (error) {
        logger.error(`GET /shippings/order/${req.params.orderId} - ${error.message}.`);
        res.status(500).json({ message: `Error al obtener el envío: ${error.message}.` });
    }
};

export const updateShippingStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const updatedShipping = await ShippingService.updateShipppingStatus(orderId, status);
        if (!updatedShipping) {
            logger.warn(`PATCH /shippings/order/${orderId}/status - Envío no encontrado.`);
            return res.status(404).json({ message: 'Envío no encontrado.' });
        }
        logger.info(`PATCH /shippings/order/${orderId}/status - Estado actualizado a "${status}".`);
        res.status(200).json(updatedShipping);
    } catch (error) {
        logger.error(`PATCH /shippings/order/${req.params.orderId}/status - ${error.message}`);
        res.status(500).json({ message: `Error al actualizar el estado del envío: ${error.message}.` });
    }
}; 

export const updateShipping = async (req, res) => {
    try {
        const { orderId } = req.params;
        const updateData = req.body;
        const updatedShipping = await ShippingService.updateShipping(orderId, updateData);
        if (!updatedShipping) {
            logger.warn(`PUT /shippings/order/${orderId} - Envío no encontrado.`);
            return res.status(404).json({ message: 'Envío no encontrado.' });
        }
        logger.info(`PUT /shippings/order/${orderId} - Envío actualizado correctamente.`);
        res.status(200).json(updatedShipping);
    } catch (error) {
        logger.error(`PUT /shippings/order/${req.params.orderId} - ${error.message}`);
        res.status(500).json({ message: `Error al actualizar el envío: ${error.message}.` });
    }
};

export const deleteShipping = async (req, res) => {
    try {
        const { orderId } = req.params;
        const deletedShipping = await ShippingService.deleteShipping(orderId);
        if (!deletedShipping) {
            logger.warn(`DELETE /shippings/order/${orderId} - Envío no encontrado.`);
            return res.status(404).json({ message: 'Envío no encontrado.' });
        }
        logger.info(`DELETE /shippings/order/${orderId} - Envío eliminado correctamente.`);
        res.status(200).json({ message: 'Envío eliminado correctamente.' });
    } catch (error) {
        logger.error(`DELETE /shippings/order/${req.params.orderId} - ${error.message}`);
        res.status(500).json({ message: `Error al eliminar el envío: ${error.message}.` });
    }
};