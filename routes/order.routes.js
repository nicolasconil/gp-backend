import express from "express";
import * as OrderController from "../controllers/order.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { createOrderValidation, dispatchOrderValidation, orderIdParamValidation } from "../middleware/validations/order.validation.js";
import { csrfMiddleware } from "../middleware/csrf.middleware.js";
import { guestOrderLimiter } from  "../middleware/ratelimit.middleware.js";

const router = express.Router();

// crear la orden (público: usuario invitado o autenticado)
router.post('/', guestOrderLimiter, csrfMiddleware, createOrderValidation, OrderController.createOrder);

// rutas protegidas (requiere login)
router.use(AuthMiddleware.verifyToken);

// ver mis órdenes
router.get('/my-orders', OrderController.getMyOrders);
// obtener orden por id (autenticado)
router.get('/:id', orderIdParamValidation, OrderController.getOrderById);
// cancelar una orden propia (solo si está pendiente)
router.patch('/:id/cancel', csrfMiddleware, orderIdParamValidation, OrderController.cancelMyOrder);
// actualizar info de pago (usuario)
router.patch('/:id/payment', csrfMiddleware, orderIdParamValidation, OrderController.updateOrderPayment);
// actualizar campos generales de una orden (usuario) 
router.patch('/:id', csrfMiddleware, orderIdParamValidation, OrderController.updateOrderFields);

// rutas sólo para moderadores y administrador
router.use(AuthMiddleware.verifyModerator);

// obtener todas las órdenes
router.get('/', OrderController.getAllOrders);
// actualizar estado de una orden
router.patch('/:id/status', csrfMiddleware, orderIdParamValidation, OrderController.updateOrderStatus);
// marcar orden como despachada 
router.patch('/:id/dispatch', csrfMiddleware, orderIdParamValidation, dispatchOrderValidation, OrderController.dispatchOrder);
// eliminar orden
router.delete('/:id', csrfMiddleware, orderIdParamValidation, OrderController.deleteOrder);

export default router;