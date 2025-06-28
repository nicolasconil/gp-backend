import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY;
const refreshSecretKey = process.env.REFRESH_SECRET_KEY;

if (!secretKey || !refreshSecretKey) {
    throw new Error('Las claves SECRET_KEY y REFRESH_SECRET_KEY deben estar definidas.');
}

export const generateToken = (userId, role, isEmailVerified) => {
    return jwt.sign({ id: userId, role, isEmailVerified }, secretKey, {
        expiresIn: '1h',
    });
};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, refreshSecretKey, {
        expiresIn: '7d',
    })
};

export const verifyToken = (req, res, next) => {
    const cookieToken = req.cookies?.token;
    const headerAuth = req.header('Authorization');
    let token = null;
    if (cookieToken) {
        token = cookieToken;
    } else if (headerAuth && headerAuth.startsWith('Bearer ')) {
        token = headerAuth.split(' ')[1];
    }
    if (!token) {
        return res.status(403).json({ message: 'Acceso denegado: token no proporcionado.' });
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

export const verifyRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Token no verificado.' });
        }
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: `Acceso denegado: se requiere rol de ${requiredRole}.`});
        }
        next();
    }
};

export const verifyAdmin = verifyRole('administrador');
export const verifyClient = verifyRole('cliente');
export const verifyModerator = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Token no verificado.'});
    }
    if (req.user.role === 'moderador' || req.user.role === 'administrador') {
        return next();
    }
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol de moderador o administrador.'});
};