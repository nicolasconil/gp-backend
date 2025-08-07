import csurf from "csurf";

// middleware de protección
export const csrfProtection = csurf({
    cookie: {
        key: 'XSRF-TOKEN',
        httpOnly: false, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        path: "/"
    }
});
