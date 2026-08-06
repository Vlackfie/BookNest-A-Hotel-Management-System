import React, { useState, useEffect } from 'react';
import { CalendarCheck, Plus, Search, Filter, AlertTriangle, ShieldAlert, CheckCircle2, Printer } from 'lucide-react';
import { api } from '../../services/api';
import { Booking, Room, Guest } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { InvoiceModal } from '../../components/common/InvoiceModal';

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Invoice Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<number | null>(null);

  const handlePrintBill = async (bookingId: number) => {
    try {
      setLoadingInvoiceId(bookingId);
      const res = await api.getBookingInvoice(bookingId);
      setSelectedInvoice(res.invoice);
      setIsInvoiceOpen(true);
    } catch (err: any) {
      alert(err.message || 'Failed to load bill invoice.');
    } finally {
      setLoadingInvoiceId(null);
    }
  };

  // New Reservation Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    guest_id: 0,
    room_id: 0,
    check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    discount_percentage: 0,
    is_walk_in: false,
    special_requests: ''
  });
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let params = '?';
      if (search) params += `search=${encodeURIComponent(search)}&`;
      if (selectedStatus) params += `status=${selectedStatus}&`;

      const [resBookings, resRooms, resGuests] = await Promise.all([
        api.getBookings(params),
        api.getRooms(),
        api.getGuests()
      ]);

      setBookings(resBookings.bookings);
      setRooms(resRooms.rooms);
      setGuests(resGuests.guests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [search, selectedStatus]);

  const handleOpenModal = () => {
    setError(null);
    setOverlapWarning(null);
    const availableRooms = rooms.filter(r => r.status === 'Available');
    setFormData({
      guest_id: guests[0]?.id || 0,
      room_id: availableRooms[0]?.id || 0,
      check_in_date: new Date().toISOString().split('T')[0],
      check_out_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      discount_percentage: 0,
      is_walk_in: false,
      special_requests: ''
    });
    setIsModalOpen(true);
  };

  // Perform Real-Time Date Overlap Check (Business Rule #3)
  const handleCheckOverlap = async () => {
    if (!formData.room_id || !formData.check_in_date || !formData.check_out_date) return;
    try {
      const res = await api.checkAvailability({
        room_id: formData.room_id,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date
      });
      if (!res.isAvailable) {
        setOverlapWarning(`⚠️ DOUBLE-BOOKING CONFLICT: Room is already reserved from ${res.conflicts[0].check_in_date} to ${res.conflicts[0].check_out_date}. Select another room or change dates.`);
      } else {
        setOverlapWarning(null);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.guest_id || !formData.room_id) {
      setError('Please select both a guest and a room.');
      return;
    }
    try {
      await api.createBooking(formData);
      setIsModalOpen(false);
      fetchBookings();
    } catch (err: any) {
      setError(err.message || 'Failed to create reservation.');
    }
  };

  const handleCancelBookingConfirm = async () => {
    if (!cancellingBooking) return;
    setCancelError(null);
    try {
      await api.cancelBooking(cancellingBooking.id);
      setCancellingBooking(null);
      fetchBookings();
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel reservation.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Reservation Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage room bookings, walk-ins, advance dates, double-booking validation, and cancellations.</p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search booking code, guest name, phone number, or room..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-500">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-In">Checked-In</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
              <tr>
                <th className="p-3">Booking Code</th>
                <th className="p-3">Guest Name</th>
                <th className="p-3">Room</th>
                <th className="p-3">Check-In</th>
                <th className="p-3">Check-Out</th>
                <th className="p-3">Type</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{b.booking_code}</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{b.guest_name}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 font-bold">Room {b.room_number} <span className="text-[10px] text-slate-400 font-normal">({b.room_type_name})</span></td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{b.check_in_date}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{b.check_out_date}</td>
                  <td className="p-3">
                    {b.is_walk_in ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 text-[10px] font-bold">
                        Walk-In
                      </span>
                    ) : (
                      <span className="text-slate-500">Advance</span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">Tk. {b.total_amount.toFixed(2)}</td>
                  <td className="p-3"><StatusBadge status={b.status} /></td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePrintBill(b.id)}
                        disabled={loadingInvoiceId === b.id}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        title="View and print official hotel bill invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{loadingInvoiceId === b.id ? 'Loading...' : 'Print Bill'}</span>
                      </button>

                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => { setCancelError(null); setCancellingBooking(b); }}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Reservation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Reservation">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl font-semibold">{error}</div>}
          {overlapWarning && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-300 rounded-xl font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
              <span>{overlapWarning}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Guest *</label>
              <select
                value={formData.guest_id}
                onChange={(e) => setFormData({ ...formData, guest_id: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              >
                <option value={0}>-- Choose Registered Guest --</option>
                {guests.map((g) => (
                  <option key={g.id} value={g.id}>{g.first_name} {g.last_name} ({g.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Room *</label>
              <select
                value={formData.room_id}
                onChange={(e) => {
                  setFormData({ ...formData, room_id: Number(e.target.value) });
                  setTimeout(handleCheckOverlap, 100);
                }}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              >
                <option value={0}>-- Choose Available Room --</option>
                {rooms
                  .filter((r) => r.status === 'Available' || r.id === formData.room_id)
                  .map((r) => (
                    <option key={r.id} value={r.id}>Room {r.room_number} ({r.room_type_name}) - Tk. {r.price_per_night}/night</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Check-In Date *</label>
              <input
                type="date"
                value={formData.check_in_date ? String(formData.check_in_date).slice(0, 10) : ''}
                onChange={(e) => {
                  setFormData({ ...formData, check_in_date: e.target.value });
                  setTimeout(handleCheckOverlap, 100);
                }}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Check-Out Date *</label>
              <input
                type="date"
                value={formData.check_out_date ? String(formData.check_out_date).slice(0, 10) : ''}
                onChange={(e) => {
                  setFormData({ ...formData, check_out_date: e.target.value });
                  setTimeout(handleCheckOverlap, 100);
                }}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={isNaN(Number(formData.discount_percentage)) ? 0 : formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_walk_in"
                checked={formData.is_walk_in}
                onChange={(e) => setFormData({ ...formData, is_walk_in: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded-xs"
              />
              <label htmlFor="is_walk_in" className="font-bold text-slate-800 dark:text-slate-200">Walk-In Guest (Immediate Desk Check-In)</label>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Special Guest Requests</label>
            <textarea
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              placeholder="e.g. Extra pillows, late arrival, airport shuttle requested..."
              rows={2}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!overlapWarning}
              className={`px-4 py-2 text-white rounded-xl font-bold transition-colors ${overlapWarning ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              Confirm Reservation
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Modal */}
      <InvoiceModal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} invoice={selectedInvoice} />

      {/* Cancel Reservation Modal */}
      <Modal isOpen={!!cancellingBooking} onClose={() => setCancellingBooking(null)} title="Confirm Reservation Cancellation">
        {cancellingBooking && (
          <div className="space-y-4 text-xs">
            {cancelError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl font-semibold">
                {cancelError}
              </div>
            )}

            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-900 dark:text-rose-200">
              <p className="font-bold text-sm">Cancel Booking #{cancellingBooking.booking_number}?</p>
              <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                Are you sure you want to cancel the reservation for guest <span className="font-bold">{cancellingBooking.guest_name}</span> in Room {cancellingBooking.room_number}?
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelBookingConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
