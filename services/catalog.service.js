import * as CatalogRepository from "../repositories/catalog.repository.js";

export const createCatalog = async (name, description) => {
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
    try {
        const catalog = await CatalogRepository.getCatalogById(id);
        return catalog;
    } catch (error) {
        throw new Error(`Error al obtener el catálogo: ${error.message}.`);        
    }
};

export const updateCatalog = async (id, updateData) => {
    try {
        const updatedCatalog = await CatalogRepository.updateCatalog(id, updateData);
        return updatedCatalog;
    } catch (error) {
        throw new Error(`Error al actualizar el catálogo: ${error.message}.`);
    }
};

export const deleteCatalog = async (id) => {
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