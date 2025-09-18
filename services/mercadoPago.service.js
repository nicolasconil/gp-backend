import { Preference, Payment } from "mercadopago";
import mpClient from "../config/mercadopago.js";
import Order from "../models/order.model.js";
import mapMPStatus from "../utils/mapMPStatus.js";
import { processAfterOrder } from "./order.service.js";
import { sendNewOrderNotificationToAdmin, sendOrderRejectedEmail } from "../middleware/email.middleware.js";
import logger from "../utils/logger.js";

export const createPreference = async (order) => {
    const items = order.products.map(product => ({
        title: product.product.name,
        quantity: product.quantity,
        unit_price: product.price,
        currency_id: 'ARS',
        picture_url: product.product.image || ''
    }));
    const preference = {
        items,
        back_urls: {
            success: `https://www.gpfootwear.com`,
            failure: `https://www.gpfootwear.com`,
            pending: `https://www.gpfootwear.com`,
        },
        auto_return: 'approved',
        notification_url: 'https://www.gpfootwear.com/api/mercadopago/webhook?source_news=webhooks',
        external_reference: order._id,
        payer: {
            email: order.user?.email || order.guestEmail || 'invitado@example'
        },
        payment_methods: {
            installments: 3,
            excluded_payment_types: [],
            excluded_payment_methods: []
        }
    };
    const response = await new Preference(mpClient).create({ body: preference });
    return response;
};

export const processWebhook = async (data) => {
  const paymentId = data.id;
  let paymentResponse;
  try {
    paymentResponse = await new Payment(mpClient).get({ id: paymentId });
    logger.debug(`MP response raw for ${paymentId}: ${JSON.stringify(paymentResponse)}`);
  } catch (err) {
    logger.error('Error al obtener pago de MP', {
      paymentId,
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      stack: err.stack
    });
    throw new Error(`Error al obtener pago con ID ${paymentId}: ${err.message}`);
  }

  const paymentData = paymentResponse?.body || paymentResponse;
  const { status, id: transactionId, external_reference } = paymentData || {};

  if (!external_reference) {
    logger.error(`Payment ${paymentId} no contiene external_reference. paymentData: ${JSON.stringify(paymentData)}`);
    return;
  }

  const order = await Order.findById(external_reference).populate('products.product');
  if (!order) {
    throw new Error(`Orden con ID ${external_reference} no encontrada.`);
  }

  // Idempotencia por transactionId + status
  if (order.payment?.transactionId && order.payment.transactionId === String(transactionId)) {
    const mappedStatus = mapMPStatus(status);
    if (order.payment.status === mappedStatus) {
      logger.info(`[MP] webhook duplicado para order ${order._id} transactionId=${transactionId} status=${status}. Ignorando.`);
      return;
    }
  }

  // Actualizamos el objeto order con info de pago y persistimos YA
  order.payment = order.payment || {};
  order.payment.status = mapMPStatus(status);
  order.payment.transactionId = transactionId != null ? String(transactionId) : '';
  order.payment.rawData = paymentData;

  try {
    await order.save();
    logger.info(`[MP] order ${order._id} actualizado con payment ${order.payment.transactionId} status=${order.payment.status}`);
  } catch (err) {
    logger.error(`Error guardando order ${order._id} tras recibir webhook: ${err.message}`, { stack: err.stack });
    throw err;
  }

  // Ahora ejecutamos la lógica que puede provocar side-effects (procesar orden / enviar emails)
  try {
    switch (status) {
      case 'approved':
        // marcar estado y persistir (si hace falta cambiarlo)
        order.status = 'procesando';
        await order.save().catch(e => logger.error('No se pudo guardar status procesando', { orderId: order._id, err: e.message }));
        try {
          await processAfterOrder(order);
        } catch (err) {
          logger.error(`processAfterOrder falló para orden ${order._id}: ${err.message}`);
        }
        try {
          await sendNewOrderNotificationToAdmin(order);
        } catch (err) {
          logger.error(`Error enviando notificación al admin para orden ${order._id}: ${err.message}`);
        }
        break;

      case 'in_process':
      case 'pending':
        order.status = 'pendiente';
        await order.save().catch(e => logger.error('No se pudo guardar status pendiente', { orderId: order._id, err: e.message }));
        break;

      case 'rejected':
      default:
        order.status = 'rechazada';
        await order.save().catch(e => logger.error('No se pudo guardar status rechazada', { orderId: order._id, err: e.message }));
        try {
          await sendOrderRejectedEmail(order.guestEmail, order);
        } catch (err) {
          logger.error(`Error enviando email de orden rechazada para orden ${order._id}: ${err.message}`);
        }
        break;
    }
  } catch (err) {
    logger.error(`Error procesando webhook para payment ${paymentId}: ${err.message}`);
    throw err;
  }
};