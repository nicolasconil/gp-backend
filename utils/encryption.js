import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import { logAudit } from "./logger.js";

const ENCRYPTION_KEY = process.env.ADDRESS_ENCRYPTION_KEY;
const IV_LENGTH = 16;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    throw new Error('ADDRESS_ENCRYPTION_KEY debe estar definida y tener 32 caracteres.');
};

export const encryptText = (text, userId = 'sistema') => {
    if (!text) return '';
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        logAudit('EncryptText', userId, true);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        logAudit('EncryptText', userId, false);
        throw error;
    }
};

export const decryptText = (text, userId = 'sistema') => {
    if (!text) return '';
    try {
        const [ivHex, encryptedData] = text.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const encrypted = Buffer.from(encryptedData, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encrypted);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        logAudit('DecryptText', userId, true);
        return decrypted.toString();
    } catch (error) {
        logAudit('DecryptText', userId, false);
        throw error;
    } 
};