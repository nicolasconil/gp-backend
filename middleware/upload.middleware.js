import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from "path";

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'products',
        allowed_formats: allowedExtensions.map(ext => ext.replace('.', '')),
        transformation: [{ quality: 'auto' }]
    },
});

function fileFilter (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if(!allowedExtensions.includes(ext)) {
        return cb(new Error('Solo se permiten imágenes (.jpg, .jpeg, .png, .webp).'), false);
    }
    cb(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export default upload;