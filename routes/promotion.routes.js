import express from "express";
import { sendPromotionalEmail } from "../controllers/promotion.controller.js";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.post("/subscribe", csrfProtection, sendPromotionalEmail);

export default router;