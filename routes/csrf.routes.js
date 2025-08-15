import express from "express";
import { csrfProtection } from "../middleware/csrf.middleware.js";

const router = express.Router();

router.get('/csrf-token', csrfProtection, (req, res) => {
  const token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
  });
  res.status(200).json({ csrfToken: token });
});

export default router;