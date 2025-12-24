import * as StockMovementService from "../services/stockMovement.service.js";
import logger from "../utils/logger.js";

export const recordStockMovement = async (req, res) => {
    try {
        const { productId, size, color, quantity, movementType, note = '' } = req.body;
        const user = req.user || null;
        if (!productId || !size || !color || quantity == null || !movementType) {
            logger.error(`POST /stock - Faltan campos obligatorios: ${JSON.stringify(req.body)}`);
            return res.status(400).json({ message: 'Faltan campos obligatorios en la solicitud.' });
        }
        const qty = Number(quantity);
        if (isNaN(qty) || qty <= 0) {
            logger.error(`POST /stock - La cantidad debe ser un número válido mayor que cero. Input: ${quantity}`);
            return res.status(400).json({ message: 'La cantidad debe ser un número válido mayor que cero (0).' });
        }
        const allowedTypes = ['venta', 'ingreso'];
        if (!allowedTypes.includes(movementType)) {
            logger.error(`POST /stock - Tipo de movimiento inválido: ${movementType}`);
            return res.status(400).json({ message: 'El tipo de movimiento debe ser "venta" o "ingreso".' });
        }
        await StockMovementService.recordStockMovement(
            productId,
            String(size).trim(),
            String(color).trim().toLowerCase(),
            qty,
            movementType,
            null,
            note
        );
        logger.info(`POST /stock - Movimiento de stock registrado para producto ${productId}, tipo: ${movementType}, cantidad: ${qty}.`);
        return res.status(201).json({ message: 'Movimiento de stock registrado correctamente.' });
    } catch (error) {
        logger.error(`POST /stock - Error al registrar el movimiento de stock: ${error.message}`);
        return res.status(500).json({ message: `Error al registrar el movimiento de stock: ${error.message}.` });
    }
};

export const getStockMovementsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            logger.error(`GET /stock/${productId} - Falta el ID del producto en la solicitud.`);
            return res.status(400).json({ message: 'Falta el ID del producto.' });
        }
        const movements = await StockMovementService.getStockMovementsByProduct(productId);
        logger.info(`GET /stock/${productId} - Movimientos de stock obtenidos para el producto ${productId}.`);
        return res.status(200).json(movements);
    } catch (error) {
        logger.error(`GET /stock/${req.params.productId} - Error al obtener los movimientos de stock: ${error.message}`);
        return res.status(500).json({ message: `Error al obtener los movimientos de stock: ${error.message}.` });
    }
};
