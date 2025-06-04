import mongoose from "mongoose";

const CatalogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
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

CatalogSchema.index({ name: 'text' });

const Catalog = mongoose.model('Catalog', CatalogSchema);
export default Catalog;