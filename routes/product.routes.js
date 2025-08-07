import express from "express";
import * as ProductController from "../controllers/product.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = express.Router();

// rutas públicas
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

// rutas protegidas
router.use(AuthMiddleware.verifyToken);

// rutas para moderador y administrador
router.use(AuthMiddleware.verifyModerator);

// creación, actualización, eliminación y actualizar stock de un producto
router.post('/', csrfProtection, upload.single('image'), ProductController.create);
router.put('/:id', csrfProtection, upload.single('image'), ProductController.update);
router.delete('/:id', csrfProtection, ProductController.remove);
router.patch('/:id/stock', csrfProtection, ProductController.updateStock);

export default router;