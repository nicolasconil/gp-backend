import express from "express";
import * as ProductController from "../controllers/product.controller.js";
import * as ProductService from "../services/product.service.js"; //
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = express.Router();

import fs from "fs";
import path from "path";

const FRONTEND_URL = process.env.FRONTEND_URL || "https://www.gpfootwear.com"; 
const INDEX_PATH = "/index.html";

let cachedIndexHtml = null;
let cachedAt = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

async function fetchFrontendIndex() {
  const now = Date.now();
  if (cachedIndexHtml && now - cachedAt < CACHE_TTL) return cachedIndexHtml;
  const url = `${FRONTEND_URL}${INDEX_PATH}`;
  try {
    const axios = await import("axios").then(m => m.default);
    const resp = await axios.get(url, { responseType: "text" });
    cachedIndexHtml = resp.data;
    cachedAt = Date.now();
    return cachedIndexHtml;
  } catch (err) {
    console.warn("Failed to fetch index.html from FRONTEND_URL:", err?.message || err);
    try {
      const fallbackPath = path.join(process.cwd(), "prerender-fallback.html");
      if (fs.existsSync(fallbackPath)) {
        cachedIndexHtml = fs.readFileSync(fallbackPath, "utf8");
        cachedAt = Date.now();
        return cachedIndexHtml;
      }
    } catch (fsErr) {
      console.warn("Fallback index read failed:", fsErr?.message || fsErr);
    }
    throw err;
  }
}

const escapeHtml = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const truncate = (s = "", n = 200) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s);

const makeAbsoluteImage = (img = "") => {
  if (!img) return `${FRONTEND_URL}/logo.svg`;
  if (/^https?:\/\//i.test(img)) return img;
  const API_BASE = process.env.API_BASE || process.env.VITE_BACKEND_URL || "";
  if (img.startsWith("/uploads")) return `${API_BASE}${img}`;
  return API_BASE ? `${API_BASE}/${img.replace(/^\/+/, "")}` : `${FRONTEND_URL}/${img.replace(/^\/+/, "")}`;
};

router.get("/prerender/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const indexHtml = await fetchFrontendIndex();
    if (!indexHtml) return res.status(500).send("index.html not available");
    let product;
    try {
      product = await ProductService.getById(id);
    } catch (err) {
      console.warn("Prerender: product not found:", err?.message || err);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(indexHtml);
    }

    if (!product || !product._id) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(indexHtml);
    }
    const title = escapeHtml(product.name || "Product");
    const desc = escapeHtml(truncate(product.description || "", 200));
    const image = escapeHtml(
      makeAbsoluteImage(Array.isArray(product.images) && product.images.length ? product.images[0] : product.image || "")
    );
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
    if (out.includes("<!--PRERENDER_META-->")) {
      out = out.replace("<!--PRERENDER_META-->", metas);
    } else {
      out = out.replace("</head>", `${metas}\n</head>`);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(out);
  } catch (err) {
    console.error("Prerender route error:", err?.message || err);
    try {
      const indexHtml = await fetchFrontendIndex();
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(indexHtml);
    } catch (e) {
      return res.status(500).send("Prerender failed");
    }
  }
});

// rutas públicas
router.get("/", ProductController.getAll);
router.get("/:id", ProductController.getById);

// rutas protegidas
router.use(AuthMiddleware.verifyToken);

// rutas para moderador y administrador
router.use(AuthMiddleware.verifyModerator);

// creación, actualización, eliminación y actualizar stock de un producto
router.post("/", csrfProtection, upload.array("images", 12), ProductController.create);
router.put("/:id", csrfProtection, upload.array("images", 12), ProductController.update);
router.delete("/:id", csrfProtection, ProductController.remove);
router.patch("/:id/stock", csrfProtection, ProductController.updateStock);

export default router;
