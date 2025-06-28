import mongoose from "mongoose";

const variationSchema = new mongoose.Schema({
    size: {
        type: Number,
    },
    color: {
        type: String,
    },
    stock: {
        type: Number,
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
    },
    brand: {
        type: String,
    },
    price: {
        type: Number,
        min: 0
    },
    description: {
        type: String,
    },
    images: {
        type: [String],
        validate: [array => array.length > 0, 'Se requiere al menos una imagen']
    },
    gender: {
        type: String,
        enum: ['hombre', 'mujer', 'niños', 'unisex']
    },
    catalog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catalog'
    },
    variations: {
        type: [variationSchema],
        validate: [array => array.length > 0, 'Se requiere al menos una variante.']
    },
    isActive: {
        type: Boolean,
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

ProductSchema.methods.updateStock = function (size, color, quantity, type) {
    const variation = this.variations.find(v => v.size === size && v.color === color);
    if (!variation) throw new Error('Variación no encontrada.');
    if (type === 'venta') {
        if (variation.stock < quantity) throw new Error('Stock insuficiente.');
        variation.stock -= quantity;
    } else if (type === 'ingreso') {
        variation.stock += quantity;
    } else {
        throw new Error('Tipo de movimiento inválido.');
    }
};

ProductSchema.pre('validate', function (next) {
    const seen = new Set();
    for (const v of this.variations) {
        const key = `${v.size}-${v.color}`;
        if (seen.has(key)) {
            return next(new Error('No puede haber variaciones duplicadas con el mismo tamaño y color.'));
        }
        seen.add(key);
    }
    next();
});

export default mongoose.model('Product', ProductSchema);
