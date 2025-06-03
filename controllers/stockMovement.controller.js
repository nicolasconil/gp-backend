import * as StockMovementService from "../services/stockMovement.service.js";

export const recordStockMovement = async (req, res) => {
    try {
        const { productId, size, color, quantity, movementType } = req.body;
        if (!productId || !size || !color || quantity == null || !movementType) {
            return res.status(400).json({ message: 'Faltan campos obligatorios en la solicitud.' });
        }
        const qty = Number(quantity);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: 'La cantidad debe ser un número válido mayor que cero (0).' });
        }
        const allowedTypes = ['venta', 'ingreso'];
        if (!allowedTypes.includes(movementType)) {
            return res.status(400).json({ message: 'El tipo de movimiento debe ser "venta" o "ingreso".' });
        }
        const user = req.user;
        await StockMovementService.recordStockMovement(productId, size, color, qty, movementType, user);
        return res.status(201).json({ message: 'Movimiento de stock registrado correctamente.' });
    } catch (error) {
        return res.status(500).json({ message: `Error al registrar el movimiento de stock: ${error.message}.` });
    }
};

export const getStockMovementsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ message: 'Falta el ID del producto.' });
        }
        const movements = await StockMovementService.getStockMovementsByProduct(productId);
        return res.status(200).json(movements);
    } catch (error) {
        return res.status(500).json({ message: `Error al obtener los movimientos de stock: ${error.message}.` });
    }
};