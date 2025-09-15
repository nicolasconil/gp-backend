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
        description: product.product.description || '',
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
        logger.debug(`MP response raw: ${JSON.stringify(paymentResponse)}`);
    } catch (err) {
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

    order.payment = order.payment || {};
    order.payment.status = mapMPStatus(status);
    order.payment.transactionId = transactionId?.toString?.() || '';
    order.payment.rawData = paymentData;

    try {
        switch (status) {
            case 'approved':
                order.status = 'procesando';
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
                break;
            case 'rejected':
            default:
                order.status = 'rechazada';
                try {
                  await sendOrderRejectedEmail(order.guestEmail, order);
                } catch (err) {
                  logger.error(`Error enviando email de orden rechazada para orden ${order._id}: ${err.message}`);
                }
                break;
        }
        await order.save();
    } catch (err) {
        logger.error(`Error procesando webhook para payment ${paymentId}: ${err.message}`);
        throw err;
    }
};
