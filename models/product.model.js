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
    },
    image: {
        type: String
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
    image: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['hombre', 'mujer', 'niños', 'unisex']
    },
    catalog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catalog',
        required: false,
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

ProductSchema.virtual('stock').get(function () {
    return this.variations.reduce((acc, v) => acc + v.stock, 0);
});

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

ProductSchema.methods.moveStock = function ({ size, color, qty, type }) {
    const variation = this.variations.find(
        (v) => v.size === size && v.color.toLowerCase() === color.toLowerCase()
    );
    if (!variation) throw new Error('Validación no encontrada.');
    const delta = type === 'venta' ? -Math.abs(qty) : Math.abs(qty);
    if (variation.stock + delta < 0) throw new Error('Stock insuficiente.');
    variation.stock += delta;
    return this;
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
