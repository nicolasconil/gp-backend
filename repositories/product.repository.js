import Product from "../models/product.model.js";

export const getAllProducts = async (filters = {}, sortBy = 'price', order = 1) => {
    const filterQuery = {};
    if (filters.name) {
        filterQuery.$text = { $search: filters.name };
    }
    if (filters.gender) {
        filterQuery.gender = filters.gender;
    }
    if (filters.brand) {
        filterQuery.brand = filters.brand;
    }
    if (filters.catalog) {
        filterQuery.catalog = filters.catalog;
    }
    if (filters.category) {
        filterQuery.category = filters.category;
    }
    if (filters.minPrice || filters.maxPrice) {
        filterQuery.price = {};
        if (filters.minPrice) {
            filterQuery.price.$gte = filters.minPrice;
        }
        if (filters.maxPrice) {
            filterQuery.price.$lte = filters.maxPrice;
        }
    }
    if (filters.isActive !== undefined) {
        filterQuery.isActive = filters.isActive;
    }
    if (filters.size) {
        let sizes = filters.size;
        if (typeof sizes === 'string') {
            if (sizes.includes(',')) sizes = sizes.split(',').map(s => String(s).trim());
            else sizes = [String(sizes).trim()];
        }
        if (Array.isArray(sizes) && sizes.length > 0) {
            if (filters.available === 'true' || filters.available === true) {
                filterQuery.variations = {
                    $elemMatch: {
                        size: { $in: sizes },
                        stock: { $gt: 0 }
                    }
                };
            } else {
                filterQuery['variations.size'] = { $in: sizes };
            }
        }
    } else if (filters.available === 'true' || filters.available === true) {
        filterQuery['variations.stock'] = { $gt: 0 };
    }
    return await Product.find(filterQuery).sort({ [sortBy]: order });
};

export const getProduct = async (id) => {
    return await Product.findById(id);
};

export const createProduct = async (data) => {
    const product = new Product(data);
    return await product.save();
};

export const updateProduct = async (id, data) => {
    return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

export const deleteProduct = async (id) => {
    return await Product.findByIdAndDelete(id);
};

export const updateProductStock = async (productId, size, color, newStock) => {
    const product = await Product.findOne({
        _id: productId,
        "variations.size": size,
        "variations.color": color
    });
    if (!product) {
        throw new Error('Producto o variación no encontrada.');
    }
    product.variations.forEach((variation) => {
        if (variation.size === size && variation.color === color) {
            variation.stock = newStock;
        }
    });
    return await product.save();
};