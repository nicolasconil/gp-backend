import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
    street: { type: String, required: [true, "La dirección es obligatoria"] },
    number: { type: String, required: [true, "El número es obligatorio"] },
    apartment: String,
    floor: String,
    city: { type: String, required: [true, "La ciudad es obligatoria"] },
    province: { type: String, required: [true, "La provincia es obligatoria"] },
    postalCode: { type: String, required: [true, "El código postal es obligatorio"] },
}, { _id: false });
 
const OrderSchema = new mongoose.Schema({
    guestEmail: {
        type: String,
        required: [true, 'El email es obligatorio'],
    },
    guestName: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
    },
    guestPhone: {
        type: String,
        required: [true, 'El teléfono es obliogatorio'],
    },
    guestAddress: {
        type: AddressSchema,
        required: true
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
        enum: ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado', 'rechazada'],
        default: 'pendiente'
    },
    totalAmount: {
        type: Number,
        min: 0
    },
    payment: {
        status: {
            type: String,
            enum: ['aprobado', 'pendiente', 'rechazado'],
        },
        transactionId: String,
        preferenceId: String,
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

OrderSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Order', OrderSchema);
