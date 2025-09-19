import nodemailer from "nodemailer";
import {
  orderConfirmationEmailTemplate,
  sendShippingNotificationEmailTemplate,
  adminNewOrderEmailTemplate,
  updateStatusEmailTemplate,
  adminStockAlertEmailTemplate,
  sendOrderRejectedEmailTemplate
} from "../utils/emailTemplates.js";
import logger from "../utils/logger.js";

const resolveTemplateSafely = (templateFn, order, templateName = "template") => {
  try {
    return templateFn(order);
  } catch (err1) {
    logger.warn(`resolveTemplateSafely - ${templateName}(order) falló: ${err1.message}. Intentando wrapper { order }...`);
    try {
      return templateFn({ order });
    } catch (err2) {
      logger.error(`resolveTemplateSafely - ${templateName} falló con ambos signatures. err1=${err1.message}, err2=${err2.message}`);
      throw err2;
    }
  }
};

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
    logger.info(`sendEmail - Enviando email a ${to}, subject="${subject}", attachments=${attachments.length}`);
    try {
        await transporter.sendMail(mailOptions);
        logger.info(`sendEmail - Email enviado a ${to} - asunto: ${subject}`);
    } catch (error) {
        logger.error(`sendEmail - Error enviando email a ${to}: ${error.message}`, { error });
        throw new Error(`No se pudo enviar el email a ${to}. Error: ${error.message}`);
    }
};

export const sendUpdateStatusEmail = async (email, name, orderId, newStatus) => {
    const { subject, text, html } = resolveTemplateSafely(updateStatusEmailTemplate, { _id: orderId, guestName: name }, "updateStatusEmailTemplate");
    await sendEmail({
        to: email,
        subject,
        html,
        text
    });
};

export const sendOrderConfirmationEmail = async (email, name, orderId, total, pdfPath, cancelUrl, viewOrderUrl, order) => {
    logger.info(`sendOrderConfirmationEmail - Preparando email confirmacion para ${email}, order=${orderId}, pdf=${pdfPath}`);
    const { subject, text, html } = resolveTemplateSafely(orderConfirmationEmailTemplate, order, "orderConfirmationEmailTemplate");
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
  const { subject, text, html } = resolveTemplateSafely(sendShippingNotificationEmailTemplate, { _id: orderId, guestName: name, trackingNumber, carrier, isDelivered }, "sendShippingNotificationEmailTemplate");
  await sendEmail({
    to: email,
    subject,
    html,
    text
  });
};

export const sendNewOrderNotificationToAdmin = async (order) => {
    const { subject, text, html } = resolveTemplateSafely(adminNewOrderEmailTemplate, order, "adminNewOrderEmailTemplate");
    const adminEmail = process.env.ADMIN_EMAIL;
    await sendEmail({
        to: adminEmail,
        subject,
        html,
        text,
    });
};

export const sendStockAlertToAdmin = async (order) => {
    const { subject, text, html } = resolveTemplateSafely(adminStockAlertEmailTemplate, order, "adminStockAlertEmailTemplate");
    const adminEmail = process.env.ADMIN_EMAIL;
    await sendEmail({
        to: adminEmail,
        subject,
        html,
        text,
    });
};

export const sendOrderRejectedEmail = async (email, order) => {
    const { subject, text, html } = resolveTemplateSafely(sendOrderRejectedEmailTemplate, order, "sendOrderRejectedEmailTemplate");
    await sendEmail({
        to: email,
        subject,
        html,
        text,
    });
};
