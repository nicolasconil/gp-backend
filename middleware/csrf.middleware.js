import csurf from "csurf";

// middleware de protección
export const csrfProtection = csurf({
    cookie: {
        key: '_csrf',
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
    }
});

// middleware para generar y pasar el token al cliente
export const addCsrfToken = (req, res, next) => {
    try {
        const token = req.csrfToken();
        res.cookie('XSRF-TOKEN', token, {
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production'
        });
        console.log('CSRF Token generado: ', token);
        res.locals.csrfToken = token;
        next();
    } catch (error) {
        console.error('Error generando CSRF token: ', error);
        return res.status(403).json({ message: 'No se pudo generar el token CSRF.' });
    }
};

export const csrfMiddleware = [csrfProtection, addCsrfToken];