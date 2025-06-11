import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

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
import auhtRoutes from "./routes/auth.routes.js";

import csrfRoutes from "./routes/csrf.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

const port = process.env.PORT || 3000;
const mongodb = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/backend-gp";
const allowedOrigins = [process.env.FRONTEND_URL];

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if(allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use('/', limiter);
app.use(requestLogger);

app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/stock', stockMovementRoutes);
app.use('/shipping', shippingRoutes);
app.use('/catalogs', catalogRoutes);
app.use('/mercadopago', mercadoPagoRoutes);
app.use('/promotions', promotionRoutes);
app.use('/newsletter', newsletterRoutes);
app.use('/', authRoutes);

app.use('/', csrfRoutes);
app.use('/', authRoutes);

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

mongoose.connect(mongodb)
    .then(() => console.log("MongoDB connected to GP Footwear."))
    .catch(error => console.error("Connection error: ", error));


app.listen(port, () => {
    console.log(`Server is running in port ${port}.`);
});