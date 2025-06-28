import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    guestEmail: {
        type: String,
        required: true
    },
    guestName: {
        type: String, 
        required: true      
    },
    guestPhone: {
        type: String,
        required: true
    },
    guestAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, required: true },
        postalCode: { type: String, required: true },
        apartment: { type: String },
        number: { type: String, required: true },
        floor: { type: String },
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        quantity: {
            type: Number,
        },
        size: String,
        color: String,
        price: Number
    }],
    shipping: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipping',
    },
    status: {
        type: String,
        enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    totalAmount: {
        type: Number,
        min: 0
    },
    payment: {
        method: {
            type: String,
            enum: ['mercadopago'],
            default: 'mercadopago'
        },
        status: {
            type: String,
            enum: ['aprobado', 'pendiente', 'rechazado'],
        },
        transactionId: String, // MP payment.id
        preferenceId: String, // MP preference_id
        rawData: Object
    },
    cancelToken: {
        type: String, 
        unique: true
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

export default mongoose.model('Order', OrderSchema);
