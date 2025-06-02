import express from "express";
import * as AuthService from "../services/auth.service.js";

const router = express.Router();

// verificación de email
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    try {
        await AuthService.verifyUserEmail(token);
        res.redirect(`${process.env.FRONTEND_URL}/verified-email`);
    } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/verification-error`);
    }
});

// solicita restablecimiento de contraseña
router.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;
    try {
        await AuthService.requestPasswordReset(email);
        res.status(200).json()
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// valida el token de restablecimiento
router.get('/validate-reset-token', async (req, res) => {
    const { token } = req.query;
    try {
        await AuthService.validateResetPasswordToken(token);
        res.status(200).json({ message: 'Token inválido.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// restablece la contraseña 
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        await AuthService.resetUserPassword(token, newPassword);+
        res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;