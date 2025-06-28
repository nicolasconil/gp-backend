import StockMovement from "../models/stockMovement.model.js";
import Product from "../models/product.model.js";

export const createStockMovement = async (data) => {
    const { product: productId, size, color, quantity, movementType } = data;

    const product = await Product.findById(productId);
    if (!product) throw new Error('Producto no encontrado.');

    const variation = product.variations.find(v => v.size === size && v.color === color);
    if (!variation) throw new Error('Variación no encontrada.');

    if (movementType === 'venta' && variation.stock < quantity) {
        throw new Error('Stock insuficiente para la venta.');
    }

    product.updateStock(size, color, quantity, movementType);
    await product.save();

    const movement = new StockMovement(data);
    return await movement.save();
};

export const getStockMovementsByProduct = async (productId) => {
    return await StockMovement.find({ product: productId }).sort({ date: -1 });
};
