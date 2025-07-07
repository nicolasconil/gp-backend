import mongoose from "mongoose";

const StockMovementSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    size: {
        type: Number,
    },
    color: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    movementType: {
        type: String,
        enum: ['venta', 'ingreso']
    },
    note: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now
    },
},
    { timestamps: true }
);

StockMovementSchema.post('save', async function (doc, next) {
    try {
        const Product = mongoose.model('Product');
        const delta = doc.movementType === 'ingreso' ? doc.quantity : -doc.quantity;
        const res = await Product.updateOne(
            {
                _id: doc.product,
                'variations.size': doc.size,
                'variations.color': doc.color,
            },
            { $inc: { 'variations.$.stock': delta } },
            { session: doc.$session() }
        );
        if (res.matchedCount === 0) {
            await mongoose.model('StockMovement').deleteOne({ _id: doc._id });
            return next(new Error('Variación no encontrada en el producto.'));
        }
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model('StockMovement', StockMovementSchema);

