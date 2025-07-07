import * as StockMovementRepository from "../repositories/stockMovement.repository.js";

export const recordStockMovement = async (productId, size, color, quantity, movementType, user, note = '') => {
    const movement = {
        product: productId,
        size,
        color,
        quantity,
        movementType,
        note,
        createdBy: user ? user._id : null
    };
    await StockMovementRepository.createStockMovement(movement);
};

export const getStockMovementsByProduct = async (productId) => {
    return await StockMovementRepository.getStockMovementsByProduct(productId);
};
