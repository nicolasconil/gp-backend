import { body } from "express-validator";
import { handleValidationErrors } from "./handleErrors.validation.js";

const genders = ['hombre', 'mujer', 'niños', 'unisex'];

export const createProductValidation = [
    body('name').notEmpty().withMessage('El nombre del producto es obligatorio'),
    body('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0'),
    body('gender').isIn(genders).withMessage(`El género debe ser uno de los siguientes: ${genders.join(', ')}`),
    body('variations').isArray({ min: 1 }).withMessage('Debe incluir al menos una variación'),
    body('variations.*.size').notEmpty().withMessage('Cada variación debe tener un tamaño (size)'),
    body('variations.*.color').notEmpty().withMessage('Cada variación debe especificar un color'),
    body('variations.*.stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0'),
    body('variations.*.stockMinimo').optional().isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número entero mayor o igual a 0'),
    handleValidationErrors
];

export const updateProductValidation = [
    body('name') .optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('price').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0'),
    body('gender').optional().isIn(genders).withMessage(`El género debe ser uno de los siguientes: ${genders.join(', ')}`),
    body('variations').optional().isArray().withMessage('Las variaciones deben ser un arreglo'),
    body('variations.*.size').optional().notEmpty().withMessage('Cada variación debe tener un tamaño (size)'),
    body('variations.*.color').optional().notEmpty().withMessage('Cada variación debe especificar un color'),
    body('variations.*.stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0'),
    body('variations.*.stockMinimo').optional().isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número entero mayor o igual a 0'),
    handleValidationErrors
];
