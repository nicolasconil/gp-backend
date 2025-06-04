import { Preference, Payment } from "mercadopago";
import mpClient from "../config/mercadopago.js";
import Order from "../models/order.model.js";
import mapMPStatus from "../utils/mapMPStatus.js";

export const createPreference = async (order) => {
    const items = order.products.map(item => ({
        title: `Producto - ${item.product}`,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: 'ARS'
    }));
    const preference = {
        items, 
        back_urls: {
            success: ``,
            failure: ``,
            pending: ``,
        },
        auto_return: 'approved',
        notifacation_url: `/mercadopago/webhook`,
        external_preference: order._id.toString(),
        payer: {
            email: order.user?.email || order.guestEmail || 'invitado@example'
        }
    };
    const response = await Preference(mpClient).create({ body: preference });
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