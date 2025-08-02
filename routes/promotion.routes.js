import express from "express";
import { sendPromotionalEmail } from "../controllers/promotion.controller.js";
import { csrfMiddleware } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.post("/subscribe", csrfMiddleware, sendPromotionalEmail);

export default router;