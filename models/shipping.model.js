import mongoose from "mongoose";
import { encryptUserFields, decryptUserFields } from "../utils/dataPrivacity.js";

const ShippingSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
        unique: true
    },
    shippingCost: {
        type: Number,
        default: null
    },
    shippingCarrier: {
        type: String,
        enum: ['Correo Argentino'],
        default: 'Correo Argentino'
    },
    shippingMethod: {
        type: String,
        enum: ['Estándar', 'Express'],
        default: 'Estándar'
    },
    shippingTrackingNumber: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pendiente', 'preparando', 'en camino', 'entregado', 'rechazado', 'devuelto']
    },
    destinationPostalCode: {
        type: String,
        required: true,
        match: /^[0-9]{4}$/
    },
    deliveryAddress: {
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        number: {
            type: String,
            required: true
        },
        apartment: {
            type: String
        },
        city: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        }
    },
    guestInfo: {
        email: {
            type: String,
            match: /.+\@.+\..+/
        },
        fullName: String,
        phone: {
            number: String
        },
        address: {
            street: String,
            number: String,
            apartment: String,
            city: String,
            province: String,
            postalCode: String
        }
    },
    estimatedDeliveryDate: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
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
    encryptUserFields(this.deliveryAddress);
    if (this.guestInfo) {
        encryptUserFields(this.guestInfo);
    }
    next();
});

ShippingSchema.methods.toJSON = function () {
    const obj = this.toObject();
    if (obj.deliveryAddress) decryptUserFields(obj.deliveryAddress);
    if (obj.guestInfo) decryptUserFields(obj.guestInfo);
    return obj;
};

const Shipping = mongoose.model('Shipping', ShippingSchema);
export default Shipping;