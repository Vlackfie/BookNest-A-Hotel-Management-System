import React, { useState, useEffect } from 'react';
import { UserCheck, UserPlus, Calendar, DollarSign, Search, Check, Clock, Trash2, Copy, Key, Mail, ShieldCheck, Edit } from 'lucide-react';
import { api } from '../../services/api';
import { Employee, Attendance, Salary } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

export const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const canManageEmployees = user?.role_name === 'Owner' || user?.role_name === 'Manager' || user?.role_name === 'Receptionist';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'salaries'>('employees');

  // Register Employee Modal
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [empForm, setEmpForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    role_id: 3, // Default Receptionist
    department: 'Front Office',
    designation: 'Receptionist',
    monthly_salary: 35000,
    shift: 'Morning',
    address: ''
  });

  // Edit Employee Modal
  const [isEditEmpModalOpen, setIsEditEmpModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editEmpForm, setEditEmpForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    role_id: 3,
    department: 'Front Office',
    designation: 'Receptionist',
    monthly_salary: 35000,
    shift: 'Morning',
    address: '',
    status: 'Active',
    user_email: ''
  });

  // Created Login Credentials Modal
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    username: string;
    password: string;
    role_name: string;
    full_name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Delete Confirmation Modal
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  // Record Attendance Modal
  const [isAttModalOpen, setIsAttModalOpen] = useState(false);
  const [attForm, setAttForm] = useState({
    employee_id: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    check_in_time: '08:00',
    check_out_time: '17:00'
  });

  // Record Salary Modal
  const [isSalModalOpen, setIsSalModalOpen] = useState(false);
  const [salForm, setSalForm] = useState({
    employee_id: 0,
    payment_month: new Date().toISOString().slice(0, 7),
    base_salary: 35000,
    bonus: 2000,
    deductions: 0,
    notes: 'Base salary + performance bonus'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resEmp, resAtt, resSal] = await Promise.all([
        api.getEmployees(),
        api.getAttendance(),
        api.getSalaries()
      ]);
      setEmployees(resEmp.employees);
      setAttendance(resAtt.attendance);
      setSalaries(resSal.salaries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEmpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createEmployee(empForm);
      setIsEmpModalOpen(false);
      
      // Reset form
      setEmpForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        role_id: 3,
        department: 'Front Office',
        designation: 'Receptionist',
        monthly_salary: 35000,
        shift: 'Morning',
        address: ''
      });

      if (res.loginCredentials) {
        setCreatedCredentials(res.loginCredentials);
      }
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to register employee');
    }
  };

  const handleOpenEditEmp = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditEmpForm({
      first_name: emp.first_name || emp.full_name?.split(' ')[0] || '',
      last_name: emp.last_name || emp.full_name?.split(' ').slice(1).join(' ') || '',
      phone: emp.phone || '',
      role_id: emp.role_id || 3,
      department: emp.department || 'Front Office',
      designation: emp.designation || 'Receptionist',
      monthly_salary: Number(emp.monthly_salary || emp.salary) || 35000,
      shift: emp.shift || 'Morning',
      address: emp.address || '',
      status: emp.status || 'Active',
      user_email: emp.user_email || ''
    });
    setIsEditEmpModalOpen(true);
  };

  const handleEditEmpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    try {
      await api.updateEmployee(editingEmployee.id, editEmpForm);
      setIsEditEmpModalOpen(false);
      setEditingEmployee(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update employee details.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEmployee) return;
    try {
      await api.deleteEmployee(deletingEmployee.id);
      setDeletingEmployee(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete employee');
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Vlackfie Hotel Login Credentials\nEmployee: ${createdCredentials.full_name}\nRole: ${createdCredentials.role_name}\nEmail/Login: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAttSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recordAttendance(attForm);
      setIsAttModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recordSalary(salForm);
      setIsSalModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Employees & HR Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage staff profiles, assign login credentials, track attendance shifts, and disburse monthly salaries.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'employees' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Directory ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'attendance' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('salaries')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'salaries' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Salaries
            </button>
          </div>

          {activeTab === 'employees' && canManageEmployees && (
            <button
              onClick={() => setIsEmpModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Add Staff Member
            </button>
          )}
          {activeTab === 'attendance' && (
            <button
              onClick={() => { setAttForm({ ...attForm, employee_id: employees[0]?.id || 0 }); setIsAttModalOpen(true); }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" /> Record Shift
            </button>
          )}
          {activeTab === 'salaries' && canManageEmployees && (
            <button
              onClick={() => { setSalForm({ ...salForm, employee_id: employees[0]?.id || 0 }); setIsSalModalOpen(true); }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4" /> Pay Salary
            </button>
          )}
        </div>
      </div>

      {activeTab === 'employees' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Role & Dept</th>
                  <th className="p-3">System Login Email</th>
                  <th className="p-3">Shift & Phone</th>
                  <th className="p-3">Monthly Salary</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {e.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || 'Staff'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{e.employee_code || `EMP-${e.id}`}</div>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{e.role_name || e.designation || 'Staff'}</span>
                      <div className="text-[10px] text-slate-500">{e.department}</div>
                    </td>
                    <td className="p-3 font-mono">
                      {e.user_email ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-md text-[11px] font-medium border border-emerald-200 dark:border-emerald-800">
                          <Mail className="w-3 h-3 text-emerald-500" />
                          {e.user_email}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No login account</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{e.shift || 'Morning'} Shift</div>
                      <div className="text-[10px] text-slate-500">{e.phone}</div>
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">৳{(Number(e.monthly_salary || e.salary) || 0).toLocaleString()}</td>
                    <td className="p-3"><StatusBadge status={e.status} /></td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditEmp(e)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
                          title="Edit Employee details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingEmployee(e)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/80 rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Shift Times</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{a.date}</td>
                    <td className="p-3 text-slate-800 dark:text-slate-200">{a.employee_name}</td>
                    <td className="p-3 text-slate-500">{a.check_in_time} - {a.check_out_time}</td>
                    <td className="p-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'salaries' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
                <tr>
                  <th className="p-3">Month</th>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Base Salary</th>
                  <th className="p-3">Bonus</th>
                  <th className="p-3">Net Paid</th>
                  <th className="p-3">Payment Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {salaries.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{s.payment_month || s.month_year}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{s.employee_name}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">৳{(Number(s.base_salary) || 0).toLocaleString()}</td>
                    <td className="p-3 text-emerald-600 font-semibold">+৳{Number(s.bonus) || 0}</td>
                    <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">৳{(Number(s.net_salary) || 0).toLocaleString()}</td>
                    <td className="p-3 text-slate-500">{s.payment_date}</td>
                    <td className="p-3"><StatusBadge status={s.status || s.payment_status || 'Paid'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal isOpen={isEmpModalOpen} onClose={() => setIsEmpModalOpen(false)} title="Register Employee & System Login">
        <form onSubmit={handleEmpSubmit} className="space-y-4 text-xs">
          <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Automatic Login Account Generation</div>
              <div className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                Creating an employee will automatically generate a system login email and password based on the assigned role.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">First Name *</label>
              <input
                type="text"
                value={empForm.first_name}
                onChange={(e) => setEmpForm({ ...empForm, first_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                placeholder="e.g. Mahfuz"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Last Name *</label>
              <input
                type="text"
                value={empForm.last_name}
                onChange={(e) => setEmpForm({ ...empForm, last_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                placeholder="e.g. Rahman"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Assigned System Role *</label>
              <select
                value={empForm.role_id}
                onChange={(e) => {
                  const roleId = Number(e.target.value);
                  let dept = 'Front Office';
                  let desig = 'Receptionist';
                  if (roleId === 2) { dept = 'Management'; desig = 'Assistant Manager'; }
                  if (roleId === 3) { dept = 'Front Office'; desig = 'Receptionist'; }
                  if (roleId === 4) { dept = 'Housekeeping'; desig = 'Housekeeper'; }
                  if (roleId === 5) { dept = 'Maintenance'; desig = 'Maintenance Technician'; }
                  setEmpForm({ ...empForm, role_id: roleId, department: dept, designation: desig });
                }}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              >
                <option value={2}>Manager (Operational Control)</option>
                <option value={3}>Receptionist (Front Desk & Bookings)</option>
                <option value={4}>Housekeeping Staff (Room Cleaning)</option>
                <option value={5}>Maintenance Staff (Facility Repair)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
              <select
                value={empForm.department}
                onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Management">Management</option>
                <option value="Front Office">Front Office</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Services">Services</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Login Email (Optional)</label>
              <input
                type="email"
                value={empForm.email}
                onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                placeholder="Auto-generated if empty"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400">Leave blank for auto-generated email</span>
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Login Password (Optional)</label>
              <input
                type="text"
                value={empForm.password}
                onChange={(e) => setEmpForm({ ...empForm, password: e.target.value })}
                placeholder="Auto-generated if empty"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-slate-400">Leave blank for secure auto password</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number *</label>
              <input
                type="text"
                value={empForm.phone}
                onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                placeholder="01711223344"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Monthly Salary (৳)</label>
              <input
                type="number"
                value={empForm.monthly_salary}
                onChange={(e) => setEmpForm({ ...empForm, monthly_salary: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Shift</label>
              <select
                value={empForm.shift}
                onChange={(e) => setEmpForm({ ...empForm, shift: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Morning">Morning Shift</option>
                <option value="Evening">Evening Shift</option>
                <option value="Night">Night Shift</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setIsEmpModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 dark:text-slate-300 font-semibold">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs">
              <UserPlus className="w-4 h-4" />
              Register & Assign Login
            </button>
          </div>
        </form>
      </Modal>

      {/* Created Credentials Modal */}
      <Modal isOpen={!!createdCredentials} onClose={() => setCreatedCredentials(null)} title="Assigned System Credentials">
        {createdCredentials && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black text-sm text-emerald-950 dark:text-emerald-100">Employee Account Provisioned!</h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                  The employee record and login credentials have been generated and activated automatically.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-sans font-medium">Employee Name:</span>
                <span className="font-bold text-slate-900 dark:text-white font-sans">{createdCredentials.full_name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-sans font-medium">Assigned Role:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-sans">{createdCredentials.role_name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-sans font-medium">Login Email:</span>
                <span className="font-bold text-slate-900 dark:text-white">{createdCredentials.email}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-sans font-medium">Username:</span>
                <span className="font-bold text-slate-900 dark:text-white">{createdCredentials.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-sans font-medium">Auto Password:</span>
                <span className="font-black text-purple-600 dark:text-purple-400 text-sm tracking-wide bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                  {createdCredentials.password}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">Provide these credentials to the staff member for system access.</span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCredentials}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Credentials'}
                </button>
                <button
                  onClick={() => setCreatedCredentials(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditEmpModalOpen} onClose={() => setIsEditEmpModalOpen(false)} title="Edit Employee Profile">
        {editingEmployee && (
          <form onSubmit={handleEditEmpSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">First Name *</label>
                <input
                  type="text"
                  value={editEmpForm.first_name}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, first_name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Last Name *</label>
                <input
                  type="text"
                  value={editEmpForm.last_name}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, last_name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Assigned Role</label>
                <select
                  value={editEmpForm.role_id}
                  onChange={(e) => {
                    const roleId = Number(e.target.value);
                    let dept = editEmpForm.department;
                    let desig = editEmpForm.designation;
                    if (roleId === 2) { dept = 'Management'; desig = 'Assistant Manager'; }
                    if (roleId === 3) { dept = 'Front Office'; desig = 'Receptionist'; }
                    if (roleId === 4) { dept = 'Housekeeping'; desig = 'Housekeeper'; }
                    if (roleId === 5) { dept = 'Maintenance'; desig = 'Maintenance Technician'; }
                    setEditEmpForm({ ...editEmpForm, role_id: roleId, department: dept, designation: desig });
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  <option value={2}>Manager</option>
                  <option value={3}>Receptionist</option>
                  <option value={4}>Housekeeping Staff</option>
                  <option value={5}>Maintenance Staff</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Department</label>
                <select
                  value={editEmpForm.department}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, department: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Management">Management</option>
                  <option value="Front Office">Front Office</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Services">Services</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  value={editEmpForm.phone}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Login Email</label>
                <input
                  type="email"
                  value={editEmpForm.user_email}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, user_email: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Monthly Salary (৳)</label>
                <input
                  type="number"
                  value={editEmpForm.monthly_salary}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, monthly_salary: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Shift</label>
                <select
                  value={editEmpForm.shift}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, shift: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Morning">Morning Shift</option>
                  <option value="Evening">Evening Shift</option>
                  <option value="Night">Night Shift</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status</label>
                <select
                  value={editEmpForm.status}
                  onChange={(e) => setEditEmpForm({ ...editEmpForm, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Address</label>
              <input
                type="text"
                value={editEmpForm.address}
                onChange={(e) => setEditEmpForm({ ...editEmpForm, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditEmpModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors shadow-xs"
              >
                Save Employee Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Employee Modal */}
      <Modal isOpen={!!deletingEmployee} onClose={() => setDeletingEmployee(null)} title="Confirm Employee Deletion">
        {deletingEmployee && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-900 dark:text-rose-200">
              <p className="font-bold text-sm">Delete Employee & System Access?</p>
              <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                Are you sure you want to delete <span className="font-bold underline">{deletingEmployee.full_name || deletingEmployee.first_name}</span>?
                This action will permanently remove their employee profile and terminate their system login account.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDeletingEmployee(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Record Attendance Modal */}
      <Modal isOpen={isAttModalOpen} onClose={() => setIsAttModalOpen(false)} title="Record Staff Attendance">
        <form onSubmit={handleAttSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1">Employee *</label>
            <select
              value={attForm.employee_id}
              onChange={(e) => setAttForm({ ...attForm, employee_id: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name || e.first_name} ({e.department})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">Date</label>
              <input type="date" value={attForm.date ? String(attForm.date).slice(0, 10) : ''} onChange={(e) => setAttForm({ ...attForm, date: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
            </div>
            <div>
              <label className="font-bold block mb-1">Status</label>
              <select value={attForm.status} onChange={(e) => setAttForm({ ...attForm, status: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl">
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsAttModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Save Shift</button>
          </div>
        </form>
      </Modal>

      {/* Pay Salary Modal */}
      <Modal isOpen={isSalModalOpen} onClose={() => setIsSalModalOpen(false)} title="Disburse Monthly Salary">
        <form onSubmit={handleSalSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1">Employee *</label>
            <select
              value={salForm.employee_id}
              onChange={(e) => setSalForm({ ...salForm, employee_id: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name || e.first_name} (৳{Number(e.monthly_salary || e.salary) || 0}/mo)</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-bold block mb-1">Base Salary</label>
              <input type="number" value={salForm.base_salary} onChange={(e) => setSalForm({ ...salForm, base_salary: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
            </div>
            <div>
              <label className="font-bold block mb-1">Bonus (৳)</label>
              <input type="number" value={salForm.bonus} onChange={(e) => setSalForm({ ...salForm, bonus: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
            </div>
            <div>
              <label className="font-bold block mb-1">Deductions (৳)</label>
              <input type="number" value={salForm.deductions} onChange={(e) => setSalForm({ ...salForm, deductions: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsSalModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold">Record Salary</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};




