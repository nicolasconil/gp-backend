import * as ProductService from "../services/product.service.js";
import logger from "../utils/logger.js";

export const getAll = async (req, res) => {
    try {
        const filters = {
            name: req.query.name || '',
            gender: req.query.gender,
            brand: req.query.brand,
            catalog: req.query.catalog,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
            isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
        };
        const sortBy = req.query.sortBy || 'price';
        const order = req.query.order === 'desc' ? -1 : 1;
        const products = await ProductService.getAll(filters, sortBy, order);
        logger.info(`GET /products - ${products.length} productos obtenidos con filtros: ${JSON.stringify(filters)}.`);
        res.status(200).json(products);
    } catch (error) {
        logger.error(`GET /products - ${error.message}.`);
        res.status(500).json({ message: `Error al obtener los productos: ${error.message}.` });        
    }
};

export const getById = async (req, res) => {
    try {
       const { id } = req.params;
       const product = await ProductService.getById(id);
       logger.info(`GET /products/${id}  Producto obtenido correctamente.`);
       res.status(200).json(product); 
    } catch (error) {
       logger.error(`GET /products/${req.params.id} - ${error.message}.`);
       res.status(404).json({ message: `Producto no encontrado: ${error.message}.` });
    }
};

export const create = async (req, res) => {
    try {
        if (req.file) {
            req.body.image = `/uploads/${req.file.filename}`;
        }
        const newProduct = await ProductService.create(req.body);
        logger.info(`POST /products - Producto creado con ID: ${newProduct._id}.`);
        res.status(201).json(newProduct);
    } catch (error) {
        logger.error(`POST /products - ${error.message}.`);
        res.status(400).json({ message: `Error al crear el producto: ${error.message}.` });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.file) {
            req.body.image = `/uploads/${req.file.filename}`;
        }
        const updated = await ProductService.update(id, req.body);
        logger.info(`PUT /products/${id} - Producto actualizado correctamente.`);
        res.status(200).json(updated);
    } catch (error) {
        logger.error(`PUT /products/${req.params.id} - ${error.message}.`);
        res.status(400).json({ message: `Error al actualizar el producto: ${error.message}.` });
    }
};

export const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await ProductService.remove(id);
        logger.info(`DELETE /products/${id} - Producto eliminado correctamente.`);
        res.status(200).json({ message: 'Producto eliminado correctamente', product: deleted });
    } catch (error) {
        logger.error(`DELETE /products/${req.params.id} - ${error.message}.`);
        res.status(400).json({ message: `Error al eliminar el producto: ${error.message}.` });
    }
};

export const updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { size, color, stock } = req.body;
        if (!size || !color || stock == null) {
            logger.warn(`PATCH /products/${id}/stock - Datos faltantes: size, color y stock son requeridos.`);
            return res.status(400).json({ message: 'Faltan datos: size, color y stock son requeridos.' });
        }
        if (stock < 0) {
            logger.warn(`PATCH /products/${id}/stock - Stock negativo no permitido.`);
            return res.status(400).json({ message: 'El stock no puede ser negativo.' });
        }
        const updated = await ProductService.updateStock(id, size, color, stock);
        logger.info(`PATCH /products/${id}/stock - Stock actualizado para size "${size}", color "${color}" con valor ${stock}.`);
        res.status(200).json(updated);
    } catch (error) {
        logger.error(`PATCH /products/${req.params.id}/stock - ${error.message}.`);
        res.status(400).json({ message: `Error al actualizar stock: ${error.message}.` });
    }
};