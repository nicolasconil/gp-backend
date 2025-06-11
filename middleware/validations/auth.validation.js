import { body } from "express-validator";
import { handleValidationErrors } from "./handleErrors.validation.js";

export const forgotPasswordValidation = [
    body('email').isEmail().withMessage('Debe proporcionar un correo electrónico válido.').normalizeEmail().trim(),
    handleValidationErrors
];

export const resetPasswordValidation = [
    body('token').notEmpty().withMessage('El token de restablecimiento es obligatorio.').isString().withMessage('El token debe ser una cadena de texto.'),
    body('newPassword').notEmpty().withMessage('La nueva contraseña es obligatoria.').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres.').matches(/[A-Z]/).withMessage('La nueva contraseña debe contener al menos una letra mayúscula.').matches(/[a-z]/).withMessage('La nueva contraseña debe contener al menos una letra minúscula.').matches(/\d/).withMessage('La nueva contraseña debe contener al menos un número.').matches(/[@$!%*?&]/).withMessage('La nueva contraseña debe contener al menos un carácter especial (@$!%*?&).'),
    handleValidationErrors
];
