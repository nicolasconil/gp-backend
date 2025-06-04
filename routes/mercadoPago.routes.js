import express from "express";
import * as MercadoPagoController from "../controllers/mercadoPago.controller.js";

const router = express.Router();

router.post('/preference', MercadoPagoController.createPreferenceController);
router.post('/webhook', MercadoPagoController.webhookController);

export default router;