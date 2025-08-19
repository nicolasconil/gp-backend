import express from "express";

const router = express.Router();

router.get('/csrf-token', (req, res) => {
  const token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
  res.json({ csrfToken: token });
});

export default router;