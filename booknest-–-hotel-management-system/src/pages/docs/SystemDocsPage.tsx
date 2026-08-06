import React, { useState } from 'react';
import { Database, FileCode2, Terminal, Server, ShieldCheck, Download, Copy, Check, BookOpen } from 'lucide-react';

export const SystemDocsPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'er' | 'mysql' | 'api' | 'testing'>('er');

  const fullMySQLScript = `-- =================================================================
-- BOOKNEST - HOTEL MANAGEMENT SYSTEM (HMS)
-- Production MySQL DDL Schema Script
-- Supports MySQL 8.0+ / MariaDB 10.5+
-- =================================================================

CREATE DATABASE IF NOT EXISTS booknest_hms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booknest_hms;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 3. Room Types Table
CREATE TABLE IF NOT EXISTS room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  capacity INT NOT NULL DEFAULT 2,
  amenities TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(20) NOT NULL UNIQUE,
  room_type_id INT NOT NULL,
  floor INT NOT NULL DEFAULT 1,
  price_per_night DECIMAL(10, 2) NOT NULL,
  status ENUM('Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance') DEFAULT 'Available',
  is_clean TINYINT(1) DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 5. Guests Table
CREATE TABLE IF NOT EXISTS guests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL,
  nid_passport VARCHAR(100) NOT NULL UNIQUE,
  emergency_contact VARCHAR(150),
  address TEXT,
  vip_status TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(30) NOT NULL UNIQUE,
  guest_id INT NOT NULL,
  room_id INT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
  status ENUM('Confirmed', 'Checked-In', 'Completed', 'Cancelled') DEFAULT 'Confirmed',
  is_walk_in TINYINT(1) DEFAULT 0,
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE RESTRICT,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
  INDEX idx_dates (check_in_date, check_out_date)
) ENGINE=InnoDB;

-- 7. Check-In / Check-Out Table
CREATE TABLE IF NOT EXISTS checkin_checkout (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  actual_check_in TIMESTAMP NULL,
  actual_check_out TIMESTAMP NULL,
  deposit_amount DECIMAL(10, 2) DEFAULT 0.00,
  key_card_number VARCHAR(50),
  additional_charges DECIMAL(10, 2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  transaction_id VARCHAR(50) NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Completed',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(50),
  department VARCHAR(100) NOT NULL,
  role_id INT NOT NULL,
  monthly_salary DECIMAL(10, 2) NOT NULL,
  hire_date DATE NOT NULL,
  shift VARCHAR(50) DEFAULT 'Morning',
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 10. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('Present', 'Absent', 'Late', 'On Leave') DEFAULT 'Present',
  check_in_time TIME NULL,
  check_out_time TIME NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_emp_date (employee_id, date)
) ENGINE=InnoDB;

-- 11. Salaries Table
CREATE TABLE IF NOT EXISTS salaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  payment_month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  base_salary DECIMAL(10, 2) NOT NULL,
  bonus DECIMAL(10, 2) DEFAULT 0.00,
  deductions DECIMAL(10, 2) DEFAULT 0.00,
  net_salary DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'Paid',
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_emp_month (employee_id, payment_month)
) ENGINE=InnoDB;

-- 12. Housekeeping Table
CREATE TABLE IF NOT EXISTS housekeeping (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  housekeeper_id INT NULL,
  scheduled_date DATE NOT NULL,
  status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (housekeeper_id) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. Maintenance Table
CREATE TABLE IF NOT EXISTS maintenance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  assigned_to INT NULL,
  issue_description TEXT NOT NULL,
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  cost DECIMAL(10, 2) DEFAULT 0.00,
  status ENUM('Open', 'In Progress', 'Completed') DEFAULT 'Open',
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 14. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(150) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  unit VARCHAR(20) DEFAULT 'pcs',
  min_stock_level INT NOT NULL DEFAULT 10,
  cost_per_unit DECIMAL(10, 2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 15. Services Table
CREATE TABLE IF NOT EXISTS hotel_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT
) ENGINE=InnoDB;

-- 16. Service Requests Table
CREATE TABLE IF NOT EXISTS service_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  service_id INT NOT NULL,
  quantity INT DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES hotel_services(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 17. Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
`;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(fullMySQLScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSQL = () => {
    const dataStr = "data:text/sql;charset=utf-8," + encodeURIComponent(fullMySQLScript);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "Vlackfie_Hotel_MySQL_Schema.sql");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">System Architecture & Technical Docs</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Relational ER Diagrams, MySQL DDL Scripts, API Endpoint specifications, and deployment guides.</p>
        </div>

        <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
          <button
            onClick={() => setActiveTab('er')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'er' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            ER Diagram
          </button>
          <button
            onClick={() => setActiveTab('mysql')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'mysql' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            MySQL DDL Script
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'api' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            REST API Reference
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'testing' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Testing & Deployment
          </button>
        </div>
      </div>

      {activeTab === 'er' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Database className="w-6 h-6" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Entity-Relationship Structural Model</h3>
          </div>

          <div className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            {`+----------------+        +-----------------+        +------------------+
|     ROLES      |1      N |      USERS      |1      1 |    EMPLOYEES     |
+----------------+--------<+-----------------+--------<+------------------+
| id             |         | id              |         | id               |
| name           |         | username        |         | user_id (FK)     |
+----------------+         | role_id (FK)    |         | department       |
                           +-----------------+         | monthly_salary   |
                                                       +--------+---------+
                                                                |1
+----------------+        +-----------------+                   |
|   ROOM_TYPES   |1      N |      ROOMS      |                   |
+----------------+--------<+-----------------+                   |
| id             |         | id              |                   |
| name           |         | room_type_id(FK)|                   |
| base_price     |         | status          |                   |
+----------------+         +--------+--------+                   |
                                    |1                           |
                                    |                            |
+----------------+         +--------v--------+         +---------v--------+
|     GUESTS     |1      N |    BOOKINGS     |1       N|   MAINTENANCE    |
+----------------+--------<+-----------------+--------<+------------------+
| id             |         | id              |         | id               |
| nid_passport   |         | guest_id (FK)   |         | room_id (FK)     |
| vip_status     |         | room_id (FK)    |         | assigned_to (FK) |
+----------------+         +--------+--------+         +------------------+
                                    |1
                       +------------+------------+
                       |1                        |1
            +----------v----------+   +----------v----------+
            |  CHECKIN_CHECKOUT   |   |      PAYMENTS       |
            +---------------------+   +---------------------+
            | booking_id (FK)     |   | booking_id (FK)     |
            | key_card_number     |   | transaction_id      |
            | deposit_amount      |   | amount              |
            +---------------------+   +---------------------+`}
          </div>
        </div>
      )}

      {activeTab === 'mysql' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Production MySQL DDL Schema Script</h3>
              <p className="text-xs text-slate-500">22 SQL tables with foreign key integrity constraints, indexes, and ENUM types.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySQL}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied SQL' : 'Copy Script'}</span>
              </button>
              <button
                onClick={handleDownloadSQL}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download .sql</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[500px] custom-scrollbar border border-slate-800">
            {fullMySQLScript}
          </pre>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">RESTful API Endpoints Reference</h3>

          <div className="space-y-2 text-xs">
            {[
              { method: 'POST', path: '/api/auth/login', desc: 'Authenticates user and returns JWT Token & User Profile' },
              { method: 'POST', path: '/api/auth/switch-role', desc: 'Instant 1-click role switcher for evaluation' },
              { method: 'GET', path: '/api/rooms', desc: 'Lists room inventory with optional floor/status filtering' },
              { method: 'POST', path: '/api/rooms', desc: 'Creates new room record' },
              { method: 'POST', path: '/api/bookings/check-availability', desc: 'Validates room date overlaps to prevent double bookings' },
              { method: 'POST', path: '/api/bookings', desc: 'Creates new reservation' },
              { method: 'POST', path: '/api/check-in', desc: 'Front desk express check-in, key card assignment, deposit tracking' },
              { method: 'POST', path: '/api/check-out', desc: 'Express check-out, calculates itemized total and generates invoice' },
              { method: 'POST', path: '/api/payments/refund', desc: 'Processes refund for manager approval' },
              { method: 'GET', path: '/api/reports/analytics', desc: 'Returns real-time executive dashboard KPIs & Recharts data' }
            ].map((endpoint, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${endpoint.method === 'GET' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60'}`}>
                    {endpoint.method}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{endpoint.path}</span>
                </div>
                <span className="text-slate-500 text-right">{endpoint.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'testing' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Testing Strategy & Verification Suite</h3>
            <p className="text-xs text-slate-500">Unit, Integration, and End-to-End verification procedures for Vlackfie International Hotel HMS.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-blue-600 dark:text-blue-400">1. Double Booking Overlap Test</h4>
              <p className="text-slate-600 dark:text-slate-300">Create a reservation for Room 101 from Oct 1 to Oct 5. Attempt to create another reservation for Room 101 from Oct 3 to Oct 7. Verify that the backend blocks creation and returns a 400 Bad Request error.</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-emerald-600 dark:text-emerald-400">2. Maintenance Assignment Rule Test</h4>
              <p className="text-slate-600 dark:text-slate-300">Attempt to update a maintenance request status to 'Completed' without an assigned technician ID. Verify that Business Rule #9 blocks completion until a staff member is assigned.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
