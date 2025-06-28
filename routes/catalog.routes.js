import express from "express";
import * as CatalogController from "../controllers/catalog.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { csrfMiddleware } from "../middleware/csrf.middleware.js";

const router = express.Router();

// rutas públicas
router.get('/', CatalogController.getAllCatalogs);
router.get('/active', CatalogController.getActiveCatalogs);
router.get('/:id', CatalogController.getCatalogById);

// rutas protegidas solo para moderadores y administradores
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.verifyModerator);

// crear catálogo
router.post('/', csrfMiddleware, CatalogController.createCatalog);
// actualizar catálogo
router.patch('/:id', csrfMiddleware, CatalogController.updateCatalog);
// eliminar catálogo
router.delete('/:id', csrfMiddleware, CatalogController.deleteCatalog);

export default router;