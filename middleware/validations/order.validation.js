import { body, param } from 'express-validator';
import { handleValidationErrors } from './handleErrors.validation.js';

export const createOrderValidation = [
    body('products').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto en la orden'),
    body('products.*.product').isMongoId().withMessage('Cada producto debe tener un ID válido'),
    body('products.*.quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor o igual a 1'),
    body('products.*.size').optional().isString().notEmpty().withMessage('El talle debe ser una cadena no vacía'),
    body('products.*.color').optional().isString().notEmpty().withMessage('El color debe ser una cadena no vacía'),
    body('products.*.price').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('shippingAddress').isObject().withMessage('La dirección de envío debe ser un objeto válido'),
    body('shippingAddress.street').notEmpty().withMessage('La calle es obligatoria'),
    body('shippingAddress.city').notEmpty().withMessage('La ciudad es obligatoria'),
    body('shippingAddress.postalCode').notEmpty().withMessage('El código postal es obligatorio'),
    body('shippingAddress.province').optional().isString().withMessage('La provincia debe ser una cadena válida'),
    body('email').optional().isEmail().withMessage('Debe proporcionar un email válido si no está autenticado'),
    body('status').optional().isIn(['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']).withMessage('El estado de la orden debe ser uno de los valores permitidos'),
    body('totalAmount').optional().isFloat({ min: 0 }).withMessage('El monto total debe ser un número positivo'),
    handleValidationErrors,
];

export const orderIdParamValidation = [
    param('id').isMongoId().withMessage('El ID de la orden no es válido'),
    handleValidationErrors,
];

export const dispatchOrderValidation = [
    body('shippingTrackingNumber').isString().notEmpty().withMessage('El número de seguimiento es obligatorio'),
    handleValidationErrors,
];
