import winston from "winston";

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(), // consola (desarrollo)
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // solo errores
        new winston.transports.File({ filename: 'logs/combined.log' }) // todos los logs
    ],
});

export const logAudit = (action, userId, success) => {
    const timestamp = new Date().toISOString();
    logger.info(`[AUDIT] ${timestamp} - Acción: ${action}. Usuario: ${userId || 'N/A'}. Exitoso: ${success}`);  
};

export default logger;