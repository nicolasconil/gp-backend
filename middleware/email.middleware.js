import nodemailer from "nodemailer";
import { orderConfirmationEmailTemplate, sendShippingNotificationEmailTemplate, adminNewOrderEmailTemplate, updateStatusEmailTemplate, adminStockAlertEmailTemplate, sendOrderRejectedEmailTemplate } from "../utils/emailTemplates.js";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async ({ to, subject, html, text = '', attachments = [] }) => {
    const mailOptions = {
        from: `'GP Footwear' <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text,
        attachments
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error enviando email a ${to}:`, error.message);
        throw new Error(`No se pudo enviar el email a ${to}.`);
    }
};

export const sendUpdateStatusEmail = async (email, name, orderId, newStatus) => {
    const { subject, text, html } = updateStatusEmailTemplate(name, orderId, newStatus);
    await sendEmail({
        to: email,
        subject,
        html,
        text
    });
};

export const sendOrderConfirmationEmail = async (email, name, orderId, total, pdfPath, cancelUrl, viewOrderUrl, order) => {
    const { subject, text, html } = orderConfirmationEmailTemplate(order);
    await sendEmail({
        to: email,
        subject,
        html,
        text,
        attachments: [
            {
                filename: `comprobante-${orderId}.pdf`,
                path: pdfPath,
            },
        ]
    });
};

export const sendShippingNotificationEmail = async (email, name, orderId, trackingNumber, carrier, isDelivered = false) => {
  const { subject, text, html } = sendShippingNotificationEmailTemplate(name, orderId, trackingNumber, carrier, isDelivered);
  await sendEmail({
    to: email,
    subject,
    html,
    text
  });
};

export const sendNewOrderNotificationToAdmin = async (order) => {
    const { subject, text, html } = adminNewOrderEmailTemplate(order);
    const adminEmail = process.env.ADMIN_EMAIL;
    await sendEmail({
        to: adminEmail,
        subject,
        html,
        text,
    });
};

export const sendStockAlertToAdmin = async (order) => {
    const { subject, text, html } = adminStockAlertEmailTemplate(order);
    const adminEmail = process.env.ADMIN_EMAIL;
    await sendEmail({
        to: adminEmail,
        subject,
        html,
        text,
    });
};

export const sendOrderRejectedEmail = async (email, order) => {
    const { subject, text, html } = sendOrderRejectedEmailTemplate(order);
    await sendEmail({
        to: email,
        subject,
        html,
        text,
    });
};