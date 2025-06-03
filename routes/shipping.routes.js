import express from "express";
import * as ShippingController from "../controllers/shipping.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { orderIdParamValidation, shippingStatusValidation, shippingValidation } from "../middleware/validations/shipping.validation.js";
import { csrfMiddleware } from "../middleware/csrf.middleware.js";

const router = express.Router();

// ruta pública (para usuarios autenticados o invitados)
router.post('/', csrfMiddleware, shippingValidation, ShippingController.createShipping);

// rutas protegidas
router.use(AuthMiddleware.verifyToken);

// ruta para obtener un envío por ID de orden (usuario autenticado)
router.get('/:orderId', orderIdParamValidation, ShippingController.getShippingOrderById);

// rutas administrativas
router.use(AuthMiddleware.verifyModerator);

// obtener todos los envíos (moderadores y administrador)
router.get('/', ShippingController.getAllShippings);
// actualizar estado del envío
router.patch('/:orderId/status', csrfMiddleware, orderIdParamValidation, shippingStatusValidation, ShippingController.updateShippingStatus);
// actualizar datos del envío
router.patch('/:orderId', csrfMiddleware, orderIdParamValidation, shippingValidation, ShippingController.updateShipping);
// eliminar un envío
router.delete('/:orderId', csrfMiddleware, orderIdParamValidation, ShippingController.deleteShipping);

export default router;
