import * as OrderService from "../services/order.service.js";
import * as ShippingService from "../services/shipping.service.js";
import logger from "../utils/logger.js";

export const createOrder = async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            user: undefined
        };
        const order = await OrderService.create(orderData);
        if (!order || !order._id) {
            return res.status(400).json({ message: `Error al crear la orden: ${error.message}.` });
        }
        await ShippingService.createShippingForOrder(order._id);
        logger.info(`POST /orders - Orden creada con ID: ${order._id} y envío asociado.`);
        res.status(201).json(order);
    } catch (error) {
        logger.error(`POST /orders - ${error.message}.`);
        res.status(400).json({ message: `No se pudo crear la orden: ${error.message}.` });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await OrderService.getAll(req.query);
        logger.info(`GET /orders - ${orders.orders.length} órdenes obtenidas.`);
        res.status(200).json(orders);
    } catch (error) {
        logger.error(`GET /orders - ${error.message}.`);
        res.status(500).json({ message: error.messsage });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await OrderService.getById(id);
        logger.info(`GET /orders/${id} - Orden obtenida.`);
        res.status(200).json(order);
    } catch (error) {
        logger.error(`GET /orders/${req.params.id} - ${error.message}.`);
        res.status(400).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await OrderService.updateStatus(id, status);
        logger.info(`PATCH /orders/${id}/status - Estado actualizado a '${status}'.`);
        res.status(200).json(updated);
    } catch (error) {
        logger.error(`PATCH /orders/${req.params.id}/status - ${error.message}.`);
        res.status(400).json({ message: error.message });
    }
};

export const updateOrderFields = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedOrder = await OrderService.updateFields(id, req.body);
        logger.info(`PATCH /orders/${id} - Orden actualizada con nuevos campos.`);
        res.status(200).json(updatedOrder);
    } catch (error) {
        logger.error(`PATCH /orders/${req.params.id} - ${error.message}.`);
        res.status(400).json({ message: error.message });
    }
};

export const dispatchOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { shippingTrackingNumber } = req.body;
        const updatedOrder = await OrderService.dispatchOrder(id, shippingTrackingNumber);
        logger.info(`PATCH /orders/${id}/dispatch - Orden despachada con tracking: ${shippingTrackingNumber}.`);
        res.status(200).json(updatedOrder);
    } catch (error) {
        logger.error(`PATCH /orders/${req.params.id}/dispatch - ${error.message}.`);
        res.status(400).json({ message: error.message });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        await OrderService.remove(id);
        logger.info(`DELETE /orders/${id} - Orden eliminada.`);
        res.status(204).send();
    } catch (error) {
        logger.error(`DELETE /orders/${req.params.id} - ${error.message}.`);
        res.status(400).json({ message: error.message });
    }
};

// export const cancelMyOrder = async (req, res) => {
//     try {
//         const { cancelToken } = req.body;
//         const order = await OrderService.getByCancelToken(cancelToken);
//         if (!order) {
//             logger.warn(`CANCEL /orders - Orden no encontrada.`);
//             return res.status(404).json({ message: 'Orden no encontrada.' });
//         }
//         if (order.status !== 'pendiente') {
//             logger.warn(`CANCEL /orders/${id} - Estado inválido (${order.status}).`);
//             return res.status(400).json({ message: `No se puede cancelar una orden con estado: ${order.status}.` });
//         }
//         const updatedOrder = await OrderService.updateStatus(order._id, 'cancelado');
//         logger.info(`CANCEL /orders/${order._id} - Orden cancelada.`);
//         res.status(200).json(updatedOrder);
//     } catch (error) {
//         logger.error(`CANCEL /orders/${req.params.id} - ${error.message}.`);
//         res.status(500).json({ message: `Error al cancelar la compra: ${error.message}.` });
//     }
// };

export const updateOrderPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const paymentInfo = req.body;
        const updatedOrder = await OrderService.updatePaymentInfo(id, paymentInfo);
        logger.info(`PATCH /orders/${id}/payment - Información de pago actualizada.`);
        res.status(200).json(updatedOrder);
    } catch (error) {
        logger.error(`PATCH /orders/${req.params.id}/payment - ${error.message}.`);
        res.status(400).json({ message: `Error al actualizar el pago: ${error.message}.` });
    }
}; 

export const getOrdersForShipping = async (req, res) => {
    try {
        const orders = await OrderService.getOrdersForShipping();
        logger.info(`GET /orders/for-shipping - ${orders.length} órdenes no entregadas/rechazadas obtenidas.`);
        res.status(200).json(orders);
    } catch (error) {
        logger.error(`GET /orders/for-shipping - ${error.message}`);
        res.status(500).json({ message: `Error al obtener órdenes para envío: ${error.message}` });
    };
};