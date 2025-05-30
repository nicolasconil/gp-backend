import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const UserSchema = new mongoose.Schema({
    isGuest: {
        type: Boolean,
        default: false
    },
    name: {
        first: {
            type: String,
            trim: true,
            minlength: 2,
            required: false
        },
        last: {
            type: String,
            trim: true,
            minlength: 2,
            required: false
        }
    },
    email: {
        type: String,
        unique: false,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
        required: false
    },
    emailHash: {
        type: String,
        required: false
    },
    password: {
        type: String,
        minlength: 6,
        required: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['cliente', 'administrador', 'moderador'],
        default: 'cliente'
    },
    address: {
        street: { type: String, default: '' },
        number: { type: String, default: '' },
        floor: { type: String, default: '' },
        apartment: { type: String, default: '' },
        city: { type: String, default: '' },
        province: { type: String, default: '' },
        postalCode: { type: String, default: '' },
        country: { type: String, default: 'Argentina' },
    },
    phone: {
        countryCode: {
            type: String,
            default: "+54",
            match: [/^\+\d{1,4}$/, 'Código de país inválido']
        },
        number: {
            type: String,
            default: "",
            match: [/^[1-9]\d{6,14}$/, 'Número de teléfono inválido']
        }
    },
    productPreferences: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    ],
    verificationToken: String,
    verificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    termsAccepted: {
        type: Boolean,
        required: false,
        default: false
    },
    termsAcceptedAt: {
        type: Date,
        required: false
    },
    consent: {
        cookies: {
            type: Boolean,
            default: false
        },
        newsletter: {
            type: Boolean,
            default: false
        },
        acceptedAt: {
            type: Date
        }
    }
});

// pre-validación antes de guardar
UserSchema.pre('validate', function (next) {
    if (!this.isGuest) {
        if (!this.email) return next(new Error('El email es requerido para usuarios registrados.'));
        if (!this.password) return next(new Error('La contraseña es requerida para usuarios registrados.'));
        if (!this.termsAccepted) return next(new Error('Debes acordar los términos y condiciones.'));
    } else {
        const hasPersonalData =
            this.name?.first || this.name?.last || this.email || this.phone?.number || this.address?.street;
        if (hasPersonalData && !this.termsAccepted) {
            return next(new Error('Debes aceptar la política de privacidad para continuar como invitado.'));
        }
    };
    next();
});

// pre-guardado para cifrar la contraseña y generar el email hash
UserSchema.pre('save', async function (next) {
    if (this.isModified('email')) { // si el email cambió, genera el hash
        this.emailHash = crypto.createHash('sha256').update(this.email.toLowerCase()).digest('hex');
    }
    if (this.isModified('password')) { // si la contraseña se modificó, la cifra
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    if (this.isModified('termsAccepted') && this.termsAccepted && !this.termsAcceptedAt) { // si se aceptaron los términos, registra la fecha
        this.termsAcceptedAt = new Date();
    }
    next();
});

const User = mongoose.model('User', UserSchema);
export default User;
