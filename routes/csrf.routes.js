import express from "express";

const router = express.Router();

router.get('/csrf-token', (req, res) => {
  try {
    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/'
    });
    res.status(200).json({ csrfToken: token });
  } catch (err) {
    console.error('Error generando CSRF token:', err);
    res.status(500).json({ message: 'No se pudo generar CSRF token' });
  }
});
export default router;