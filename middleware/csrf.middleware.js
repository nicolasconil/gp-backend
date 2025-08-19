import csurf from "csurf";

export const csrfProtection = csurf({
  cookie: {
    key: 'XSRF-TOKEN',          
    httpOnly: false,             
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: "/"
  },
  value: (req) => req.headers['x-xsrf-token'] 
});