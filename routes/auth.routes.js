import express from "express";
import * as AuthController from "../controllers/auth.controller.js"
import { csrfMiddleware } from "../middleware/csrf.middleware.js";
import { registerUserValidation, loginUserValidation } from "../middleware/validations/user.validation.js";
import { forgotPasswordValidation, resetPasswordValidation } from "../middleware/validations/auth.validation.js";

const router = express.Router();

// registro y login
router.post('/signup', registerUserValidation, csrfMiddleware, AuthController.createUser);
router.post('/login', loginUserValidation, csrfMiddleware, AuthController.login);
// refresh token
router.post('/refresh-token', csrfMiddleware, AuthController.refreshAccessToken);
// verificación de email
router.get('/verify-email', AuthController.verifyEmail);
// recuperación de contraseña
router.post('/forgot-password', forgotPasswordValidation, csrfMiddleware, AuthController.requestPasswordReset);
router.post('/reset-password', resetPasswordValidation, csrfMiddleware, AuthController.resetPassword);

export default router;