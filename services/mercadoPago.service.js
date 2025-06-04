import { Preference, Payment } from "mercadopago";
import mpClient from "../config/mercadopago.js";
import Order from "../models/order.model.js";
import mapMPStatus from "../utils/mapMPStatus.js";

export const createPreference = async (order) => {
    const items = order.products.map(item => ({
        title: item.product,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'ARS'
    }));
    const preference = {
        items, 
        back_urls: {
            success: `https://www.instagram.com/nicooconil/`,
            failure: `https://x.com/nnicolasconil`,
            pending: `https://x.com/nnicolasconil`,
        },
        auto_return: 'approved',
        notification_url: 'https://d4f4-190-183-80-198.ngrok-free.app/mercadopago/webhook',
        external_reference: order._id.toString(),
        payer: {
            email: order.user?.email || order.guestEmail || 'invitado@example'
        }
    };
    const response = await new Preference(mpClient).create({ body: preference });
    return response;
};

export const processWebhook = async (data) => {
    const paymentId = data.id;
    const paymentResponse = await new Payment(mpClient).get({ id: paymentId });
    const {
        status,
        external_preference,
        id: transactionId
    } = paymentResponse;
    const order = await Order.findById(external_preference);
    if (!order) throw new Error('Orden no encontrada.');
    order.payment.status = mapMPStatus(status);
    order.payment.transactionId = transactionId.toString();
    order.payment.rawData = paymentResponse;
    if (status === 'approved') {
        order.status = 'procesando';
    };
    await order.save();
};