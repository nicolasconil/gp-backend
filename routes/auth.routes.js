import express from "express";
import * as AuthController from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = express.Router();

// login
router.post('/login', csrfProtection, AuthController.login);
// logout
router.post('/logout', csrfProtection, AuthController.logout);
// refresh token
router.post('/refresh-token', csrfProtection, AuthController.refreshAccessToken);
// recuperación de contraseña
router.post('/forgot-password', csrfProtection, AuthController.requestPasswordReset);
router.post('/reset-password', csrfProtection, AuthController.resetPassword);

router.post('/create-user', AuthController.createUser);

router.get('/users/me', verifyToken, AuthController.getUserProfile);

export default router;