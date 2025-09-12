import express from 'express';
import axios from 'axios';

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.gpfootwear.com';
const API_BASE = process.env.VITE_BACKEND_URL || 'https://gp-backend-f7dk.onrender.com';
const INDEX_HTML_PATH_ON_FRONTEND = '/index.html';

let cachedIndexHtml = null;
let cachedIndexFetchedAt = 0;
const INDEX_CACHE_TTL_MS = 1000 * 60 * 5;

const fetchFrontendIndex = async () => {
    const now = Date.now();
    if (cachedIndexHtml && (now - cachedIndexFetchedAt) < INDEX_CACHE_TTL_MS) {
        return cachedIndexHtml;
    }
    const idxUrl = `${FRONTEND_URL}${INDEX_HTML_PATH_ON_FRONTEND}`;
    const resp = await axios.get(idxUrl, { responseType: 'text' });
    cachedIndexHtml = resp.data;
    cachedIndexFetchedAt = Date.now();
    return cachedIndexHtml;
};

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const truncate = (s = '', n = 200) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s);

const makeAbsoluteImage = (img = '') => {
  if (!img) return `${FRONTEND_URL}/logo.svg`;
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  if (img.startsWith('/uploads')) return `${API_BASE}${img}`;
  return `${API_BASE}/${img.replace(/^\/+/, '')}`;
};

router.get('/product/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const indexHtml = await fetchFrontendIndex();
    if (!indexHtml) return res.status(500).send('Index not available');
    const productResp = await axios.get(`${API_BASE}/api/products/${id}`);
    const raw = productResp?.data || {};
    const product = raw.data || raw.product || raw || null;
    if (!product || !product._id) {
      return res.status(200).send(indexHtml);
    }

    const title = escapeHtml(product.name || 'Producto');
    const desc = escapeHtml(truncate(product.description || '', 200));
    const image = escapeHtml(makeAbsoluteImage(
      Array.isArray(product.images) && product.images.length
        ? product.images[0]
        : product.image || ''
    ));
    const productUrl = `${FRONTEND_URL}/producto/${id}`;

    const metas = `
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${desc}" />
      <meta property="og:image" content="${image}" />
      <meta property="og:url" content="${productUrl}" />
      <meta property="og:type" content="product" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${desc}" />
      <meta name="twitter:image" content="${image}" />
      <title>${title}</title>
    `;

    let out = indexHtml;
    if (out.includes('<!--PRERENDER_META-->')) {
      out = out.replace('<!--PRERENDER_META-->', metas);
    } else {
      out = out.replace('</head>', `${metas}\n</head>`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(out);
  } catch (err) {
    console.error('Prerender error:', err?.response?.data || err.message || err);
    try {
      const indexHtml = await fetchFrontendIndex();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(indexHtml);
    } catch (e) {
      return res.status(500).send('Error prerendering product');
    }
  }
});

export default router;