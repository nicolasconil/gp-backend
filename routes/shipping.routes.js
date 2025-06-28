import express from "express";
import * as ShippingController from "../controllers/shipping.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { csrfMiddleware } from "../middleware/csrf.middleware.js";

const router = express.Router();

// ruta pública (crear envío)
router.post('/', csrfMiddleware, ShippingController.createShipping);

// rutas administrativas
router.use(AuthMiddleware.verifyModerator);

router.get('/:orderId', ShippingController.getShippingOrderById);

// obtener todos los envíos (moderadores y administrador)
router.get('/', ShippingController.getAllShippings);
// actualizar estado del envío
router.patch('/:orderId/status', ShippingController.updateShippingStatus);
// actualizar datos del envío
router.patch('/:orderId', csrfMiddleware, ShippingController.updateShipping);
// eliminar un envío
router.delete('/:orderId', csrfMiddleware, ShippingController.deleteShipping);

export default router;
