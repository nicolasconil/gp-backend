import csurf from "csurf";

// middleware de protección
export const csrfProtection = csurf({
    cookie: {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});

// middleware para generar y pasar el token al cliente
export const addCsrfToken = (req, res, next) => {
    try {
        res.locals.csrfToken = req.csrfToken();
        next();
    } catch (error) {
        return res.status(403).json({ message: 'No se pudo generar el token CSRF.' });
    }
};

export const csrfMiddleware = [csrfProtection, addCsrfToken];