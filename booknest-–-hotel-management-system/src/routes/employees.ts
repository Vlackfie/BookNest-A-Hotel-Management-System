import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb, queryAll, queryOne, executeRun } from '../db/database';
import { authenticateToken, authorizeRoles, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/employees - List Employees
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
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
    const params: any[] = [];

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
    return res.status(500).json({ error: 'Failed to fetch employees.' });
  }
});

// POST /api/employees - Register Employee & Auto-Create User Account
router.post('/', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
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

    const firstName = (first_name || raw_full_name?.split(' ')[0] || 'Staff').trim();
    const lastName = (last_name || raw_full_name?.split(' ').slice(1).join(' ') || 'Member').trim();
    const fullName = raw_full_name || `${firstName} ${lastName}`.trim();
    const dept = department || 'Operations';
    const desig = designation || 'Staff Member';
    const hireDate = joining_date || hire_date || new Date().toISOString().split('T')[0];
    const pay = Number(monthly_salary || salary || 35000);
    const empPhone = phone || '01700000000';

    const db = await getDb();
    const empCode = `EMP-${Math.floor(100 + Math.random() * 900)}`;

    // Determine Role ID
    let roleId = Number(raw_role_id);
    if (!roleId || isNaN(roleId)) {
      if (dept === 'Management') roleId = 2; // Manager
      else if (dept === 'Front Office' || dept === 'Front Desk') roleId = 3; // Receptionist
      else if (dept === 'Housekeeping') roleId = 4; // Housekeeping Staff
      else if (dept === 'Maintenance' || dept === 'Facility') roleId = 5; // Maintenance Staff
      else roleId = 3; // Default Receptionist
    }

    const roleObj = queryOne(db, `SELECT role_name FROM Roles WHERE id = ?`, [roleId]);
    const roleName = roleObj ? roleObj.role_name : 'Staff';

    // Auto generate email and password for login if missing
    const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const defaultEmail = `${cleanFirstName}.${cleanLastName}${Math.floor(10 + Math.random() * 90)}@booknest.com`;
    const userEmail = (raw_email && raw_email.includes('@')) ? raw_email.trim().toLowerCase() : defaultEmail;

    const username = `${cleanFirstName}_${cleanLastName}_${Math.floor(100 + Math.random() * 900)}`;
    const plainPassword = custom_password && custom_password.trim().length >= 4 
      ? custom_password.trim() 
      : `BN-${Math.floor(100000 + Math.random() * 900000)}`;

    const passwordHash = bcrypt.hashSync(plainPassword, 10);

    // 1. Create User Account
    const userRun = executeRun(
      db,
      `INSERT INTO Users (username, email, password_hash, role_id, full_name, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [username, userEmail, passwordHash, roleId, fullName, empPhone]
    );

    const userId = userRun.lastInsertRowid;

    // 2. Create Employee Record
    const empRun = executeRun(
      db,
      `INSERT INTO Employees (user_id, employee_code, full_name, first_name, last_name, department, designation, joining_date, salary, monthly_salary, phone, address, status, shift)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, empCode, fullName, firstName, lastName, dept, desig, hireDate, pay, pay, empPhone, address || '', status || 'Active', shift || 'Morning']
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

    // 3. Log Activity
    executeRun(
      db,
      `INSERT INTO ActivityLogs (user_id, action, module, details, ip_address) VALUES (?, 'Register Employee', 'HR', ?, '127.0.0.1')`,
      [req.user?.id || 1, `Created employee ${fullName} (${empCode}) with assigned login ${userEmail}`]
    );

    return res.status(201).json({
      message: 'Employee registered successfully with assigned login account.',
      employee,
      loginCredentials: {
        email: userEmail,
        username,
        password: plainPassword,
        role_name: roleName,
        full_name: fullName
      }
    });
  } catch (err: any) {
    console.error('Error creating employee:', err);
    return res.status(500).json({ error: 'Failed to create employee and provision login account.' });
  }
});

// PUT /api/employees/:id - Update Employee & Associated User Account
router.put('/:id', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
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
      return res.status(404).json({ error: 'Employee not found.' });
    }

    const firstName = (first_name !== undefined ? first_name : emp.first_name || 'Staff').trim();
    const lastName = (last_name !== undefined ? last_name : emp.last_name || 'Member').trim();
    const fullName = raw_full_name || `${firstName} ${lastName}`.trim();
    const dept = department || emp.department || 'Operations';
    const desig = designation || emp.designation || 'Staff Member';
    const pay = Number(monthly_salary || salary || emp.monthly_salary || emp.salary || 35000);
    const empPhone = phone || emp.phone || '01700000000';
    const empShift = shift || emp.shift || 'Morning';
    const empStatus = status || emp.status || 'Active';
    const empAddr = address !== undefined ? address : emp.address;

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

    // Also update associated User record if user_id exists
    if (emp.user_id) {
      const roleId = Number(role_id) || undefined;
      const email = user_email?.trim() || undefined;

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

    return res.json({ message: 'Employee updated successfully', employee: updatedEmployee });
  } catch (err: any) {
    console.error('Error updating employee:', err);
    return res.status(500).json({ error: 'Failed to update employee details.' });
  }
});

// DELETE /api/employees/:id - Delete Employee & Associated User Login
router.delete('/:id', authenticateToken, authorizeRoles('Owner', 'Manager', 'Receptionist'), async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const db = await getDb();

    const emp = queryOne(db, `SELECT * FROM Employees WHERE id = ?`, [id]);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found.' });
    }

    // Delete associated User login account if exists
    if (emp.user_id) {
      executeRun(db, `DELETE FROM Users WHERE id = ?`, [emp.user_id]);
    }

    // Nullify references in Housekeeping & Maintenance
    executeRun(db, `UPDATE Housekeeping SET assigned_employee_id = NULL WHERE assigned_employee_id = ?`, [id]);
    executeRun(db, `UPDATE Maintenance SET assigned_employee_id = NULL WHERE assigned_employee_id = ?`, [id]);

    // Clean up attendance and salaries
    executeRun(db, `DELETE FROM Attendance WHERE employee_id = ?`, [id]);
    executeRun(db, `DELETE FROM Salaries WHERE employee_id = ?`, [id]);

    // Delete Employee record
    executeRun(db, `DELETE FROM Employees WHERE id = ?`, [id]);

    // Log Activity
    executeRun(
      db,
      `INSERT INTO ActivityLogs (user_id, action, module, details, ip_address) VALUES (?, 'Delete Employee', 'HR', ?, '127.0.0.1')`,
      [req.user?.id || 1, `Deleted employee ${emp.full_name || emp.employee_code} (ID: ${id})`]
    );

    return res.json({ message: 'Employee and associated login credentials deleted successfully.' });
  } catch (err) {
    console.error('Error deleting employee:', err);
    return res.status(500).json({ error: 'Failed to delete employee.' });
  }
});

// GET /api/employees/attendance - Attendance Logs
router.get('/attendance', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { date, employee_id } = req.query;
    const db = await getDb();

    let sql = `
      SELECT a.*, e.full_name as employee_name, e.employee_code, e.department
      FROM Attendance a
      JOIN Employees e ON a.employee_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

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
    return res.status(500).json({ error: 'Failed to fetch attendance.' });
  }
});

// POST /api/employees/attendance - Record Daily Attendance
router.post('/attendance', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { employee_id, date, check_in_time, check_out_time, status, notes } = req.body;
    if (!employee_id || !date || !check_in_time) {
      return res.status(400).json({ error: 'Employee ID, date, and check-in time are required.' });
    }

    const db = await getDb();
    executeRun(
      db,
      `INSERT INTO Attendance (employee_id, date, check_in_time, check_out_time, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [Number(employee_id), date, check_in_time, check_out_time || null, status || 'Present', notes || '']
    );

    return res.status(201).json({ message: 'Attendance recorded successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record attendance.' });
  }
});

// GET /api/employees/salaries - List Salary Records
router.get('/salaries', authenticateToken, authorizeRoles('Owner', 'Manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { month_year } = req.query;
    const db = await getDb();

    let sql = `
      SELECT s.*, e.full_name as employee_name, e.employee_code, e.department, e.designation
      FROM Salaries s
      JOIN Employees e ON s.employee_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (month_year) {
      sql += ` AND s.month_year = ?`;
      params.push(month_year);
    }

    sql += ` ORDER BY s.id DESC`;
    const salaries = queryAll(db, sql, params);
    return res.json({ salaries });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch salary records.' });
  }
});

// POST /api/employees/salaries - Process Salary Payment
router.post('/salaries', authenticateToken, authorizeRoles('Owner', 'Manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { employee_id, month_year, base_salary, bonus, deductions, payment_status } = req.body;
    if (!employee_id || !month_year || !base_salary) {
      return res.status(400).json({ error: 'Employee ID, month/year, and base salary are required.' });
    }

    const net = Number(base_salary) + (Number(bonus) || 0) - (Number(deductions) || 0);
    const db = await getDb();

    executeRun(
      db,
      `INSERT INTO Salaries (employee_id, month_year, base_salary, bonus, deductions, net_salary, payment_status, payment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)`,
      [Number(employee_id), month_year, Number(base_salary), Number(bonus || 0), Number(deductions || 0), net, payment_status || 'Paid']
    );

    return res.status(201).json({ message: 'Salary recorded successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process salary.' });
  }
});

export default router;

