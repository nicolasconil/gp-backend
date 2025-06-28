import nodemailer from "nodemailer";
import { verificationEmailTemplate, orderConfirmationEmailTemplate, sendShippingNotificationEmailTemplate, passwordResetEmailTemplate } from "../utils/emailTemplates.js";

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

export const sendVerificationEmail = async (email, name, verificationUrl) => {
    const { subject, text, html } = verificationEmailTemplate(name, verificationUrl);
    await sendEmail({
        to: email,
        subject,
        html,
        text,
    });
};

export const sendOrderConfirmationEmail = async (email, name, orderId, total, pdfPath, cancelToken) => {
    const cancelUrl = `${process.env.FRONTEND_URL}/cancelar-orden?token=${cancelToken}`;
    const { subject, text, html } = orderConfirmationEmailTemplate(name, orderId, total, cancelUrl);
    await sendEmail({
        to: email,
        subject,
        html,
        text,
        attachments: [
            {
                filename: `factura-${orderId}.pdf`,
                path: pdfPath,
            },
        ]
    });
};

export const sendShippingNotificationEmail = async (email, name, orderId, trackingNumber, carrier) => {
    const { subject, text, html } = sendShippingNotificationEmailTemplate(name, orderId, trackingNumber, carrier);
    await sendEmail({
        to: email,
        subject,
        html,
        text
    });
};

export const sendPasswordResetEmail = async (email, name, resetUrl) => {
    const { subject, text, html } = passwordResetEmailTemplate(name, resetUrl);
    await sendEmail({
        to: email,
        subject,
        html,
        text
    });
};