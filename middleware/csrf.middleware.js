import csurf from "csurf";

export const csrfProtection = csurf({
    cookie: {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});

export const addCsrfToken = (req, res, next) => {
    try {
        res.locals.csrfToken = req.csrfToken();
    } catch (error) {
        return res.status(403).json({ message: 'No se pudo generar el token CSRF.' });
    }
    next();
};
