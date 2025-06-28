import * as StockMovementRepository from "../repositories/stockMovement.repository.js";
import * as ProductService from "../services/product.service.js"; 

export const recordStockMovement = async (productId, size, color, quantity, movementType, user) => {
    const movement = {
        product: productId,
        size,
        color,
        quantity,
        movementType,
        createdBy: user ? user._id : null
    };
    await StockMovementRepository.createStockMovement(movement);
    await ProductService.updateStock(productId, size, color, quantity, movementType);
};

export const getStockMovementsByProduct = async (productId) => {
    return await StockMovementRepository.getStockMovementsByProduct(productId);
};
