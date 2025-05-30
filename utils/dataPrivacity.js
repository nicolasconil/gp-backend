import { decryptText, encryptText } from "./encryption.js";

const encryptField = (field) => field ? encryptText(field) : field;

const decryptField = (field) => field ? decryptText(field) : field;

export const encryptAddress = (address = {}) => {
    const encrypted = {};
    for (const key of Object.keys(address)) {
        encrypted[key] = encryptField(address[key]);
    }
    return encrypted;
};

export const encryptPhone = (phone = {}) => {
    return {
        ...phone,
        number: encryptField(phone.number)
    }
};

export const encryptUserFields = (user) => {
    if (!user) return null;
    return {
        ...user,
        email: encryptField(user.email),
        name: {
            first: encryptField(user.name?.first),
            last: encryptField(user.name?.last)
        },
        phone: encryptPhone(user.phone),
        address: encryptAddress(user.address)
    }
};

export const decryptAddres = (address = {}) => {
    const decrypted = {};
    for (const key of Object.keys(address)) {
        decrypted[key] = decryptField(address[key]);
    }
    return decrypted;
};

export const decryptPhone = (phone = {}) => {
    return {
        ...phone,
        number: decryptField(phone.number)
    }
};

export const decryptUserFields = (user) => {
    if (!user) return null;
    const plainUser = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    return {
        ...plainUser,
        email: decryptField(plainUser.email),
        name: {
            first: decryptField(plainUser.name?.first),
            last: decryptField(plainUser.name?.last)
        },
        phone: decryptPhone(plainUser.phone),
        address: decryptAddres(plainUser.address)
    };
};

export const encryptGuestInfo = (guest = {}) => {
    return {
        name: {
            first: encryptField(guest.name?.first),
            last: encryptField(guest.name?.last)
        }, 
        email: encryptField(guest.email),
        phone: encryptPhone(guest.phone),
        address: encryptAddress(guest.address)
    };
};

export const decryptGuestInfo = (guest = {}) => {
    return {
        name: {
            first: decryptField(guest.name?.first),
            last: decryptField(guest.name?.last)
        },
        email: decryptField(guest.email),
        phone: decryptPhone(guest.phone),
        address: decryptAddres(guest.address)
    };
};