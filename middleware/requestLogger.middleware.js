import logger from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const userId = req.user?.id || 'N/A';
        const { method, originalUrl, ip } = req;
        const statusCode = res.statusCode;
        logger.info(`[REQUEST] ${method} ${originalUrl} - ${statusCode} - ${duration} ms - IP: ${ip} - User: ${userId}.`);
    });
    next();
};