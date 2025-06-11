import { body } from "express-validator";
import { handleValidationErrors } from "./handleErrors.validation.js";

export const registerUserValidation = [
    body('name.first').trim().isLength({ min: 3 }).withMessage('El nombre debe tener al menos tres (3) caracteres.'),
    body('name.last').trim().isLength({ min: 3 }).withMessage('El apellido debe tener al menos tres (3) caracteres.'),
    body('email').isEmail().withMessage('El email no es válido.'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos seis (6) caracteres.'),
    body('role').optional().isIn(['cliente', 'moderador', 'administrador']).withMessage('El rol debe ser "cliente", "moderador" o "administrador".'),
    body('termsAccepted').equals('true').withMessage('Debes aceptar los términos y condiciones para registrarte.'),
    handleValidationErrors
];

export const updateUserValidation = [
    body('name.first').optional().trim().isLength({ min: 3 }).withMessage('El nombre debe tener al menos tres (3) caracteres.'),
    body('name.last').optional().trim().isLength({ min: 3 }).withMessage('El apellido debe tener al menos tres (3) caracteres.'),
    body('email').optional().isEmail().withMessage('El email no es válido.'),
    body('password').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos seis (6) caracteres.'),
    body('address.street').optional().isString().withMessage('La calle debe ser un texto.'),
    body('address.number').optional().isString().withMessage('El número debe ser un texto'),
    body('address.city').optional().isString().withMessage('La ciudad debe ser un texto.'),
    body('address.postalCode').optional().isString().withMessage('El código postal debe ser un texto.'),
    body('address.country').optional().isString().withMessage('El país debe ser un texto.'),
    body('phone.countryCode').optional().matches(/^\+\d{1,4}$/).withMessage('El código de país no es válido.'),
    body('phone.number').optional().matches(/^[1-9]\d{6,14}$/).withMessage('El número de teléfono no es válido.'),
    handleValidationErrors
];

export const loginUserValidation = [
    body('email').isEmail().withMessage('Debe proporcionar un correo electrónico válido.').normalizeEmail().trim(),
    body('password').notEmpty().withMessage('La contraseña es obligatoria.').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
    handleValidationErrors
];