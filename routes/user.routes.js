import express from "express";
import * as UserController from "../controllers/user.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { csrfMiddleware } from "../middleware/csrf.middleware.js";
import { updateUserValidation } from "../middleware/validations/user.validation.js";
import { exportFormatValidation } from "../middleware/validations/data.validation.js";

const router = express.Router();

// rutas protegidas
router.use(AuthMiddleware.verifyToken); // verifica el token para todas las siguientes rutas

// rutas de usuario
router.get('/me', csrfMiddleware, UserController.getUserById);
router.put('/me', updateUserValidation, csrfMiddleware, UserController.updateUser);
router.delete('/me', csrfMiddleware, UserController.deleteAccount);
router.get('/me/orders', csrfMiddleware, UserController.getUserWithOrders);
router.get('/me/exports', exportFormatValidation, csrfMiddleware, UserController.exportUserData);

// rutas del moderador y administrador
router.use(AuthMiddleware.verifyModerator);

// administración de usuarios
router.get('/', UserController.getAllUsers);
router.put('/:id', updateUserValidation, csrfMiddleware, UserController.updateUser);

// rutas del administrador
router.use(AuthMiddleware.verifyAdmin);

// administración de usuarios
router.delete('/:id', csrfMiddleware, UserController.deleteUser);

export default router;