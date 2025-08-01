import express from "express";
import * as ShippingController from "../controllers/shipping.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { csrfMiddleware } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.patch('/:orderId/status', csrfMiddleware, ShippingController.updateShippingStatus);
router.post('/:orderId', csrfMiddleware, ShippingController.createShippingForOrder);
router.patch('/:orderId', csrfMiddleware, ShippingController.updateShipping);
router.get('/order/:orderId', ShippingController.getShippingOrderById);
router.get('/', ShippingController.getAllShippings);
// rutas administrativas
router.use(AuthMiddleware.verifyModerator);

// obtener un envío por ID de orden

// obtener todos los envíos (moderadores y administrador)


// actualizar estado del envío

// actualizar datos del envío

// eliminar un envío
router.delete('/:orderId', csrfMiddleware, ShippingController.deleteShipping);

router.post('/:orderId/dispatch', csrfMiddleware, ShippingController.dispatchShipping);


export default router;
