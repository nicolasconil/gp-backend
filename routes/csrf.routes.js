import express from "express";
import { csrfProtection, addCsrfToken } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.get('/csrf-token', csrfProtection, addCsrfToken, (req, res) => {
    res.json({ csrfToken: res.locals.csrfToken });
});

export default router;