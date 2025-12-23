// src/repositories/product.repository.js
import Product from '../models/product.model.js';

/**
 * Escapa una cadena para usarla en RegExp segura.
 */
function escapeRegExp(str = '') {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Campos permitidos para ordenar (whitelist)
 */
const ALLOWED_SORT_FIELDS = ['price', 'name', 'createdAt', 'brand', 'category'];

/**
 * Construye y ejecuta la consulta de productos según filtros.
 * filters = { name, gender, brand, catalog, category, size, minPrice, maxPrice, isActive, available }
 */
export const getAllProducts = async (filters = {}, sortBy = 'price', order = 1) => {
  const query = {};

  // name: substring case-insensitive (safe regexp)
  if (filters.name) {
    const safe = escapeRegExp(filters.name);
    query.name = { $regex: safe, $options: 'i' };
  }

  // brand (case-insensitive exact-ish)
  if (filters.brand) {
    const safe = escapeRegExp(String(filters.brand));
    query.brand = { $regex: `^${safe}$`, $options: 'i' };
  }

  // catalog (case-insensitive exact-ish)
  if (filters.catalog) {
    const safe = escapeRegExp(String(filters.catalog));
    query.catalog = { $regex: `^${safe}$`, $options: 'i' };
  }

  // category (case-insensitive exact-ish)
  if (filters.category) {
    const safe = escapeRegExp(String(filters.category));
    // si en tu modelo guardás category como array -> ajustar a $in
    query.category = { $regex: `^${safe}$`, $options: 'i' };
  }

  // gender (case-insensitive exact-ish)
  if (filters.gender) {
    const safe = escapeRegExp(String(filters.gender));
    query.gender = { $regex: `^${safe}$`, $options: 'i' };
  }

  // price range
  if (typeof filters.minPrice === 'number' || typeof filters.maxPrice === 'number') {
    query.price = {};
    if (typeof filters.minPrice === 'number') query.price.$gte = filters.minPrice;
    if (typeof filters.maxPrice === 'number') query.price.$lte = filters.maxPrice;
  }

  // isActive boolean
  if (typeof filters.isActive === 'boolean') {
    query.isActive = filters.isActive;
  } else if (filters.isActive !== undefined && (filters.isActive === 'true' || filters.isActive === 'false')) {
    query.isActive = filters.isActive === 'true';
  }

  // size filtering: acepta "38" o "38,39" o array
  if (filters.size) {
    let sizes = filters.size;
    if (typeof sizes === 'string') {
      sizes = sizes.split(',').map(s => String(s).trim()).filter(Boolean);
    }
    if (Array.isArray(sizes) && sizes.length > 0) {
      // si se pide sólo sizes (sin available) -> buscar variaciones con ese talle
      if (filters.available === 'true' || filters.available === true) {
        query.variations = {
          $elemMatch: {
            size: { $in: sizes },
            stock: { $gt: 0 },
          },
        };
      } else {
        query['variations.size'] = { $in: sizes };
      }
    }
  } else if (filters.available === 'true' || filters.available === true) {
    // sin size, pero con available=true -> al menos una variación con stock > 0
    query['variations.stock'] = { $gt: 0 };
  }

  // Orden seguro: si sortBy no está en whitelist, usar price
  const sortField = ALLOWED_SORT_FIELDS.includes(String(sortBy)) ? String(sortBy) : 'price';
  const sortObj = {};
  sortObj[sortField] = order === -1 ? -1 : 1;

  // Ejecutar consulta y devolver lean objects
  const products = await Product.find(query).sort(sortObj).lean().exec();
  return products;
};

export const getProduct = async (id) => {
  if (!id) return null;
  return await Product.findById(id).lean().exec();
};

export const createProduct = async (data) => {
  const product = new Product(data);
  const saved = await product.save();
  return saved.toObject();
};

export const updateProduct = async (id, data) => {
  if (!id) return null;
  const updated = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean().exec();
  return updated;
};

export const deleteProduct = async (id) => {
  if (!id) return null;
  const deleted = await Product.findByIdAndDelete(id).lean().exec();
  return deleted;
};

/**
 * Actualiza stock de una variación. Si no existe la variación, la agrega.
 * size & color matching case-insensitive (color trimmed).
 */
export const updateProductStock = async (productId, size, color, newStock) => {
  if (!productId) throw new Error('productId required');
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const s = String(size);
  const c = String(color).trim().toLowerCase();

  product.variations = product.variations || [];

  let modified = false;
  for (let i = 0; i < product.variations.length; i += 1) {
    const v = product.variations[i];
    if (String(v.size) === s && String(v.color).trim().toLowerCase() === c) {
      v.stock = Number(newStock);
      modified = true;
      break;
    }
  }

  if (!modified) {
    product.variations.push({ size: s, color: c, stock: Number(newStock) });
  }

  const saved = await product.save();
  return saved.toObject();
};
