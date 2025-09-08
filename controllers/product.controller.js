import * as ProductService from "../services/product.service.js";
import logger from "../utils/logger.js";

function extractFileUrl(file) {
  if (!file) return null;
  return file.path || file.secure_url || file.url || file.location || file.filename || null;
}

export const getAll = async (req, res) => {
  try {
    const filters = {
      name: req.query.name || "",
      gender: req.query.gender,
      brand: req.query.brand,
      catalog: req.query.catalog,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      isActive:
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined,
    };

    const sortBy = req.query.sortBy || "price";
    const order = req.query.order === "desc" ? -1 : 1;
    const products = await ProductService.getAll(filters, sortBy, order);

    logger.info(
      `GET /products - ${products.length} productos obtenidos con filtros: ${JSON.stringify(
        filters
      )}.`
    );
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
    const {
      name, brand, price, description,
      gender, isActive
    } = req.body;
    let { catalog } = req.body;
    catalog = catalog?.trim() || null;
    let variations = [];
    if (req.body.variations) {
      try {
        variations = typeof req.body.variations === 'string' ? JSON.parse(req.body.variations) : req.body.variations;
      } catch (err) {
        return res.status(400).json({ message: "Variaciones mal formateadas." });
      }
    }
    if (!variations || !Array.isArray(variations) || variations.length === 0) {
      return res.status(400).json({ message: "Debe incluir al menos una variación." });
    }
    const files = req.files || (req.file ? [req.file] : []);
    const imageUrls = (files || []).map(f => extractFileUrl(f)).filter(Boolean);
    if (req.body.image && imageUrls.length === 0) {
      imageUrls.push(req.body.image);
    }
    const productData = {
      name,
      brand,
      price,
      description,
      gender,
      catalog,
      isActive,
      variations,
      images: imageUrls, 
      image: imageUrls[0] || null, 
    };
    const newProduct = await ProductService.create(productData);
    res.status(201).json(newProduct);
  } catch (err) {
    logger.error(`POST /products - ${err.message}`);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductService.getById(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    if (req.body.variations && typeof req.body.variations === 'string') {
      try {
        req.body.variations = JSON.parse(req.body.variations);
      } catch (err) {
        return res.status(400).json({ message: "Variaciones mal formateadas." });
      }
    }
    const newFiles = req.files || (req.file ? [req.file] : []);
    const newImageUrls = (newFiles || []).map(f => extractFileUrl(f)).filter(Boolean);
    let imagesToKeep = null;
    if (req.body.imagesToKeep) {
      try {
        imagesToKeep = typeof req.body.imagesToKeep === 'string'
          ? JSON.parse(req.body.imagesToKeep)
          : req.body.imagesToKeep;
        if (!Array.isArray(imagesToKeep)) imagesToKeep = null;
      } catch (err) {
        return res.status(400).json({ message: "imagesToKeep mal formateado." });
      }
    }
    const updates = {
      name: req.body.name,
      brand: req.body.brand,
      price: req.body.price,
      description: req.body.description,
      gender: req.body.gender,
      variations: req.body.variations, 
      isActive: req.body.isActive,
      catalog: req.body.catalog,
    };
    let finalImages = product.images ? [...product.images] : [];
    if (newImageUrls.length > 0) {
      finalImages = (imagesToKeep && Array.isArray(imagesToKeep))
        ? [...imagesToKeep, ...newImageUrls]
        : [...newImageUrls]; 
    } else if (imagesToKeep && Array.isArray(imagesToKeep)) {
      finalImages = [...imagesToKeep];
    } 
    updates.images = finalImages;
    updates.image = finalImages[0] || null;
    const updated = await ProductService.update(id, updates);
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
    res.status(200).json({ message: "Producto eliminado correctamente", product: deleted });
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
      logger.warn(`PATCH /products/${id}/stock - Datos faltantes.`);
      return res.status(400).json({ message: "Faltan datos: size, color y stock son requeridos." });
    }
    if (stock < 0) {
      logger.warn(`PATCH /products/${id}/stock - Stock negativo no permitido.`);
      return res.status(400).json({ message: "El stock no puede ser negativo." });
    }
    const updated = await ProductService.updateStock(id, size, color, stock);
    logger.info(`PATCH /products/${id}/stock - Stock actualizado.`);
    res.status(200).json(updated);
  } catch (error) {
    logger.error(`PATCH /products/${req.params.id}/stock - ${error.message}.`);
    res.status(400).json({ message: `Error al actualizar stock: ${error.message}.` });
  }
};
