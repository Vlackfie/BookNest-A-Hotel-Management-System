import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'booknest.json');

export type JsonDb = Record<string, any[]>;

let dbInstance: JsonDb | null = null;

export async function getDb(): Promise<JsonDb> {
  if (dbInstance) {
    return dbInstance;
  }

  const dataDir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      dbInstance = JSON.parse(fileContent);

      // Migrate / reload seed data if Bookings are empty or if missing initial guest stays
      if (!dbInstance?.Bookings || dbInstance.Bookings.length === 0) {
        console.log("Re-seeding Bookings, CheckIns & Payments into database...");
        const initial = createInitialData();
        dbInstance.Bookings = initial.Bookings;
        dbInstance.CheckIns = initial.CheckIns;
        dbInstance.Payments = initial.Payments;
        dbInstance.Rooms = initial.Rooms;
        saveDb();
      } else {
        // Migrate room statuses from legacy 'Cleaning' to 'Dirty'
        let updated = false;
        if (dbInstance.Rooms) {
          dbInstance.Rooms.forEach((r: any) => {
            if (r.status === 'Cleaning') {
              r.status = 'Dirty';
              r.is_clean = 0;
              updated = true;
            }
          });
        }
        if (updated) {
          saveDb();
        }
      }
    } catch (err) {
      console.error('Failed to load JSON database file, initializing new database:', err);
      dbInstance = createInitialData();
      saveDb();
    }
  } else {
    dbInstance = createInitialData();
    saveDb();
  }

  return dbInstance!;
}

export function saveDb(): void {
  if (!dbInstance) return;
  try {
    const dataDir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dbInstance, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving JSON database:', err);
  }
}

// Create initial seed data
function createInitialData(): JsonDb {
  console.log("Seeding initial BookNest JSON Database...");

  const defaultPasswordHash = bcrypt.hashSync('password123', 10);

  const Roles = [
    { id: 1, role_name: 'Owner', description: 'Full system control, financial management and analytics access', permissions_json: '["*"]', created_at: new Date().toISOString() },
    { id: 2, role_name: 'Manager', description: 'Operational oversight, employee, service, refund approval', permissions_json: '["manage_employees","manage_rooms","manage_bookings","manage_services","approve_refunds","view_reports"]', created_at: new Date().toISOString() },
    { id: 3, role_name: 'Receptionist', description: 'Front-desk check-in, check-out, bookings and guest profiles', permissions_json: '["register_guests","create_bookings","checkin_checkout","receive_payments"]', created_at: new Date().toISOString() },
    { id: 4, role_name: 'Housekeeping Staff', description: 'Room cleaning status, lost & found, damage reports', permissions_json: '["view_assigned_rooms","update_cleaning_status","damage_reports"]', created_at: new Date().toISOString() },
    { id: 5, role_name: 'Maintenance Staff', description: 'Equipment repair tickets, maintenance status and costs', permissions_json: '["view_maintenance_requests","update_repair_status","record_costs"]', created_at: new Date().toISOString() }
  ];

  const Users = [
    { id: 1, username: 'owner', email: 'owner@booknest.com', password_hash: defaultPasswordHash, role_id: 1, full_name: 'Sadikul Hossain', phone: '01941575025', is_active: 1, created_at: new Date().toISOString() },
    { id: 2, username: 'manager', email: 'manager@booknest.com', password_hash: defaultPasswordHash, role_id: 2, full_name: 'Prosenjeet', phone: '01941575025', is_active: 1, created_at: new Date().toISOString() },
    { id: 3, username: 'receptionist', email: 'receptionist@booknest.com', password_hash: defaultPasswordHash, role_id: 3, full_name: 'Rayhana Akter Rupa', phone: '01941575025', is_active: 1, created_at: new Date().toISOString() },
    { id: 4, username: 'housekeeper', email: 'housekeeping@booknest.com', password_hash: defaultPasswordHash, role_id: 4, full_name: 'Tanvir', phone: '01941575025', is_active: 1, created_at: new Date().toISOString() },
    { id: 5, username: 'maintenance', email: 'maintenance@booknest.com', password_hash: defaultPasswordHash, role_id: 5, full_name: 'Tawhid Sharihar', phone: '01941575025', is_active: 1, created_at: new Date().toISOString() }
  ];

  const Employees = [
    { id: 1, user_id: 1, employee_code: 'EMP-001', full_name: 'Sadikul Hossain', department: 'Management', designation: 'Chief Executive Owner', joining_date: '2022-01-15', salary: 120000.00, phone: '01941575025', address: 'Gulshan 2, Dhaka, Bangladesh', status: 'Active', created_at: new Date().toISOString() },
    { id: 2, user_id: 2, employee_code: 'EMP-002', full_name: 'Prosenjeet', department: 'Operations', designation: 'General Hotel Manager', joining_date: '2022-03-01', salary: 75000.00, phone: '01941575025', address: 'Dhanmondi, Dhaka, Bangladesh', status: 'Active', created_at: new Date().toISOString() },
    { id: 3, user_id: 3, employee_code: 'EMP-003', full_name: 'Rayhana Akter Rupa', department: 'Front Desk', designation: 'Senior Receptionist', joining_date: '2023-05-10', salary: 42000.00, phone: '01941575025', address: 'Uttara, Dhaka, Bangladesh', status: 'Active', created_at: new Date().toISOString() },
    { id: 4, user_id: 4, employee_code: 'EMP-004', full_name: 'Tanvir', department: 'Housekeeping', designation: 'Head Housekeeper', joining_date: '2023-06-15', salary: 36000.00, phone: '01941575025', address: 'Banani, Dhaka, Bangladesh', status: 'Active', created_at: new Date().toISOString() },
    { id: 5, user_id: 5, employee_code: 'EMP-005', full_name: 'Tawhid Sharihar', department: 'Facility', designation: 'Lead Maintenance Technician', joining_date: '2023-08-20', salary: 45000.00, phone: '01941575025', address: 'Mirpur, Dhaka, Bangladesh', status: 'Active', created_at: new Date().toISOString() }
  ];

  const RoomTypes = [
    { id: 1, name: 'Standard Deluxe', base_price: 3500.00, capacity: 2, amenities: 'High-Speed Wi-Fi, 42" Smart TV, Air Conditioning, Mini Fridge, Work Desk', description: 'Cozy and contemporary room suitable for business travelers or couples.' },
    { id: 2, name: 'Executive Suite', base_price: 6500.00, capacity: 4, amenities: 'High-Speed Wi-Fi, 55" OLED TV, Jacuzzi Tub, Ocean View, King Bed, Nespresso Bar', description: 'Spacious luxury suite with separated living room and panoramic city skyline views.' },
    { id: 3, name: 'Presidential Suite', base_price: 15000.00, capacity: 6, amenities: 'Private Terrace, Personal Butler Service, Spa Bath, 65" TV, Mini Bar, Kitchenette', description: 'The pinnacle of luxury featuring bespoke Italian furniture and private terrace.' },
    { id: 4, name: 'Family Twin', base_price: 5000.00, capacity: 4, amenities: 'High-Speed Wi-Fi, 2 Queen Beds, Kid Play Area, Smart TV, Refrigerator', description: 'Designed for families, offering dual double beds and connected lounge amenities.' }
  ];

  const Rooms = [
    { id: 1, room_number: '101', room_type_id: 1, floor: 1, status: 'Available', price_per_night: 3500.00, is_clean: 1, notes: 'Corner room near garden' },
    { id: 2, room_number: '102', room_type_id: 1, floor: 1, status: 'Available', price_per_night: 3500.00, is_clean: 1, notes: 'Recently sanitized' },
    { id: 3, room_number: '103', room_type_id: 4, floor: 1, status: 'Available', price_per_night: 5000.00, is_clean: 1, notes: 'Family friendly twin beds' },
    { id: 4, room_number: '104', room_type_id: 1, floor: 1, status: 'Dirty', price_per_night: 3500.00, is_clean: 0, notes: 'Checkout cleaning required' },
    { id: 5, room_number: '201', room_type_id: 2, floor: 2, status: 'Available', price_per_night: 6500.00, is_clean: 1, notes: 'Executive Suite ready' },
    { id: 6, room_number: '202', room_type_id: 2, floor: 2, status: 'Available', price_per_night: 6500.00, is_clean: 1, notes: 'Executive Suite ready' },
    { id: 7, room_number: '203', room_type_id: 2, floor: 2, status: 'Available', price_per_night: 6500.00, is_clean: 1, notes: 'Fresh linens installed' },
    { id: 8, room_number: '204', room_type_id: 1, floor: 2, status: 'Maintenance', price_per_night: 3500.00, is_clean: 0, notes: 'AC unit capacitor replacement in progress' },
    { id: 9, room_number: '301', room_type_id: 3, floor: 3, status: 'Available', price_per_night: 15000.00, is_clean: 1, notes: 'Presidential Penthouse ready' },
    { id: 10, room_number: '302', room_type_id: 3, floor: 3, status: 'Available', price_per_night: 15000.00, is_clean: 1, notes: 'Penthouse B ready for booking' }
  ];

  const Guests = [
    { id: 1, first_name: 'Anisur', last_name: 'Rahman', email: 'anisur.rahman@example.com', phone: '01941575025', nid_passport: 'NID-BD-1982739102', emergency_contact: 'Rahima Rahman (01941575001)', address: 'Gulshan 1, Dhaka, Bangladesh', vip_status: 0 },
    { id: 2, first_name: 'Nusrat', last_name: 'Jahan', email: 'nusrat.jahan@example.com', phone: '01812345678', nid_passport: 'PASSPORT-BD-441209', emergency_contact: 'Kamrul Islam (01812345678)', address: 'Dhanmondi, Dhaka, Bangladesh', vip_status: 1 },
    { id: 3, first_name: 'Shakib', last_name: 'Al Hasan', email: 'shakib.hasan@example.com', phone: '01711223344', nid_passport: 'NID-BD-992102911', emergency_contact: 'Umme Ahmed (01711223344)', address: 'Banani, Dhaka, Bangladesh', vip_status: 1 },
    { id: 4, first_name: 'Farhana', last_name: 'Ahmed', email: 'farhana.a@example.com', phone: '01698765432', nid_passport: 'PASSPORT-BD-882194', emergency_contact: 'Tariq Ahmed (01698765432)', address: 'Uttara, Dhaka, Bangladesh', vip_status: 1 },
    { id: 5, first_name: 'Tanvir', last_name: 'Hossain', email: 'tanvir.hossain@example.com', phone: '01715000005', nid_passport: 'NID-BD-1002938411', emergency_contact: 'Sumaiya Hossain (01715000050)', address: 'Mirpur 10, Dhaka, Bangladesh', vip_status: 0 },
    { id: 6, first_name: 'Mahmudul', last_name: 'Hasan', email: 'm.hasan@example.com', phone: '01822000006', nid_passport: 'PASSPORT-BD-102938', emergency_contact: 'Shaila Hasan (01822000060)', address: 'Agrabad, Chittagong, Bangladesh', vip_status: 0 },
    { id: 7, first_name: 'Sadia', last_name: 'Islam', email: 'sadia.islam@example.com', phone: '01933000007', nid_passport: 'NID-BD-3029481023', emergency_contact: 'Rashed Islam (01933000070)', address: 'Zindabazar, Sylhet, Bangladesh', vip_status: 1 },
    { id: 8, first_name: 'Kamal', last_name: 'Uddin', email: 'kamal.uddin@example.com', phone: '01644000008', nid_passport: 'PASSPORT-BD-304958', emergency_contact: 'Nasreen Begum (01644000080)', address: 'Nasirabad, Chittagong, Bangladesh', vip_status: 0 },
    { id: 9, first_name: 'Roksana', last_name: 'Akter', email: 'roksana.akter@example.com', phone: '01555000009', nid_passport: 'NID-BD-5019283746', emergency_contact: 'Monir Hossain (01555000090)', address: 'Rajshahi Sadar, Rajshahi, Bangladesh', vip_status: 0 },
    { id: 10, first_name: 'Arifur', last_name: 'Chowdhury', email: 'arif.chowdhury@example.com', phone: '01766000010', nid_passport: 'PASSPORT-BD-502938', emergency_contact: 'Selina Chowdhury (01766000100)', address: 'Khulna City, Khulna, Bangladesh', vip_status: 1 },
    { id: 11, first_name: 'Tasnim', last_name: 'Ferdaus', email: 'tasnim.f@example.com', phone: '01877000011', nid_passport: 'NID-BD-7019283745', emergency_contact: 'Rafiq Ferdaus (01877000110)', address: 'Barishal Sadar, Barishal, Bangladesh', vip_status: 0 },
    { id: 12, first_name: 'Shahriar', last_name: 'Kabir', email: 'shahriar.k@example.com', phone: '01988000012', nid_passport: 'PASSPORT-BD-702938', emergency_contact: 'Naila Kabir (01988000120)', address: 'Mymensingh Sadar, Mymensingh, Bangladesh', vip_status: 1 },
    { id: 13, first_name: 'Mehedi', last_name: 'Hasan', email: 'mehedi.hasan@example.com', phone: '01699000013', nid_passport: 'NID-BD-9018273645', emergency_contact: 'Sharmin Mehedi (01699000130)', address: 'Rangpur Sadar, Rangpur, Bangladesh', vip_status: 0 },
    { id: 14, first_name: 'Sabrina', last_name: 'Sharmin', email: 'sabrina.s@example.com', phone: '01712000014', nid_passport: 'PASSPORT-BD-902837', emergency_contact: 'Imtiaz Ali (01712000140)', address: 'Cumilla Sadar, Cumilla, Bangladesh', vip_status: 0 },
    { id: 15, first_name: 'Zubaer', last_name: 'Khan', email: 'zubaer.khan@example.com', phone: '01823000015', nid_passport: 'NID-BD-1122334455', emergency_contact: 'Fahmida Khan (01823000150)', address: 'Bogura Sadar, Bogura, Bangladesh', vip_status: 1 },
    { id: 16, first_name: 'Jannatul', last_name: 'Ferdous', email: 'jannat.f@example.com', phone: '01934000016', nid_passport: 'PASSPORT-BD-112233', emergency_contact: 'Zahid Ferdous (01934000160)', address: 'Jessore Sadar, Jessore, Bangladesh', vip_status: 0 },
    { id: 17, first_name: 'Imtiaz', last_name: 'Ahmed', email: 'imtiaz.ahmed@example.com', phone: '01645000017', nid_passport: 'NID-BD-2233445566', emergency_contact: 'Shirin Ahmed (01645000170)', address: 'Gazipur City, Gazipur, Bangladesh', vip_status: 0 },
    { id: 18, first_name: 'Sharmin', last_name: 'Sultana', email: 'sharmin.sultana@example.com', phone: '01556000018', nid_passport: 'PASSPORT-BD-223344', emergency_contact: 'Kabir Sultana (01556000180)', address: 'Narayanganj Sadar, Narayanganj, Bangladesh', vip_status: 1 },
    { id: 19, first_name: 'Faisal', last_name: 'Mahmood', email: 'faisal.m@example.com', phone: '01767000019', nid_passport: 'NID-BD-3344556677', emergency_contact: 'Nahid Mahmood (01767000190)', address: "Cox's Bazar, Bangladesh", vip_status: 0 },
    { id: 20, first_name: 'Naila', last_name: 'Parveen', email: 'naila.parveen@example.com', phone: '01878000020', nid_passport: 'PASSPORT-BD-334455', emergency_contact: 'Asif Parveen (01878000200)', address: 'Sreemangal, Moulvibazar, Bangladesh', vip_status: 1 }
  ];

  const Bookings: any[] = [
    { id: 1, booking_code: 'BN-2026-1001', guest_id: 1, room_id: 1, check_in_date: '2026-06-10', check_out_date: '2026-06-14', num_guests: 2, total_amount: 14000.00, discount_amount: 0, status: 'Checked-Out', booked_by_user_id: 1, created_at: '2026-06-08T10:00:00Z' },
    { id: 2, booking_code: 'BN-2026-1002', guest_id: 2, room_id: 3, check_in_date: '2026-06-18', check_out_date: '2026-06-21', num_guests: 1, total_amount: 45000.00, discount_amount: 1000, status: 'Checked-Out', booked_by_user_id: 2, created_at: '2026-06-15T12:00:00Z' },
    { id: 3, booking_code: 'BN-2026-1003', guest_id: 3, room_id: 5, check_in_date: '2026-07-01', check_out_date: '2026-07-05', num_guests: 2, total_amount: 34000.00, discount_amount: 1000, status: 'Checked-Out', booked_by_user_id: 1, created_at: '2026-06-25T14:30:00Z' },
    { id: 4, booking_code: 'BN-2026-1004', guest_id: 4, room_id: 2, check_in_date: '2026-07-10', check_out_date: '2026-07-15', num_guests: 2, total_amount: 32500.00, discount_amount: 0, status: 'Checked-Out', booked_by_user_id: 3, created_at: '2026-07-08T09:00:00Z' },
    { id: 5, booking_code: 'BN-2026-1005', guest_id: 1, room_id: 4, check_in_date: '2026-07-22', check_out_date: '2026-07-28', num_guests: 1, total_amount: 22800.00, discount_amount: 0, status: 'Checked-In', booked_by_user_id: 3, created_at: '2026-07-20T11:00:00Z' },
    { id: 6, booking_code: 'BN-2026-1006', guest_id: 5, room_id: 7, check_in_date: '2026-07-27', check_out_date: '2026-07-30', num_guests: 2, total_amount: 10500.00, discount_amount: 500, status: 'Confirmed', booked_by_user_id: 3, created_at: '2026-07-22T16:00:00Z' },
    { id: 7, booking_code: 'BN-2026-1007', guest_id: 6, room_id: 6, check_in_date: '2026-07-15', check_out_date: '2026-07-18', num_guests: 1, total_amount: 19500.00, discount_amount: 0, status: 'Checked-Out', booked_by_user_id: 2, created_at: '2026-07-12T08:00:00Z' },
    { id: 8, booking_code: 'BN-2026-1008', guest_id: 7, room_id: 8, check_in_date: '2026-07-05', check_out_date: '2026-07-08', num_guests: 1, total_amount: 7500.00, discount_amount: 0, status: 'Checked-Out', booked_by_user_id: 1, created_at: '2026-07-02T10:00:00Z' }
  ];

  const CheckIns: any[] = [
    { id: 1, booking_id: 1, check_in_time: '2026-06-10T14:00:00Z', checked_in_by_user_id: 3, deposit_amount: 2000.00, key_card_number: 'KC-101', notes: 'VIP Welcome drink served' },
    { id: 2, booking_id: 2, check_in_time: '2026-06-18T15:00:00Z', checked_in_by_user_id: 3, deposit_amount: 5000.00, key_card_number: 'KC-103', notes: 'Late check-in' },
    { id: 3, booking_id: 3, check_in_time: '2026-07-01T14:00:00Z', checked_in_by_user_id: 3, deposit_amount: 3000.00, key_card_number: 'KC-201', notes: 'Airport pickup provided' },
    { id: 4, booking_id: 4, check_in_time: '2026-07-10T13:30:00Z', checked_in_by_user_id: 3, deposit_amount: 2500.00, key_card_number: 'KC-102', notes: 'Early check-in approved' },
    { id: 5, booking_id: 5, check_in_time: '2026-07-22T14:15:00Z', checked_in_by_user_id: 3, deposit_amount: 3000.00, key_card_number: 'KC-104', notes: 'Active stay' }
  ];

  const Payments: any[] = [
    { id: 1, booking_id: 1, amount: 2000.00, payment_method: 'Cash', payment_status: 'Paid', transaction_id: 'TXN-001', is_refund: 0, notes: 'Advance Deposit', created_by_user_id: 3 },
    { id: 2, booking_id: 1, amount: 12000.00, payment_method: 'Credit Card', payment_status: 'Paid', transaction_id: 'TXN-002', is_refund: 0, notes: 'Checkout settlement', created_by_user_id: 3 },
    { id: 3, booking_id: 2, amount: 5000.00, payment_method: 'bKash', payment_status: 'Paid', transaction_id: 'TXN-003', is_refund: 0, notes: 'Advance Deposit', created_by_user_id: 3 },
    { id: 4, booking_id: 2, amount: 41000.00, payment_method: 'bKash', payment_status: 'Paid', transaction_id: 'TXN-004', is_refund: 0, notes: 'Checkout settlement', created_by_user_id: 3 },
    { id: 5, booking_id: 5, amount: 3000.00, payment_method: 'Cash', payment_status: 'Paid', transaction_id: 'TXN-005', is_refund: 0, notes: 'Checkin deposit', created_by_user_id: 3 }
  ];

  const Services = [
    { id: 1, name: 'Gourmet Breakfast In Bed', category: 'Food & Beverage', price: 500.00, description: 'Freshly baked pastries, eggs, sausage, and fresh juice.', is_active: 1 },
    { id: 2, name: 'Express Laundry & Dry Cleaning', category: 'Laundry', price: 350.00, description: 'Same-day washing, pressing, and garment bag delivery.', is_active: 1 },
    { id: 3, name: 'VIP Luxury Airport Transfer', category: 'Airport Pickup', price: 1500.00, description: 'Chauffeur driven sedan pickup.', is_active: 1 },
    { id: 4, name: 'Deep Relaxation Massage (60 min)', category: 'Room Service', price: 2500.00, description: 'In-room certified therapeutic massage.', is_active: 1 },
    { id: 5, name: 'Gentle Morning Wake-Up Call', category: 'Wake-Up Calls', price: 0.00, description: 'Automated or human wake-up call with briefing.', is_active: 1 }
  ];

  const ServiceRequests: any[] = [];

  const Housekeeping = [
    { id: 1, room_id: 4, assigned_employee_id: 4, scheduled_date: '2026-07-22', status: 'In Progress', notes: 'Deep sanitize and refresh bed linens' },
    { id: 2, room_id: 2, assigned_employee_id: 4, scheduled_date: '2026-07-22', status: 'Completed', notes: 'Daily turnover completed' },
    { id: 3, room_id: 8, assigned_employee_id: 4, scheduled_date: '2026-07-22', status: 'Pending', notes: 'Clean room post-maintenance completion' }
  ];

  const Maintenance = [
    { id: 1, room_id: 8, reported_by_user_id: 3, assigned_employee_id: 5, issue_description: 'Air conditioning compressor leaking coolant on floor 2.', priority: 'High', repair_cost: 2500.00, status: 'In Progress' },
    { id: 2, room_id: 3, reported_by_user_id: 4, assigned_employee_id: 5, issue_description: 'Bathroom sink faucet aerator loose.', priority: 'Low', repair_cost: 500.00, status: 'Open' }
  ];

  const Inventory = [
    { id: 1, item_name: 'Egyptian Cotton Towels', category: 'Linen Inventory', quantity: 140, unit: 'Pcs', min_stock_alert: 30, last_restocked: '2026-07-15' },
    { id: 2, item_name: 'Luxury Botanical Shampoo (250ml)', category: 'Room Supplies', quantity: 180, unit: 'Bottles', min_stock_alert: 50, last_restocked: '2026-07-10' },
    { id: 3, item_name: 'Espresso Coffee Pods Box', category: 'Restaurant Inventory', quantity: 12, unit: 'Boxes', min_stock_alert: 25, last_restocked: '2026-06-30' },
    { id: 4, item_name: 'Premium Bed Sheets (King)', category: 'Linen Inventory', quantity: 65, unit: 'Sets', min_stock_alert: 20, last_restocked: '2026-07-12' },
    { id: 5, item_name: 'Fine Red Wine Bottles (750ml)', category: 'Restaurant Inventory', quantity: 8, unit: 'Bottles', min_stock_alert: 15, last_restocked: '2026-07-01' }
  ];

  const Salaries = [
    { id: 1, employee_id: 1, month_year: '2026-06', base_salary: 120000.00, bonus: 10000.00, deductions: 0.00, net_salary: 130000.00, payment_status: 'Paid', payment_date: '2026-06-30' },
    { id: 2, employee_id: 2, month_year: '2026-06', base_salary: 75000.00, bonus: 5000.00, deductions: 0.00, net_salary: 80000.00, payment_status: 'Paid', payment_date: '2026-06-30' },
    { id: 3, employee_id: 3, month_year: '2026-06', base_salary: 42000.00, bonus: 2000.00, deductions: 0.00, net_salary: 44000.00, payment_status: 'Paid', payment_date: '2026-06-30' },
    { id: 4, employee_id: 4, month_year: '2026-06', base_salary: 36000.00, bonus: 1500.00, deductions: 0.00, net_salary: 37500.00, payment_status: 'Paid', payment_date: '2026-06-30' },
    { id: 5, employee_id: 5, month_year: '2026-06', base_salary: 45000.00, bonus: 2000.00, deductions: 0.00, net_salary: 47000.00, payment_status: 'Paid', payment_date: '2026-06-30' }
  ];

  const Attendance = [
    { id: 1, employee_id: 1, date: '2026-07-22', check_in_time: '08:00:00', check_out_time: '17:00:00', status: 'Present', notes: 'On-site executive duties' },
    { id: 2, employee_id: 2, date: '2026-07-22', check_in_time: '08:15:00', check_out_time: '17:30:00', status: 'Present', notes: 'Morning staff briefing conducted' },
    { id: 3, employee_id: 3, date: '2026-07-22', check_in_time: '08:00:00', check_out_time: '16:30:00', status: 'Present', notes: 'Front desk morning shift' },
    { id: 4, employee_id: 4, date: '2026-07-22', check_in_time: '08:30:00', check_out_time: '16:00:00', status: 'Present', notes: 'Housekeeping shift floor 1 & 2' },
    { id: 5, employee_id: 5, date: '2026-07-22', check_in_time: '09:00:00', check_out_time: '17:00:00', status: 'Present', notes: 'Maintenance HVAC repairs' }
  ];

  const ActivityLogs = [
    { id: 1, user_id: 1, action: 'System Boot', module: 'System', details: 'Vlackfie International Hotel HMS system initialized with clean guest directory.', ip_address: '127.0.0.1', created_at: new Date().toISOString() }
  ];

  const Notifications = [
    { id: 1, user_id: null, role_target: 'Manager', title: 'Low Stock Alert', message: 'Espresso Coffee Pods Box stock (12) is below minimum threshold (25).', is_read: 0, created_at: new Date().toISOString() },
    { id: 2, user_id: null, role_target: 'Maintenance Staff', title: 'New Repair Ticket', message: 'Room 204 reported High Priority AC repair request.', is_read: 0, created_at: new Date().toISOString() },
    { id: 3, user_id: null, role_target: 'Housekeeping Staff', title: 'Room Cleaning Needed', message: 'Room 104 requires checkout cleaning turn-around.', is_read: 0, created_at: new Date().toISOString() }
  ];

  const SystemSettings = [
    { id: 1, setting_key: 'hotel_name', setting_value: 'Vlackfie International Hotel', category: 'General', description: 'Official trading name of the hotel establishment' },
    { id: 2, setting_key: 'hotel_currency', setting_value: '৳', category: 'Financial', description: 'Primary currency symbol used across invoices and billing' },
    { id: 3, setting_key: 'contact_phone', setting_value: '01941575025', category: 'General', description: 'Primary contact phone number' },
    { id: 4, setting_key: 'check_in_time', setting_value: '14:00', category: 'Policy', description: 'Standard check-in time' },
    { id: 5, setting_key: 'check_out_time', setting_value: '11:00', category: 'Policy', description: 'Standard check-out time' },
    { id: 6, setting_key: 'tax_rate_percent', setting_value: '10.0', category: 'Financial', description: 'Applicable hotel room tax percentage' }
  ];

  return {
    Roles,
    Users,
    Employees,
    RoomTypes,
    Rooms,
    Guests,
    Bookings,
    CheckIns,
    CheckOuts: [],
    Payments,
    Services,
    ServiceRequests,
    Housekeeping,
    Maintenance,
    Inventory,
    Salaries,
    Attendance,
    Feedback: [],
    Reports: [],
    ActivityLogs,
    Notifications,
    SystemSettings
  };
}

// Write/Mutation operations
export function executeRun(db: JsonDb, sql: string, params: any[] = []): { lastInsertRowid: number; changes: number } {
  const cleanSql = sql.trim();
  const sanitizedParams = params.map(p => (p === undefined ? null : p));

  // 1. INSERT INTO <table> (...) VALUES (...)
  const insertMatch = cleanSql.match(/^INSERT\s+INTO\s+(\w+)\s*(?:\(([^)]+)\))?\s*VALUES\s*\((.+)\)/i);
  if (insertMatch) {
    const tableName = getCanonicalTable(db, insertMatch[1]);
    if (!db[tableName]) db[tableName] = [];

    const colsStr = insertMatch[2];
    const valStr = insertMatch[3];

    const cols = colsStr ? colsStr.split(',').map(c => c.trim()) : [];
    const valExprs = valStr ? valStr.split(/,(?![^()]*\))/).map(v => v.trim()) : [];
    
    let paramIdx = 0;
    const newRecord: any = {};

    if (cols.length > 0) {
      cols.forEach((col, idx) => {
        const expr = valExprs[idx] !== undefined ? valExprs[idx] : '?';
        if (expr === '?') {
          newRecord[col] = sanitizedParams[paramIdx++];
        } else if (expr.toUpperCase() === 'CURRENT_TIMESTAMP') {
          newRecord[col] = new Date().toISOString();
        } else {
          const cleanVal = expr.replace(/^['"]|['"]$/g, '');
          newRecord[col] = isNaN(Number(cleanVal)) || cleanVal === '' ? cleanVal : Number(cleanVal);
        }
      });
    } else if (sanitizedParams.length > 0) {
      sanitizedParams.forEach((val, idx) => {
        newRecord[`col_${idx}`] = val;
      });
    }

    // Auto id
    const existingIds = db[tableName].map(r => Number(r.id) || 0);
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const newId = newRecord.id ? Number(newRecord.id) : maxId + 1;
    newRecord.id = newId;

    if (!newRecord.created_at) {
      newRecord.created_at = new Date().toISOString();
    }

    db[tableName].push(newRecord);
    saveDb();
    return { lastInsertRowid: newId, changes: 1 };
  }

  // 2. UPDATE <table> SET col1 = ?, col2 = ? WHERE ...
  const updateMatch = cleanSql.match(/^UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
  if (updateMatch) {
    const tableName = getCanonicalTable(db, updateMatch[1]);
    const setClause = updateMatch[2];
    const whereClause = updateMatch[3] || '';

    if (!db[tableName]) return { lastInsertRowid: 0, changes: 0 };

    let paramIdx = 0;
    const setPairs: { col: string; val: any; isExpr?: boolean }[] = [];
    const setTokens = setClause.split(/,(?![^()]*\))/);

    setTokens.forEach(st => {
      const parts = st.split('=');
      if (parts.length >= 2) {
        const col = parts[0].trim();
        const valExpr = parts.slice(1).join('=').trim();
        if (valExpr === '?') {
          setPairs.push({ col, val: sanitizedParams[paramIdx++] });
        } else if (/COALESCE\s*\(\s*\?\s*,\s*(\w+)\s*\)/i.test(valExpr)) {
          const matchCoalesce = valExpr.match(/COALESCE\s*\(\s*\?\s*,\s*(\w+)\s*\)/i);
          const boundVal = sanitizedParams[paramIdx++];
          setPairs.push({ col, val: boundVal, isExpr: true });
        } else if (valExpr.toUpperCase() === 'CURRENT_TIMESTAMP') {
          setPairs.push({ col, val: new Date().toISOString() });
        } else {
          // direct literal
          const cleanVal = valExpr.replace(/^['"]|['"]$/g, '');
          setPairs.push({ col, val: cleanVal });
        }
      }
    });

    let changes = 0;
    db[tableName].forEach(record => {
      if (matchWhere(record, whereClause, sanitizedParams, paramIdx)) {
        setPairs.forEach(pair => {
          if (pair.isExpr) {
            if (pair.val !== null && pair.val !== undefined) {
              record[pair.col] = pair.val;
            }
          } else {
            record[pair.col] = pair.val;
          }
        });
        changes++;
      }
    });

    saveDb();
    return { lastInsertRowid: 0, changes };
  }

  // 3. DELETE FROM <table> WHERE ...
  const deleteMatch = cleanSql.match(/^DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
  if (deleteMatch) {
    const tableName = getCanonicalTable(db, deleteMatch[1]);
    const whereClause = deleteMatch[2] || '';

    if (!db[tableName]) return { lastInsertRowid: 0, changes: 0 };

    const initialLength = db[tableName].length;
    db[tableName] = db[tableName].filter(record => !matchWhere(record, whereClause, sanitizedParams, 0));
    const changes = initialLength - db[tableName].length;

    saveDb();
    return { lastInsertRowid: 0, changes };
  }

  return { lastInsertRowid: 0, changes: 0 };
}

// Read/Query operations
export function queryAll<T = any>(db: JsonDb, sql: string, params: any[] = []): T[] {
  const cleanSql = sql.trim().replace(/\s+/g, ' ');
  const sanitizedParams = params.map(p => (p === undefined ? null : p));

  // 1. COUNT / SUM aggregates
  if (/^SELECT\s+(COUNT|SUM)/i.test(cleanSql)) {
    return handleAggregates(db, cleanSql, sanitizedParams) as T[];
  }

  // 2. Standard SELECT queries
  return handleSelect(db, cleanSql, sanitizedParams) as T[];
}

export function queryOne<T = any>(db: JsonDb, sql: string, params: any[] = []): T | null {
  const list = queryAll<T>(db, sql, params);
  return list.length > 0 ? list[0] : null;
}

// Helpers
function getCanonicalTable(db: JsonDb, name: string): string {
  const lower = name.toLowerCase();
  const keys = Object.keys(db);
  const matched = keys.find(k => k.toLowerCase() === lower);
  return matched || name;
}

function handleAggregates(db: JsonDb, sql: string, params: any[]): any[] {
  if (/SELECT\s+COUNT\(\*\)\s+as\s+(\w+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i.test(sql)) {
    const m = sql.match(/SELECT\s+COUNT\(\*\)\s+as\s+(\w+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i)!;
    const alias = m[1];
    const table = getCanonicalTable(db, m[2]);
    const whereStr = m[3] || '';
    const records = (db[table] || []).filter(r => matchWhere(r, whereStr, params, 0));
    return [{ [alias]: records.length }];
  }

  if (/SELECT\s+SUM\((\w+)\)\s+as\s+(\w+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i.test(sql)) {
    const m = sql.match(/SELECT\s+SUM\((\w+)\)\s+as\s+(\w+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i)!;
    const field = m[1];
    const alias = m[2];
    const table = getCanonicalTable(db, m[3]);
    const whereStr = m[4] || '';
    const records = (db[table] || []).filter(r => matchWhere(r, whereStr, params, 0));
    const sum = records.reduce((acc, curr) => acc + (Number(curr[field]) || 0), 0);
    return [{ [alias]: sum }];
  }

  return [{ count: 0, sum: 0 }];
}

function handleSelect(db: JsonDb, sql: string, params: any[]): any[] {
  // Extract main components
  const fromIdx = sql.toUpperCase().indexOf(' FROM ');
  if (fromIdx === -1) return [];

  const selectColsStr = sql.substring(7, fromIdx).trim();
  const rest = sql.substring(fromIdx + 6).trim();

  // Extract ORDER BY and LIMIT
  let whereAndRest = rest;
  let orderStr = '';
  let limitNum: number | null = null;

  const limitIdx = whereAndRest.toUpperCase().indexOf(' LIMIT ');
  if (limitIdx !== -1) {
    limitNum = parseInt(whereAndRest.substring(limitIdx + 7).trim(), 10);
    whereAndRest = whereAndRest.substring(0, limitIdx).trim();
  }

  const orderIdx = whereAndRest.toUpperCase().indexOf(' ORDER BY ');
  if (orderIdx !== -1) {
    orderStr = whereAndRest.substring(orderIdx + 10).trim();
    whereAndRest = whereAndRest.substring(0, orderIdx).trim();
  }

  // Extract WHERE
  let tablesAndJoins = whereAndRest;
  let whereStr = '';
  const whereIdx = whereAndRest.toUpperCase().indexOf(' WHERE ');
  if (whereIdx !== -1) {
    tablesAndJoins = whereAndRest.substring(0, whereIdx).trim();
    whereStr = whereAndRest.substring(whereIdx + 7).trim();
  }

  // Parse Table & Joins
  // Example: Rooms r JOIN RoomTypes rt ON r.room_type_id = rt.id
  const tableTokens = tablesAndJoins.split(/\s+(?:JOIN|LEFT\s+JOIN)\s+/i);
  const primaryToken = tableTokens[0].trim();
  const primaryParts = primaryToken.split(/\s+/);
  const primaryTableName = getCanonicalTable(db, primaryParts[0]);
  const primaryAlias = primaryParts[1] || primaryTableName;

  let results: any[] = (db[primaryTableName] || []).map(row => ({
    [`${primaryAlias}`]: row,
    ...row
  }));

  // Process Joins
  for (let i = 1; i < tableTokens.length; i++) {
    const joinToken = tableTokens[i].trim();
    const onIdx = joinToken.toUpperCase().indexOf(' ON ');
    let joinTablePart = joinToken;
    let onCond = '';
    if (onIdx !== -1) {
      joinTablePart = joinToken.substring(0, onIdx).trim();
      onCond = joinToken.substring(onIdx + 4).trim();
    }

    const joinParts = joinTablePart.split(/\s+/);
    const joinTableName = getCanonicalTable(db, joinParts[0]);
    const joinAlias = joinParts[1] || joinTableName;
    const joinData = db[joinTableName] || [];

    const isLeftJoin = sql.toUpperCase().includes('LEFT JOIN');

    const nextResults: any[] = [];
    results.forEach(leftRow => {
      const matches = joinData.filter(rightRow => matchJoinOn(leftRow, rightRow, onCond, primaryAlias, joinAlias));
      if (matches.length > 0) {
        matches.forEach(mRow => {
          nextResults.push({
            ...leftRow,
            [`${joinAlias}`]: mRow,
            // Attach joined fields with alias prefix or direct properties
            ...attachJoinedFields(leftRow, mRow, joinAlias)
          });
        });
      } else if (isLeftJoin) {
        nextResults.push({
          ...leftRow,
          [`${joinAlias}`]: null
        });
      }
    });

    results = nextResults;
  }

  // Filter WHERE
  if (whereStr && whereStr !== '1=1') {
    results = results.filter(row => matchWhere(row, whereStr, params, 0));
  }

  // Apply ORDER BY
  if (orderStr) {
    const orderParts = orderStr.split(',')[0].trim().split(/\s+/);
    const fieldRaw = orderParts[0];
    const direction = (orderParts[1] || 'ASC').toUpperCase();
    const fieldName = fieldRaw.includes('.') ? fieldRaw.split('.')[1] : fieldRaw;

    results.sort((a, b) => {
      let valA = a[fieldName] !== undefined ? a[fieldName] : a[fieldRaw];
      let valB = b[fieldName] !== undefined ? b[fieldName] : b[fieldRaw];

      if (valA === null || valA === undefined) valA = '';
      if (valB === null || valB === undefined) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'ASC' ? valA - valB : valB - valA;
      }

      return direction === 'ASC'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  // Apply LIMIT
  if (limitNum !== null && limitNum >= 0) {
    results = results.slice(0, limitNum);
  }

  // Format projections
  return results.map(row => projectFields(row, selectColsStr));
}

function attachJoinedFields(leftRow: any, rightRow: any, rightAlias: string): any {
  const merged: any = {};
  Object.keys(rightRow).forEach(key => {
    // Avoid overwriting primary id unless aliased
    if (!leftRow[key] || key !== 'id') {
      merged[key] = rightRow[key];
    }
    merged[`${rightAlias}_${key}`] = rightRow[key];
  });
  return merged;
}

function matchJoinOn(leftRow: any, rightRow: any, onCond: string, leftAlias: string, rightAlias: string): boolean {
  if (!onCond) return true;
  const parts = onCond.split('=').map(p => p.trim());
  if (parts.length !== 2) return true;

  const getVal = (expr: string) => {
    if (expr.includes('.')) {
      const [alias, col] = expr.split('.');
      if (alias === leftAlias) return leftRow[col] !== undefined ? leftRow[col] : leftRow[`${alias}_${col}`];
      if (alias === rightAlias) return rightRow[col];
    }
    return leftRow[expr] !== undefined ? leftRow[expr] : rightRow[expr];
  };

  const val1 = getVal(parts[0]);
  const val2 = getVal(parts[1]);

  return String(val1) === String(val2);
}

function matchWhere(record: any, whereStr: string, params: any[], startParamIdx: number): boolean {
  if (!whereStr || whereStr === '1=1') return true;

  // Simple parser supporting AND/OR
  let paramIdx = startParamIdx;

  // Substitute params into expression
  let exprStr = whereStr;
  while (exprStr.includes('?') && paramIdx < params.length) {
    const val = params[paramIdx++];
    const formattedVal = typeof val === 'string' ? `'${val.replace(/'/g, "\\'")}'` : String(val);
    exprStr = exprStr.replace('?', () => formattedVal);
  }

  // Handle parenthesized OR search: (r.room_number LIKE '%query%' OR rt.name LIKE '%query%')
  // Avoid replacing IN (...) lists like IN ('Confirmed', 'Checked-In')
  if (/\(([^)]+)\)/.test(exprStr)) {
    exprStr = exprStr.replace(/\(([^)]+)\)/g, (fullMatch, inner) => {
      // If it looks like a comma-separated list of quoted strings (IN values), keep it intact
      if (inner.includes(',') || /^\s*['"]/.test(inner)) {
        return fullMatch;
      }
      const innerMatch = evalClause(record, inner);
      return innerMatch ? '1=1' : '1=0';
    });
  }

  return evalClause(record, exprStr);
}

function evalClause(record: any, exprStr: string): boolean {
  const andTokens = exprStr.split(/\s+AND\s+/i);

  for (const token of andTokens) {
    const trimmed = token.trim();
    if (!trimmed || trimmed === '1=1') continue;
    if (trimmed === '1=0') return false;

    // Handle OR inside token
    if (trimmed.includes(' OR ')) {
      const orTokens = trimmed.split(/\s+OR\s+/i);
      const matchedAny = orTokens.some(orT => evalSingleCondition(record, orT.trim()));
      if (!matchedAny) return false;
      continue;
    }

    if (!evalSingleCondition(record, trimmed)) {
      return false;
    }
  }

  return true;
}

function evalSingleCondition(record: any, cond: string): boolean {
  if (cond === '1=1') return true;
  if (cond === '1=0') return false;

  // LIKE
  if (/LIKE/i.test(cond)) {
    const parts = cond.split(/\s+LIKE\s+/i);
    const fieldRaw = parts[0].trim();
    const pattern = parts[1].trim().replace(/^['"]|['"]$/g, '').replace(/%/g, '').toLowerCase();
    const fieldVal = getRecordValue(record, fieldRaw);
    return String(fieldVal || '').toLowerCase().includes(pattern);
  }

  // IN ('a', 'b')
  if (/IN\s*\(([^)]+)\)/i.test(cond)) {
    const parts = cond.split(/\s+IN\s*/i);
    const fieldRaw = parts[0].trim();
    const inVals = parts[1].replace(/[()]/g, '').split(',').map(v => v.trim().replace(/^['"]|['"]$/g, ''));
    const fieldVal = String(getRecordValue(record, fieldRaw));
    return inVals.includes(fieldVal);
  }

  // IS NULL / IS NOT NULL
  if (/IS\s+NOT\s+NULL/i.test(cond)) {
    const fieldRaw = cond.split(/\s+IS\s+/i)[0].trim();
    const fieldVal = getRecordValue(record, fieldRaw);
    return fieldVal !== null && fieldVal !== undefined;
  }
  if (/IS\s+NULL/i.test(cond)) {
    const fieldRaw = cond.split(/\s+IS\s+/i)[0].trim();
    const fieldVal = getRecordValue(record, fieldRaw);
    return fieldVal === null || fieldVal === undefined;
  }

  // Comparisons: =, !=, >=, <=, >, <
  const compMatch = cond.match(/^(.+?)\s*(=|!=|>=|<=|>|<)\s*(.+)$/);
  if (compMatch) {
    const fieldRaw = compMatch[1].trim();
    const op = compMatch[2];
    const rawVal = compMatch[3].trim().replace(/^['"]|['"]$/g, '');

    const fieldVal = getRecordValue(record, fieldRaw);

    const numField = Number(fieldVal);
    const numVal = Number(rawVal);
    const isNumeric = !isNaN(numField) && !isNaN(numVal) && fieldVal !== '' && rawVal !== '';

    if (op === '=') return isNumeric ? numField === numVal : String(fieldVal) === String(rawVal);
    if (op === '!=') return isNumeric ? numField !== numVal : String(fieldVal) !== String(rawVal);
    if (op === '>=') return isNumeric ? numField >= numVal : String(fieldVal) >= String(rawVal);
    if (op === '<=') return isNumeric ? numField <= numVal : String(fieldVal) <= String(rawVal);
    if (op === '>') return isNumeric ? numField > numVal : String(fieldVal) > String(rawVal);
    if (op === '<') return isNumeric ? numField < numVal : String(fieldVal) < String(rawVal);
  }

  return true;
}

function getRecordValue(record: any, fieldRaw: string): any {
  if (fieldRaw.includes('.')) {
    const [alias, col] = fieldRaw.split('.');
    if (record[alias] && record[alias][col] !== undefined) {
      return record[alias][col];
    }
    if (record[`${alias}_${col}`] !== undefined) {
      return record[`${alias}_${col}`];
    }
    return record[col];
  }
  return record[fieldRaw];
}

function projectFields(row: any, selectColsStr: string): any {
  if (selectColsStr === '*') {
    // Return record without alias objects
    const clean: any = {};
    Object.keys(row).forEach(k => {
      if (typeof row[k] !== 'object' || row[k] === null || Array.isArray(row[k])) {
        clean[k] = row[k];
      }
    });
    return clean;
  }

  const result: any = {};
  const colTokens = selectColsStr.split(/,(?![^()]*\))/);

  colTokens.forEach(token => {
    const trimmed = token.trim();

    // Wildcards: * or u.*
    if (trimmed === '*' || /^(\w+)\.\*$/i.test(trimmed)) {
      const match = trimmed.match(/^(\w+)\.\*$/i);
      const targetAlias = match ? match[1] : null;
      const targetObj = targetAlias ? (row[targetAlias] || row) : row;
      if (targetObj && typeof targetObj === 'object') {
        Object.keys(targetObj).forEach(k => {
          if (typeof targetObj[k] !== 'object' || targetObj[k] === null || Array.isArray(targetObj[k])) {
            result[k] = targetObj[k];
          }
        });
      }
      return;
    }

    // String concatenation alias: g.first_name || ' ' || g.last_name as guest_name
    if (trimmed.includes('||') && /as\s+(\w+)/i.test(trimmed)) {
      const matchAlias = trimmed.match(/as\s+(\w+)/i)!;
      const alias = matchAlias[1];
      const expr = trimmed.substring(0, matchAlias.index).trim();
      const parts = expr.split('||').map(p => p.trim());

      const computed = parts.map(part => {
        if (part.startsWith("'") && part.endsWith("'")) {
          return part.slice(1, -1);
        }
        return getRecordValue(row, part) || '';
      }).join('');

      result[alias] = computed;
      return;
    }

    // Direct alias: table.col as alias or col as alias
    const aliasMatch = trimmed.match(/^(.+?)\s+as\s+(\w+)$/i);
    if (aliasMatch) {
      const fieldExpr = aliasMatch[1].trim();
      const aliasName = aliasMatch[2].trim();
      result[aliasName] = getRecordValue(row, fieldExpr);
      return;
    }

    // Direct column: table.col or col
    if (trimmed.includes('.')) {
      const colName = trimmed.split('.')[1];
      result[colName] = getRecordValue(row, trimmed);
    } else {
      result[trimmed] = row[trimmed];
    }
  });

  return result;
}



