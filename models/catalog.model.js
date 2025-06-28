import mongoose from "mongoose";

const CatalogSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true
    },
    description: {
        type: String,
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

CatalogSchema.index({ name: 'text' });

export default mongoose.model('Catalog', CatalogSchema);
