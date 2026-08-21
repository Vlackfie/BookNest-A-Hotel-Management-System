var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express14 = __toESM(require("express"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_vite = require("vite");

// src/routes/auth.ts
var import_express = require("express");
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);

// src/db/database.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var DB_FILE_PATH = import_path.default.join(process.cwd(), "data", "booknest.json");
var dbInstance = null;
async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }
  const dataDir = import_path.default.dirname(DB_FILE_PATH);
  if (!import_fs.default.existsSync(dataDir)) {
    import_fs.default.mkdirSync(dataDir, { recursive: true });
  }
  if (import_fs.default.existsSync(DB_FILE_PATH)) {
    try {
      const fileContent = import_fs.default.readFileSync(DB_FILE_PATH, "utf-8");
      dbInstance = JSON.parse(fileContent);
      if (!dbInstance?.Bookings || dbInstance.Bookings.length === 0) {
        console.log("Re-seeding Bookings, CheckIns & Payments into database...");
        const initial = createInitialData();
        dbInstance.Bookings = initial.Bookings;
        dbInstance.CheckIns = initial.CheckIns;
        dbInstance.Payments = initial.Payments;
        dbInstance.Rooms = initial.Rooms;
        saveDb();
      } else {
        let updated = false;
        if (dbInstance.Rooms) {
          dbInstance.Rooms.forEach((r) => {
            if (r.status === "Cleaning") {
              r.status = "Dirty";
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
      console.error("Failed to load JSON database file, initializing new database:", err);
      dbInstance = createInitialData();
      saveDb();
    }
  } else {
    dbInstance = createInitialData();
    saveDb();
  }
  return dbInstance;
}
function saveDb() {
  if (!dbInstance) return;
  try {
    const dataDir = import_path.default.dirname(DB_FILE_PATH);
    if (!import_fs.default.existsSync(dataDir)) {
      import_fs.default.mkdirSync(dataDir, { recursive: true });
    }
    import_fs.default.writeFileSync(DB_FILE_PATH, JSON.stringify(dbInstance, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving JSON database:", err);
  }
}
function createInitialData() {
  console.log("Seeding initial BookNest JSON Database...");
  const defaultPasswordHash = import_bcryptjs.default.hashSync("password123", 10);
  const Roles = [
    { id: 1, role_name: "Owner", description: "Full system control, financial management and analytics access", permissions_json: '["*"]', created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 2, role_name: "Manager", description: "Operational oversight, employee, service, refund approval", permissions_json: '["manage_employees","manage_rooms","manage_bookings","manage_services","approve_refunds","view_reports"]', created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 3, role_name: "Receptionist", description: "Front-desk check-in, check-out, bookings and guest profiles", permissions_json: '["register_guests","create_bookings","checkin_checkout","receive_payments"]', created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 4, role_name: "Housekeeping Staff", description: "Room cleaning status, lost & found, damage reports", permissions_json: '["view_assigned_rooms","update_cleaning_status","damage_reports"]', created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 5, role_name: "Maintenance Staff", description: "Equipment repair tickets, maintenance status and costs", permissions_json: '["view_maintenance_requests","update_repair_status","record_costs"]', created_at: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  const Users = [
    { id: 1, username: "owner", email: "owner@booknest.com", password_hash: defaultPasswordHash, role_id: 1, full_name: "Sadikul Hossain", phone: "01941575025", is_active: 1, created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 2, username: "manager", email: "manager@booknest.com", password_hash: defaultPasswordHash, role_id: 2, full_name: "Prosenjeet", phone: "01941575025", is_active: 1, created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 3, username: "receptionist", email: "receptionist@booknest.com", password_hash: defaultPasswordHash, role_id: 3, full_name: "Rayhana Akter Rupa", phone: "01941575025", is_active: 1, created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 4, username: "housekeeper", email: "housekeeping@booknest.com", password_hash: defaultPasswordHash, role_id: 4, full_name: "Tanvir", phone: "01941575025", is_active: 1, created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 5, username: "maintenance", email: "maintenance@booknest.com", password_hash: defaultPasswordHash, role_id: 5, full_name: "Tawhid Sharihar", phone: "01941575025", is_active: 1, created_at: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  const Employees = [
    { id: 1, user_id: 1, employee_code: "EMP-001", full_name: "Sadikul Hossain", department: "Management", designation: "Chief Executive Owner", joining_date: "2022-01-15", salary: 12e4, phone: "01941575025", address: "Gulshan 2, Dhaka, Bangladesh", status: "Active", created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 2, user_id: 2, employee_code: "EMP-002", full_name: "Prosenjeet", department: "Operations", designation: "General Hotel Manager", joining_date: "2022-03-01", salary: 75e3, phone: "01941575025", address: "Dhanmondi, Dhaka, Bangladesh", status: "Active", created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 3, user_id: 3, employee_code: "EMP-003", full_name: "Rayhana Akter Rupa", department: "Front Desk", designation: "Senior Receptionist", joining_date: "2023-05-10", salary: 42e3, phone: "01941575025", address: "Uttara, Dhaka, Bangladesh", status: "Active", created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 4, user_id: 4, employee_code: "EMP-004", full_name: "Tanvir", department: "Housekeeping", designation: "Head Housekeeper", joining_date: "2023-06-15", salary: 36e3, phone: "01941575025", address: "Banani, Dhaka, Bangladesh", status: "Active", created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 5, user_id: 5, employee_code: "EMP-005", full_name: "Tawhid Sharihar", department: "Facility", designation: "Lead Maintenance Technician", joining_date: "2023-08-20", salary: 45e3, phone: "01941575025", address: "Mirpur, Dhaka, Bangladesh", status: "Active", created_at: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  const RoomTypes = [
    { id: 1, name: "Standard Deluxe", base_price: 3500, capacity: 2, amenities: 'High-Speed Wi-Fi, 42" Smart TV, Air Conditioning, Mini Fridge, Work Desk', description: "Cozy and contemporary room suitable for business travelers or couples." },
    { id: 2, name: "Executive Suite", base_price: 6500, capacity: 4, amenities: 'High-Speed Wi-Fi, 55" OLED TV, Jacuzzi Tub, Ocean View, King Bed, Nespresso Bar', description: "Spacious luxury suite with separated living room and panoramic city skyline views." },
    { id: 3, name: "Presidential Suite", base_price: 15e3, capacity: 6, amenities: 'Private Terrace, Personal Butler Service, Spa Bath, 65" TV, Mini Bar, Kitchenette', description: "The pinnacle of luxury featuring bespoke Italian furniture and private terrace." },
    { id: 4, name: "Family Twin", base_price: 5e3, capacity: 4, amenities: "High-Speed Wi-Fi, 2 Queen Beds, Kid Play Area, Smart TV, Refrigerator", description: "Designed for families, offering dual double beds and connected lounge amenities." }
  ];
  const Rooms = [
    { id: 1, room_number: "101", room_type_id: 1, floor: 1, status: "Available", price_per_night: 3500, is_clean: 1, notes: "Corner room near garden" },
    { id: 2, room_number: "102", room_type_id: 1, floor: 1, status: "Available", price_per_night: 3500, is_clean: 1, notes: "Recently sanitized" },
    { id: 3, room_number: "103", room_type_id: 4, floor: 1, status: "Available", price_per_night: 5e3, is_clean: 1, notes: "Family friendly twin beds" },
    { id: 4, room_number: "104", room_type_id: 1, floor: 1, status: "Dirty", price_per_night: 3500, is_clean: 0, notes: "Checkout cleaning required" },
    { id: 5, room_number: "201", room_type_id: 2, floor: 2, status: "Available", price_per_night: 6500, is_clean: 1, notes: "Executive Suite ready" },
    { id: 6, room_number: "202", room_type_id: 2, floor: 2, status: "Available", price_per_night: 6500, is_clean: 1, notes: "Executive Suite ready" },
    { id: 7, room_number: "203", room_type_id: 2, floor: 2, status: "Available", price_per_night: 6500, is_clean: 1, notes: "Fresh linens installed" },
    { id: 8, room_number: "204", room_type_id: 1, floor: 2, status: "Maintenance", price_per_night: 3500, is_clean: 0, notes: "AC unit capacitor replacement in progress" },
    { id: 9, room_number: "301", room_type_id: 3, floor: 3, status: "Available", price_per_night: 15e3, is_clean: 1, notes: "Presidential Penthouse ready" },
    { id: 10, room_number: "302", room_type_id: 3, floor: 3, status: "Available", price_per_night: 15e3, is_clean: 1, notes: "Penthouse B ready for booking" }
  ];
  const Guests = [
    { id: 1, first_name: "Anisur", last_name: "Rahman", email: "anisur.rahman@example.com", phone: "01941575025", nid_passport: "NID-BD-1982739102", emergency_contact: "Rahima Rahman (01941575001)", address: "Gulshan 1, Dhaka, Bangladesh", vip_status: 0 },
    { id: 2, first_name: "Nusrat", last_name: "Jahan", email: "nusrat.jahan@example.com", phone: "01812345678", nid_passport: "PASSPORT-BD-441209", emergency_contact: "Kamrul Islam (01812345678)", address: "Dhanmondi, Dhaka, Bangladesh", vip_status: 1 },
    { id: 3, first_name: "Shakib", last_name: "Al Hasan", email: "shakib.hasan@example.com", phone: "01711223344", nid_passport: "NID-BD-992102911", emergency_contact: "Umme Ahmed (01711223344)", address: "Banani, Dhaka, Bangladesh", vip_status: 1 },
    { id: 4, first_name: "Farhana", last_name: "Ahmed", email: "farhana.a@example.com", phone: "01698765432", nid_passport: "PASSPORT-BD-882194", emergency_contact: "Tariq Ahmed (01698765432)", address: "Uttara, Dhaka, Bangladesh", vip_status: 1 },
    { id: 5, first_name: "Tanvir", last_name: "Hossain", email: "tanvir.hossain@example.com", phone: "01715000005", nid_passport: "NID-BD-1002938411", emergency_contact: "Sumaiya Hossain (01715000050)", address: "Mirpur 10, Dhaka, Bangladesh", vip_status: 0 },
    { id: 6, first_name: "Mahmudul", last_name: "Hasan", email: "m.hasan@example.com", phone: "01822000006", nid_passport: "PASSPORT-BD-102938", emergency_contact: "Shaila Hasan (01822000060)", address: "Agrabad, Chittagong, Bangladesh", vip_status: 0 },
    { id: 7, first_name: "Sadia", last_name: "Islam", email: "sadia.islam@example.com", phone: "01933000007", nid_passport: "NID-BD-3029481023", emergency_contact: "Rashed Islam (01933000070)", address: "Zindabazar, Sylhet, Bangladesh", vip_status: 1 },
    { id: 8, first_name: "Kamal", last_name: "Uddin", email: "kamal.uddin@example.com", phone: "01644000008", nid_passport: "PASSPORT-BD-304958", emergency_contact: "Nasreen Begum (01644000080)", address: "Nasirabad, Chittagong, Bangladesh", vip_status: 0 },
    { id: 9, first_name: "Roksana", last_name: "Akter", email: "roksana.akter@example.com", phone: "01555000009", nid_passport: "NID-BD-5019283746", emergency_contact: "Monir Hossain (01555000090)", address: "Rajshahi Sadar, Rajshahi, Bangladesh", vip_status: 0 },
    { id: 10, first_name: "Arifur", last_name: "Chowdhury", email: "arif.chowdhury@example.com", phone: "01766000010", nid_passport: "PASSPORT-BD-502938", emergency_contact: "Selina Chowdhury (01766000100)", address: "Khulna City, Khulna, Bangladesh", vip_status: 1 },
    { id: 11, first_name: "Tasnim", last_name: "Ferdaus", email: "tasnim.f@example.com", phone: "01877000011", nid_passport: "NID-BD-7019283745", emergency_contact: "Rafiq Ferdaus (01877000110)", address: "Barishal Sadar, Barishal, Bangladesh", vip_status: 0 },
    { id: 12, first_name: "Shahriar", last_name: "Kabir", email: "shahriar.k@example.com", phone: "01988000012", nid_passport: "PASSPORT-BD-702938", emergency_contact: "Naila Kabir (01988000120)", address: "Mymensingh Sadar, Mymensingh, Bangladesh", vip_status: 1 },
    { id: 13, first_name: "Mehedi", last_name: "Hasan", email: "mehedi.hasan@example.com", phone: "01699000013", nid_passport: "NID-BD-9018273645", emergency_contact: "Sharmin Mehedi (01699000130)", address: "Rangpur Sadar, Rangpur, Bangladesh", vip_status: 0 },
    { id: 14, first_name: "Sabrina", last_name: "Sharmin", email: "sabrina.s@example.com", phone: "01712000014", nid_passport: "PASSPORT-BD-902837", emergency_contact: "Imtiaz Ali (01712000140)", address: "Cumilla Sadar, Cumilla, Bangladesh", vip_status: 0 },
    { id: 15, first_name: "Zubaer", last_name: "Khan", email: "zubaer.khan@example.com", phone: "01823000015", nid_passport: "NID-BD-1122334455", emergency_contact: "Fahmida Khan (01823000150)", address: "Bogura Sadar, Bogura, Bangladesh", vip_status: 1 },
    { id: 16, first_name: "Jannatul", last_name: "Ferdous", email: "jannat.f@example.com", phone: "01934000016", nid_passport: "PASSPORT-BD-112233", emergency_contact: "Zahid Ferdous (01934000160)", address: "Jessore Sadar, Jessore, Bangladesh", vip_status: 0 },
    { id: 17, first_name: "Imtiaz", last_name: "Ahmed", email: "imtiaz.ahmed@example.com", phone: "01645000017", nid_passport: "NID-BD-2233445566", emergency_contact: "Shirin Ahmed (01645000170)", address: "Gazipur City, Gazipur, Bangladesh", vip_status: 0 },
    { id: 18, first_name: "Sharmin", last_name: "Sultana", email: "sharmin.sultana@example.com", phone: "01556000018", nid_passport: "PASSPORT-BD-223344", emergency_contact: "Kabir Sultana (01556000180)", address: "Narayanganj Sadar, Narayanganj, Bangladesh", vip_status: 1 },
    { id: 19, first_name: "Faisal", last_name: "Mahmood", email: "faisal.m@example.com", phone: "01767000019", nid_passport: "NID-BD-3344556677", emergency_contact: "Nahid Mahmood (01767000190)", address: "Cox's Bazar, Bangladesh", vip_status: 0 },
    { id: 20, first_name: "Naila", last_name: "Parveen", email: "naila.parveen@example.com", phone: "01878000020", nid_passport: "PASSPORT-BD-334455", emergency_contact: "Asif Parveen (01878000200)", address: "Sreemangal, Moulvibazar, Bangladesh", vip_status: 1 }
  ];
  const Bookings = [
    { id: 1, booking_code: "BN-2026-1001", guest_id: 1, room_id: 1, check_in_date: "2026-06-10", check_out_date: "2026-06-14", num_guests: 2, total_amount: 14e3, discount_amount: 0, status: "Checked-Out", booked_by_user_id: 1, created_at: "2026-06-08T10:00:00Z" },
    { id: 2, booking_code: "BN-2026-1002", guest_id: 2, room_id: 3, check_in_date: "2026-06-18", check_out_date: "2026-06-21", num_guests: 1, total_amount: 45e3, discount_amount: 1e3, status: "Checked-Out", booked_by_user_id: 2, created_at: "2026-06-15T12:00:00Z" },
    { id: 3, booking_code: "BN-2026-1003", guest_id: 3, room_id: 5, check_in_date: "2026-07-01", check_out_date: "2026-07-05", num_guests: 2, total_amount: 34e3, discount_amount: 1e3, status: "Checked-Out", booked_by_user_id: 1, created_at: "2026-06-25T14:30:00Z" },
    { id: 4, booking_code: "BN-2026-1004", guest_id: 4, room_id: 2, check_in_date: "2026-07-10", check_out_date: "2026-07-15", num_guests: 2, total_amount: 32500, discount_amount: 0, status: "Checked-Out", booked_by_user_id: 3, created_at: "2026-07-08T09:00:00Z" },
    { id: 5, booking_code: "BN-2026-1005", guest_id: 1, room_id: 4, check_in_date: "2026-07-22", check_out_date: "2026-07-28", num_guests: 1, total_amount: 22800, discount_amount: 0, status: "Checked-In", booked_by_user_id: 3, created_at: "2026-07-20T11:00:00Z" },
    { id: 6, booking_code: "BN-2026-1006", guest_id: 5, room_id: 7, check_in_date: "2026-07-27", check_out_date: "2026-07-30", num_guests: 2, total_amount: 10500, discount_amount: 500, status: "Confirmed", booked_by_user_id: 3, created_at: "2026-07-22T16:00:00Z" },
    { id: 7, booking_code: "BN-2026-1007", guest_id: 6, room_id: 6, check_in_date: "2026-07-15", check_out_date: "2026-07-18", num_guests: 1, total_amount: 19500, discount_amount: 0, status: "Checked-Out", booked_by_user_id: 2, created_at: "2026-07-12T08:00:00Z" },
    { id: 8, booking_code: "BN-2026-1008", guest_id: 7, room_id: 8, check_in_date: "2026-07-05", check_out_date: "2026-07-08", num_guests: 1, total_amount: 7500, discount_amount: 0, status: "Checked-Out", booked_by_user_id: 1, created_at: "2026-07-02T10:00:00Z" }
  ];
  const CheckIns = [
    { id: 1, booking_id: 1, check_in_time: "2026-06-10T14:00:00Z", checked_in_by_user_id: 3, deposit_amount: 2e3, key_card_number: "KC-101", notes: "VIP Welcome drink served" },
    { id: 2, booking_id: 2, check_in_time: "2026-06-18T15:00:00Z", checked_in_by_user_id: 3, deposit_amount: 5e3, key_card_number: "KC-103", notes: "Late check-in" },
    { id: 3, booking_id: 3, check_in_time: "2026-07-01T14:00:00Z", checked_in_by_user_id: 3, deposit_amount: 3e3, key_card_number: "KC-201", notes: "Airport pickup provided" },
    { id: 4, booking_id: 4, check_in_time: "2026-07-10T13:30:00Z", checked_in_by_user_id: 3, deposit_amount: 2500, key_card_number: "KC-102", notes: "Early check-in approved" },
    { id: 5, booking_id: 5, check_in_time: "2026-07-22T14:15:00Z", checked_in_by_user_id: 3, deposit_amount: 3e3, key_card_number: "KC-104", notes: "Active stay" }
  ];
  const Payments = [
    { id: 1, booking_id: 1, amount: 2e3, payment_method: "Cash", payment_status: "Paid", transaction_id: "TXN-001", is_refund: 0, notes: "Advance Deposit", created_by_user_id: 3 },
    { id: 2, booking_id: 1, amount: 12e3, payment_method: "Credit Card", payment_status: "Paid", transaction_id: "TXN-002", is_refund: 0, notes: "Checkout settlement", created_by_user_id: 3 },
    { id: 3, booking_id: 2, amount: 5e3, payment_method: "bKash", payment_status: "Paid", transaction_id: "TXN-003", is_refund: 0, notes: "Advance Deposit", created_by_user_id: 3 },
    { id: 4, booking_id: 2, amount: 41e3, payment_method: "bKash", payment_status: "Paid", transaction_id: "TXN-004", is_refund: 0, notes: "Checkout settlement", created_by_user_id: 3 },
    { id: 5, booking_id: 5, amount: 3e3, payment_method: "Cash", payment_status: "Paid", transaction_id: "TXN-005", is_refund: 0, notes: "Checkin deposit", created_by_user_id: 3 }
  ];
  const Services = [
    { id: 1, name: "Gourmet Breakfast In Bed", category: "Food & Beverage", price: 500, description: "Freshly baked pastries, eggs, sausage, and fresh juice.", is_active: 1 },
    { id: 2, name: "Express Laundry & Dry Cleaning", category: "Laundry", price: 350, description: "Same-day washing, pressing, and garment bag delivery.", is_active: 1 },
    { id: 3, name: "VIP Luxury Airport Transfer", category: "Airport Pickup", price: 1500, description: "Chauffeur driven sedan pickup.", is_active: 1 },
    { id: 4, name: "Deep Relaxation Massage (60 min)", category: "Room Service", price: 2500, description: "In-room certified therapeutic massage.", is_active: 1 },
    { id: 5, name: "Gentle Morning Wake-Up Call", category: "Wake-Up Calls", price: 0, description: "Automated or human wake-up call with briefing.", is_active: 1 }
  ];
  const ServiceRequests = [];
  const Housekeeping = [
    { id: 1, room_id: 4, assigned_employee_id: 4, scheduled_date: "2026-07-22", status: "In Progress", notes: "Deep sanitize and refresh bed linens" },
    { id: 2, room_id: 2, assigned_employee_id: 4, scheduled_date: "2026-07-22", status: "Completed", notes: "Daily turnover completed" },
    { id: 3, room_id: 8, assigned_employee_id: 4, scheduled_date: "2026-07-22", status: "Pending", notes: "Clean room post-maintenance completion" }
  ];
  const Maintenance = [
    { id: 1, room_id: 8, reported_by_user_id: 3, assigned_employee_id: 5, issue_description: "Air conditioning compressor leaking coolant on floor 2.", priority: "High", repair_cost: 2500, status: "In Progress" },
    { id: 2, room_id: 3, reported_by_user_id: 4, assigned_employee_id: 5, issue_description: "Bathroom sink faucet aerator loose.", priority: "Low", repair_cost: 500, status: "Open" }
  ];
  const Inventory = [
    { id: 1, item_name: "Egyptian Cotton Towels", category: "Linen Inventory", quantity: 140, unit: "Pcs", min_stock_alert: 30, last_restocked: "2026-07-15" },
    { id: 2, item_name: "Luxury Botanical Shampoo (250ml)", category: "Room Supplies", quantity: 180, unit: "Bottles", min_stock_alert: 50, last_restocked: "2026-07-10" },
    { id: 3, item_name: "Espresso Coffee Pods Box", category: "Restaurant Inventory", quantity: 12, unit: "Boxes", min_stock_alert: 25, last_restocked: "2026-06-30" },
    { id: 4, item_name: "Premium Bed Sheets (King)", category: "Linen Inventory", quantity: 65, unit: "Sets", min_stock_alert: 20, last_restocked: "2026-07-12" },
    { id: 5, item_name: "Fine Red Wine Bottles (750ml)", category: "Restaurant Inventory", quantity: 8, unit: "Bottles", min_stock_alert: 15, last_restocked: "2026-07-01" }
  ];
  const Salaries = [
    { id: 1, employee_id: 1, month_year: "2026-06", base_salary: 12e4, bonus: 1e4, deductions: 0, net_salary: 13e4, payment_status: "Paid", payment_date: "2026-06-30" },
    { id: 2, employee_id: 2, month_year: "2026-06", base_salary: 75e3, bonus: 5e3, deductions: 0, net_salary: 8e4, payment_status: "Paid", payment_date: "2026-06-30" },
    { id: 3, employee_id: 3, month_year: "2026-06", base_salary: 42e3, bonus: 2e3, deductions: 0, net_salary: 44e3, payment_status: "Paid", payment_date: "2026-06-30" },
    { id: 4, employee_id: 4, month_year: "2026-06", base_salary: 36e3, bonus: 1500, deductions: 0, net_salary: 37500, payment_status: "Paid", payment_date: "2026-06-30" },
    { id: 5, employee_id: 5, month_year: "2026-06", base_salary: 45e3, bonus: 2e3, deductions: 0, net_salary: 47e3, payment_status: "Paid", payment_date: "2026-06-30" }
  ];
  const Attendance = [
    { id: 1, employee_id: 1, date: "2026-07-22", check_in_time: "08:00:00", check_out_time: "17:00:00", status: "Present", notes: "On-site executive duties" },
    { id: 2, employee_id: 2, date: "2026-07-22", check_in_time: "08:15:00", check_out_time: "17:30:00", status: "Present", notes: "Morning staff briefing conducted" },
    { id: 3, employee_id: 3, date: "2026-07-22", check_in_time: "08:00:00", check_out_time: "16:30:00", status: "Present", notes: "Front desk morning shift" },
    { id: 4, employee_id: 4, date: "2026-07-22", check_in_time: "08:30:00", check_out_time: "16:00:00", status: "Present", notes: "Housekeeping shift floor 1 & 2" },
    { id: 5, employee_id: 5, date: "2026-07-22", check_in_time: "09:00:00", check_out_time: "17:00:00", status: "Present", notes: "Maintenance HVAC repairs" }
  ];
  const ActivityLogs = [
    { id: 1, user_id: 1, action: "System Boot", module: "System", details: "Vlackfie International Hotel HMS system initialized with clean guest directory.", ip_address: "127.0.0.1", created_at: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  const Notifications = [
    { id: 1, user_id: null, role_target: "Manager", title: "Low Stock Alert", message: "Espresso Coffee Pods Box stock (12) is below minimum threshold (25).", is_read: 0, created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 2, user_id: null, role_target: "Maintenance Staff", title: "New Repair Ticket", message: "Room 204 reported High Priority AC repair request.", is_read: 0, created_at: (/* @__PURE__ */ new Date()).toISOString() },
    { id: 3, user_id: null, role_target: "Housekeeping Staff", title: "Room Cleaning Needed", message: "Room 104 requires checkout cleaning turn-around.", is_read: 0, created_at: (/* @__PURE__ */ new Date()).toISOString() }
  ];
  const SystemSettings = [
    { id: 1, setting_key: "hotel_name", setting_value: "Vlackfie International Hotel", category: "General", description: "Official trading name of the hotel establishment" },
    { id: 2, setting_key: "hotel_currency", setting_value: "\u09F3", category: "Financial", description: "Primary currency symbol used across invoices and billing" },
    { id: 3, setting_key: "contact_phone", setting_value: "01941575025", category: "General", description: "Primary contact phone number" },
    { id: 4, setting_key: "check_in_time", setting_value: "14:00", category: "Policy", description: "Standard check-in time" },
    { id: 5, setting_key: "check_out_time", setting_value: "11:00", category: "Policy", description: "Standard check-out time" },
    { id: 6, setting_key: "tax_rate_percent", setting_value: "10.0", category: "Financial", description: "Applicable hotel room tax percentage" }
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
function executeRun(db, sql, params = []) {
  const cleanSql = sql.trim();
  const sanitizedParams = params.map((p) => p === void 0 ? null : p);
  const insertMatch = cleanSql.match(/^INSERT\s+INTO\s+(\w+)\s*(?:\(([^)]+)\))?\s*VALUES\s*\((.+)\)/i);
  if (insertMatch) {
    const tableName = getCanonicalTable(db, insertMatch[1]);
    if (!db[tableName]) db[tableName] = [];
    const colsStr = insertMatch[2];
    const valStr = insertMatch[3];
    const cols = colsStr ? colsStr.split(",").map((c) => c.trim()) : [];
    const valExprs = valStr ? valStr.split(/,(?![^()]*\))/).map((v) => v.trim()) : [];
    let paramIdx = 0;
    const newRecord = {};
    if (cols.length > 0) {
      cols.forEach((col, idx) => {
        const expr = valExprs[idx] !== void 0 ? valExprs[idx] : "?";
        if (expr === "?") {
          newRecord[col] = sanitizedParams[paramIdx++];
        } else if (expr.toUpperCase() === "CURRENT_TIMESTAMP") {
          newRecord[col] = (/* @__PURE__ */ new Date()).toISOString();
        } else {
          const cleanVal = expr.replace(/^['"]|['"]$/g, "");
          newRecord[col] = isNaN(Number(cleanVal)) || cleanVal === "" ? cleanVal : Number(cleanVal);
        }
      });
    } else if (sanitizedParams.length > 0) {
      sanitizedParams.forEach((val, idx) => {
        newRecord[`col_${idx}`] = val;
      });
    }
    const existingIds = db[tableName].map((r) => Number(r.id) || 0);
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const newId = newRecord.id ? Number(newRecord.id) : maxId + 1;
    newRecord.id = newId;
    if (!newRecord.created_at) {
      newRecord.created_at = (/* @__PURE__ */ new Date()).toISOString();
    }
    db[tableName].push(newRecord);
    saveDb();
    return { lastInsertRowid: newId, changes: 1 };
  }
  const updateMatch = cleanSql.match(/^UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
  if (updateMatch) {
    const tableName = getCanonicalTable(db, updateMatch[1]);
    const setClause = updateMatch[2];
    const whereClause = updateMatch[3] || "";
    if (!db[tableName]) return { lastInsertRowid: 0, changes: 0 };
    let paramIdx = 0;
    const setPairs = [];
    const setTokens = setClause.split(/,(?![^()]*\))/);
    setTokens.forEach((st) => {
      const parts = st.split("=");
      if (parts.length >= 2) {
        const col = parts[0].trim();
        const valExpr = parts.slice(1).join("=").trim();
        if (valExpr === "?") {
          setPairs.push({ col, val: sanitizedParams[paramIdx++] });
        } else if (/COALESCE\s*\(\s*\?\s*,\s*(\w+)\s*\)/i.test(valExpr)) {
          const matchCoalesce = valExpr.match(/COALESCE\s*\(\s*\?\s*,\s*(\w+)\s*\)/i);
          const boundVal = sanitizedParams[paramIdx++];
          setPairs.push({ col, val: boundVal, isExpr: true });
        } else if (valExpr.toUpperCase() === "CURRENT_TIMESTAMP") {
          setPairs.push({ col, val: (/* @__PURE__ */ new Date()).toISOString() });
        } else {
          const cleanVal = valExpr.replace(/^['"]|['"]$/g, "");
          setPairs.push({ col, val: cleanVal });
        }
      }
    });
    let changes = 0;
    db[tableName].forEach((record) => {
      if (matchWhere(record, whereClause, sanitizedParams, paramIdx)) {
        setPairs.forEach((pair) => {
          if (pair.isExpr) {
            if (pair.val !== null && pair.val !== void 0) {
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
  const deleteMatch = cleanSql.match(/^DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
  if (deleteMatch) {
    const tableName = getCanonicalTable(db, deleteMatch[1]);
    const whereClause = deleteMatch[2] || "";
    if (!db[tableName]) return { lastInsertRowid: 0, changes: 0 };
    const initialLength = db[tableName].length;
    db[tableName] = db[tableName].filter((record) => !matchWhere(record, whereClause, sanitizedParams, 0));
    const changes = initialLength - db[tableName].length;
    saveDb();
    return { lastInsertRowid: 0, changes };
  }
  return { lastInsertRowid: 0, changes: 0 };
}
function queryAll(db, sql, params = []) {
  const cleanSql = sql.trim().replace(/\s+/g, " ");
  const sanitizedParams = params.map((p) => p === void 0 ? null : p);
  if (/^SELECT\s+(COUNT|SUM)/i.test(cleanSql)) {
    return handleAggregates(db, cleanSql, sanitizedParams);
  }
  return handleSelect(db, cleanSql, sanitizedParams);
}
function queryOne(db, sql, params = []) {
  const list = queryAll(db, sql, params);
  return list.length > 0 ? list[0] : null;
}
function getCanonicalTable(db, name) {
  const lower = name.toLowerCase();
  const keys = Object.keys(db);
  const matched = keys.find((k) => k.toLowerCase() === lower);
  return matched || name;
}
function handleAggregates(db, sql, params) {
  if (/SELECT\s+COUNT\(\*\)\s+as\s+(\w+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i.test(sql)) {
    const m = sql.match(/SELECT\s+COUNT\(\*\)\s+as\s+(\w+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i);
    const alias = m[1];
    const table = getCanonicalTable(db, m[2]);
    const whereStr = m[3] || "";
    const records = (db[table] || []).filter((r) => matchWhere(r, whereStr, params, 0));
    return [{ [alias]: records.length }];
  }
  if (/SELECT\s+SUM\((\w+)\)\s+as\s+(\w+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i.test(sql)) {
    const m = sql.match(/SELECT\s+SUM\((\w+)\)\s+as\s+(\w+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i);
    const field = m[1];
    const alias = m[2];
    const table = getCanonicalTable(db, m[3]);
    const whereStr = m[4] || "";
    const records = (db[table] || []).filter((r) => matchWhere(r, whereStr, params, 0));
    const sum = records.reduce((acc, curr) => acc + (Number(curr[field]) || 0), 0);
    return [{ [alias]: sum }];
  }
  return [{ count: 0, sum: 0 }];
}
function handleSelect(db, sql, params) {
  const fromIdx = sql.toUpperCase().indexOf(" FROM ");
  if (fromIdx === -1) return [];
  const selectColsStr = sql.substring(7, fromIdx).trim();
  const rest = sql.substring(fromIdx + 6).trim();
  let whereAndRest = rest;
  let orderStr = "";
  let limitNum = null;
  const limitIdx = whereAndRest.toUpperCase().indexOf(" LIMIT ");
  if (limitIdx !== -1) {
    limitNum = parseInt(whereAndRest.substring(limitIdx + 7).trim(), 10);
    whereAndRest = whereAndRest.substring(0, limitIdx).trim();
  }
  const orderIdx = whereAndRest.toUpperCase().indexOf(" ORDER BY ");
  if (orderIdx !== -1) {
    orderStr = whereAndRest.substring(orderIdx + 10).trim();
    whereAndRest = whereAndRest.substring(0, orderIdx).trim();
  }
  let tablesAndJoins = whereAndRest;
  let whereStr = "";
  const whereIdx = whereAndRest.toUpperCase().indexOf(" WHERE ");
  if (whereIdx !== -1) {
    tablesAndJoins = whereAndRest.substring(0, whereIdx).trim();
    whereStr = whereAndRest.substring(whereIdx + 7).trim();
  }
  const tableTokens = tablesAndJoins.split(/\s+(?:JOIN|LEFT\s+JOIN)\s+/i);
  const primaryToken = tableTokens[0].trim();
  const primaryParts = primaryToken.split(/\s+/);
  const primaryTableName = getCanonicalTable(db, primaryParts[0]);
  const primaryAlias = primaryParts[1] || primaryTableName;
  let results = (db[primaryTableName] || []).map((row) => ({
    [`${primaryAlias}`]: row,
    ...row
  }));
  for (let i = 1; i < tableTokens.length; i++) {
    const joinToken = tableTokens[i].trim();
    const onIdx = joinToken.toUpperCase().indexOf(" ON ");
    let joinTablePart = joinToken;
    let onCond = "";
    if (onIdx !== -1) {
      joinTablePart = joinToken.substring(0, onIdx).trim();
      onCond = joinToken.substring(onIdx + 4).trim();
    }
    const joinParts = joinTablePart.split(/\s+/);
    const joinTableName = getCanonicalTable(db, joinParts[0]);
    const joinAlias = joinParts[1] || joinTableName;
    const joinData = db[joinTableName] || [];
    const isLeftJoin = sql.toUpperCase().includes("LEFT JOIN");
    const nextResults = [];
    results.forEach((leftRow) => {
      const matches = joinData.filter((rightRow) => matchJoinOn(leftRow, rightRow, onCond, primaryAlias, joinAlias));
      if (matches.length > 0) {
        matches.forEach((mRow) => {
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
  if (whereStr && whereStr !== "1=1") {
    results = results.filter((row) => matchWhere(row, whereStr, params, 0));
  }
  if (orderStr) {
    const orderParts = orderStr.split(",")[0].trim().split(/\s+/);
    const fieldRaw = orderParts[0];
    const direction = (orderParts[1] || "ASC").toUpperCase();
    const fieldName = fieldRaw.includes(".") ? fieldRaw.split(".")[1] : fieldRaw;
    results.sort((a, b) => {
      let valA = a[fieldName] !== void 0 ? a[fieldName] : a[fieldRaw];
      let valB = b[fieldName] !== void 0 ? b[fieldName] : b[fieldRaw];
      if (valA === null || valA === void 0) valA = "";
      if (valB === null || valB === void 0) valB = "";
      if (typeof valA === "number" && typeof valB === "number") {
        return direction === "ASC" ? valA - valB : valB - valA;
      }
      return direction === "ASC" ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
    });
  }
  if (limitNum !== null && limitNum >= 0) {
    results = results.slice(0, limitNum);
  }
  return results.map((row) => projectFields(row, selectColsStr));
}
function attachJoinedFields(leftRow, rightRow, rightAlias) {
  const merged = {};
  Object.keys(rightRow).forEach((key) => {
    if (!leftRow[key] || key !== "id") {
      merged[key] = rightRow[key];
    }
    merged[`${rightAlias}_${key}`] = rightRow[key];
  });
  return merged;
}
function matchJoinOn(leftRow, rightRow, onCond, leftAlias, rightAlias) {
  if (!onCond) return true;
  const parts = onCond.split("=").map((p) => p.trim());
  if (parts.length !== 2) return true;
  const getVal = (expr) => {
    if (expr.includes(".")) {
      const [alias, col] = expr.split(".");
      if (alias === leftAlias) return leftRow[col] !== void 0 ? leftRow[col] : leftRow[`${alias}_${col}`];
      if (alias === rightAlias) return rightRow[col];
    }
    return leftRow[expr] !== void 0 ? leftRow[expr] : rightRow[expr];
  };
  const val1 = getVal(parts[0]);
  const val2 = getVal(parts[1]);
  return String(val1) === String(val2);
}
function matchWhere(record, whereStr, params, startParamIdx) {
  if (!whereStr || whereStr === "1=1") return true;
  let paramIdx = startParamIdx;
  let exprStr = whereStr;
  while (exprStr.includes("?") && paramIdx < params.length) {
    const val = params[paramIdx++];
    const formattedVal = typeof val === "string" ? `'${val.replace(/'/g, "\\'")}'` : String(val);
    exprStr = exprStr.replace("?", () => formattedVal);
  }
  if (/\(([^)]+)\)/.test(exprStr)) {
    exprStr = exprStr.replace(/\(([^)]+)\)/g, (fullMatch, inner) => {
      if (inner.includes(",") || /^\s*['"]/.test(inner)) {
        return fullMatch;
      }
      const innerMatch = evalClause(record, inner);
      return innerMatch ? "1=1" : "1=0";
    });
  }
  return evalClause(record, exprStr);
}
function evalClause(record, exprStr) {
  const andTokens = exprStr.split(/\s+AND\s+/i);
  for (const token of andTokens) {
    const trimmed = token.trim();
    if (!trimmed || trimmed === "1=1") continue;
    if (trimmed === "1=0") return false;
    if (trimmed.includes(" OR ")) {
      const orTokens = trimmed.split(/\s+OR\s+/i);
      const matchedAny = orTokens.some((orT) => evalSingleCondition(record, orT.trim()));
      if (!matchedAny) return false;
      continue;
    }
    if (!evalSingleCondition(record, trimmed)) {
      return false;
    }
  }
  return true;
}
function evalSingleCondition(record, cond) {
  if (cond === "1=1") return true;
  if (cond === "1=0") return false;
  if (/LIKE/i.test(cond)) {
    const parts = cond.split(/\s+LIKE\s+/i);
    const fieldRaw = parts[0].trim();
    const pattern = parts[1].trim().replace(/^['"]|['"]$/g, "").replace(/%/g, "").toLowerCase();
    const fieldVal = getRecordValue(record, fieldRaw);
    return String(fieldVal || "").toLowerCase().includes(pattern);
  }
  if (/IN\s*\(([^)]+)\)/i.test(cond)) {
    const parts = cond.split(/\s+IN\s*/i);
    const fieldRaw = parts[0].trim();
    const inVals = parts[1].replace(/[()]/g, "").split(",").map((v) => v.trim().replace(/^['"]|['"]$/g, ""));
    const fieldVal = String(getRecordValue(record, fieldRaw));
    return inVals.includes(fieldVal);
  }
  if (/IS\s+NOT\s+NULL/i.test(cond)) {
    const fieldRaw = cond.split(/\s+IS\s+/i)[0].trim();
    const fieldVal = getRecordValue(record, fieldRaw);
    return fieldVal !== null && fieldVal !== void 0;
  }
  if (/IS\s+NULL/i.test(cond)) {
    const fieldRaw = cond.split(/\s+IS\s+/i)[0].trim();
    const fieldVal = getRecordValue(record, fieldRaw);
    return fieldVal === null || fieldVal === void 0;
  }
  const compMatch = cond.match(/^(.+?)\s*(=|!=|>=|<=|>|<)\s*(.+)$/);
  if (compMatch) {
    const fieldRaw = compMatch[1].trim();
    const op = compMatch[2];
    const rawVal = compMatch[3].trim().replace(/^['"]|['"]$/g, "");
    const fieldVal = getRecordValue(record, fieldRaw);
    const numField = Number(fieldVal);
    const numVal = Number(rawVal);
    const isNumeric = !isNaN(numField) && !isNaN(numVal) && fieldVal !== "" && rawVal !== "";
    if (op === "=") return isNumeric ? numField === numVal : String(fieldVal) === String(rawVal);
    if (op === "!=") return isNumeric ? numField !== numVal : String(fieldVal) !== String(rawVal);
    if (op === ">=") return isNumeric ? numField >= numVal : String(fieldVal) >= String(rawVal);
    if (op === "<=") return isNumeric ? numField <= numVal : String(fieldVal) <= String(rawVal);
    if (op === ">") return isNumeric ? numField > numVal : String(fieldVal) > String(rawVal);
    if (op === "<") return isNumeric ? numField < numVal : String(fieldVal) < String(rawVal);
  }
  return true;
}
function getRecordValue(record, fieldRaw) {
  if (fieldRaw.includes(".")) {
    const [alias, col] = fieldRaw.split(".");
    if (record[alias] && record[alias][col] !== void 0) {
      return record[alias][col];
    }
    if (record[`${alias}_${col}`] !== void 0) {
      return record[`${alias}_${col}`];
    }
    return record[col];
  }
  return record[fieldRaw];
}
function projectFields(row, selectColsStr) {
  if (selectColsStr === "*") {
    const clean = {};
    Object.keys(row).forEach((k) => {
      if (typeof row[k] !== "object" || row[k] === null || Array.isArray(row[k])) {
        clean[k] = row[k];
      }
    });
    return clean;
  }
  const result = {};
  const colTokens = selectColsStr.split(/,(?![^()]*\))/);
  colTokens.forEach((token) => {
    const trimmed = token.trim();
    if (trimmed === "*" || /^(\w+)\.\*$/i.test(trimmed)) {
      const match = trimmed.match(/^(\w+)\.\*$/i);
      const targetAlias = match ? match[1] : null;
      const targetObj = targetAlias ? row[targetAlias] || row : row;
      if (targetObj && typeof targetObj === "object") {
        Object.keys(targetObj).forEach((k) => {
          if (typeof targetObj[k] !== "object" || targetObj[k] === null || Array.isArray(targetObj[k])) {
            result[k] = targetObj[k];
          }
        });
      }
      return;
    }
    if (trimmed.includes("||") && /as\s+(\w+)/i.test(trimmed)) {
      const matchAlias = trimmed.match(/as\s+(\w+)/i);
      const alias = matchAlias[1];
      const expr = trimmed.substring(0, matchAlias.index).trim();
      const parts = expr.split("||").map((p) => p.trim());
      const computed = parts.map((part) => {
        if (part.startsWith("'") && part.endsWith("'")) {
          return part.slice(1, -1);
        }
        return getRecordValue(row, part) || "";
      }).join("");
      result[alias] = computed;
      return;
    }
    const aliasMatch = trimmed.match(/^(.+?)\s+as\s+(\w+)$/i);
    if (aliasMatch) {
      const fieldExpr = aliasMatch[1].trim();
      const aliasName = aliasMatch[2].trim();
      result[aliasName] = getRecordValue(row, fieldExpr);
      return;
    }
    if (trimmed.includes(".")) {
      const colName = trimmed.split(".")[1];
      result[colName] = getRecordValue(row, trimmed);
    } else {
      result[trimmed] = row[trimmed];
    }
  });
  return result;
}

// src/middleware/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var JWT_SECRET = process.env.JWT_SECRET || "booknest_super_secret_jwt_key_2026";
function generateToken(payload) {
  return import_jsonwebtoken.default.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. No authentication token provided." });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired session token." });
  }
}
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized." });
    }
    if (allowedRoles.includes(req.user.role_name) || req.user.role_name === "Owner") {
      return next();
    }
    return res.status(403).json({
      error: `Access forbidden. Role '${req.user.role_name}' does not have permission for this module.`
    });
  };
}

// src/routes/auth.ts
var router = (0, import_express.Router)();
router.post("/login", async (req, res) => {
  try {
    const loginIdentifier = req.body.email || req.body.username;
    const { password } = req.body;
    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const db = await getDb();
    const user = queryOne(
      db,
      `SELECT u.*, r.role_name 
       FROM Users u 
       JOIN Roles r ON u.role_id = r.id 
       WHERE (u.email = ? OR u.username = ?) AND u.is_active = 1`,
      [loginIdentifier, loginIdentifier]
    );
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "Invalid credentials or inactive account." });
    }
    const isMatch = import_bcryptjs2.default.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    executeRun(db, `UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`, [user.id]);
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
      full_name: user.full_name
    };
    const token = generateToken(payload);
    return res.json({
      message: "Login successful",
      token,
      user: payload
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error during authentication." });
  }
});
router.get("/me", authenticateToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated." });
    const db = await getDb();
    const user = queryOne(
      db,
      `SELECT u.id, u.username, u.email, u.full_name, u.phone, u.role_id, r.role_name, u.created_at, u.last_login 
       FROM Users u JOIN Roles r ON u.role_id = r.id WHERE u.id = ?`,
      [req.user.id]
    );
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: "Server error." });
  }
});
router.post("/switch-role", async (req, res) => {
  try {
    const { role_name } = req.body;
    const db = await getDb();
    const user = queryOne(
      db,
      `SELECT u.*, r.role_name 
       FROM Users u JOIN Roles r ON u.role_id = r.id 
       WHERE r.role_name = ? LIMIT 1`,
      [role_name]
    );
    if (!user) {
      return res.status(404).json({ error: `User with role '${role_name}' not found.` });
    }
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
      full_name: user.full_name
    };
    const token = generateToken(payload);
    return res.json({
      message: `Switched to ${role_name} profile`,
      token,
      user: payload
    });
  } catch (err) {
    return res.status(500).json({ error: "Role switch failed." });
  }
});
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: "Both current and new passwords are required." });
    }
    const db = await getDb();
    const user = queryOne(db, `SELECT password_hash FROM Users WHERE id = ?`, [req.user.id]);
    if (!user || !user.password_hash || !import_bcryptjs2.default.compareSync(current_password, user.password_hash)) {
      return res.status(400).json({ error: "Current password does not match." });
    }
    const newHash = import_bcryptjs2.default.hashSync(new_password, 10);
    executeRun(db, `UPDATE Users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [newHash, req.user.id]);
    return res.json({ message: "Password updated successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update password." });
  }
});
var auth_default = router;

// src/routes/rooms.ts
var import_express2 = require("express");
var router2 = (0, import_express2.Router)();
router2.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, type_id, floor, search } = req.query;
    const db = await getDb();
    let sql = `
      SELECT r.*, rt.name as room_type_name, rt.capacity, rt.amenities
      FROM Rooms r
      JOIN RoomTypes rt ON r.room_type_id = rt.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      sql += ` AND r.status = ?`;
      params.push(status);
    }
    if (type_id) {
      sql += ` AND r.room_type_id = ?`;
      params.push(Number(type_id));
    }
    if (floor) {
      sql += ` AND r.floor = ?`;
      params.push(Number(floor));
    }
    if (search) {
      sql += ` AND (r.room_number LIKE ? OR rt.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY r.floor ASC, r.room_number ASC`;
    const rooms = queryAll(db, sql, params);
    return res.json({ rooms });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch rooms." });
  }
});
router2.get("/types", authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const roomTypes = queryAll(db, `SELECT * FROM RoomTypes ORDER BY base_price ASC`);
    return res.json({ roomTypes });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch room types." });
  }
});
router2.post("/", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const { room_number, room_type_id, floor, price_per_night, notes } = req.body;
    if (!room_number || !room_type_id || !price_per_night) {
      return res.status(400).json({ error: "Room number, type, and price per night are required." });
    }
    const db = await getDb();
    const existing = queryOne(db, `SELECT id FROM Rooms WHERE room_number = ?`, [room_number]);
    if (existing) {
      return res.status(400).json({ error: `Room number ${room_number} already exists.` });
    }
    const resRun = executeRun(
      db,
      `INSERT INTO Rooms (room_number, room_type_id, floor, status, price_per_night, is_clean, notes) VALUES (?, ?, ?, 'Available', ?, 1, ?)`,
      [room_number, Number(room_type_id), Number(floor || 1), Number(price_per_night), notes || ""]
    );
    const newRoom = queryOne(db, `SELECT r.*, rt.name as room_type_name FROM Rooms r JOIN RoomTypes rt ON r.room_type_id = rt.id WHERE r.id = ?`, [resRun.lastInsertRowid]);
    return res.status(201).json({ message: "Room created successfully", room: newRoom });
  } catch (err) {
    console.error("Error creating room:", err);
    return res.status(500).json({ error: "Failed to create room." });
  }
});
router2.put("/:id", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist", "Housekeeping Staff", "Maintenance Staff"), async (req, res) => {
  try {
    const roomId = Number(req.params.id);
    const { room_number, room_type_id, floor, status, price_per_night, is_clean, notes } = req.body;
    const db = await getDb();
    const existing = queryOne(db, `SELECT * FROM Rooms WHERE id = ?`, [roomId]);
    if (!existing) {
      return res.status(404).json({ error: "Room not found." });
    }
    if (room_number && String(room_number).trim() !== String(existing.room_number).trim()) {
      const existingNum = queryOne(db, `SELECT id FROM Rooms WHERE room_number = ? AND id != ?`, [String(room_number).trim(), roomId]);
      if (existingNum) {
        return res.status(400).json({ error: `Room number ${room_number} already exists.` });
      }
    }
    const updatedRoomNumber = room_number !== void 0 ? String(room_number).trim() : existing.room_number;
    const updatedRoomTypeId = room_type_id !== void 0 ? Number(room_type_id) : existing.room_type_id;
    const updatedFloor = floor !== void 0 ? Number(floor) : existing.floor;
    const updatedStatus = status !== void 0 ? status : existing.status;
    const updatedPrice = price_per_night !== void 0 ? Number(price_per_night) : existing.price_per_night;
    const updatedClean = is_clean !== void 0 ? is_clean ? 1 : 0 : updatedStatus === "Available" ? 1 : existing.is_clean;
    const updatedNotes = notes !== void 0 ? notes : existing.notes;
    executeRun(
      db,
      `UPDATE Rooms 
       SET room_number = ?,
           room_type_id = ?,
           floor = ?,
           status = ?,
           price_per_night = ?,
           is_clean = ?,
           notes = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [updatedRoomNumber, updatedRoomTypeId, updatedFloor, updatedStatus, updatedPrice, updatedClean, updatedNotes, roomId]
    );
    const updated = queryOne(db, `SELECT r.*, rt.name as room_type_name FROM Rooms r JOIN RoomTypes rt ON r.room_type_id = rt.id WHERE r.id = ?`, [roomId]);
    return res.json({ message: "Room updated successfully", room: updated });
  } catch (err) {
    console.error("Error updating room:", err);
    return res.status(500).json({ error: "Failed to update room." });
  }
});
router2.delete("/:id", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const roomId = Number(req.params.id);
    const db = await getDb();
    const activeBooking = queryOne(db, `SELECT id FROM Bookings WHERE room_id = ? AND status IN ('Confirmed', 'Checked-In')`, [roomId]);
    if (activeBooking) {
      return res.status(400).json({ error: "Cannot delete room with active or upcoming reservations." });
    }
    executeRun(db, `DELETE FROM Housekeeping WHERE room_id = ?`, [roomId]);
    executeRun(db, `DELETE FROM Maintenance WHERE room_id = ?`, [roomId]);
    const pastBookings = queryAll(db, `SELECT id FROM Bookings WHERE room_id = ?`, [roomId]);
    for (const b of pastBookings) {
      executeRun(db, `DELETE FROM CheckIns WHERE booking_id = ?`, [b.id]);
      executeRun(db, `DELETE FROM Payments WHERE booking_id = ?`, [b.id]);
      executeRun(db, `DELETE FROM Bookings WHERE id = ?`, [b.id]);
    }
    executeRun(db, `DELETE FROM Rooms WHERE id = ?`, [roomId]);
    return res.json({ message: "Room deleted successfully." });
  } catch (err) {
    console.error("Error deleting room:", err);
    return res.status(500).json({ error: "Failed to delete room." });
  }
});
var rooms_default = router2;

// src/routes/guests.ts
var import_express3 = require("express");
var router3 = (0, import_express3.Router)();
router3.get("/", authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    const db = await getDb();
    let sql = `SELECT * FROM Guests WHERE 1=1`;
    const params = [];
    if (search) {
      sql += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR nid_passport LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY id DESC`;
    const guests = queryAll(db, sql, params);
    return res.json({ guests });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch guests." });
  }
});
router3.get("/:id", authenticateToken, async (req, res) => {
  try {
    const guestId = Number(req.params.id);
    const db = await getDb();
    const guest = queryOne(db, `SELECT * FROM Guests WHERE id = ?`, [guestId]);
    if (!guest) return res.status(404).json({ error: "Guest not found." });
    const bookings = queryAll(
      db,
      `SELECT b.*, r.room_number, rt.name as room_type_name
       FROM Bookings b
       JOIN Rooms r ON b.room_id = r.id
       JOIN RoomTypes rt ON r.room_type_id = rt.id
       WHERE b.guest_id = ?
       ORDER BY b.id DESC`,
      [guestId]
    );
    return res.json({ guest, bookings });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch guest details." });
  }
});
router3.post("/", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const { first_name, last_name, email, phone, nid_passport, emergency_contact, address, vip_status } = req.body;
    if (!first_name || !last_name || !email || !phone || !nid_passport) {
      return res.status(400).json({ error: "First name, last name, email, phone, and NID/Passport are required." });
    }
    const db = await getDb();
    const existingPhone = queryOne(db, `SELECT id FROM Guests WHERE phone = ?`, [phone.trim()]);
    if (existingPhone) {
      return res.status(400).json({ error: `A guest with phone number "${phone}" is already registered.` });
    }
    const existing = queryOne(db, `SELECT id FROM Guests WHERE email = ? OR nid_passport = ?`, [email.trim(), nid_passport.trim()]);
    if (existing) {
      return res.status(400).json({ error: "A guest with this email or NID/Passport already exists." });
    }
    const resRun = executeRun(
      db,
      `INSERT INTO Guests (first_name, last_name, email, phone, nid_passport, emergency_contact, address, vip_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, nid_passport, emergency_contact || "", address || "", vip_status ? 1 : 0]
    );
    const newGuest = queryOne(db, `SELECT * FROM Guests WHERE id = ?`, [resRun.lastInsertRowid]);
    return res.status(201).json({ message: "Guest registered successfully", guest: newGuest });
  } catch (err) {
    return res.status(500).json({ error: "Failed to register guest." });
  }
});
router3.put("/:id", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const guestId = Number(req.params.id);
    const { first_name, last_name, email, phone, nid_passport, emergency_contact, address, vip_status } = req.body;
    const db = await getDb();
    const existingGuest = queryOne(db, `SELECT * FROM Guests WHERE id = ?`, [guestId]);
    if (!existingGuest) {
      return res.status(404).json({ error: "Guest not found." });
    }
    if (phone && phone.trim()) {
      const existingPhone = queryOne(db, `SELECT id FROM Guests WHERE phone = ? AND id != ?`, [phone.trim(), guestId]);
      if (existingPhone) {
        return res.status(400).json({ error: `Phone number "${phone}" is already registered to another guest.` });
      }
    }
    if (email && email.trim()) {
      const existingEmail = queryOne(db, `SELECT id FROM Guests WHERE email = ? AND id != ?`, [email.trim(), guestId]);
      if (existingEmail) {
        return res.status(400).json({ error: `Email address "${email}" is already registered to another guest.` });
      }
    }
    if (nid_passport && nid_passport.trim()) {
      const existingNid = queryOne(db, `SELECT id FROM Guests WHERE nid_passport = ? AND id != ?`, [nid_passport.trim(), guestId]);
      if (existingNid) {
        return res.status(400).json({ error: `NID/Passport "${nid_passport}" is already registered to another guest.` });
      }
    }
    const updatedFirstName = first_name !== void 0 ? first_name.trim() : existingGuest.first_name;
    const updatedLastName = last_name !== void 0 ? last_name.trim() : existingGuest.last_name;
    const updatedEmail = email !== void 0 ? email.trim() : existingGuest.email;
    const updatedPhone = phone !== void 0 ? phone.trim() : existingGuest.phone;
    const updatedNid = nid_passport !== void 0 ? nid_passport.trim() : existingGuest.nid_passport;
    const updatedEmerg = emergency_contact !== void 0 ? emergency_contact.trim() : existingGuest.emergency_contact;
    const updatedAddr = address !== void 0 ? address.trim() : existingGuest.address;
    const updatedVip = vip_status !== void 0 ? vip_status ? 1 : 0 : existingGuest.vip_status;
    executeRun(
      db,
      `UPDATE Guests
       SET first_name = ?,
           last_name = ?,
           email = ?,
           phone = ?,
           nid_passport = ?,
           emergency_contact = ?,
           address = ?,
           vip_status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [updatedFirstName, updatedLastName, updatedEmail, updatedPhone, updatedNid, updatedEmerg, updatedAddr, updatedVip, guestId]
    );
    const updated = queryOne(db, `SELECT * FROM Guests WHERE id = ?`, [guestId]);
    return res.json({ message: "Guest updated successfully", guest: updated });
  } catch (err) {
    console.error("Error updating guest:", err);
    return res.status(500).json({ error: "Failed to update guest profile." });
  }
});
router3.delete("/:id", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const guestId = Number(req.params.id);
    const db = await getDb();
    const guest = queryOne(db, `SELECT * FROM Guests WHERE id = ?`, [guestId]);
    if (!guest) return res.status(404).json({ error: "Guest not found." });
    const activeBooking = queryOne(db, `SELECT id FROM Bookings WHERE guest_id = ? AND status IN ('Confirmed', 'Checked-In')`, [guestId]);
    if (activeBooking) {
      return res.status(400).json({ error: "Cannot delete guest with active or upcoming reservations. Please check out or cancel the reservation first." });
    }
    const bookings = queryAll(db, `SELECT id FROM Bookings WHERE guest_id = ?`, [guestId]);
    for (const b of bookings) {
      executeRun(db, `DELETE FROM CheckIns WHERE booking_id = ?`, [b.id]);
      executeRun(db, `DELETE FROM Payments WHERE booking_id = ?`, [b.id]);
      executeRun(db, `DELETE FROM Bookings WHERE id = ?`, [b.id]);
    }
    executeRun(db, `DELETE FROM Guests WHERE id = ?`, [guestId]);
    return res.json({ message: "Guest deleted successfully." });
  } catch (err) {
    console.error("Error deleting guest:", err);
    return res.status(500).json({ error: "Failed to delete guest." });
  }
});
var guests_default = router3;

// src/routes/bookings.ts
var import_express4 = require("express");
var router4 = (0, import_express4.Router)();
router4.get("/", authenticateToken, async (req, res) => {
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
    const params = [];
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
    return res.status(500).json({ error: "Failed to fetch bookings." });
  }
});
router4.get("/:id/invoice", authenticateToken, async (req, res) => {
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
    if (!booking) return res.status(404).json({ error: "Booking record not found." });
    const serviceItems = queryAll(
      db,
      `SELECT gs.quantity, gs.total_price, s.service_name 
       FROM GuestServices gs
       JOIN Services s ON gs.service_id = s.id
       WHERE gs.booking_id = ?`,
      [bookingId]
    );
    const payments = queryAll(
      db,
      `SELECT amount, payment_method, is_refund FROM Payments WHERE booking_id = ? AND payment_status = 'Paid'`,
      [bookingId]
    );
    let priorPaid = 0;
    let receivedAmount = 0;
    let paymentMethod = "Cash";
    payments.forEach((p) => {
      if (p.is_refund) {
        priorPaid -= p.amount;
      } else {
        priorPaid += p.amount;
        paymentMethod = p.payment_method || paymentMethod;
      }
    });
    const checkoutRecord = queryOne(
      db,
      `SELECT * FROM CheckOuts WHERE booking_id = ? ORDER BY id DESC LIMIT 1`,
      [bookingId]
    );
    if (checkoutRecord) {
      receivedAmount = checkoutRecord.received_amount || 0;
      paymentMethod = checkoutRecord.payment_method || paymentMethod;
    }
    const servicesTotal = serviceItems.reduce((acc, curr) => acc + (curr.total_price || 0), 0);
    const extraCharges = checkoutRecord ? checkoutRecord.additional_charges : servicesTotal;
    const finalTotal = checkoutRecord ? checkoutRecord.final_amount : booking.total_amount + extraCharges;
    const totalPaid = Math.max(priorPaid, 0);
    const balanceDue = Math.max(0, finalTotal - totalPaid);
    const changeReturn = Math.max(0, totalPaid - finalTotal);
    const hotelSetting = queryOne(db, `SELECT setting_value FROM SystemSettings WHERE setting_key = 'hotel_name'`);
    const hotelName = hotelSetting ? hotelSetting.setting_value : "Vlackfie International Hotel";
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
    console.error("Invoice fetch error:", err);
    return res.status(500).json({ error: "Failed to generate invoice for booking." });
  }
});
router4.post("/check-availability", authenticateToken, async (req, res) => {
  try {
    const { room_id, check_in_date, check_out_date, exclude_booking_id } = req.body;
    if (!room_id || !check_in_date || !check_out_date) {
      return res.status(400).json({ error: "Room ID, Check-in date, and Check-out date are required." });
    }
    const db = await getDb();
    let sql = `
      SELECT id, booking_code, check_in_date, check_out_date
      FROM Bookings
      WHERE room_id = ? 
        AND status IN ('Confirmed', 'Checked-In')
        AND (check_in_date < ? AND check_out_date > ?)
    `;
    const params = [Number(room_id), check_out_date, check_in_date];
    if (exclude_booking_id) {
      sql += ` AND id != ?`;
      params.push(Number(exclude_booking_id));
    }
    const conflicts = queryAll(db, sql, params);
    const isAvailable = conflicts.length === 0;
    return res.json({ isAvailable, conflicts });
  } catch (err) {
    return res.status(500).json({ error: "Failed to check availability." });
  }
});
router4.post("/", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const {
      guest_id,
      room_id,
      check_in_date,
      check_out_date,
      num_guests,
      discount_amount,
      status
      // 'Confirmed' or 'Checked-In'
    } = req.body;
    if (!guest_id || !room_id || !check_in_date || !check_out_date) {
      return res.status(400).json({ error: "Guest, Room, Check-in, and Check-out dates are required." });
    }
    if (new Date(check_out_date) <= new Date(check_in_date)) {
      return res.status(400).json({ error: "Check-out date must be strictly after check-in date." });
    }
    const db = await getDb();
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
    const room = queryOne(db, `SELECT price_per_night, room_number FROM Rooms WHERE id = ?`, [Number(room_id)]);
    if (!room) return res.status(404).json({ error: "Selected room does not exist." });
    const days = Math.max(1, Math.ceil((new Date(check_out_date).getTime() - new Date(check_in_date).getTime()) / (1e3 * 60 * 60 * 24)));
    const baseTotal = days * room.price_per_night;
    const finalTotal = Math.max(0, baseTotal - (Number(discount_amount) || 0));
    const bookingCode = `BN-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}`;
    const bookedByUserId = req.user ? req.user.id : 1;
    const bookingStatus = status || "Confirmed";
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
    if (bookingStatus === "Confirmed") {
      executeRun(db, `UPDATE Rooms SET status = 'Reserved', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [Number(room_id)]);
    } else if (bookingStatus === "Checked-In") {
      executeRun(db, `UPDATE Rooms SET status = 'Occupied', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [Number(room_id)]);
    }
    const newBooking = queryOne(
      db,
      `SELECT b.*, g.first_name || ' ' || g.last_name as guest_name, r.room_number 
       FROM Bookings b JOIN Guests g ON b.guest_id = g.id JOIN Rooms r ON b.room_id = r.id WHERE b.id = ?`,
      [resRun.lastInsertRowid]
    );
    return res.status(201).json({ message: "Reservation created successfully", booking: newBooking });
  } catch (err) {
    console.error("Create booking error:", err);
    return res.status(500).json({ error: "Failed to create reservation." });
  }
});
router4.put("/:id/cancel", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const db = await getDb();
    const booking = queryOne(db, `SELECT room_id FROM Bookings WHERE id = ?`, [bookingId]);
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    executeRun(db, `UPDATE Bookings SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [bookingId]);
    executeRun(db, `UPDATE Rooms SET status = 'Available' WHERE id = ? AND status = 'Reserved'`, [booking.room_id]);
    return res.json({ message: "Reservation cancelled successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to cancel reservation." });
  }
});
var bookings_default = router4;

// src/routes/checkin.ts
var import_express5 = require("express");
var router5 = (0, import_express5.Router)();
router5.post("/check-in", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const { booking_id, deposit_amount, key_card_number, notes } = req.body;
    if (!booking_id) {
      return res.status(400).json({ error: "Booking ID is required for Check-In." });
    }
    const db = await getDb();
    const booking = queryOne(
      db,
      `SELECT b.*, r.room_number, g.first_name || ' ' || g.last_name as guest_name 
       FROM Bookings b JOIN Rooms r ON b.room_id = r.id JOIN Guests g ON b.guest_id = g.id
       WHERE b.id = ?`,
      [Number(booking_id)]
    );
    if (!booking) {
      return res.status(404).json({ error: "Valid booking not found." });
    }
    if (booking.status === "Checked-In") {
      return res.status(400).json({ error: "Guest is already checked in for this booking." });
    }
    if (booking.status === "Cancelled" || booking.status === "Checked-Out") {
      return res.status(400).json({ error: `Cannot check in booking with status '${booking.status}'.` });
    }
    const userId = req.user ? req.user.id : 1;
    executeRun(
      db,
      `INSERT INTO CheckIns (booking_id, check_in_time, checked_in_by_user_id, deposit_amount, key_card_number, notes)
       VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?)`,
      [Number(booking_id), userId, Number(deposit_amount || 0), key_card_number || `KC-${booking.room_number}`, notes || ""]
    );
    executeRun(db, `UPDATE Bookings SET status = 'Checked-In', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [Number(booking_id)]);
    executeRun(db, `UPDATE Rooms SET status = 'Occupied', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [booking.room_id]);
    return res.json({
      message: `Check-in completed successfully for ${booking.guest_name} in Room ${booking.room_number}`,
      booking_id: booking.id,
      key_card_number: key_card_number || `KC-${booking.room_number}`
    });
  } catch (err) {
    console.error("Check-in error:", err);
    return res.status(500).json({ error: "Failed to process check-in." });
  }
});
router5.post("/check-out", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const { booking_id, additional_charges, refund_amount, received_amount, payment_method, notes } = req.body;
    if (!booking_id) {
      return res.status(400).json({ error: "Booking ID is required for Check-Out." });
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
      return res.status(404).json({ error: "Booking not found." });
    }
    if (booking.status !== "Checked-In") {
      return res.status(400).json({ error: "Only checked-in bookings can be checked out." });
    }
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
    const priorPayments = queryAll(db, `SELECT * FROM Payments WHERE booking_id = ?`, [Number(booking_id)]);
    const priorPaid = priorPayments.reduce((acc, curr) => acc + (curr.is_refund ? -curr.amount : curr.amount), 0);
    const received = Number(received_amount) || 0;
    const selectedMethod = payment_method || "Cash";
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
    executeRun(
      db,
      `INSERT INTO CheckOuts (booking_id, check_out_time, checked_out_by_user_id, final_amount, additional_charges, refund_amount, received_amount, payment_method, notes)
       VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?)`,
      [Number(booking_id), userId, finalAmount, extraCharges, Number(refund_amount || 0), received, selectedMethod, notes || ""]
    );
    executeRun(db, `UPDATE Bookings SET status = 'Checked-Out', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [Number(booking_id)]);
    executeRun(db, `UPDATE Rooms SET status = 'Dirty', is_clean = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [booking.room_id]);
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    executeRun(
      db,
      `INSERT INTO Housekeeping (room_id, assigned_employee_id, scheduled_date, status, notes)
       VALUES (?, 4, ?, 'Pending', ?)`,
      [booking.room_id, todayStr, `Checkout room turnover for guest ${booking.guest_name}`]
    );
    executeRun(
      db,
      `INSERT INTO ActivityLogs (user_id, action, module, details, ip_address) VALUES (?, 'Check-Out Guest', 'Front Desk', ?, '127.0.0.1')`,
      [userId, `Checked out guest ${booking.guest_name} from Room ${booking.room_number}. Settlement Received: Tk. ${received} (${selectedMethod})`]
    );
    const hotelSetting = queryOne(db, `SELECT setting_value FROM SystemSettings WHERE setting_key = 'hotel_name'`);
    const hotelName = hotelSetting ? hotelSetting.setting_value : "Vlackfie International Hotel";
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
    console.error("Check-out error:", err);
    return res.status(500).json({ error: "Failed to process check-out." });
  }
});
var checkin_default = router5;

// src/routes/payments.ts
var import_express6 = require("express");
var router6 = (0, import_express6.Router)();
router6.get("/", authenticateToken, async (req, res) => {
  try {
    const { booking_id, search } = req.query;
    const db = await getDb();
    let sql = `
      SELECT p.*, b.booking_code, g.first_name || ' ' || g.last_name as guest_name, u.full_name as created_by_name
      FROM Payments p
      JOIN Bookings b ON p.booking_id = b.id
      JOIN Guests g ON b.guest_id = g.id
      JOIN Users u ON p.created_by_user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (booking_id) {
      sql += ` AND p.booking_id = ?`;
      params.push(Number(booking_id));
    }
    if (search) {
      sql += ` AND (p.transaction_id LIKE ? OR b.booking_code LIKE ? OR g.first_name LIKE ? OR g.last_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY p.id DESC`;
    const payments = queryAll(db, sql, params);
    return res.json({ payments });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch payments." });
  }
});
router6.post("/", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const { booking_id, amount, payment_method, notes } = req.body;
    if (!booking_id || !amount || !payment_method) {
      return res.status(400).json({ error: "Booking ID, amount, and payment method are required." });
    }
    const db = await getDb();
    const booking = queryOne(db, `SELECT id FROM Bookings WHERE id = ?`, [Number(booking_id)]);
    if (!booking) return res.status(404).json({ error: "Associated booking not found." });
    const transactionId = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const userId = req.user ? req.user.id : 1;
    const resRun = executeRun(
      db,
      `INSERT INTO Payments (booking_id, amount, payment_method, payment_status, transaction_id, is_refund, notes, created_by_user_id)
       VALUES (?, ?, ?, 'Paid', ?, 0, ?, ?)`,
      [Number(booking_id), Number(amount), payment_method, transactionId, notes || "", userId]
    );
    const payment = queryOne(db, `SELECT * FROM Payments WHERE id = ?`, [resRun.lastInsertRowid]);
    return res.status(201).json({ message: "Payment recorded successfully", payment });
  } catch (err) {
    return res.status(500).json({ error: "Failed to record payment." });
  }
});
router6.post("/refund", authenticateToken, authorizeRoles("Owner", "Manager"), async (req, res) => {
  try {
    const { booking_id, amount, notes } = req.body;
    if (!booking_id || !amount) {
      return res.status(400).json({ error: "Booking ID and refund amount are required." });
    }
    const db = await getDb();
    const transactionId = `RFD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const userId = req.user ? req.user.id : 1;
    executeRun(
      db,
      `INSERT INTO Payments (booking_id, amount, payment_method, payment_status, transaction_id, is_refund, notes, created_by_user_id)
       VALUES (?, ?, 'Cash', 'Refunded', ?, 1, ?, ?)`,
      [Number(booking_id), Number(amount), transactionId, `APPROVED REFUND: ${notes || "Manager approved"}`, userId]
    );
    return res.json({ message: "Refund approved and recorded successfully.", transaction_id: transactionId });
  } catch (err) {
    return res.status(500).json({ error: "Failed to process refund." });
  }
});
var payments_default = router6;

// src/routes/employees.ts
var import_express7 = require("express");
var import_bcryptjs3 = __toESM(require("bcryptjs"), 1);
var router7 = (0, import_express7.Router)();
router7.get("/", authenticateToken, async (req, res) => {
  try {
    const { department, status, search } = req.query;
    const db = await getDb();
    let sql = `
      SELECT e.*, 
             u.email as user_email, 
             u.username, 
             u.is_active as user_active,
             r.role_name, 
             r.id as role_id 
      FROM Employees e 
      LEFT JOIN Users u ON e.user_id = u.id 
      LEFT JOIN Roles r ON u.role_id = r.id 
      WHERE 1=1
    `;
    const params = [];
    if (department) {
      sql += ` AND e.department = ?`;
      params.push(department);
    }
    if (status) {
      sql += ` AND e.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (e.full_name LIKE ? OR e.employee_code LIKE ? OR e.designation LIKE ? OR u.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY e.id DESC`;
    const employees = queryAll(db, sql, params);
    return res.json({ employees });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch employees." });
  }
});
router7.post("/", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      full_name: raw_full_name,
      department,
      designation,
      joining_date,
      hire_date,
      salary,
      monthly_salary,
      phone,
      address,
      status,
      shift,
      role_id: raw_role_id,
      email: raw_email,
      password: custom_password
    } = req.body;
    const firstName = (first_name || raw_full_name?.split(" ")[0] || "Staff").trim();
    const lastName = (last_name || raw_full_name?.split(" ").slice(1).join(" ") || "Member").trim();
    const fullName = raw_full_name || `${firstName} ${lastName}`.trim();
    const dept = department || "Operations";
    const desig = designation || "Staff Member";
    const hireDate = joining_date || hire_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const pay = Number(monthly_salary || salary || 35e3);
    const empPhone = phone || "01700000000";
    const db = await getDb();
    const empCode = `EMP-${Math.floor(100 + Math.random() * 900)}`;
    let roleId = Number(raw_role_id);
    if (!roleId || isNaN(roleId)) {
      if (dept === "Management") roleId = 2;
      else if (dept === "Front Office" || dept === "Front Desk") roleId = 3;
      else if (dept === "Housekeeping") roleId = 4;
      else if (dept === "Maintenance" || dept === "Facility") roleId = 5;
      else roleId = 3;
    }
    const roleObj = queryOne(db, `SELECT role_name FROM Roles WHERE id = ?`, [roleId]);
    const roleName = roleObj ? roleObj.role_name : "Staff";
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, "");
    const defaultEmail = `${cleanFirstName}.${cleanLastName}${Math.floor(10 + Math.random() * 90)}@booknest.com`;
    const userEmail = raw_email && raw_email.includes("@") ? raw_email.trim().toLowerCase() : defaultEmail;
    const username = `${cleanFirstName}_${cleanLastName}_${Math.floor(100 + Math.random() * 900)}`;
    const plainPassword = custom_password && custom_password.trim().length >= 4 ? custom_password.trim() : `BN-${Math.floor(1e5 + Math.random() * 9e5)}`;
    const passwordHash = import_bcryptjs3.default.hashSync(plainPassword, 10);
    const userRun = executeRun(
      db,
      `INSERT INTO Users (username, email, password_hash, role_id, full_name, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [username, userEmail, passwordHash, roleId, fullName, empPhone]
    );
    const userId = userRun.lastInsertRowid;
    const empRun = executeRun(
      db,
      `INSERT INTO Employees (user_id, employee_code, full_name, first_name, last_name, department, designation, joining_date, salary, monthly_salary, phone, address, status, shift)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, empCode, fullName, firstName, lastName, dept, desig, hireDate, pay, pay, empPhone, address || "", status || "Active", shift || "Morning"]
    );
    const employee = queryOne(
      db,
      `SELECT e.*, u.email as user_email, u.username, r.role_name, r.id as role_id 
       FROM Employees e 
       LEFT JOIN Users u ON e.user_id = u.id 
       LEFT JOIN Roles r ON u.role_id = r.id 
       WHERE e.id = ?`,
      [empRun.lastInsertRowid]
    );
    executeRun(
      db,
      `INSERT INTO ActivityLogs (user_id, action, module, details, ip_address) VALUES (?, 'Register Employee', 'HR', ?, '127.0.0.1')`,
      [req.user?.id || 1, `Created employee ${fullName} (${empCode}) with assigned login ${userEmail}`]
    );
    return res.status(201).json({
      message: "Employee registered successfully with assigned login account.",
      employee,
      loginCredentials: {
        email: userEmail,
        username,
        password: plainPassword,
        role_name: roleName,
        full_name: fullName
      }
    });
  } catch (err) {
    console.error("Error creating employee:", err);
    return res.status(500).json({ error: "Failed to create employee and provision login account." });
  }
});
router7.put("/:id", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const empId = Number(req.params.id);
    const {
      first_name,
      last_name,
      full_name: raw_full_name,
      department,
      designation,
      monthly_salary,
      salary,
      phone,
      address,
      status,
      shift,
      role_id,
      user_email
    } = req.body;
    const db = await getDb();
    const emp = queryOne(db, `SELECT * FROM Employees WHERE id = ?`, [empId]);
    if (!emp) {
      return res.status(404).json({ error: "Employee not found." });
    }
    const firstName = (first_name !== void 0 ? first_name : emp.first_name || "Staff").trim();
    const lastName = (last_name !== void 0 ? last_name : emp.last_name || "Member").trim();
    const fullName = raw_full_name || `${firstName} ${lastName}`.trim();
    const dept = department || emp.department || "Operations";
    const desig = designation || emp.designation || "Staff Member";
    const pay = Number(monthly_salary || salary || emp.monthly_salary || emp.salary || 35e3);
    const empPhone = phone || emp.phone || "01700000000";
    const empShift = shift || emp.shift || "Morning";
    const empStatus = status || emp.status || "Active";
    const empAddr = address !== void 0 ? address : emp.address;
    executeRun(
      db,
      `UPDATE Employees
       SET first_name = ?,
           last_name = ?,
           full_name = ?,
           department = ?,
           designation = ?,
           monthly_salary = ?,
           salary = ?,
           phone = ?,
           address = ?,
           status = ?,
           shift = ?
       WHERE id = ?`,
      [firstName, lastName, fullName, dept, desig, pay, pay, empPhone, empAddr, empStatus, empShift, empId]
    );
    if (emp.user_id) {
      const roleId = Number(role_id) || void 0;
      const email = user_email?.trim() || void 0;
      if (roleId && email) {
        executeRun(
          db,
          `UPDATE Users SET full_name = ?, phone = ?, role_id = ?, email = ? WHERE id = ?`,
          [fullName, empPhone, roleId, email, emp.user_id]
        );
      } else if (roleId) {
        executeRun(
          db,
          `UPDATE Users SET full_name = ?, phone = ?, role_id = ? WHERE id = ?`,
          [fullName, empPhone, roleId, emp.user_id]
        );
      } else {
        executeRun(
          db,
          `UPDATE Users SET full_name = ?, phone = ? WHERE id = ?`,
          [fullName, empPhone, emp.user_id]
        );
      }
    }
    const updatedEmployee = queryOne(
      db,
      `SELECT e.*, u.email as user_email, u.username, r.role_name, r.id as role_id 
       FROM Employees e 
       LEFT JOIN Users u ON e.user_id = u.id 
       LEFT JOIN Roles r ON u.role_id = r.id 
       WHERE e.id = ?`,
      [empId]
    );
    return res.json({ message: "Employee updated successfully", employee: updatedEmployee });
  } catch (err) {
    console.error("Error updating employee:", err);
    return res.status(500).json({ error: "Failed to update employee details." });
  }
});
router7.delete("/:id", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const db = await getDb();
    const emp = queryOne(db, `SELECT * FROM Employees WHERE id = ?`, [id]);
    if (!emp) {
      return res.status(404).json({ error: "Employee not found." });
    }
    if (emp.user_id) {
      executeRun(db, `DELETE FROM Users WHERE id = ?`, [emp.user_id]);
    }
    executeRun(db, `UPDATE Housekeeping SET assigned_employee_id = NULL WHERE assigned_employee_id = ?`, [id]);
    executeRun(db, `UPDATE Maintenance SET assigned_employee_id = NULL WHERE assigned_employee_id = ?`, [id]);
    executeRun(db, `DELETE FROM Attendance WHERE employee_id = ?`, [id]);
    executeRun(db, `DELETE FROM Salaries WHERE employee_id = ?`, [id]);
    executeRun(db, `DELETE FROM Employees WHERE id = ?`, [id]);
    executeRun(
      db,
      `INSERT INTO ActivityLogs (user_id, action, module, details, ip_address) VALUES (?, 'Delete Employee', 'HR', ?, '127.0.0.1')`,
      [req.user?.id || 1, `Deleted employee ${emp.full_name || emp.employee_code} (ID: ${id})`]
    );
    return res.json({ message: "Employee and associated login credentials deleted successfully." });
  } catch (err) {
    console.error("Error deleting employee:", err);
    return res.status(500).json({ error: "Failed to delete employee." });
  }
});
router7.get("/attendance", authenticateToken, async (req, res) => {
  try {
    const { date, employee_id } = req.query;
    const db = await getDb();
    let sql = `
      SELECT a.*, e.full_name as employee_name, e.employee_code, e.department
      FROM Attendance a
      JOIN Employees e ON a.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (date) {
      sql += ` AND a.date = ?`;
      params.push(date);
    }
    if (employee_id) {
      sql += ` AND a.employee_id = ?`;
      params.push(Number(employee_id));
    }
    sql += ` ORDER BY a.date DESC, a.id DESC`;
    const attendance = queryAll(db, sql, params);
    return res.json({ attendance });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch attendance." });
  }
});
router7.post("/attendance", authenticateToken, async (req, res) => {
  try {
    const { employee_id, date, check_in_time, check_out_time, status, notes } = req.body;
    if (!employee_id || !date || !check_in_time) {
      return res.status(400).json({ error: "Employee ID, date, and check-in time are required." });
    }
    const db = await getDb();
    executeRun(
      db,
      `INSERT INTO Attendance (employee_id, date, check_in_time, check_out_time, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [Number(employee_id), date, check_in_time, check_out_time || null, status || "Present", notes || ""]
    );
    return res.status(201).json({ message: "Attendance recorded successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to record attendance." });
  }
});
router7.get("/salaries", authenticateToken, authorizeRoles("Owner", "Manager"), async (req, res) => {
  try {
    const { month_year } = req.query;
    const db = await getDb();
    let sql = `
      SELECT s.*, e.full_name as employee_name, e.employee_code, e.department, e.designation
      FROM Salaries s
      JOIN Employees e ON s.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (month_year) {
      sql += ` AND s.month_year = ?`;
      params.push(month_year);
    }
    sql += ` ORDER BY s.id DESC`;
    const salaries = queryAll(db, sql, params);
    return res.json({ salaries });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch salary records." });
  }
});
router7.post("/salaries", authenticateToken, authorizeRoles("Owner", "Manager"), async (req, res) => {
  try {
    const { employee_id, month_year, base_salary, bonus, deductions, payment_status } = req.body;
    if (!employee_id || !month_year || !base_salary) {
      return res.status(400).json({ error: "Employee ID, month/year, and base salary are required." });
    }
    const net = Number(base_salary) + (Number(bonus) || 0) - (Number(deductions) || 0);
    const db = await getDb();
    executeRun(
      db,
      `INSERT INTO Salaries (employee_id, month_year, base_salary, bonus, deductions, net_salary, payment_status, payment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)`,
      [Number(employee_id), month_year, Number(base_salary), Number(bonus || 0), Number(deductions || 0), net, payment_status || "Paid"]
    );
    return res.status(201).json({ message: "Salary recorded successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to process salary." });
  }
});
var employees_default = router7;

// src/routes/housekeeping.ts
var import_express8 = require("express");
var router8 = (0, import_express8.Router)();
router8.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, date } = req.query;
    const db = await getDb();
    let sql = `
      SELECT h.*, r.room_number, e.full_name as housekeeper_name, e.full_name as employee_name
      FROM Housekeeping h
      JOIN Rooms r ON h.room_id = r.id
      LEFT JOIN Employees e ON h.assigned_employee_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      sql += ` AND h.status = ?`;
      params.push(status);
    }
    if (date) {
      sql += ` AND h.scheduled_date = ?`;
      params.push(date);
    }
    sql += ` ORDER BY h.id DESC`;
    const schedules = queryAll(db, sql, params);
    return res.json({ schedules });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch housekeeping schedules." });
  }
});
router8.post("/", authenticateToken, authorizeRoles("Owner", "Manager", "Housekeeping Staff"), async (req, res) => {
  try {
    const { room_id, assigned_employee_id, housekeeper_id, scheduled_date, notes } = req.body;
    const employeeId = assigned_employee_id || housekeeper_id;
    if (!room_id || !employeeId || !scheduled_date) {
      return res.status(400).json({ error: "Room, assigned employee, and scheduled date are required." });
    }
    const db = await getDb();
    const resRun = executeRun(
      db,
      `INSERT INTO Housekeeping (room_id, assigned_employee_id, scheduled_date, status, notes)
       VALUES (?, ?, ?, 'Pending', ?)`,
      [Number(room_id), Number(employeeId), scheduled_date, notes || ""]
    );
    executeRun(db, `UPDATE Rooms SET status = 'Cleaning', is_clean = 0 WHERE id = ?`, [Number(room_id)]);
    return res.status(201).json({ message: "Housekeeping task assigned successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to assign housekeeping task." });
  }
});
router8.put("/:id/status", authenticateToken, authorizeRoles("Owner", "Manager", "Housekeeping Staff"), async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const { status, notes } = req.body;
    const db = await getDb();
    const task = queryOne(db, `SELECT room_id FROM Housekeeping WHERE id = ?`, [taskId]);
    if (!task) return res.status(404).json({ error: "Housekeeping task not found." });
    const completedAt = status === "Completed" ? (/* @__PURE__ */ new Date()).toISOString() : null;
    executeRun(
      db,
      `UPDATE Housekeeping SET status = ?, notes = COALESCE(?, notes), completed_at = ? WHERE id = ?`,
      [status, notes, completedAt, taskId]
    );
    if (status === "Completed") {
      executeRun(db, `UPDATE Rooms SET is_clean = 1, status = 'Available', updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [task.room_id]);
    }
    return res.json({ message: "Cleaning status updated." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update cleaning status." });
  }
});
var housekeeping_default = router8;

// src/routes/maintenance.ts
var import_express9 = require("express");
var router9 = (0, import_express9.Router)();
router9.get("/", authenticateToken, async (req, res) => {
  try {
    const { status, priority } = req.query;
    const db = await getDb();
    let sql = `
      SELECT m.*, m.repair_cost as cost, r.room_number, u.full_name as reported_by_name, e.full_name as assigned_employee_name, e.full_name as employee_name
      FROM Maintenance m
      JOIN Rooms r ON m.room_id = r.id
      JOIN Users u ON m.reported_by_user_id = u.id
      LEFT JOIN Employees e ON m.assigned_employee_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      sql += ` AND m.status = ?`;
      params.push(status);
    }
    if (priority) {
      sql += ` AND m.priority = ?`;
      params.push(priority);
    }
    sql += ` ORDER BY m.id DESC`;
    const tickets = queryAll(db, sql, params);
    return res.json({ tickets });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch maintenance tickets." });
  }
});
router9.post("/", authenticateToken, async (req, res) => {
  try {
    const { room_id, issue_description, priority } = req.body;
    if (!room_id || !issue_description) {
      return res.status(400).json({ error: "Room and issue description are required." });
    }
    const db = await getDb();
    const userId = req.user ? req.user.id : 1;
    executeRun(
      db,
      `INSERT INTO Maintenance (room_id, reported_by_user_id, issue_description, priority, status)
       VALUES (?, ?, ?, ?, 'Open')`,
      [Number(room_id), userId, issue_description, priority || "Medium"]
    );
    executeRun(db, `UPDATE Rooms SET status = 'Maintenance' WHERE id = ?`, [Number(room_id)]);
    return res.status(201).json({ message: "Maintenance issue reported successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to report maintenance issue." });
  }
});
router9.put("/:id", authenticateToken, authorizeRoles("Owner", "Manager", "Maintenance Staff"), async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    const { assigned_employee_id, assigned_to, status, repair_cost, cost } = req.body;
    const empId = assigned_employee_id || assigned_to;
    const rCost = repair_cost !== void 0 ? repair_cost : cost;
    const db = await getDb();
    const ticket = queryOne(db, `SELECT * FROM Maintenance WHERE id = ?`, [ticketId]);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });
    if (status === "Completed" && !empId && !ticket.assigned_employee_id) {
      return res.status(400).json({ error: "BUSINESS RULE VIOLATION: Maintenance ticket must be assigned to an employee before completing." });
    }
    const resolvedAt = status === "Completed" ? (/* @__PURE__ */ new Date()).toISOString() : null;
    executeRun(
      db,
      `UPDATE Maintenance
       SET assigned_employee_id = COALESCE(?, assigned_employee_id),
           status = COALESCE(?, status),
           repair_cost = COALESCE(?, repair_cost),
           resolved_at = COALESCE(?, resolved_at)
       WHERE id = ?`,
      [empId || null, status, rCost !== void 0 ? Number(rCost) : void 0, resolvedAt, ticketId]
    );
    if (status === "Completed") {
      executeRun(db, `UPDATE Rooms SET status = 'Cleaning', is_clean = 0 WHERE id = ? AND status = 'Maintenance'`, [ticket.room_id]);
    }
    return res.json({ message: "Maintenance ticket updated successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update maintenance ticket." });
  }
});
var maintenance_default = router9;

// src/routes/inventory.ts
var import_express10 = require("express");
var router10 = (0, import_express10.Router)();
router10.get("/", authenticateToken, async (req, res) => {
  try {
    const { category, low_stock } = req.query;
    const db = await getDb();
    let sql = `SELECT * FROM Inventory WHERE 1=1`;
    const params = [];
    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }
    if (low_stock === "true") {
      sql += ` AND quantity <= min_stock_alert`;
    }
    sql += ` ORDER BY id DESC`;
    const inventory = queryAll(db, sql, params);
    return res.json({ inventory });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch inventory." });
  }
});
router10.post("/", authenticateToken, authorizeRoles("Owner", "Manager"), async (req, res) => {
  try {
    const { item_name, category, quantity, unit, min_stock_alert } = req.body;
    if (!item_name || !category || quantity === void 0) {
      return res.status(400).json({ error: "Item name, category, and quantity are required." });
    }
    if (Number(quantity) < 0) {
      return res.status(400).json({ error: "BUSINESS RULE VIOLATION: Inventory quantity cannot be negative." });
    }
    const db = await getDb();
    const resRun = executeRun(
      db,
      `INSERT INTO Inventory (item_name, category, quantity, unit, min_stock_alert)
       VALUES (?, ?, ?, ?, ?)`,
      [item_name, category, Number(quantity), unit || "Pcs", Number(min_stock_alert || 10)]
    );
    const item = queryOne(db, `SELECT * FROM Inventory WHERE id = ?`, [resRun.lastInsertRowid]);
    return res.status(201).json({ message: "Inventory item added.", item });
  } catch (err) {
    return res.status(500).json({ error: "Failed to add inventory item." });
  }
});
router10.put("/:id", authenticateToken, authorizeRoles("Owner", "Manager", "Housekeeping Staff", "Maintenance Staff"), async (req, res) => {
  try {
    const itemId = Number(req.params.id);
    const { quantity, min_stock_alert, restock_add } = req.body;
    const db = await getDb();
    const item = queryOne(db, `SELECT * FROM Inventory WHERE id = ?`, [itemId]);
    if (!item) return res.status(404).json({ error: "Inventory item not found." });
    let newQty = item.quantity;
    if (restock_add !== void 0) {
      newQty += Number(restock_add);
    } else if (quantity !== void 0) {
      newQty = Number(quantity);
    }
    if (newQty < 0) {
      return res.status(400).json({ error: "BUSINESS RULE VIOLATION: Inventory quantity cannot become negative." });
    }
    executeRun(
      db,
      `UPDATE Inventory 
       SET quantity = ?, min_stock_alert = COALESCE(?, min_stock_alert), last_restocked = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newQty, min_stock_alert, itemId]
    );
    if (newQty <= (min_stock_alert || item.min_stock_alert)) {
      executeRun(
        db,
        `INSERT INTO Notifications (role_target, title, message) VALUES ('Manager', 'Low Stock Alert', ?)`,
        [`Stock for item '${item.item_name}' (${newQty} ${item.unit}) has dropped below alert threshold.`]
      );
    }
    return res.json({ message: "Inventory updated successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update inventory." });
  }
});
var inventory_default = router10;

// src/routes/services.ts
var import_express11 = require("express");
var router11 = (0, import_express11.Router)();
router11.get("/", authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const services = queryAll(db, `SELECT * FROM Services WHERE is_active = 1 ORDER BY category ASC, name ASC`);
    return res.json({ services });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch services." });
  }
});
router11.get("/requests", authenticateToken, async (req, res) => {
  try {
    const { booking_id, status } = req.query;
    const db = await getDb();
    let sql = `
      SELECT sr.*, s.name as service_name, s.category, b.booking_code, r.room_number, g.first_name || ' ' || g.last_name as guest_name
      FROM ServiceRequests sr
      JOIN Services s ON sr.service_id = s.id
      JOIN Bookings b ON sr.booking_id = b.id
      JOIN Rooms r ON b.room_id = r.id
      JOIN Guests g ON b.guest_id = g.id
      WHERE 1=1
    `;
    const params = [];
    if (booking_id) {
      sql += ` AND sr.booking_id = ?`;
      params.push(Number(booking_id));
    }
    if (status) {
      sql += ` AND sr.status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY sr.id DESC`;
    const requests = queryAll(db, sql, params);
    return res.json({ requests });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch service requests." });
  }
});
router11.post("/requests", authenticateToken, authorizeRoles("Owner", "Manager", "Receptionist"), async (req, res) => {
  try {
    const { booking_id, service_id, quantity, notes } = req.body;
    if (!booking_id || !service_id) {
      return res.status(400).json({ error: "Booking ID and service ID are required." });
    }
    const db = await getDb();
    const service = queryOne(db, `SELECT * FROM Services WHERE id = ?`, [Number(service_id)]);
    if (!service) return res.status(404).json({ error: "Selected service not found." });
    const qty = Number(quantity || 1);
    const totalPrice = service.price * qty;
    const resRun = executeRun(
      db,
      `INSERT INTO ServiceRequests (booking_id, service_id, quantity, unit_price, total_price, status, notes)
       VALUES (?, ?, ?, ?, ?, 'Pending', ?)`,
      [Number(booking_id), Number(service_id), qty, service.price, totalPrice, notes || ""]
    );
    return res.status(201).json({ message: "Service request submitted successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create service request." });
  }
});
router11.put("/requests/:id", authenticateToken, async (req, res) => {
  try {
    const requestId = Number(req.params.id);
    const { status } = req.body;
    const db = await getDb();
    const completedAt = status === "Completed" ? (/* @__PURE__ */ new Date()).toISOString() : null;
    executeRun(
      db,
      `UPDATE ServiceRequests SET status = ?, completed_at = COALESCE(?, completed_at) WHERE id = ?`,
      [status, completedAt, requestId]
    );
    return res.json({ message: "Service request status updated." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update service request." });
  }
});
var services_default = router11;

// src/routes/reports.ts
var import_express12 = require("express");
var router12 = (0, import_express12.Router)();
router12.get("/analytics", authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const totalRooms = queryOne(db, `SELECT COUNT(*) as count FROM Rooms`)?.count || 0;
    const occupiedRooms = queryOne(db, `SELECT COUNT(*) as count FROM Rooms WHERE status = 'Occupied'`)?.count || 0;
    const availableRooms = queryOne(db, `SELECT COUNT(*) as count FROM Rooms WHERE status = 'Available'`)?.count || 0;
    const reservedRooms = queryOne(db, `SELECT COUNT(*) as count FROM Rooms WHERE status = 'Reserved'`)?.count || 0;
    const cleaningRooms = queryOne(db, `SELECT COUNT(*) as count FROM Rooms WHERE status = 'Cleaning'`)?.count || 0;
    const maintenanceRooms = queryOne(db, `SELECT COUNT(*) as count FROM Rooms WHERE status = 'Maintenance'`)?.count || 0;
    const occupancyRate = totalRooms > 0 ? Math.round(occupiedRooms / totalRooms * 100) : 0;
    const totalRevenue = queryOne(db, `SELECT SUM(amount) as sum FROM Payments WHERE is_refund = 0`)?.sum || 0;
    const monthlyBookingsCount = queryOne(db, `SELECT COUNT(*) as count FROM Bookings WHERE check_in_date >= date('now', '-30 days')`)?.count || 0;
    const employeeCount = queryOne(db, `SELECT COUNT(*) as count FROM Employees WHERE status = 'Active'`)?.count || 0;
    const pendingMaintenanceCount = queryOne(db, `SELECT COUNT(*) as count FROM Maintenance WHERE status IN ('Open', 'Assigned', 'In Progress')`)?.count || 0;
    const lowStockAlertsCount = queryOne(db, `SELECT COUNT(*) as count FROM Inventory WHERE quantity <= min_stock_alert`)?.count || 0;
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
    const revenueByMonth = totalRevenue > 0 ? [
      { month: "Feb", revenue: 0, bookings: 0 },
      { month: "Mar", revenue: 0, bookings: 0 },
      { month: "Apr", revenue: 0, bookings: 0 },
      { month: "May", revenue: 0, bookings: 0 },
      { month: "Jun", revenue: 0, bookings: 0 },
      { month: "Jul", revenue: totalRevenue, bookings: monthlyBookingsCount }
    ] : [
      { month: "Feb", revenue: 0, bookings: 0 },
      { month: "Mar", revenue: 0, bookings: 0 },
      { month: "Apr", revenue: 0, bookings: 0 },
      { month: "May", revenue: 0, bookings: 0 },
      { month: "Jun", revenue: 0, bookings: 0 },
      { month: "Jul", revenue: 0, bookings: 0 }
    ];
    const roomStatusBreakdown = [
      { name: "Occupied", value: occupiedRooms, color: "#10B981" },
      { name: "Available", value: availableRooms, color: "#3B82F6" },
      { name: "Reserved", value: reservedRooms, color: "#F59E0B" },
      { name: "Cleaning", value: cleaningRooms, color: "#8B5CF6" },
      { name: "Maintenance", value: maintenanceRooms, color: "#EF4444" }
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
    console.error("Analytics error:", err);
    return res.status(500).json({ error: "Failed to generate analytics report." });
  }
});
var reports_default = router12;

// src/routes/system.ts
var import_express13 = require("express");
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var router13 = (0, import_express13.Router)();
router13.get("/logs", authenticateToken, authorizeRoles("Owner"), async (req, res) => {
  try {
    const db = await getDb();
    const logs = queryAll(
      db,
      `SELECT a.*, u.username, r.role_name
       FROM ActivityLogs a
       JOIN Users u ON a.user_id = u.id
       JOIN Roles r ON u.role_id = r.id
       ORDER BY a.id DESC LIMIT 100`
    );
    return res.json({ logs });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch activity logs." });
  }
});
router13.get("/notifications", authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const notifications = queryAll(
      db,
      `SELECT * FROM Notifications 
       WHERE (role_target IS NULL OR role_target = ?) 
       ORDER BY id DESC LIMIT 20`,
      [req.user ? req.user.role_name : "Owner"]
    );
    return res.json({ notifications });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch notifications." });
  }
});
router13.put("/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const db = await getDb();
    executeRun(db, `UPDATE Notifications SET is_read = 1 WHERE id = ?`, [id]);
    return res.json({ message: "Marked as read." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update notification." });
  }
});
router13.get("/settings", authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const settings = queryAll(db, `SELECT * FROM SystemSettings ORDER BY category ASC`);
    return res.json({ settings });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch system settings." });
  }
});
router13.put("/settings", authenticateToken, authorizeRoles("Owner"), async (req, res) => {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings)) {
      return res.status(400).json({ error: "Settings array is required." });
    }
    const db = await getDb();
    for (const item of settings) {
      executeRun(
        db,
        `UPDATE SystemSettings SET setting_value = ?, updated_at = CURRENT_TIMESTAMP WHERE setting_key = ?`,
        [item.setting_value, item.setting_key]
      );
    }
    return res.json({ message: "System settings updated successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update settings." });
  }
});
router13.get("/sql-script", async (req, res) => {
  try {
    const sqlPath = import_path2.default.join(process.cwd(), "src", "db", "schema.sql");
    if (import_fs2.default.existsSync(sqlPath)) {
      const sqlContent = import_fs2.default.readFileSync(sqlPath, "utf-8");
      return res.type("text/plain").send(sqlContent);
    }
    return res.status(404).send("-- MySQL Schema file not found.");
  } catch (err) {
    return res.status(500).send("-- Error loading SQL script.");
  }
});
var system_default = router13;

// server.ts
async function startServer() {
  const app = (0, import_express14.default)();
  const PORT = 3e3;
  await getDb();
  app.use((0, import_cors.default)());
  app.use(import_express14.default.json());
  app.use("/api/auth", auth_default);
  app.use("/api/rooms", rooms_default);
  app.use("/api/guests", guests_default);
  app.use("/api/bookings", bookings_default);
  app.use("/api", checkin_default);
  app.use("/api/payments", payments_default);
  app.use("/api/employees", employees_default);
  app.use("/api/housekeeping", housekeeping_default);
  app.use("/api/maintenance", maintenance_default);
  app.use("/api/inventory", inventory_default);
  app.use("/api/services", services_default);
  app.use("/api/reports", reports_default);
  app.use("/api/system", system_default);
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", system: "BookNest HMS", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: {
        middlewareMode: true,
        // Check-in and check-out persist records to this JSON database.  It is
        // runtime data, not client source, so watching it would force a full
        // browser reload and discard the generated invoice modal.
        watch: {
          ignored: ["**/data/booknest.json"]
        }
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path3.default.join(process.cwd(), "dist");
    app.use(import_express14.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path3.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BookNest HMS] Server running smoothly on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("[BookNest HMS] Server startup failed:", err);
});
//# sourceMappingURL=server.cjs.map
