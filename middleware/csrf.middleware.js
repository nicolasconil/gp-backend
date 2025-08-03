import csurf from "csurf";

// middleware de protección
export const csrfProtection = csurf({
    cookie: {
        key: 'XSRF-TOKEN',
        httpOnly: false, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None'
    }
});

// middleware para generar y pasar el token al cliente
export const addCsrfToken = (req, res, next) => {
  try {
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken(); 
    }
    next(); 
  } catch (error) {
    console.error('Error generando CSRF token:', error);
    return res.status(403).json({ message: 'No se pudo generar el token CSRF.' });
  }
};