import * as ShippingService from "../services/shipping.service.js";
import logger from "../utils/logger.js";

export const getAllShippings = async (req, res) => {
    try {
        const shippings = await ShippingService.getAllShippings();
        logger.info(`GET /shippings - ${shippings.length} envíos obtenidos.`);
        res.status(200).json(shippings);
    } catch (error) {
        logger.error(`GET /shippings - ${error.message}`);
        res.status(500).json({ message: `Error al obtener los envíos: ${error.message}` });
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
        logger.error(`GET /shippings/order/${req.params.orderId} - ${error.message}`);
        res.status(500).json({ message: `Error al obtener el envío: ${error.message}` });
    }
};

export const updateShippingStatus = async (req, res) => {
    try {
        const { shippingId } = req.params;
        const { status } = req.body;
        const updatedShipping = await ShippingService.updateShippingStatus(shippingId, status);
        if (!updatedShipping) {
            logger.warn(`PATCH /shippings/${shippingId}/status - Envío no encontrado.`);
            return res.status(404).json({ message: 'Envío no encontrado.' });
        }
        logger.info(`PATCH /shippings/${shippingId}/status - Estado actualizado a "${status}".`);
        res.status(200).json(updatedShipping);
    } catch (error) {
        logger.error(`PATCH /shippings/${req.params.shippingId}/status - ${error.message}`);
        res.status(500).json({ message: `Error al actualizar el estado del envío: ${error.message}` });
    }
};

export const updateShipping = async (req, res) => {
    try {
        const { shippingId } = req.params;
        const updateData = req.body;
        const updatedShipping = await ShippingService.updateShipping(shippingId, updateData);
        if (!updatedShipping) {
            logger.warn(`PUT /shippings/${shippingId} - Envío no encontrado.`);
            return res.status(404).json({ message: 'Envío no encontrado.' });
        }
        logger.info(`PUT /shippings/${shippingId} - Envío actualizado correctamente.`);
        res.status(200).json(updatedShipping);
    } catch (error) {
        logger.error(`PUT /shippings/${req.params.shippingId} - ${error.message}`);
        res.status(500).json({ message: `Error al actualizar el envío: ${error.message}` });
    }
};

export const deleteShipping = async (req, res) => {
    try {
        const { shippingId } = req.params;
        const deletedShipping = await ShippingService.deleteShipping(shippingId);
        if (!deletedShipping) {
            logger.warn(`DELETE /shippings/${shippingId} - Envío no encontrado.`);
            return res.status(404).json({ message: 'Envío no encontrado.' });
        }
        logger.info(`DELETE /shippings/${shippingId} - Envío eliminado correctamente.`);
        res.status(200).json({ message: 'Envío eliminado correctamente.' });
    } catch (error) {
        logger.error(`DELETE /shippings/${req.params.shippingId} - ${error.message}`);
        res.status(500).json({ message: `Error al eliminar el envío: ${error.message}` });
    }
};
