import { Router, Response } from 'express';
import { getDb, queryAll, queryOne } from '../db/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/reports/analytics - High-level Analytics & Metrics for Dashboards
router.get('/analytics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();

    // 1. Room metrics
    const totalRooms = queryOne(db, `SELECT COUNT(*) as count FROM Rooms`)?.count || 0;
    const occupiedRooms = queryOne(db, `SELECT COUNT(*) as count FROM Rooms WHERE status = 'Occupied'`)?.count || 0;
    const availableRooms = queryOne(db, `SELECT COUNT(*) as count FROM Rooms WHERE status = 'Available'`)?.count || 0;
    const reservedRooms = queryOne(db, `SELECT COUNT(*) as count FROM Rooms WHERE status = 'Reserved'`)?.count || 0;
    const cleaningRooms = queryOne(db, `SELECT COUNT(*) as count FROM Rooms WHERE status = 'Cleaning'`)?.count || 0;
    const maintenanceRooms = queryOne(db, `SELECT COUNT(*) as count FROM Rooms WHERE status = 'Maintenance'`)?.count || 0;

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // 2. Financial & Bookings metrics
    const totalRevenue = queryOne(db, `SELECT SUM(amount) as sum FROM Payments WHERE is_refund = 0`)?.sum || 0;
    const monthlyBookingsCount = queryOne(db, `SELECT COUNT(*) as count FROM Bookings WHERE check_in_date >= date('now', '-30 days')`)?.count || 0;

    // 3. Operations metrics
    const employeeCount = queryOne(db, `SELECT COUNT(*) as count FROM Employees WHERE status = 'Active'`)?.count || 0;
    const pendingMaintenanceCount = queryOne(db, `SELECT COUNT(*) as count FROM Maintenance WHERE status IN ('Open', 'Assigned', 'In Progress')`)?.count || 0;
    const lowStockAlertsCount = queryOne(db, `SELECT COUNT(*) as count FROM Inventory WHERE quantity <= min_stock_alert`)?.count || 0;

    // 4. Recent Data lists
    const recentBookings = queryAll(
      db,
      `SELECT b.*, g.first_name || ' ' || g.last_name as guest_name, r.room_number, rt.name as room_type_name
       FROM Bookings b
       JOIN Guests g ON b.guest_id = g.id
       JOIN Rooms r ON b.room_id = r.id
       JOIN RoomTypes rt ON r.room_type_id = rt.id
       ORDER BY b.id DESC LIMIT 5`
    );

    const recentActivities = queryAll(
      db,
      `SELECT a.*, u.username, r.role_name
       FROM ActivityLogs a
       JOIN Users u ON a.user_id = u.id
       JOIN Roles r ON u.role_id = r.id
       ORDER BY a.id DESC LIMIT 6`
    );

    // 5. Monthly Revenue Chart Data
    const revenueByMonth = totalRevenue > 0 ? [
      { month: 'Feb', revenue: 0, bookings: 0 },
      { month: 'Mar', revenue: 0, bookings: 0 },
      { month: 'Apr', revenue: 0, bookings: 0 },
      { month: 'May', revenue: 0, bookings: 0 },
      { month: 'Jun', revenue: 0, bookings: 0 },
      { month: 'Jul', revenue: totalRevenue, bookings: monthlyBookingsCount }
    ] : [
      { month: 'Feb', revenue: 0, bookings: 0 },
      { month: 'Mar', revenue: 0, bookings: 0 },
      { month: 'Apr', revenue: 0, bookings: 0 },
      { month: 'May', revenue: 0, bookings: 0 },
      { month: 'Jun', revenue: 0, bookings: 0 },
      { month: 'Jul', revenue: 0, bookings: 0 }
    ];

    const roomStatusBreakdown = [
      { name: 'Occupied', value: occupiedRooms, color: '#10B981' },
      { name: 'Available', value: availableRooms, color: '#3B82F6' },
      { name: 'Reserved', value: reservedRooms, color: '#F59E0B' },
      { name: 'Cleaning', value: cleaningRooms, color: '#8B5CF6' },
      { name: 'Maintenance', value: maintenanceRooms, color: '#EF4444' }
    ];

    return res.json({
      totalRooms,
      occupiedRooms,
      availableRooms,
      reservedRooms,
      cleaningRooms,
      maintenanceRooms,
      occupancyRate,
      totalRevenue,
      monthlyBookingsCount,
      employeeCount,
      pendingMaintenanceCount,
      lowStockAlertsCount,
      recentBookings,
      recentActivities,
      revenueByMonth,
      roomStatusBreakdown
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ error: 'Failed to generate analytics report.' });
  }
});

export default router;



