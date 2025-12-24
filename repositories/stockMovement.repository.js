import StockMovement from "../models/stockMovement.model.js";
import Product from "../models/product.model.js";

const normalizeSize = (s) => (s === null || s === undefined) ? '' : String(s).trim();
const normalizeColor = (c) => (c === null || c === undefined) ? '' : String(c).trim().toLowerCase();

export const createStockMovement = async (data, session = null) => {
    const { product: productId, size: rawSize, color: rawColor, quantity, movementType, note, createdBy } = data;
    const size = normalizeSize(rawSize);
    const color = normalizeColor(rawColor);

    const product = await Product.findById(productId).session(session);
    if (!product) throw new Error('Producto no encontrado.');
    const variation = product.variations.find(
        (v) => String(v.size).trim().toLowerCase() === size.toLowerCase() &&
               String(v.color || '').trim().toLowerCase() === color
    );
    if (!variation) throw new Error('Variación no encontrada.');

    if (movementType === 'venta' && Number(variation.stock) < Number(quantity)) {
        throw new Error(
            `Stock insuficiente para la variación (size: ${size}, color: ${color}). Solicitado: ${quantity}, disponible: ${variation.stock}`
        );
    }
    const [movement] = await StockMovement.create(
        [
            {
                product: productId,
                size,
                color,
                quantity: Math.abs(Number(quantity)),
                movementType,
                note,
                createdBy,
            },
        ],
        { session }
    );
    const delta = movementType === 'ingreso' ? Number(quantity) : -Number(quantity);
    const filter = {
        _id: productId,
        variations: {
            $elemMatch: {
                size,
                color,
                ...(movementType === 'venta' ? { stock: { $gte: Number(quantity) } } : {})
            }
        }
    };
    const result = await Product.updateOne(
        filter,
        { $inc: { 'variations.$.stock': delta } },
        { session }
    );
    if (result.modifiedCount === 0 && result.matchedCount === 0) {
        throw new Error('No se pudo actualizar el stock del producto. Posible inconsistencia en formatos de size/color.');
    }
    return movement;
};

export const getStockMovementsByProduct = async (productId) => {
    return await StockMovement.find({ product: productId }).sort({ date: -1 });
};
