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
    let paymentResponse;
    try {
        paymentResponse = await new Payment(mpClient).get({ id: paymentId });
    } catch (err) {
        throw new Error(`Error al obtener pago con ID ${paymentId}: ${err.message}`);
    }
    const { status, id: transactionId, external_reference } = paymentResponse;
    const order = await Order.findById(external_reference).populate('products.product');
    if (!order) throw new Error(`Orden con ID ${external_reference} no encontrada.`);
    order.payment.status = mapMPStatus(status);
    order.payment.transactionId = transactionId.toString();
    order.payment.rawData = paymentResponse;
    switch (status) {
        case 'approved':
            order.status = 'procesando';
            await processAfterOrder(order);
            await sendNewOrderNotificationToAdmin(order);
            break;
        case 'in_process': 
            order.status = 'pendiente';
            break;
        case 'pending':
            order.status = 'pendiente';
            break;
        case 'rejected':
        default: 
            order.status = 'rechazada';
            await sendOrderRejectedEmail(order);
            break;
    }
    await order.save();
};