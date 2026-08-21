import { User, Room, RoomType, Guest, Booking, Payment, Employee, Attendance, Salary, Housekeeping, Maintenance, InventoryItem, HotelService, ServiceRequest, DashboardStats, ActivityLog, Notification, SystemSetting } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('booknest_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token && typeof token === 'string' && token !== 'null' && token !== 'undefined' && token.trim()) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'An unexpected server error occurred.');
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: any) => request<{ message: string; token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request<{ user: User }>('/auth/me'),
  switchRole: (role_name: string) => request<{ message: string; token: string; user: User }>('/auth/switch-role', { method: 'POST', body: JSON.stringify({ role_name }) }),

  // Rooms
  getRooms: (params: string = '') => request<{ rooms: Room[] }>(`/rooms${params}`),
  getRoomTypes: () => request<{ roomTypes: RoomType[] }>('/rooms/types'),
  createRoom: (roomData: Partial<Room>) => request<{ message: string; room: Room }>('/rooms', { method: 'POST', body: JSON.stringify(roomData) }),
  updateRoom: (id: number, roomData: Partial<Room>) => request<{ message: string; room: Room }>(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(roomData) }),
  deleteRoom: (id: number) => request<{ message: string }>(`/rooms/${id}`, { method: 'DELETE' }),

  // Guests
  getGuests: (search: string = '') => request<{ guests: Guest[] }>(`/guests${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getGuestDetails: (id: number) => request<{ guest: Guest; bookings: Booking[] }>(`/guests/${id}`),
  createGuest: (guestData: Partial<Guest>) => request<{ message: string; guest: Guest }>('/guests', { method: 'POST', body: JSON.stringify(guestData) }),
  updateGuest: (id: number, guestData: Partial<Guest>) => request<{ message: string; guest: Guest }>(`/guests/${id}`, { method: 'PUT', body: JSON.stringify(guestData) }),
  deleteGuest: (id: number) => request<{ message: string }>(`/guests/${id}`, { method: 'DELETE' }),

  // Bookings
  getBookings: (params: string = '') => request<{ bookings: Booking[] }>(`/bookings${params}`),
  getBookingInvoice: (id: number) => request<{ invoice: any }>(`/bookings/${id}/invoice`),
  checkAvailability: (data: { room_id: number; check_in_date: string; check_out_date: string; exclude_booking_id?: number }) =>
    request<{ isAvailable: boolean; conflicts: any[] }>('/bookings/check-availability', { method: 'POST', body: JSON.stringify(data) }),
  createBooking: (bookingData: any) => request<{ message: string; booking: Booking }>('/bookings', { method: 'POST', body: JSON.stringify(bookingData) }),
  cancelBooking: (id: number) => request<{ message: string }>(`/bookings/${id}/cancel`, { method: 'PUT' }),

  // Check-In / Check-Out
  checkIn: (data: { booking_id: number; deposit_amount?: number; key_card_number?: string; notes?: string }) =>
    request<{ message: string; booking_id: number; key_card_number: string }>('/check-in', { method: 'POST', body: JSON.stringify(data) }),
  checkOut: (data: { booking_id: number; additional_charges?: number; refund_amount?: number; received_amount?: number; payment_method?: string; notes?: string }) =>
    request<{ message: string; invoice: any }>('/check-out', { method: 'POST', body: JSON.stringify(data) }),

  // Payments
  getPayments: (params: string = '') => request<{ payments: Payment[] }>(`/payments${params}`),
  createPayment: (data: { booking_id: number; amount: number; payment_method: string; notes?: string }) =>
    request<{ message: string; payment: Payment }>('/payments', { method: 'POST', body: JSON.stringify(data) }),
  processRefund: (data: { booking_id: number; amount: number; notes?: string }) =>
    request<{ message: string; transaction_id: string }>('/payments/refund', { method: 'POST', body: JSON.stringify(data) }),

  // Employees, Attendance, Salaries
  getEmployees: (params: string = '') => request<{ employees: Employee[] }>(`/employees${params}`),
  createEmployee: (data: any) => request<{ message: string; employee: Employee; loginCredentials?: { email: string; username: string; password: string; role_name: string; full_name: string } }>('/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id: number, data: any) => request<{ message: string; employee: Employee }>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEmployee: (id: number) => request<{ message: string }>(`/employees/${id}`, { method: 'DELETE' }),
  getAttendance: (params: string = '') => request<{ attendance: Attendance[] }>(`/employees/attendance${params}`),
  recordAttendance: (data: any) => request<{ message: string }>('/employees/attendance', { method: 'POST', body: JSON.stringify(data) }),
  getSalaries: (params: string = '') => request<{ salaries: Salary[] }>(`/employees/salaries${params}`),
  recordSalary: (data: any) => request<{ message: string }>('/employees/salaries', { method: 'POST', body: JSON.stringify(data) }),

  // Housekeeping
  getHousekeeping: (params: string = '') => request<{ schedules: Housekeeping[] }>(`/housekeeping${params}`),
  assignHousekeeping: (data: any) => request<{ message: string }>('/housekeeping', { method: 'POST', body: JSON.stringify(data) }),
  updateHousekeepingStatus: (id: number, data: { status: string; notes?: string }) =>
    request<{ message: string }>(`/housekeeping/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Maintenance
  getMaintenance: (params: string = '') => request<{ tickets: Maintenance[] }>(`/maintenance${params}`),
  createMaintenance: (data: any) => request<{ message: string }>('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  updateMaintenance: (id: number, data: any) => request<{ message: string }>(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Inventory
  getInventory: (params: string = '') => request<{ inventory: InventoryItem[] }>(`/inventory${params}`),
  addInventory: (data: any) => request<{ message: string; item: InventoryItem }>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
  updateInventory: (id: number, data: any) => request<{ message: string }>(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Services
  getServices: () => request<{ services: HotelService[] }>('/services'),
  getServiceRequests: (params: string = '') => request<{ requests: ServiceRequest[] }>(`/services/requests${params}`),
  createServiceRequest: (data: any) => request<{ message: string }>('/services/requests', { method: 'POST', body: JSON.stringify(data) }),
  updateServiceRequestStatus: (id: number, status: string) => request<{ message: string }>(`/services/requests/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Analytics & Reports
  getAnalytics: () => request<DashboardStats>('/reports/analytics'),

  // System
  getActivityLogs: () => request<{ logs: ActivityLog[] }>('/system/logs'),
  getNotifications: () => request<{ notifications: Notification[] }>('/system/notifications'),
  markNotificationRead: (id: number) => request<{ message: string }>(`/system/notifications/${id}/read`, { method: 'PUT' }),
  getSettings: () => request<{ settings: SystemSetting[] }>('/system/settings'),
  updateSettings: (settings: any[]) => request<{ message: string }>('/system/settings', { method: 'PUT', body: JSON.stringify({ settings }) })
};



