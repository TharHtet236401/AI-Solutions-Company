export const checkAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    
    if (token) {
        // If accessing login page with token, redirect to dashboard
        if (req.path === '/admin/login') {
            return res.redirect('/admin/dashboard');
        }
    } else {
        // If accessing protected routes without token, redirect to login
        if (req.path.startsWith('/admin') && req.path !== '/admin/login') {
            return res.redirect('/admin/login');
        }
    }
    next();
}; 