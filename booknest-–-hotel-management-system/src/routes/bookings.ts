import { Router, Response } from 'express';
import { getDb, queryAll, queryOne, executeRun } from '../db/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/bookings - Search & List Bookings
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, guest_id, room_id, search } = req.query;
    const db = await getDb();

    let sql = `
      SELECT b.*, 
             g.first_name || ' ' || g.last_name as guest_name, g.phone as guest_phone, g.email as guest_email,
             r.room_number, rt.name as room_type_name,
             u.full_name as booked_by_name,
             ci.key_card_number
      FROM Bookings b
      JOIN Guests g ON b.guest_id = g.id
      JOIN Rooms r ON b.room_id = r.id
      JOIN RoomTypes rt ON r.room_type_id = rt.id
      LEFT JOIN Users u ON b.booked_by_user_id = u.id
      LEFT JOIN CheckIns ci ON ci.booking_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND b.status = ?`;
      params.push(status);
    }
    if (guest_id) {
      sql += ` AND b.guest_id = ?`;
      params.push(Number(guest_id));
    }
    if (room_id) {
      sql += ` AND b.room_id = ?`;
      params.push(Number(room_id));
    }
    if (search) {
      sql += ` AND (b.booking_code LIKE ? OR g.first_name LIKE ? OR g.last_name LIKE ? OR g.phone LIKE ? OR r.room_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY b.id DESC`;

    const bookings = queryAll(db, sql, params);
    return res.json({ bookings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// GET /api/bookings/:id/invoice
router.get('/:id/invoice', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const db = await getDb();

    const booking = queryOne(
      db,
      `SELECT b.*, 
              g.first_name || ' ' || g.last_name as guest_name, g.phone as guest_phone, g.email as guest_email,
              r.room_number, rt.name as room_type_name
       FROM Bookings b
       JOIN Guests g ON b.guest_id = g.id
       JOIN Rooms r ON b.room_id = r.id
       JOIN RoomTypes rt ON r.room_type_id = rt.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (!booking) return res.status(404).json({ error: 'Booking record not found.' });

    // Service items attached
    const serviceItems = queryAll(
      db,
      `SELECT gs.quantity, gs.total_price, s.service_name 
       FROM GuestServices gs
       JOIN Services s ON gs.service_id = s.id
       WHERE gs.booking_id = ?`,
      [bookingId]
    );

    // Payments
    const payments = queryAll(
      db,
      `SELECT amount, payment_method, is_refund FROM Payments WHERE booking_id = ? AND payment_status = 'Paid'`,
      [bookingId]
    );

    let priorPaid = 0;
    let receivedAmount = 0;
    let paymentMethod = 'Cash';

    payments.forEach(p => {
      if (p.is_refund) {
        priorPaid -= p.amount;
      } else {
        priorPaid += p.amount;
        paymentMethod = p.payment_method || paymentMethod;
      }
    });

    // Checkout record if completed
    const checkoutRecord = queryOne(
      db,
      `SELECT * FROM CheckOuts WHERE booking_id = ? ORDER BY id DESC LIMIT 1`,
      [bookingId]
    );

    if (checkoutRecord) {
      receivedAmount = checkoutRecord.received_amount || 0;
      paymentMethod = checkoutRecord.payment_method || paymentMethod;
    }

    const servicesTotal = serviceItems.reduce((acc, curr: any) => acc + (curr.total_price || 0), 0);
    const extraCharges = checkoutRecord ? checkoutRecord.additional_charges : servicesTotal;
    const finalTotal = checkoutRecord ? checkoutRecord.final_amount : (booking.total_amount + extraCharges);

    const totalPaid = Math.max(priorPaid, 0);
    const balanceDue = Math.max(0, finalTotal - totalPaid);
    const changeReturn = Math.max(0, totalPaid - finalTotal);

    const hotelSetting = queryOne(db, `SELECT setting_value FROM SystemSettings WHERE setting_key = 'hotel_name'`);
    const hotelName = hotelSetting ? hotelSetting.setting_value : 'Vlackfie International Hotel';

    return res.json({
      invoice: {
        hotel_name: hotelName,
        booking_code: booking.booking_code,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        guest_phone: booking.guest_phone,
        room_number: booking.room_number,
        room_type_name: booking.room_type_name,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        room_charge: booking.total_amount,
        service_items: serviceItems,
        additional_charges: extraCharges,
        final_total: finalTotal,
        prior_paid: totalPaid,
        received_amount: receivedAmount,
        total_paid: totalPaid,
        change_return: changeReturn,
        balance_due: balanceDue,
        payment_method: paymentMethod
      }
    });
  } catch (err) {
    console.error('Invoice fetch error:', err);
    return res.status(500).json({ error: 'Failed to generate invoice for booking.' });
  }
});

// POST /api/bookings/check-availability
router.post('/check-availability', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { room_id, check_in_date, check_out_date, exclude_booking_id } = req.body;
    if (!room_id || !check_in_date || !check_out_date) {
      return res.status(400).json({ error: 'Room ID, Check-in date, and Check-out date are required.' });
    }

    const db = await getDb();

    let sql = `
      SELECT id, booking_code, check_in_date, check_out_date
      FROM Bookings
      WHERE room_id = ? 
        AND status IN ('Confirmed', 'Checked-In')
        AND (check_in_date < ? AND check_out_date > ?)
    `;
    const params: any[] = [Number(room_id), check_out_date, check_in_date];

    if (exclude_booking_id) {
      sql += ` AND id != ?`;
      params.push(Number(exclude_booking_id));
    }

    const conflicts = queryAll(db, sql, params);
    const isAvailable = conflicts.length === 0;

    return res.json({ isAvailable, conflicts });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to check availability.' });
  }
});

// POST /api/bookings - Create Reservation (Walk-In or Advance)
router.post('/', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      guest_id,
      room_id,
      check_in_date,
      check_out_date,
      num_guests,
      discount_amount,
      status // 'Confirmed' or 'Checked-In'
    } = req.body;

    if (!guest_id || !room_id || !check_in_date || !check_out_date) {
      return res.status(400).json({ error: 'Guest, Room, Check-in, and Check-out dates are required.' });
    }

    if (new Date(check_out_date) <= new Date(check_in_date)) {
      return res.status(400).json({ error: 'Check-out date must be strictly after check-in date.' });
    }

    const db = await getDb();

    // DOUBLE BOOKING VALIDATION
    const overlapSql = `
      SELECT id, booking_code, check_in_date, check_out_date
      FROM Bookings
      WHERE room_id = ? 
        AND status IN ('Confirmed', 'Checked-In')
        AND (check_in_date < ? AND check_out_date > ?)
    `;
    const conflicts = queryAll(db, overlapSql, [Number(room_id), check_out_date, check_in_date]);
    if (conflicts.length > 0) {
      return res.status(400).json({
        error: `DOUBLE BOOKING PREVENTED: Room is already reserved/occupied for overlapping dates (${conflicts[0].check_in_date} to ${conflicts[0].check_out_date}).`
      });
    }

    // Get room price per night
    const room = queryOne(db, `SELECT price_per_night, room_number FROM Rooms WHERE id = ?`, [Number(room_id)]);
    if (!room) return res.status(404).json({ error: 'Selected room does not exist.' });

    // Calculate stay duration in days
    const days = Math.max(1, Math.ceil((new Date(check_out_date).getTime() - new Date(check_in_date).getTime()) / (1000 * 60 * 60 * 24)));
    const baseTotal = days * room.price_per_night;
    const finalTotal = Math.max(0, baseTotal - (Number(discount_amount) || 0));

    const bookingCode = `BN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const bookedByUserId = req.user ? req.user.id : 1;
    const bookingStatus = status || 'Confirmed';

    const resRun = executeRun(
      db,
      `INSERT INTO Bookings (booking_code, guest_id, room_id, check_in_date, check_out_date, num_guests, total_amount, discount_amount, status, booked_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingCode,
        Number(guest_id),
        Number(room_id),
        check_in_date,
        check_out_date,
        Number(num_guests || 1),
        finalTotal,
        Number(discount_amount || 0),
        bookingStatus,
        bookedByUserId
      ]
    );

    // Update Room status dynamically upon reservation/walk-in check-in
    if (bookingStatus === 'Confirmed') {
      executeRun(db, `UPDATE Rooms SET status = 'Reserved', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [Number(room_id)]);
    } else if (bookingStatus === 'Checked-In') {
      executeRun(db, `UPDATE Rooms SET status = 'Occupied', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [Number(room_id)]);
    }

    const newBooking = queryOne(
      db,
      `SELECT b.*, g.first_name || ' ' || g.last_name as guest_name, r.room_number 
       FROM Bookings b JOIN Guests g ON b.guest_id = g.id JOIN Rooms r ON b.room_id = r.id WHERE b.id = ?`,
      [resRun.lastInsertRowid]
    );

    return res.status(201).json({ message: 'Reservation created successfully', booking: newBooking });
  } catch (err) {
    console.error('Create booking error:', err);
    return res.status(500).json({ error: 'Failed to create reservation.' });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
  try {
    const bookingId = Number(req.params.id);
    const db = await getDb();

    const booking = queryOne(db, `SELECT room_id FROM Bookings WHERE id = ?`, [bookingId]);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    executeRun(db, `UPDATE Bookings SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [bookingId]);
    executeRun(db, `UPDATE Rooms SET status = 'Available' WHERE id = ? AND status = 'Reserved'`, [booking.room_id]);

    return res.json({ message: 'Reservation cancelled successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel reservation.' });
  }
});

export default router;
