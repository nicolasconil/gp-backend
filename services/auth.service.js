import * as UserRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { encryptText } from "../utils/encryption.js";
import { generateRefreshToken, generateToken } from "../middleware/auth.middleware.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../middleware/email.middleware.js";


export const authenticateUser = async (email, password) => {
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');
    const user = await UserRepository.getUserByEmailHash(emailHash);
    if (!user) throw new Error('Usuario no encontrado.');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Contraseña incorrecta.');
    if (!user.isEmailVerified) throw new Error('Debes verificar tu correo.');
    const token = generateToken(user._id, user.role, user.isEmailVerified);
    const refreshToken = generateRefreshToken(user._id, user.role);
    return { token, refreshToken, userId: user._id, role: user.role };
};

export const registerUser = async ({
    email,
    password,
    name,
    role = 'cliente',
    termsAccepted,
    address = {},
    phone = {}
}) => {
    if (!termsAccepted) {
        throw new Error('Debes aceptar los términos y condiciones para registrarte.');
    }
    if (!email || !password || !name) {
        throw new Error('Faltan campos obligatorios.');
    }
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');
    const exist = await UserRepository.getUserByEmailHash(emailHash);
    if (exist) throw new Error('El correo electrónico ya está registrado.');
    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedEmail = encryptText(email);
    const [firstName, lastName] = name.split(' ');
    const encryptedFirstName = encryptText(firstName);
    const encryptedLastName = encryptText(lastName);
    const encryptedAddress = Object.fromEntries(
        Object.entries(address).map(([k, v]) => [k, encryptText(v)])
    );
    const encryptedPhone = {
        ...phone,
        number: phone.number ? encryptText(phone.number) : ''
    };
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const newUser = await UserRepository.createUser({
        email: encryptedEmail,
        emailHash,
        password: hashedPassword,
        name: {
            first: encryptedFirstName,
            last: encryptedLastName
        },
        role,
        address: encryptedAddress,
        phone: encryptedPhone,
        isEmailVerified: false,
        verificationToken,
        termsAccepted: true,
        termsAcceptedAt: new Date()
    });
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, firstName, verificationUrl);
    return newUser;
};

export const verifyUserEmail = async (token) => {
    const user = await UserRepository.findByVerificationToken(token);
    if (!user) throw new Error('Token inválido.');
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();
};

export const resetUserPassword = async (token, newPassword) => {
    const user = await UserRepository.findByResetToken(token);
    if (!user) throw new Error('Token inválido o expirado.');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
};

export const createGuestUser = async ({ address = {}, phone = {} }) => {
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const encryptedAddress = Object.fromEntries(
        Object.entries(address).map(([k, v]) => [k, encryptText(v)])
    );
    const encryptedPhone = {
        ...phone,
        number: phone.number ? encryptText(phone.number) : ''
    }; 
    const newGuest = await UserRepository.createUser({
        isGuest: true, 
        isEmailVerified: false,
        password: hashedPassword,
        address: encryptedAddress,
        phone: encryptedPhone
    });
    return newGuest;
};

export const requestPasswordReset = async (email) => { // solicita el restablecimiento de la contraseña
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');
    const user = await UserRepository.getUserByEmailHash(emailHash);
    if (!user) throw new Error('Usuario no encontrado.');
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = Date.now() + 3600000;
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
    await sendPasswordResetEmail(email, user.name.first, resetUrl)
};

export const validateResetPasswordToken = async (token) => {
    const user = await UserRepository.findByResetToken(token);
    if (!user || user.resetPasswordExpires < Date.now()) {
        throw new Error('Token inválido o expirado.');
    }
    return user;
};