import * as CatalogRepository from "../repositories/catalog.repository.js";

export const createCatalog = async (name, description) => {
    if (!name || !description) {
        throw new Error('El nombre y la descripción son obligatorios.');
    }
    try {
        const catalog = await CatalogRepository.createCatalog(name, description);
        return catalog;
    } catch (error) {
        throw new Error(`Error al crear el catálogo: ${error.message}.`);
    }
};

export const getAllCatalogs = async (filter = {}) => {
    try {
        const catalogs = await CatalogRepository.getAllCatalogs(filter);
        return catalogs;
    } catch (error) {
        throw new Error(`Error al obtener los catálogos: ${error.message}.`);
    }
};

export const getCatalogById = async (id) => {
    if (!id) throw new Error('El ID del catálogo es obligatorio.');
    try {
        const catalog = await CatalogRepository.getCatalogById(id);
        return catalog;
    } catch (error) {
        throw new Error(`Error al obtener el catálogo: ${error.message}.`);        
    }
};

export const updateCatalog = async (id, updateData) => {
    if (!id || !updateData) {
        throw new Error('El ID y los datos de actualización son obligatorios.');
    }
    try {
        const updatedCatalog = await CatalogRepository.updateCatalog(id, updateData);
        return updateCatalog;
    } catch (error) {
        throw new Error(`Error al actualizar el catálogo: ${error.message}.`);
    }
};

export const deleteCatalog = async (id) => {
    if (!id) throw new Error('El ID del catálogo es obligatorio.');
    try {
        const deletedCatalog = await CatalogRepository.deleteCatalog(id);
        return deletedCatalog;
    } catch (error) {
        throw new Error(`Error al eliminar el catálogo: ${error.message}.`);
    }
};

export const getActiveCatalogs = async () => {
    try {
        const activeCatalogs = await CatalogRepository.filterActiveCatalogs();
        return activeCatalogs;
    } catch (error) {
        throw new Error(`Error al obtener los catálogos activos: ${error.message}.`);
    }
};