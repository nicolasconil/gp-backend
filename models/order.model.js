import mongoose, { mongo } from "mongoose";

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    guestEmail: {
        type: String,
        required: function () {
            return !this.user;
        }
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
        },
        size: String,
        color: String,
        price: Number
    }],
    shipping: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipping',
        required: false
    },
    status: {
        type: String,
        enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    payment: {
        method: {
            type: String,
            enum: ['mercadopago'],
            required: true,
            default: 'mercadopago'
        },
        status: {
            type: String,
            enum: ['aprobado', 'pendiente', 'rechazado'],
            required: true
        },
        transactionId: String, // MP payment.id
        preferenceId: String, // MP preference_id
        rawData: Object
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

OrderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;