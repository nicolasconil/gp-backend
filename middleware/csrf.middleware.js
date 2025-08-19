import csurf from "csurf";

export const csrfProtection = csurf({
  cookie: {
    key: '_csrfSecret',
    httpOnly: true,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  },
  value: (req) => {
    return (
      req.headers['x-xsrf-token'] ||
      req.headers['x-csrf-token'] ||
      (req.body && req.body._csrf) ||
      (req.query && req.query._csrf) ||
      (req.cookies && req.cookies['XSRF-TOKEN']) ||
      null
    );
  }
});
