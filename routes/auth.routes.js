import express from "express";
import * as AuthController from "../controllers/auth.controller.js"
import { csrfMiddleware } from "../middleware/csrf.middleware.js";

const router = express.Router();

// login
router.post('/login', AuthController.login);
// logout
router.post('/logout', csrfMiddleware, AuthController.logout);
// refresh token
router.post('/refresh-token', csrfMiddleware, AuthController.refreshAccessToken);
// recuperación de contraseña
router.post('/forgot-password', csrfMiddleware, AuthController.requestPasswordReset);
router.post('/reset-password', csrfMiddleware, AuthController.resetPassword);

router.post('/create-user', AuthController.createUser);

export default router;