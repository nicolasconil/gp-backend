import express from "express";
import { addCsrfToken } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.get('/csrf-token', addCsrfToken, (req, res) => {
    res.json({ csrfToken: res.locals.csrfToken });
});

export default router;