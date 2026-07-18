const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authorization token omitted or malformed.' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        
        const [users] = await pool.query(
            `SELECT u.id, u.email, r.name AS role, u.is_active 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.id = ?`, 
            [decoded.id]
        );
        
        if (users.length === 0 || !users[0].is_active) {
            return res.status(401).json({ success: false, message: 'User is inactive or no longer exists.' });
        }
        
        req.user = users[0];
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid or expired credentials token.' });
    }
};

exports.authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Access forbidden: insufficient administrative scope.' });
        }
        next();
    };
};