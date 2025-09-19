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
        notification_url: `${process.env.BACKEND_URL}/api/mercadopago/webhook?source_news=webhooks`,
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
    logger.info(`processWebhook - inicio. paymentId=${paymentId}`);

    let paymentResponse;
    try {
        paymentResponse = await new Payment(mpClient).get({ id: paymentId });
        logger.info(`processWebhook - Payment.get OK para id=${paymentId}`);
    } catch (err) {
        logger.error(`processWebhook - Error al obtener pago con ID ${paymentId}: ${err.message}`);
        throw new Error(`Error al obtener pago con ID ${paymentId}: ${err.message}`);
    }

    const paymentData = paymentResponse?.body ? paymentResponse.body : paymentResponse;
    logger.info(`processWebhook - paymentData recibida: ${JSON.stringify(Object.keys(paymentData || {}))}`);

    const { status, id: transactionId, external_reference } = paymentData || {};
    logger.info(`processWebhook - status=${status}, transactionId=${transactionId}, external_reference=${external_reference}`);

    if (!external_reference) {
        logger.error(`processWebhook - Sin external_reference en payment ${paymentId}`);
        throw new Error(`El pago ${paymentId} no tiene external_reference.`);
    }

    const order = await Order.findById(external_reference).populate('products.product');
    if (!order) {
        logger.error(`processWebhook - Orden ${external_reference} no encontrada`);
        throw new Error(`Orden con ID ${external_reference} no encontrada.`);
    }
    logger.info(`processWebhook - Orden ${order._id} encontrada. guestEmail=${order.guestEmail}`);

    order.payment = order.payment || {};
    order.payment.status = mapMPStatus(status);
    order.payment.transactionId = (transactionId || '').toString();
    order.payment.rawData = paymentData;

    switch (status) {
        case 'approved':
            order.status = 'procesando';
            try {
                logger.info(`processWebhook - Procesando orden aprobada ${order._id}`);
                await processAfterOrder(order);
                logger.info(`processWebhook - processAfterOrder OK para ${order._id}`);
            } catch (err) {
                logger.error(`processWebhook - Error en processAfterOrder para ${order._id}: ${err.message}`);
            }
            try {
                await sendNewOrderNotificationToAdmin(order);
                logger.info(`processWebhook - Email admin enviado para ${order._id}`);
            } catch (err) {
                logger.error(`processWebhook - Error enviando email admin para ${order._id}: ${err.message}`);
            }
            break;
        case 'in_process':
        case 'pending':
            order.status = 'pendiente';
            logger.info(`processWebhook - status set a pendiente para orden ${order._id}`);
            break;
        case 'rejected':
        default:
            order.status = 'rechazada';
            {
                const buyerEmail = order.guestEmail;
                logger.info(`processWebhook - intento enviar email rechazo. buyerEmail=${buyerEmail}`);
                try {
                    if (buyerEmail) {
                        await sendOrderRejectedEmail(buyerEmail, order);
                        logger.info(`processWebhook - Email rechazo enviado a ${buyerEmail} para orden ${order._id}`);
                    } else {
                        logger.warn(`processWebhook - Orden ${order._id} sin guestEmail; no se envió mail de rechazo.`);
                    }
                } catch (err) {
                    logger.error(`processWebhook - Error enviando mail de rechazo para orden ${order._id}: ${err.message}`);
                }
            }
            break;
    }
    await order.save();
    logger.info(`processWebhook - orden ${order._id} guardada con status=${order.status}`);
};