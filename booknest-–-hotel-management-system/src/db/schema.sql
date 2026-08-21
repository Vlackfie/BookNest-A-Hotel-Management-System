-- ============================================================================
-- BookNest Hotel Management System - Enterprise MySQL Relational Schema
-- Standard: 1NF, 2NF, 3NF Compliant
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS booknest_hms;
USE booknest_hms;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    permissions_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role_id)
) ENGINE=InnoDB;

-- 3. Employees Table
CREATE TABLE IF NOT EXISTS Employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL UNIQUE,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(50) NOT NULL,
    designation VARCHAR(50) NOT NULL,
    joining_date DATE NOT NULL,
    salary DECIMAL(10,2) NOT NULL CHECK (salary >= 0),
    phone VARCHAR(30) NOT NULL,
    address TEXT,
    status ENUM('Active', 'On Leave', 'Terminated') DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_employees_code (employee_code)
) ENGINE=InnoDB;

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS Attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    check_in_time TIME NOT NULL,
    check_out_time TIME NULL,
    status ENUM('Present', 'Absent', 'Late', 'Half Day') DEFAULT 'Present',
    notes VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_emp_date (employee_id, date)
) ENGINE=InnoDB;

-- 5. Guests Table
CREATE TABLE IF NOT EXISTS Guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    nid_passport VARCHAR(50) NOT NULL UNIQUE,
    emergency_contact VARCHAR(100),
    address TEXT,
    vip_status BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_guests_email (email),
    INDEX idx_guests_phone (phone)
) ENGINE=InnoDB;

-- 6. RoomTypes Table
CREATE TABLE IF NOT EXISTS RoomTypes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    capacity INT NOT NULL CHECK (capacity > 0),
    amenities TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 7. Rooms Table
CREATE TABLE IF NOT EXISTS Rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    room_type_id INT NOT NULL,
    floor INT NOT NULL DEFAULT 1,
    status ENUM('Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance') DEFAULT 'Available',
    price_per_night DECIMAL(10,2) NOT NULL CHECK (price_per_night >= 0),
    is_clean BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_type_id) REFERENCES RoomTypes(id) ON DELETE RESTRICT,
    INDEX idx_rooms_status (status),
    INDEX idx_rooms_number (room_number)
) ENGINE=InnoDB;

-- 8. Bookings Table
CREATE TABLE IF NOT EXISTS Bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(30) NOT NULL UNIQUE,
    guest_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    num_guests INT DEFAULT 1 CHECK (num_guests > 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    status ENUM('Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled') DEFAULT 'Confirmed',
    booked_by_user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES Guests(id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (booked_by_user_id) REFERENCES Users(id) ON DELETE RESTRICT,
    CHECK (check_out_date > check_in_date),
    INDEX idx_bookings_dates (check_in_date, check_out_date),
    INDEX idx_bookings_status (status)
) ENGINE=InnoDB;

-- 9. CheckIns Table
CREATE TABLE IF NOT EXISTS CheckIns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    checked_in_by_user_id INT NOT NULL,
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    key_card_number VARCHAR(50),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (checked_in_by_user_id) REFERENCES Users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 10. CheckOuts Table
CREATE TABLE IF NOT EXISTS CheckOuts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    check_out_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    checked_out_by_user_id INT NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    additional_charges DECIMAL(10,2) DEFAULT 0,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (checked_out_by_user_id) REFERENCES Users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 11. Payments Table
CREATE TABLE IF NOT EXISTS Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    payment_method ENUM('Cash', 'Card', 'Mobile Banking', 'Online Payment') NOT NULL,
    payment_status ENUM('Paid', 'Pending', 'Refunded', 'Partial') DEFAULT 'Paid',
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    is_refund BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_by_user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES Users(id) ON DELETE RESTRICT,
    INDEX idx_payments_booking (booking_id)
) ENGINE=InnoDB;

-- 12. Services Table
CREATE TABLE IF NOT EXISTS Services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('Room Service', 'Laundry', 'Wake-Up Calls', 'Food & Beverage', 'Airport Pickup') NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 13. ServiceRequests Table
CREATE TABLE IF NOT EXISTS ServiceRequests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 14. Housekeeping Table
CREATE TABLE IF NOT EXISTS Housekeeping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    assigned_employee_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    notes TEXT,
    completed_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_employee_id) REFERENCES Employees(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 15. Maintenance Table
CREATE TABLE IF NOT EXISTS Maintenance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    reported_by_user_id INT NOT NULL,
    assigned_employee_id INT NULL,
    issue_description TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    repair_cost DECIMAL(10,2) DEFAULT 0 CHECK (repair_cost >= 0),
    status ENUM('Open', 'Assigned', 'In Progress', 'Completed') DEFAULT 'Open',
    reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by_user_id) REFERENCES Users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_employee_id) REFERENCES Employees(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 16. Inventory Table
CREATE TABLE IF NOT EXISTS Inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL UNIQUE,
    category ENUM('Room Supplies', 'Restaurant Inventory', 'Linen Inventory', 'General') NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    unit VARCHAR(20) DEFAULT 'Pcs',
    min_stock_alert INT DEFAULT 10 CHECK (min_stock_alert >= 0),
    last_restocked DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 17. Salaries Table
CREATE TABLE IF NOT EXISTS Salaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    month_year VARCHAR(7) NOT NULL, -- YYYY-MM
    base_salary DECIMAL(10,2) NOT NULL,
    bonus DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) NOT NULL,
    payment_status ENUM('Paid', 'Pending') DEFAULT 'Pending',
    payment_date DATE NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_emp_month (employee_id, month_year)
) ENGINE=InnoDB;

-- 18. Feedback Table
CREATE TABLE IF NOT EXISTS Feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    booking_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES Guests(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 19. Reports Table
CREATE TABLE IF NOT EXISTS Reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_type VARCHAR(100) NOT NULL,
    generated_by_user_id INT NOT NULL,
    summary_json TEXT,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by_user_id) REFERENCES Users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 20. ActivityLogs Table
CREATE TABLE IF NOT EXISTS ActivityLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 21. Notifications Table
CREATE TABLE IF NOT EXISTS Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    role_target VARCHAR(50) NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 22. SystemSettings Table
CREATE TABLE IF NOT EXISTS SystemSettings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    description VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Triggers Example: Automatic Room Status Update on Check-In
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_after_checkin_update_room
AFTER INSERT ON CheckIns
FOR EACH ROW
BEGIN
    UPDATE Rooms 
    SET status = 'Occupied' 
    WHERE id = (SELECT room_id FROM Bookings WHERE id = NEW.booking_id);
END;
//
DELIMITER ;

-- Triggers Example: Automatic Room Status Update on Check-Out
DELIMITER //
CREATE TRIGGER IF NOT EXISTS trg_after_checkout_update_room
AFTER INSERT ON CheckOuts
FOR EACH ROW
BEGIN
    UPDATE Rooms 
    SET status = 'Cleaning', is_clean = FALSE 
    WHERE id = (SELECT room_id FROM Bookings WHERE id = NEW.booking_id);
    
    UPDATE Bookings
    SET status = 'Checked-Out'
    WHERE id = NEW.booking_id;
END;
//
DELIMITER ;



