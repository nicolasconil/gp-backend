import StockMovement from "../models/stockMovement.model.js";
import Product from "../models/product.model.js"; // necesario para actualizar el stock

export const createStockMovement = async (data) => {
    if (data.movementType === 'venta') {
        const product = await Product.findById(data.product);
        if (!product) {
            throw new Error('Producto no encontrado.');
        }
        const variation = product.variations.find(v => v.size === data.size && v.color === data.color);
        if (!variation) {
            throw new Error('Variación no encontrada.');
        }
        if (variation.stock < data.quantity) {
            throw new Error('Stock insuficiente para la venta.');
        }
        product.updateStock(data.size, data.color, data.quantity, 'venta');
        await product.save();
    }
    const movement = new StockMovement(data);
    return await movement.save();
};

export const getStockMovementsByProduct = async (productId) => {
    return await StockMovement.find({ product: productId }).sort({ date: -1 });
};