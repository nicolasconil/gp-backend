import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import { fileURLToPath } from "url";
import { dirname } from "path";

import { limiter } from "./middleware/ratelimit.middleware.js";
import { requestLogger } from "./middleware/requestLogger.middleware.js";

import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import stockMovementRoutes from "./routes/stockMovement.routes.js";
import shippingRoutes from "./routes/shipping.routes.js";
import catalogRoutes from "./routes/catalog.routes.js";
import mercadoPagoRoutes from "./routes/mercadoPago.routes.js";
import promotionRoutes from "./routes/promotion.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";

import csrfRoutes from "./routes/csrf.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Redirect HTTP to HTTPS in production
app.use((req, res, next) => {
    if (
        process.env.NODE_ENV === 'production' &&
        req.headers['x-forwarded-proto'] !== 'https'
    ) {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

const port = process.env.PORT || 3000;
const mongodbUri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/backend-gp';

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self' https://betagpfootwear.netlify.app; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://betagpfootwear.netlify.app; style-src 'self' 'unsafe-inline' https://betagpfootwear.netlify.app;"
    );
    next();
});

app.use(compression());

// CORS configuration
const allowedOrigins = [
    'https://betagpfootwear.netlify.app',
    process.env.FRONTEND_URL
];

const corsOptions = {
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps or curl)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn('❌ CORS blocked for origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN']
};

// Apply CORS middleware
app.use(cors(corsOptions));
// Enable preflight across the board
app.options('*', cors(corsOptions));

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.use('/assets', express.static('assets'));
app.use('/', limiter);
app.use(requestLogger);

// Routes
app.use('/api/auth', csrfRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/mercadopago', mercadoPagoRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Root
app.get('/', (req, res) => {
    res.send('Backend GP Footwear funcionando.');
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada.' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});

// Connect to MongoDB & start server
mongoose
    .connect(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ Conexión a MongoDB exitosa'))
    .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

import util from "util";

console.log('\n🚀 Rutas registradas en Express:');
app._router.stack
  .filter(layer => layer.route)
  .forEach(layer => {
    const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
    console.log(`  ${methods.padEnd(7)}  ${layer.route.path}`);
  });
console.log(); // línea en blanco

app.listen(port, () => console.log(`Server is running on port ${port}.`));
