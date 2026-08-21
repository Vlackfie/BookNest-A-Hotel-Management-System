import { Router, Response } from 'express';
import { getDb, queryAll, queryOne, executeRun } from '../db/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/check-in - Process Check-In
router.post('/check-in', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
  try {
    const { booking_id, deposit_amount, key_card_number, notes } = req.body;
    if (!booking_id) {
      return res.status(400).json({ error: 'Booking ID is required for Check-In.' });
    }

    const db = await getDb();

    // Check valid booking
    const booking = queryOne(
      db,
      `SELECT b.*, r.room_number, g.first_name || ' ' || g.last_name as guest_name 
       FROM Bookings b JOIN Rooms r ON b.room_id = r.id JOIN Guests g ON b.guest_id = g.id
       WHERE b.id = ?`,
      [Number(booking_id)]
    );

    if (!booking) {
      return res.status(404).json({ error: 'Valid booking not found.' });
    }

    if (booking.status === 'Checked-In') {
      return res.status(400).json({ error: 'Guest is already checked in for this booking.' });
    }

    if (booking.status === 'Cancelled' || booking.status === 'Checked-Out') {
      return res.status(400).json({ error: `Cannot check in booking with status '${booking.status}'.` });
    }

    const userId = req.user ? req.user.id : 1;

    // Record Check-In
    executeRun(
      db,
      `INSERT INTO CheckIns (booking_id, check_in_time, checked_in_by_user_id, deposit_amount, key_card_number, notes)
       VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?)`,
      [Number(booking_id), userId, Number(deposit_amount || 0), key_card_number || `KC-${booking.room_number}`, notes || '']
    );

    // Update Booking status
    executeRun(db, `UPDATE Bookings SET status = 'Checked-In', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [Number(booking_id)]);

    // Update Room status to Occupied
    executeRun(db, `UPDATE Rooms SET status = 'Occupied', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [booking.room_id]);

    return res.json({
      message: `Check-in completed successfully for ${booking.guest_name} in Room ${booking.room_number}`,
      booking_id: booking.id,
      key_card_number: key_card_number || `KC-${booking.room_number}`
    });
  } catch (err) {
    console.error('Check-in error:', err);
    return res.status(500).json({ error: 'Failed to process check-in.' });
  }
});

// POST /api/check-out - Process Check-Out & Generate Invoice Summary
router.post('/check-out', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
  try {
    const { booking_id, additional_charges, refund_amount, received_amount, payment_method, notes } = req.body;
    if (!booking_id) {
      return res.status(400).json({ error: 'Booking ID is required for Check-Out.' });
    }

    const db = await getDb();

    const booking = queryOne(
      db,
      `SELECT b.*, r.room_number, r.id as room_id, g.first_name || ' ' || g.last_name as guest_name, g.email as guest_email, g.phone as guest_phone, g.nid_passport
       FROM Bookings b JOIN Rooms r ON b.room_id = r.id JOIN Guests g ON b.guest_id = g.id
       WHERE b.id = ?`,
      [Number(booking_id)]
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.status !== 'Checked-In') {
      return res.status(400).json({ error: 'Only checked-in bookings can be checked out.' });
    }

    // Calculate additional service charges
    const services = queryAll(
      db,
      `SELECT sr.*, s.name as service_name
       FROM ServiceRequests sr JOIN Services s ON sr.service_id = s.id
       WHERE sr.booking_id = ? AND sr.status = 'Completed'`,
      [Number(booking_id)]
    );

    const totalServiceCost = services.reduce((acc, curr) => acc + (curr.total_price || 0), 0);
    const extraCharges = (Number(additional_charges) || 0) + totalServiceCost;
    const finalAmount = Math.max(0, booking.total_amount + extraCharges - (Number(refund_amount) || 0));

    const userId = req.user ? req.user.id : 1;

    // Payments recorded prior to check-out settlement
    const priorPayments = queryAll(db, `SELECT * FROM Payments WHERE booking_id = ?`, [Number(booking_id)]);
    const priorPaid = priorPayments.reduce((acc, curr) => acc + (curr.is_refund ? -curr.amount : curr.amount), 0);

    const received = Number(received_amount) || 0;
    const selectedMethod = payment_method || 'Cash';

    // Record payment if received amount > 0
    if (received > 0) {
      const transactionId = `TXN-OUT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      executeRun(
        db,
        `INSERT INTO Payments (booking_id, amount, payment_method, payment_status, transaction_id, is_refund, notes, created_by_user_id)
         VALUES (?, ?, ?, 'Paid', ?, 0, ?, ?)`,
        [Number(booking_id), received, selectedMethod, transactionId, `Check-out settlement received via ${selectedMethod}`, userId]
      );
    }

    const totalPaid = priorPaid + received;
    const balanceDue = Math.max(0, finalAmount - totalPaid);
    const changeReturn = Math.max(0, totalPaid - finalAmount);

    // Record Check-Out
    executeRun(
      db,
      `INSERT INTO CheckOuts (booking_id, check_out_time, checked_out_by_user_id, final_amount, additional_charges, refund_amount, received_amount, payment_method, notes)
       VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?)`,
      [Number(booking_id), userId, finalAmount, extraCharges, Number(refund_amount || 0), received, selectedMethod, notes || '']
    );

    // Update Booking status to Checked-Out
    executeRun(db, `UPDATE Bookings SET status = 'Checked-Out', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [Number(booking_id)]);

    // Update Room status to 'Dirty' and is_clean = 0 (Requires housekeeping turnaround)
    executeRun(db, `UPDATE Rooms SET status = 'Dirty', is_clean = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [booking.room_id]);

    // Automatically assign/enqueue a Housekeeping task for the room
    const todayStr = new Date().toISOString().split('T')[0];
    executeRun(
      db,
      `INSERT INTO Housekeeping (room_id, assigned_employee_id, scheduled_date, status, notes)
       VALUES (?, 4, ?, 'Pending', ?)`,
      [booking.room_id, todayStr, `Checkout room turnover for guest ${booking.guest_name}`]
    );

    // Log Activity
    executeRun(
      db,
      `INSERT INTO ActivityLogs (user_id, action, module, details, ip_address) VALUES (?, 'Check-Out Guest', 'Front Desk', ?, '127.0.0.1')`,
      [userId, `Checked out guest ${booking.guest_name} from Room ${booking.room_number}. Settlement Received: Tk. ${received} (${selectedMethod})`]
    );

    // Fetch active hotel name from settings
    const hotelSetting = queryOne(db, `SELECT setting_value FROM SystemSettings WHERE setting_key = 'hotel_name'`);
    const hotelName = hotelSetting ? hotelSetting.setting_value : 'Vlackfie International Hotel';

    return res.json({
      message: `Check-Out completed. Room ${booking.room_number} marked as Dirty for Housekeeping turnaround.`,
      invoice: {
        hotel_name: hotelName,
        booking_code: booking.booking_code,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        guest_phone: booking.guest_phone,
        room_number: booking.room_number,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        room_charge: booking.total_amount,
        additional_charges: extraCharges,
        service_items: services,
        final_total: finalAmount,
        prior_paid: priorPaid,
        received_amount: received,
        payment_method: selectedMethod,
        total_paid: totalPaid,
        balance_due: balanceDue,
        change_return: changeReturn
      }
    });
  } catch (err) {
    console.error('Check-out error:', err);
    return res.status(500).json({ error: 'Failed to process check-out.' });
  }
});

export default router;
