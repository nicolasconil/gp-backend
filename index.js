import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

import path from "path";
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

app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
});

const port = process.env.PORT || 3000;
const mongodbUri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/backend-gp";

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy',
        "default-src 'self' https://betagpfootwear.netlify.app; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://betagpfootwear.netlify.app; style-src 'self' 'unsafe-inline' https://betagpfootwear.netlify.app;"
    );
    next();
})

app.use(compression());

const allowedOrigins = [
  'https://betagpfootwear.netlify.app',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ CORS bloqueado para origen:", origin);
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-XSRF-TOKEN',
    'XSRF-TOKEN',
    'x-xsrf-token',
    'xsrf-token'
  ],
}));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res) => {
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        res.set('Cross-Origin-Opener-Policy', 'same-origin');
    }
}));


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.use('/assets', express.static('assets'));

app.use('/', limiter);
app.use(requestLogger);

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/catalogs', catalogRoutes);
app.use('/api/mercadopago', mercadoPagoRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.use('/api', csrfRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send("Backend GP Footwear funcionando.");
});

app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta no encontrada.' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Error interno del servidor',
        error: err.message
    });
});

mongoose.connect(mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ Conexión a MongoDB exitosa"))
    .catch((err) => console.error("❌ Error al conectar a MongoDB:", err));


app.listen(port, () => {
    console.log(`Server is running in port ${port}.`);
});