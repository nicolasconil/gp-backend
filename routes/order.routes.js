import express from "express";
import * as OrderController from "../controllers/order.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";
import { guestOrderLimiter } from  "../middleware/ratelimit.middleware.js";

const router = express.Router();

// crear la orden (público: usuario invitado o autenticado)
router.post('/', guestOrderLimiter, csrfProtection, OrderController.createOrder);

router.get('/', OrderController.getAllOrders);

router.get('/public/:id', OrderController.getOrderById);

// rutas sólo para moderadores y administrador
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.verifyModerator);
// obtener todas las órdenes
router.get('/for-shipping', csrfProtection, OrderController.getOrdersForShipping);

// actualizar estado de una orden
router.patch('/:id/status', csrfProtection, OrderController.updateOrderStatus);

// marcar orden como despachada 
router.patch('/:id/dispatch', csrfProtection, OrderController.dispatchOrder);

// actualizar campos generales (email, dirección, etc.)
router.patch('/:id', csrfProtection, OrderController.updateOrderFields);

// actualizar información de pago
router.patch('/:id/payment', csrfProtection, OrderController.updateOrderPayment);

// eliminar orden
router.delete('/:id', csrfProtection, OrderController.deleteOrder);

router.get('/:id', OrderController.getOrderById);

export default router;