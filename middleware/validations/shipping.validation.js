import { body, param } from "express-validator";
import { handleValidationErrors } from "./handleErrors.validation.js";

export const shippingValidation = [
    body('orderId').notEmpty().withMessage('El ID de la orden es obligatorio').isMongoId().withMessage('El ID de la orden debe ser un ObjectId válido'),
    body('address').trim().notEmpty().withMessage('La dirección del envío es obligatoria'),
    body('city').trim().notEmpty().withMessage('La ciudad es obligatoria'),
    body('province').trim().notEmpty().withMessage('La provincia es obligatoria'),
    body('postalCode').trim().notEmpty().withMessage('El código postal es obligatorio').isPostalCode('any').withMessage('El código postal no es válido'), 
    body('country').trim().notEmpty().withMessage('El país es obligatorio'),
    handleValidationErrors
];

export const shippingStatusValidation = [
    body('status').trim().notEmpty().withMessage('El estado es obligatorio').isIn(['pendiente', 'procesando', 'enviado', 'entregado']).withMessage('Estado no válido'),
    handleValidationErrors
];

export const orderIdParamValidation = [
    param('orderId').notEmpty().withMessage('El parámetro orderId es obligatorio').isMongoId().withMessage('El parámetro orderId debe ser un ObjectId válido'),
    handleValidationErrors
];
