import express from "express";
import * as OrderController from "../controllers/order.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { csrfMiddleware } from "../middleware/csrf.middleware.js";
import { guestOrderLimiter } from  "../middleware/ratelimit.middleware.js";

const router = express.Router();

// crear la orden (público: usuario invitado o autenticado)
router.post('/', guestOrderLimiter, csrfMiddleware, OrderController.createOrder);

router.get('/', OrderController.getAllOrders);

// rutas sólo para moderadores y administrador
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.verifyModerator);
// obtener todas las órdenes
router.get('/for-shipping', csrfMiddleware, OrderController.getOrdersForShipping);

// actualizar estado de una orden
router.patch('/:id/status', csrfMiddleware, OrderController.updateOrderStatus);

// marcar orden como despachada 
router.patch('/:id/dispatch', csrfMiddleware, OrderController.dispatchOrder);

// actualizar campos generales (email, dirección, etc.)
router.patch('/:id', csrfMiddleware, OrderController.updateOrderFields);

// actualizar información de pago
router.patch('/:id/payment', csrfMiddleware, OrderController.updateOrderPayment);

// eliminar orden
router.delete('/:id', csrfMiddleware, OrderController.deleteOrder);

export default router;