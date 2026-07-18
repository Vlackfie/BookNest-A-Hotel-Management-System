const pool = require('../config/db');

exports.getAllRooms = async (req, res, next) => {
    try {
        const { status, type, search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        let queryStr = `
            SELECT r.*, rt.name AS room_type_name, rt.base_price, rt.max_occupancy 
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE 1=1
        `;
        const queryParams = [];
        
        if (status) {
            queryStr += ' AND r.status = ?';
            queryParams.push(status);
        }
        if (type) {
            queryStr += ' AND rt.name = ?';
            queryParams.push(type);
        }
        if (search) {
            queryStr += ' AND r.room_number LIKE ?';
            queryParams.push(`%${search}%`);
        }
        
        queryStr += ' ORDER BY r.room_number ASC LIMIT ? OFFSET ?';
        queryParams.push(parseInt(limit), parseInt(offset));
        
        const [rooms] = await pool.query(queryStr, queryParams);
        res.status(200).json({ success: true, count: rooms.length, data: rooms });
    } catch (error) {
        next(error);
    }
};

exports.createRoom = async (req, res, next) => {
    try {
        const { room_number, room_type_id, floor } = req.body;
        
        // Prevent transaction collapse via manual unique check validation protection
        const [exists] = await pool.query('SELECT id FROM rooms WHERE room_number = ?', [room_number]);
        if (exists.length > 0) {
            return res.status(400).json({ success: false, message: 'Room number configuration collision detected.' });
        }
        
        const [result] = await pool.query(
            'INSERT INTO rooms (room_number, room_type_id, floor, status) VALUES (?, ?, ?, "Available")',
            [room_number, room_type_id, floor]
        );
        
        await pool.query(
            'INSERT INTO activity_logs (user_id, action_performed, ip_address, user_agent) VALUES (?, ?, ?, ?)',
            [req.user.id, `Created Room Entity Object ID: ${result.insertId}`, req.ip, req.headers['user-agent']]
        );
        
        res.status(201).json({ success: true, message: 'Room allocated and registered successfully.', roomId: result.insertId });
    } catch (error) {
        next(error);
    }
};

exports.updateRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, room_type_id, floor } = req.body;
        
        const [result] = await pool.query(
            'UPDATE rooms SET status = COALESCE(?, status), room_type_id = COALESCE(?, room_type_id), floor = COALESCE(?, floor) WHERE id = ?',
            [status, room_type_id, floor, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Target operational room entity not found.' });
        }
        
        res.status(200).json({ success: true, message: 'Room configuration parameter delta committed.' });
    } catch (error) {
        next(error);
    }
};