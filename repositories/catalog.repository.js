import Catalog from "../models/catalog.model.js";

export const createCatalog = async (name, description) => {
    const catalog = new Catalog({ name, description });
    await catalog.save();
    return catalog;
};

export const getAllCatalogs = async (filter = {}) => {
    const catalogs = await Catalog.find(filter).select('name description isActive createdAt').lean();
    return catalogs;
};

export const getCatalogById = async (id) => {
    const catalog = await Catalog.findById(id);
    if (!catalog) throw new Error('Catálogo no encontrado.');
    return catalog;
};

export const updateCatalog = async (id, updateData) => {
    const catalog = await Catalog.findByIdAndUpdate(id, updateData, { new: true });
    if (!catalog) throw new Error('Catálogo no encontrado.');
    return catalog;
};

export const deleteCatalog = async (id) => {
    const catalog = await Catalog.findByIdAndDelete(id);
    if (!catalog) throw new Error('Catálogo no encontrado.');
    return catalog;
};

export const filterActiveCatalogs = async () => {
    const activeCatalogs = await Catalog.find({ isActive: true });
    return activeCatalogs;
};