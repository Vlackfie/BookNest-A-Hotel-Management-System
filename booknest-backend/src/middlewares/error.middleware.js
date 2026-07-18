const pool = require('../config/db');

exports.errorHandler = async (err, req, res, next) => {
    console.error(`[SYSTEM ERROR]: ${err.stack}`);
    
    try {
        await pool.query(
            'INSERT INTO activity_logs (user_id, action_performed, ip_address, user_agent) VALUES (?, ?, ?, ?)',
            [req.user ? req.user.id : null, `ERROR: ${err.message.substring(0, 200)}`, req.ip, req.headers['user-agent'] || 'Unknown']
        );
    } catch (logError) {
        console.error('[AUDIT FAILED]: Could not write error event trace to database.', logError);
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal application engine exception.',
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
};