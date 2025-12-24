import mongoose from "mongoose";
import * as StockMovementRepository from "../repositories/stockMovement.repository.js";

const normalizeSize = (s) => (s === null || s === undefined) ? '' : String(s).trim();
const normalizeColor = (c) => (c === null || c === undefined) ? '' : String(c).trim().toLowerCase();

export const recordStockMovement = async (productId, size, color, quantity, movementType, user, note = '') => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const movement = {
            product: productId,
            size: normalizeSize(size),
            color: normalizeColor(color),
            quantity: Math.abs(Number(quantity)),
            movementType,
            note,
            createdBy: user ? user._id : null
        };
        await StockMovementRepository.createStockMovement(movement, session);
        await session.commitTransaction();
        return true;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const getStockMovementsByProduct = async (productId) => {
    return await StockMovementRepository.getStockMovementsByProduct(productId);
};
