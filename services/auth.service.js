import * as UserRepository from "../repositories/user.repository.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { encryptText } from "../utils/encryption.js";
import { generateToken } from "../middleware/auth.middleware.js";


export const authenticateUser = async (email, password) => {
    const emailHash = crypto.createHash('sha256').update(email).digest('hex');
    const user = await UserRepository.getUserByEmailHash(emailHash);
    if (!user) throw new Error('Usuario no encontrado.');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Contraseña incorrecta.');
    if (!user.isEmailVerified) throw new Error('Debes verificar tu correo.');
    const token = generateToken(user._id, user.role);
    return { token, userId: user._id, role: user.role };
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
    const encryptedAddres = Object.fromEntries(
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
        address: encryptedAddres,
        phone: encryptedPhone,
        isEmailVerified: false,
        verificationToken,
        termsAccepted: true,
        termsAcceptedAt: new Date()
    });
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
    const encryptedAddres = Object.fromEntries(
        Object.entries(address).map(([k, v]) => [k, encryptText(v)])
    );
    const encryptedPhone = {
        ...phone,
        number: phone.number ? encryptText(phone.number) : ''
    }; 
    const newGuest = await UserRepository.createUser({
        isGuest: true, 
        password: hashedPassword,
        address: encryptedAddres,
        phone: encryptedPhone
    });
    return newGuest;
}