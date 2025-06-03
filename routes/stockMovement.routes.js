import express from "express";
import * as StockMovementController from "../controllers/stockMovement.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { stockMovementValidation } from "../middleware/validations/stockMovement.validation.js";
import { csrfMiddleware } from "../middleware/csrf.middleware.js";

const router = express.Router();

// rutas protegidas (requiere login)
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.verifyModerator);

// registrar movimientos de stock 
router.post('/', csrfMiddleware, stockMovementValidation, StockMovementController.recordStockMovement);
// obtener movimientos por producto
router.get('/:productId', StockMovementController.getStockMovementsByProduct);

export default router;