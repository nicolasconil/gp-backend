import { body } from "express-validator";
import { handleValidationErrors } from "./handleErrors.validation.js";

export const newsletterValidation = [
    body('emailList').isArray({ min: 1 }).withMessage('La lista de correos electrónicos es obligatoria y debe contener al menos un correo'),
    body('emailList.*').isEmail().withMessage('Cada correo electrónico debe ser válido'),
    body('subject').isString().trim().notEmpty().withMessage('El asunto es obligatorio y no puede estar vacío'),
    body('content').isString().trim().notEmpty().withMessage('El contenido es obligatorio y no puede estar vacío').isLength({ min: 10 }).withMessage('El contenido debe tener al menos 10 caracteres'),
    handleValidationErrors
];
