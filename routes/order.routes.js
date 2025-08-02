import express from "express";
import * as OrderController from "../controllers/order.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { csrfProtection, addCsrfToken } from "../middleware/csrf.middleware.js";
import { guestOrderLimiter } from  "../middleware/ratelimit.middleware.js";

const router = express.Router();

// crear la orden (público: usuario invitado o autenticado)
router.post('/', guestOrderLimiter, csrfProtection, addCsrfToken, OrderController.createOrder);

router.get('/', OrderController.getAllOrders);

// rutas sólo para moderadores y administrador
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.verifyModerator);
// obtener todas las órdenes
router.get('/for-shipping', csrfProtection, addCsrfToken, OrderController.getOrdersForShipping);

// actualizar estado de una orden
router.patch('/:id/status', csrfProtection, addCsrfToken, OrderController.updateOrderStatus);

// marcar orden como despachada 
router.patch('/:id/dispatch', csrfProtection, addCsrfToken, OrderController.dispatchOrder);

// actualizar campos generales (email, dirección, etc.)
router.patch('/:id', csrfProtection, addCsrfToken, OrderController.updateOrderFields);

// actualizar información de pago
router.patch('/:id/payment', csrfProtection, addCsrfToken, OrderController.updateOrderPayment);

// eliminar orden
router.delete('/:id', csrfProtection, addCsrfToken, OrderController.deleteOrder);

router.get('/:id', OrderController.getOrderById);

export default router;