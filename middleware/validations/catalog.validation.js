import { body, param } from 'express-validator';
import { handleValidationErrors } from './handleErrors.validation.js';

export const createCatalogValidation = [
    body('name').isString().withMessage('El nombre debe ser una cadena de texto').notEmpty().withMessage('El nombre es obligatorio'),
    body('description').optional().isString().withMessage('La descripción debe ser una cadena de texto'),
    handleValidationErrors,
];

export const updateCatalogValidation = [
    body('name').optional().isString().withMessage('El nombre debe ser una cadena de texto').notEmpty().withMessage('El nombre no puede estar vacío'),
    body('description').optional().isString().withMessage('La descripción debe ser una cadena de texto'),
    handleValidationErrors,
];

export const catalogIdParamValidation = [
    param('id').isMongoId().withMessage('El ID del catálogo no es válido'),
    handleValidationErrors,
];
