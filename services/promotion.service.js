// import { sendEmail } from "../middleware/email.middleware.js";
// import { promoEmailTemplate } from "../utils/emailTemplates.js";

// export const sendBulkPromotions = async ({ emails = [], subject, content }) => {
//     if (!emails.length) {
//         throw new Error('No se proporcionaron destinatarios.');
//     }
//     const html = promoEmailTemplate(subject, content);
//     const results = await Promise.allSettled(
//         emails.map(email => sendEmail({ to: email, subject, html }))
//     );
//     const success = results.filter(r => r.status === 'fulfilled').length;
//     const failed = results.filter(r => r.status === 'rejected');
//     return {
//         total: emails.length, 
//         success,
//         failed: failed.map(f => f.reason?.message || f.reason)
//     };
// };