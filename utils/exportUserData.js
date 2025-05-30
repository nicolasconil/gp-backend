import * as UserService from "../services/user.service.js";
import { decryptUserFields } from "./dataPrivacity.js";
import { generatePDFBuffer, generateCSV, generateJSON } from "./generators.js";

export const exportUserDataFile = async (userId, format) => {
    try {
        const user = await UserService.getById(userId);
        if (!user) {
            throw new Error('Usuario no encontrado.');
        }
        const decryptedUser = decryptUserFields(user.toObject());
        let buffer, contentType, extension;
        switch (format) {
            case 'pdf':
                buffer = await generatePDFBuffer(decryptedUser);
                contentType = 'application/pdf';
                extension = 'pdf';
                break;
            case 'csv': 
                buffer = Buffer.from(generateCSV(decryptedUser));
                contentType = 'text/csv';
                extension = 'csv';
                break;
            case 'json':
                buffer = Buffer.from(generateJSON(decryptedUser));
                contentType = 'application/json';
                extension = 'json';
                break;
            default:
                throw new Error('Formato no válido.');
        }
        return { buffer, contentType, extension };
    } catch (error) {
        throw new Error(`Error al exportar los datos del usuario: ${error.message}.`);
    }
};