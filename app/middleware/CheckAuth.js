const jwt = require('jsonwebtoken');

// For token checking form cookies
const CheckAuth = (req, res, next) => {
    if (req.cookies && req.cookies.token) {
        jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY, (err, data) => {
            if (!err) {
                req.user = data;
            }
            next();
        });
    } else {
        next();
    }
};

module.exports = CheckAuth;
