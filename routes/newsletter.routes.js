import express from "express";
import * as PromotionController from "../controllers/promotion.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { csrfMiddleware } from "../middleware/csrf.middleware.js";

const router = express.Router();

// ruta protegida para moderadores y administrador
router.use(AuthMiddleware.verifyModerator);

// ruta para enviar la promocion del newsletter
router.post('/', csrfMiddleware, PromotionController.sendPromotions);

export default router;