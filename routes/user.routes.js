import express from "express";
import * as UserController from "../controllers/user.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { csrfMiddleware } from "../middleware/csrf.middleware.js";

const router = express.Router();

// rutas protegidas
router.use(AuthMiddleware.verifyToken); // verifica el token para todas las siguientes rutas

// rutas de usuario
router.get('/me', UserController.getUserById);
router.put('/me', csrfMiddleware, UserController.updateUser);
router.delete('/me', csrfMiddleware, UserController.deleteAccount);

// rutas del moderador y administrador
router.use(AuthMiddleware.verifyModerator);

// administración de usuarios
router.get('/', UserController.getAllUsers);
router.put('/:id', csrfMiddleware, UserController.updateUser);

// rutas del administrador
router.use(AuthMiddleware.verifyAdmin);

// administración de usuarios
router.delete('/:id', csrfMiddleware, UserController.deleteUser);

export default router;