import * as CatalogService from "../services/catalog.service.js";
import logger from "../utils/logger.js";

export const createCatalog = async (req, res) => {
    try {
        const { name, description } = req.body;
        const catalog = await CatalogService.createCatalog(name, description);
        logger.info(`POST /catalogs - Catálogo creado con ID: ${catalog._id}.`);
        res.status(201).json(catalog);
    } catch (error) {
        logger.error(`POST /catalogs - ${error.message}.`);
        res.status(500).json({ message: `Error al crear el catálogo: ${error.message}.` });
    }
};

export const getAllCatalogs = async (req, res) => {
    try {
        const filter = req.query;
        const catalogs = await CatalogService.getAllCatalogs(filter);
        logger.info(`GET /catalogs - ${catalogs.length} catálogos obtenidos.`);
        res.status(200).json(catalogs);
    } catch (error) {
        logger.error(`GET /catalogs - ${error.message}.`);
        res.status(500).json({ message: `Error al obtener los catálogos: ${error.message}.` });
    }
};

export const getCatalogById = async (req, res) => {
    try {
        const { id } = req.params;
        const catalog = await CatalogService.getCatalogById(id);
        if (!catalog) {
            logger.warn(`GET /catalogs/${id} - Catálogo no encontrado.`);
            return res.status(404).json({ message: 'Catálogo no encontrado.' });
        }
        logger.info(`GET /catalogs/${id} - Catálogo obtenido correctamente.`);
        res.status(200).json(catalog);
    } catch (error) {
        logger.error(`GET /catalogs/${req.params.id} - ${error.message}.`);
        res.status(500).json({ message: `Error al obtener el catálogo: ${error.message}.` });
    }
};

export const updateCatalog = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedCatalog = await CatalogService.updateCatalog(id, updateData);
        if (!updatedCatalog) {
            logger.warn(`PATCH /catalogs/${id} - Catálogo no encontrado.`);
            return res.status(404).json({ message: 'Catálogo no encontrado.' });
        }
        logger.info(`PATCH /catalogs/${id} - Catálogo actualizado correctamente.`);
        res.status(200).json(updatedCatalog);
    } catch (error) {
        logger.error(`PATCH /catalogs/${req.params.id} - ${error.message}.`);
        res.status(500).json({ message: `Error al actualizar el catálogo: ${error.message}.` });
    }
};

export const deleteCatalog = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCatalog = await CatalogService.deleteCatalog(id);
        if (!deletedCatalog) {
            logger.warn(`DELETE /catalogs/{id} - Catálogo no encontrado.`);
            return res.status(404).json({ message: 'Catálogo no encontrado.' });
        }
        logger.info(`DELETE /catalogs/${id} - Catálogo eliminado correctamente.`);
        res.status(200).json({ message: 'Catálogo eliminado correctamente.' });
    } catch (error) {
        logger.error(`DELETE /catalogs/${req.params.id} - ${error.message}.`);
        res.status(500).json({ message: `Error al eliminar el catálogo: ${error.message}.` });
    }
};

export const getActiveCatalogs = async (req, res) => {
    try {
        const activeCatalogs = await CatalogService.getActiveCatalogs();
        logger.info(`GET /catalogs/active - ${activeCatalogs.length} catálogos activos obtenidos.`);
        res.status(200).json(activeCatalogs);
    } catch (error) {
        logger.error(`GET /catalogs/active - ${error.message}.`);
        res.status(500).json({ message: `Error al obtener los catálogos activos: ${error.message}.` });
    }
};