const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await pool.query(
            `SELECT u.*, r.name AS role_name 
             FROM users u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.email = ?`, 
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid authentication credentials provided.' });
        }
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid authentication credentials provided.' });
        }
        
        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'This account has been administratively locked.' });
        }
        
        const accessToken = jwt.sign(
            { id: user.id, role: user.role_name }, 
            process.env.JWT_SECRET || 'fallback_secret_key', 
            { expiresIn: '1h' }
        );
        
        const refreshToken = jwt.sign(
            { id: user.id }, 
            process.env.JWT_REFRESH_SECRET || 'fallback_refresh_key', 
            { expiresIn: '7d' }
        );
        
        await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);
        
        await pool.query(
            'INSERT INTO activity_logs (user_id, action_performed, ip_address, user_agent) VALUES (?, ?, ?, ?)',
            [user.id, 'User Authentication Established via JWT', req.ip, req.headers['user-agent']]
        );
        
        res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
            user: { id: user.id, email: user.email, role: user.role_name }
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        await pool.query('UPDATE users SET refresh_token = NULL WHERE id = ?', [req.user.id]);
        await pool.query(
            'INSERT INTO activity_logs (user_id, action_performed, ip_address, user_agent) VALUES (?, ?, ?, ?)',
            [req.user.id, 'User Session Explicitly Terminated', req.ip, req.headers['user-agent']]
        );
        res.status(200).json({ success: true, message: 'Logout execution finalized.' });
    } catch (error) {
        next(error);
    }
};