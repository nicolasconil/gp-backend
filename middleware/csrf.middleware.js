import csurf from "csurf";

export const csrfProtection = csurf({
  cookie: {
    key: 'XSRF-TOKEN',
    httpOnly: false, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', 
    path: "/"
  },
  value: (req) => {
    return (
      req.headers['x-xsrf-token'] ||
      req.headers['x-csrf-token'] ||
      req.body && req.body._csrf ||
      req.query && req.query._csrf ||
      (req.cookies && req.cookies['XSRF-TOKEN']) ||
      null
    );
  }
});
