export type RoleName = 'Owner' | 'Manager' | 'Receptionist' | 'Housekeeping Staff' | 'Maintenance Staff';

export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  role_name: RoleName;
  full_name: string;
  phone: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  user_id?: number;
  employee_code?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  department: string;
  designation?: string;
  role_id?: number;
  role_name?: RoleName;
  monthly_salary?: number;
  salary?: number;
  phone: string;
  email?: string;
  user_email?: string;
  username?: string;
  shift?: string;
  address?: string;
  hire_date?: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  created_at?: string;
  updated_at?: string;
}

export interface Attendance {
  id: number;
  employee_id: number;
  employee_name?: string;
  date: string;
  check_in_time: string;
  check_out_time?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  notes?: string;
  created_at: string;
}

export interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nid_passport: string;
  emergency_contact: string;
  address: string;
  vip_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomType {
  id: number;
  name: string;
  base_price: number;
  capacity: number;
  amenities: string; // JSON or comma-separated
  description: string;
  created_at: string;
}

export type RoomStatus = 'Available' | 'Reserved' | 'Occupied' | 'Dirty' | 'Cleaning' | 'Maintenance';

export interface Room {
  id: number;
  room_number: string;
  room_type_id: number;
  room_type_name?: string;
  floor: number;
  status: RoomStatus;
  price_per_night: number;
  is_clean: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Checked-In' | 'Checked-Out' | 'Cancelled';

export interface Booking {
  id: number;
  booking_code: string;
  guest_id: number;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  room_id: number;
  room_number?: string;
  room_type_name?: string;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
  total_amount: number;
  discount_amount: number;
  status: BookingStatus;
  booked_by_user_id: number;
  booked_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: number;
  booking_id: number;
  check_in_time: string;
  checked_in_by_user_id: number;
  deposit_amount: number;
  key_card_number: string;
  notes?: string;
  created_at: string;
}

export interface CheckOut {
  id: number;
  booking_id: number;
  check_out_time: string;
  checked_out_by_user_id: number;
  final_amount: number;
  additional_charges: number;
  refund_amount: number;
  notes?: string;
  created_at: string;
}

export type PaymentMethod = 'Cash' | 'Card' | 'Mobile Banking' | 'Online Payment';
export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded' | 'Partial';

export interface Payment {
  id: number;
  booking_id: number;
  booking_code?: string;
  guest_name?: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_id: string;
  is_refund: boolean;
  notes?: string;
  created_by_user_id: number;
  created_at: string;
}

export interface HotelService {
  id: number;
  name: string;
  category: 'Room Service' | 'Laundry' | 'Wake-Up Calls' | 'Food & Beverage' | 'Airport Pickup';
  price: number;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface ServiceRequest {
  id: number;
  booking_id: number;
  room_number?: string;
  guest_name?: string;
  service_id: number;
  service_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  requested_at: string;
  completed_at?: string;
  notes?: string;
}

export type HousekeepingStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Housekeeping {
  id: number;
  room_id: number;
  room_number?: string;
  assigned_employee_id?: number;
  housekeeper_id?: number;
  housekeeper_name?: string;
  employee_name?: string;
  scheduled_date: string;
  status: HousekeepingStatus;
  notes?: string;
  completed_at?: string;
  created_at: string;
}

export type MaintenanceStatus = 'Open' | 'Assigned' | 'In Progress' | 'Completed';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Maintenance {
  id: number;
  room_id: number;
  room_number?: string;
  reported_by_user_id?: number;
  assigned_employee_id?: number;
  assigned_to?: number;
  employee_name?: string;
  assigned_employee_name?: string;
  issue_description: string;
  priority: PriorityLevel;
  repair_cost?: number;
  cost: number;
  status: MaintenanceStatus;
  resolution_notes?: string;
  reported_at?: string;
  resolved_at?: string;
  created_at: string;
}

export interface InventoryItem {
  id: number;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock_alert?: number;
  min_stock_level: number;
  cost_per_unit: number;
  last_restocked?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Salary {
  id: number;
  employee_id: number;
  employee_name?: string;
  employee_code?: string;
  month_year?: string;
  payment_month: string;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_salary: number;
  payment_status?: string;
  status: string;
  payment_date: string;
  created_at?: string;
}

export interface Feedback {
  id: number;
  guest_id: number;
  guest_name?: string;
  booking_id: number;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  username?: string;
  role_name?: string;
  action: string;
  module: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id?: number;
  role_target?: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SystemSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  category: string;
  description: string;
  updated_at: string;
}

export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  reservedRooms: number;
  cleaningRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
  totalRevenue: number;
  monthlyBookingsCount: number;
  employeeCount: number;
  pendingMaintenanceCount: number;
  lowStockAlertsCount: number;
  recentBookings: Booking[];
  recentActivities: ActivityLog[];
  revenueByMonth: { month: string; revenue: number; bookings: number }[];
  roomStatusBreakdown: { name: string; value: number; color: string }[];
}
