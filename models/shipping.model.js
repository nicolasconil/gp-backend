import mongoose from "mongoose";

const ShippingSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    shippingCost: {
        type: Number,
    },
    carrier: {
        type: String,
        default: 'Correo Argentino'
    },
    method: {
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
            default: ''
        },
        phone: {
            type: String,
            default: ''
        },
        street: {
            type: String,
            default: ''
        },
        number: {
            type: String,
            default: ''
        },
        apartment: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            default: ''
        },
        province: {
            type: String,
            default: ''
        },
        default: {}
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

ShippingSchema.index({ order: 1 }, { unique: true });

ShippingSchema.set("toObject", { virtuals: true });
ShippingSchema.set("toJSON", { virtuals: true });

export default mongoose.model('Shipping', ShippingSchema);
