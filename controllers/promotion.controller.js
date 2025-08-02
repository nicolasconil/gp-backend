import { promoEmailTemplate } from "../utils/emailTemplates.js";
import { sendEmail } from "../middleware/email.middleware.js";
import logger from "../utils/logger.js";

export const sendPromotionalEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    logger.warn("POST /subscribe - Email no proporcionado.");
    return res.status(400).json({ message: "El email es requerido." });
  }
  try {
    const subject = "¡Gracias por unirte a GP Footwear!";
    const content = `
      <p>Ahora vas a recibir novedades, promociones y mucho más.</p>
      <p>Si tenés dudas o querés realizar un pedido, escribinos por WhatsApp o Instagram.</p>
    `;
    await sendEmail({
      to: email,
      subject,
      html: promoEmailTemplate(subject, content),
    });
    logger.info(`POST /subscribe - Email enviado a ${email}.`);
    res.status(200).json({ message: "Email enviado correctamente." });
  } catch (error) {
    logger.error(`POST /subscribe - Error: ${error.message}`);
    res.status(500).json({ message: "No se pudo enviar el email." });
  }
};