import express from "express";
import * as CatalogController from "../controllers/catalog.controller.js";
import * as AuthMiddleware from "../middleware/auth.middleware.js";
import { csrfMiddleware } from "../middleware/csrf.middleware.js";
import { catalogIdParamValidation, createCatalogValidation, updateCatalogValidation } from "../middleware/validations/catalog.validation.js";

const router = express.Router();

// rutas públicas
router.get('/', CatalogController.getAllCatalogs);
router.get('/active', CatalogController.getActiveCatalogs);
router.get('/:id', catalogIdParamValidation, CatalogController.getCatalogById);

// rutas protegidas solo para moderadores y administradores
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.verifyModerator);

// crear catálogo
router.post('/', createCatalogValidation, csrfMiddleware, CatalogController.createCatalog);
// actualizar catálogo
router.patch('/:id', catalogIdParamValidation, updateCatalogValidation, csrfMiddleware, CatalogController.updateCatalog);
// eliminar catálogo
router.delete('/:id', catalogIdParamValidation, csrfMiddleware, CatalogController.deleteCatalog);

export default router;