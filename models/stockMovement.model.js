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
    }
});

export default mongoose.model('StockMovement', StockMovementSchema);

