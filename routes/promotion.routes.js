import express from "express";
import { sendPromotionalEmail } from "../controllers/promotion.controller.js";
import { csrfProtection, addCsrfToken } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.post("/subscribe", csrfProtection, addCsrfToken, sendPromotionalEmail);

export default router;