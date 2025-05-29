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

export default logger;