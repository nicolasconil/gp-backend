import { createPreference, processWebhook } from "../services/mercadoPago.service.js";
import logger from "../utils/logger.js";

export const createPreferenceController = async (req, res) => {
    try {
        const order = req.body;
        const preference = await createPreference(order);
        logger.info(`POST /mercadopago/preference - Preferencia creada para orden ID: ${order._id}. Preference ID: ${preference.id}.`);
        res.json({ id: preference.id });
    } catch (error) {
        logger.error(`POST /mercadopago/preference - Error al crear la preferencia: ${error.message}.`);
        res.status(500).json({ message: `Error al crear la preferencia: ${error.message}.` });
    }
};

export const webhookController = async (req, res) => {
    const { type, data } = req.body;
    if (type !== 'payment') {
        logger.info(`POST /mercadopago/webhook - Tipo de evento ignorado: ${type}.`);
        return res.sendStatus(200);
    }
    try {
        await processWebhook(data);
        logger.info(`POST /mercadopago/webhook - Webhook procesado correctamente para payment ID: ${data.id}.`);
        res.sendStatus(200);
    } catch (error) {
        logger.error(`POST /mercadopago/webhook - Error al procesar webhook para payment ID ${data.id}: ${error.message}.`);
        res.sendStatus(500);
    }
};