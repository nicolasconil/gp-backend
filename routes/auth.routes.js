import express from "express";
import * as AuthController from "../controllers/auth.controller.js"
import { csrfProtection, addCsrfToken } from "../middleware/csrf.middleware.js";

const router = express.Router();

// login
router.post('/login', csrfProtection, addCsrfToken, AuthController.login);
// logout
router.post('/logout', csrfProtection, addCsrfToken, AuthController.logout);
// refresh token
router.post('/refresh-token', csrfProtection, addCsrfToken, AuthController.refreshAccessToken);
// recuperación de contraseña
router.post('/forgot-password', csrfProtection, addCsrfToken, AuthController.requestPasswordReset);
router.post('/reset-password', csrfProtection, addCsrfToken, AuthController.resetPassword);

router.post('/create-user', AuthController.createUser);

export default router;