import mongoose from "mongoose";

const ShippingSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        unique: true
    },
    shippingCost: {
        type: Number,
    },
    shippingCarrier: {
        type: String,
        default: 'Correo Argentino'
    },
    shippingMethod: {
        type: String,
        default: 'Estándar'
    },
    shippingTrackingNumber: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pendiente', 'preparando', 'en camino', 'entregado', 'rechazado', 'devuelto'],
        default: 'pendiente'
    },
    destinationPostalCode: {
        type: String,
    },
    deliveryAddress: {
        fullName: {
            type: String,
        },
        phone: {
            type: String,
        },
        street: {
            type: String,
        },
        number: {
            type: String,
        },
        apartment: {
            type: String
        },
        city: {
            type: String,
        },
        province: {
            type: String,
        }
    },
    notes: {
        type: String,
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

ShippingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Shipping', ShippingSchema);
