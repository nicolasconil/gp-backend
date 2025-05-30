import mongoose from "mongoose";

const variationSchema = new mongoose.Schema({
    size: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    stockMinimo: {
        type: Number,
        default: 1
    }
}, {_id: false });

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: true,
        validate: [array => array.length > 0, 'Se requiere al menos una imagen']
    },
    gender: {
        type: String,
        required: true,
        enum: ['hombre', 'mujer', 'niños', 'unisex']
    },
    catalog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catalog'
    },
    variations: {
        type: [variationSchema],
        required: true
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ProductSchema.index({ name: 'text', brand: 'text' });
ProductSchema.index({ gender: 1 });
ProductSchema.index({ catalog : 1 });
ProductSchema.index({ price: 1 });

const Product = mongoose.model('Product', ProductSchema);
export default Product;