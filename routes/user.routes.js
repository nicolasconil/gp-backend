import express from "express";
import * as UserController from "../controllers/user.controller.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.middleware.js";
import { registerUserValidation, updateUserValidation } from "../middleware/validations/user.validation.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.get('/', verifyToken, verifyAdmin, UserController.getAllUsers); // obtiene todos los usuarios
router.get('/:id', verifyToken, UserController.getUserById); // obtiene el usuario por id
router.post('/register', verifyToken, csrfProtection, registerUserValidation, UserController.createUser); // registrar un nuevo usuario
router.put('/:id', verifyToken, csrfProtection, updateUserValidation, UserController.updateUser); // actualiza un usuario por id
router.delete('/:id', verifyToken, verifyAdmin, csrfProtection, UserController.deleteUser); // elimina un usuario por id (admins)
router.patch('/consent', verifyToken, csrfProtection, UserController.updateConsent); // actualiza el consentimiento del usuario
router.get('/export', verifyToken, csrfProtection, UserController.exportUserData); // exporta los datos del usuario autenticado
router.delete('/me', verifyToken, csrfProtection, UserController.deleteAccount); // elimina la cuenta del usuario autenticado

export default router;