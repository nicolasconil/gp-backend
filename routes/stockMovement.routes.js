import express from "express";
import * as StockMovementController from "../controllers/stockMovement.controller.js";
import { csrfProtection, addCsrfToken } from "../middleware/csrf.middleware.js";

const router = express.Router();

// registrar movimientos de stock 
router.post('/', csrfProtection, addCsrfToken, StockMovementController.recordStockMovement);
// obtener movimientos por producto
router.get('/:productId', StockMovementController.getStockMovementsByProduct);

export default router;