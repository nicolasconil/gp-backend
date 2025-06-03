import { body } from "express-validator";
import { handleValidationErrors } from "./handleErrors.validation.js";

export const stockMovementValidation = [
  body("productId").isMongoId().withMessage('El campo "productId" debe ser un ID válido de MongoDB'),
  body("size").isNumeric().withMessage("El talle debe ser un número"),
  body("color").notEmpty().withMessage("El color es obligatorio"),
  body("quantity").isInt({ min: 1 }).withMessage("La cantidad debe ser un número entero mayor que 0"),
  body("movementType").isIn(["venta", "ingreso"]).withMessage('El tipo de movimiento debe ser "venta" o "ingreso"'),
  handleValidationErrors,
];
