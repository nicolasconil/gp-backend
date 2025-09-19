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
  try {
    logger.info('[MP webhook] incoming', {
      headers: {
        'content-type': req.get('content-type'),
        'x-request-id': req.get('x-request-id') || null,
      },
      query: req.query,
      bodyPreview: req.rawBody ? req.rawBody.slice(0, 1000) : JSON.stringify(req.body).slice(0,1000)
    });
    const topic = (req.query.topic || req.body?.topic || req.body?.type || '').toString();
    const idFromQuery = req.query.id;
    const idFromBody = req.body?.data?.id || req.body?.id;
    const paymentId = idFromBody || idFromQuery;
    if (topic && (topic === 'payment' || topic === 'payments' || topic === 'payments_v2')) {
      if (!paymentId) {
        logger.warn('[MP webhook] topic indica pago pero no hay id', { topic, idFromBody, idFromQuery });
        return res.sendStatus(400);
      }
      res.sendStatus(200);
      setImmediate(async () => {
        try {
          await processWebhook({ id: paymentId });
          logger.info(`[MP webhook] procesado OK paymentId=${paymentId}`);
        } catch (err) {
          logger.error(`[MP webhook] error procesando paymentId=${paymentId}`, {
            message: err.message,
            responseStatus: err.response?.status,
            responseData: err.response?.data,
            stack: err.stack
          });
        }
      });
      return;
    }
    if (req.body?.type && req.body?.data) {
      if (req.body.type !== 'payment') {
        logger.info('[MP webhook] evento ignorado', { type: req.body.type });
        return res.sendStatus(200);
      }
      const id = req.body.data.id;
      if (!id) {
        logger.warn('[MP webhook] body.data presente pero sin id', { body: req.body });
        return res.sendStatus(400);
      }
      res.sendStatus(200);
      setImmediate(async () => {
        try {
          await processWebhook({ id });
          logger.info(`[MP webhook] procesado OK (body) paymentId=${id}`);
        } catch (err) {
          logger.error(`[MP webhook] error procesando (body) paymentId=${id}`, {
            message: err.message,
            responseStatus: err.response?.status,
            responseData: err.response?.data,
            stack: err.stack
          });
        }
      });
      return;
    }
    logger.warn('[MP webhook] formato desconocido', { body: req.body, query: req.query });
    return res.sendStatus(400);
  } catch (err) {
    logger.error('[MP webhook] error inesperado', { message: err.message, stack: err.stack });
    return res.sendStatus(500);
  }
};