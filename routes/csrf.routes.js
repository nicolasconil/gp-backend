import express from "express";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.get('/csrf-token', csrfProtection, (req, res) => {
    const csrfToken = req.csrfToken();
    res.status(200).json({ csrfToken });
});

export default router;