import express from "express";
import * as UserController from "../controllers/user.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { csrfProtection, addCsrfToken } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.get('/me', AuthMiddleware.verifyToken, csrfProtection, addCsrfToken, UserController.getUserById);
// rutas protegidas
router.use(AuthMiddleware.verifyToken); // verifica el token para todas las siguientes rutas

// rutas de usuario
router.put('/me', csrfProtection, addCsrfToken, UserController.updateUser);
router.delete('/me', csrfProtection, addCsrfToken, UserController.deleteAccount);

// rutas del moderador y administrador
router.use(AuthMiddleware.verifyModerator);

// administración de usuarios
router.get('/', UserController.getAllUsers);
router.put('/:id', csrfProtection, addCsrfToken, UserController.updateUser);

// rutas del administrador
router.use(AuthMiddleware.verifyAdmin);

// administración de usuarios
router.delete('/:id', csrfProtection, addCsrfToken, UserController.deleteUser);

export default router;