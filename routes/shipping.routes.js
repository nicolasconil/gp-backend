import express from "express";
import * as ShippingController from "../controllers/shipping.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.patch('/:orderId/status', csrfProtection, ShippingController.updateShippingStatus);
router.post('/:orderId', csrfProtection, ShippingController.createShippingForOrder);
router.patch('/:orderId', csrfProtection, ShippingController.updateShipping);
router.get('/order/:orderId', ShippingController.getShippingOrderById);
router.get('/', ShippingController.getAllShippings);
// rutas administrativas
router.use(AuthMiddleware.verifyModerator);

// obtener un envío por ID de orden

// obtener todos los envíos (moderadores y administrador)


// actualizar estado del envío

// actualizar datos del envío

// eliminar un envío
router.delete('/:orderId', csrfProtection, ShippingController.deleteShipping);

router.post('/:orderId/dispatch', csrfProtection, ShippingController.dispatchShipping);


export default router;
