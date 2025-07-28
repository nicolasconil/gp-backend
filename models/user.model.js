import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    emailHash: {
        type: String,
    },
    password: {
        type: String,
        minlength: 6,
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['administrador', 'moderador'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('email')) { 
        this.emailHash = crypto.createHash('sha256').update(this.email.toLowerCase()).digest('hex');
    }
    if (this.isModified('password')) { 
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    if (this.isModified('termsAccepted') && this.termsAccepted && !this.termsAcceptedAt) { 
        this.termsAcceptedAt = new Date();
    }
    next();
});

const User = mongoose.model('User', UserSchema);
export default User;
