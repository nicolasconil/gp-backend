import * as PromotionService from "../services/promotion.service.js";
import * as UserService from "../services/user.service.js";
import logger from "../utils/logger.js";

export const sendPromotions = async (req, res) => {
    try {
        const emailList = await UserService.getSubscribers();
        const { subject, content } = req.body;
        if (!emailList || emailList.length === 0) {
            logger.warn(`POST /promotions - No hay suscriptores para enviar correos.`);
            return res.status(400).json({ message: 'No hay suscriptores.' });
        }
        logger.info(`POST /promotions - Enviando correos promocionales a ${emailList.length} suscriptores.`);
        const result = await PromotionService.sendBulkPromotions({
            emails: emailList,
            subject,
            content
        });
        if (result.failed.length > 0) {
            logger.warn(`POST /promotions - Fallaron ${result.failed.length} correos.`);
            return res.status(500).json({ message: 'Hubo errores al enviar algunos correos.', details: result.failed });
        }
        logger.info(`POST /promotions - Correos enviados correctamente. Total: ${result.total}. Éxitos: ${result.success}. Fallos: ${result.failed.length}.`);
        res.status(200).json({
            mesage: 'Correos promocionales enviados correctamente.',
            summary: {
                total: result.total,
                success: result.success,
                failed: result.failed.length
            }
       });
    } catch (error) {
        logger.error(`POST /promotions - Error al enviar correos promocionales: ${error.message}.`);
        res.status(500).json({ message: `Error al enviar correos promocionales: ${error.message}.` });
    }
};