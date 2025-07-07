import StockMovement from "../models/stockMovement.model.js";
import Product from "../models/product.model.js";

export const createStockMovement = async (data, session = null) => {
    const { product: productId, size, color, quantity, movementType, note, createdBy } = data;

    const product = await Product.findById(productId).session(session);
    if (!product) throw new Error('Producto no encontrado.');

    const variation = product.variations.find((v) => v.size === size && v.color.toLowerCase() === color.toLowerCase());
    if (!variation) throw new Error('Variación no encontrada.');

    if (movementType === 'venta' && variation.stock < quantity) {
        throw new Error('Stock insuficiente para la venta.');
    }

    const [movement] = await StockMovement.create(
        [
            {
                product: productId,
                size,
                color: color.toLowerCase(),
                quantity: Math.abs(quantity),
                movementType,
                note,
                createdBy,
            },
        ],
        { session }
    );

    return movement;
};

export const getStockMovementsByProduct = async (productId) => {
    return await StockMovement.find({ product: productId }).sort({ date: -1 });
};
