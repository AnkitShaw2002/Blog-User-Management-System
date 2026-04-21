const jwt = require('jsonwebtoken');

// redirect to login if not authenticated
const isAuthenticated = (req, res, next) => {
    if (req.cookies && req.cookies.token) {
        jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY, (err, data) => {
            if (err) {
                req.flash('error_msg', 'Session expired. Please login again.');
                return res.redirect('/login');
            }
            req.user = data;
            next();
        });
    } else {
        req.flash('error_msg', 'Please login to access this page.');
        return res.redirect('/login');
    }
};

// Return JSON error if not authenticated
const isAuthenticatedApi = (req, res, next) => {
    const token = req.body?.token || req.query?.token || req.headers['x-access-token'] || req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ status: false, message: 'Token is required for authentication' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ status: false, message: 'Invalid or expired token' });
    }
};

// Admin-only protect for EJS routes
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Access denied. Admins only.');
    return res.redirect('/dashboard');
};

// Admin-only protect for API routes
const isAdminApi = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ status: false, message: 'Access denied. Admins only.' });
};

module.exports = { isAuthenticated, isAuthenticatedApi, isAdmin, isAdminApi };
