import mercadopago from "mercadopago";
import logger from "../utils/logger.js";
import * as OrderRepository from "../repositories/order.repository.js";
import { processAfterOrder } from "./order.service.js";
import { sendNewOrderNotificationToAdmin, sendOrderRejectedEmail } from "../middleware/email.middleware.js";
import mapMPStatus from "../utils/mapMPStatus.js";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

export const createPreference = async (order) => {
  try {
    const preference = {
      items: order.products.map((item) => ({
        title: item.product.name,
        unit_price: Number(item.product.price),
        quantity: item.quantity,
        picture_url: item.product.images?.[0] || "",
      })),
      external_reference: order._id.toString(),
      payer: {
        email: order.guestEmail || order.user?.email,
        name: order.guestName || "",
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/success`,
        failure: `${process.env.FRONTEND_URL}/failure`,
        pending: `${process.env.FRONTEND_URL}/pending`,
      },
      auto_return: "approved",
      notification_url: `${process.env.BACKEND_URL}/api/mercadopago/webhook?source_news=webhooks`,
    };

    const response = await mercadopago.preferences.create(preference);
    return response.body;
  } catch (err) {
    logger.error(`Error creando preferencia MP: ${err.message}`, { stack: err.stack });
    throw err;
  }
};

export const processWebhook = async ({ id }) => {
  try {
    const payment = await mercadopago.payment.findById(id);
    if (!payment || !payment.body) {
      throw new Error(`No se encontró información de pago para ID ${id}`);
    }

    const paymentData = payment.body;
    const externalReference = paymentData.external_reference;
    const status = paymentData.status;
    const transactionId = paymentData.id;

    if (!externalReference) {
      throw new Error("El pago no tiene external_reference");
    }

    const order = await OrderRepository.getOrderById(externalReference);
    if (!order) {
      throw new Error(`No se encontró la orden con id ${externalReference}`);
    }

    // Evitar reprocesar si ya está actualizado
    if (
      order.payment?.transactionId === String(transactionId) &&
      order.payment?.status === mapMPStatus(status)
    ) {
      logger.info(`[MP] webhook ignorado, orden ${order._id} ya tenía este paymentId=${transactionId}`);
      return order;
    }

    // Actualizamos info de pago
    const mappedStatus = mapMPStatus(status); // 'aprobado' | 'pendiente' | 'rechazado'
    order.payment = {
      rawData: paymentData,
      status: mappedStatus,
      transactionId: String(transactionId),
    };

    try {
      await order.save();
      logger.info(`[MP] order ${order._id} actualizado con payment ${transactionId} status=${mappedStatus}`);
    } catch (err) {
      logger.error(`Error guardando order ${order._id} tras recibir webhook: ${err.message}`, { stack: err.stack });
      throw err;
    }

    // Ahora derivamos el estado de la orden en tu negocio
    switch (mappedStatus) {
      case "aprobado": {
        order.status = "pagado";
        await order.save().catch((e) =>
          logger.error("No se pudo guardar status pagado", { orderId: order._id, err: e.message })
        );

        // Ejecutar lógica posterior (invoice, stock, envío, email)
        try {
          await processAfterOrder(order);
        } catch (err) {
          logger.error(`processAfterOrder falló para orden ${order._id}: ${err.message}`);
        }

        // Notificar al admin
        try {
          await sendNewOrderNotificationToAdmin(order);
        } catch (err) {
          logger.error(`Error enviando notificación al admin para orden ${order._id}: ${err.message}`);
        }
        break;
      }

      case "pendiente": {
        order.status = "pendiente";
        await order.save().catch((e) =>
          logger.error("No se pudo guardar status pendiente", { orderId: order._id, err: e.message })
        );
        break;
      }

      case "rechazado":
      default: {
        order.status = "rechazada";
        await order.save().catch((e) =>
          logger.error("No se pudo guardar status rechazada", { orderId: order._id, err: e.message })
        );
        try {
          if (order.guestEmail) {
            await sendOrderRejectedEmail(order.guestEmail, order);
          }
        } catch (err) {
          logger.error(`Error enviando email de orden rechazada para orden ${order._id}: ${err.message}`);
        }
        break;
      }
    }

    return order;
  } catch (err) {
    logger.error(`[MP] Error en processWebhook: ${err.message}`, {
      stack: err.stack,
    });
    throw err;
  }
};
