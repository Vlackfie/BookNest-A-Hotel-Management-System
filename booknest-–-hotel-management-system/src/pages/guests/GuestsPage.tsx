import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, ShieldCheck, Mail, Phone, FileText, History, Trash2, Edit, Printer } from 'lucide-react';
import { api } from '../../services/api';
import { Guest, Booking } from '../../types';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { useAuth } from '../../context/AuthContext';

export const GuestsPage: React.FC = () => {
  const { user } = useAuth();
  const canDelete = user?.role_name === 'Owner' || user?.role_name === 'Manager' || user?.role_name === 'Receptionist';

  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Register Modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nid_passport: '',
    emergency_contact: '',
    address: '',
    vip_status: false
  });
  const [error, setError] = useState<string | null>(null);

  // Edit Modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deletingGuest, setDeletingGuest] = useState<Guest | null>(null);
  const [deleteGuestError, setDeleteGuestError] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    nid_passport: '',
    emergency_contact: '',
    address: '',
    vip_status: false
  });
  const [editError, setEditError] = useState<string | null>(null);

  // Guest Details & History Modal
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestBookings, setGuestBookings] = useState<Booking[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Invoice Modal state for Print Bill
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

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const res = await api.getGuests(search);
      setGuests(res.guests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [search]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createGuest(formData);
      setIsRegisterOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        nid_passport: '',
        emergency_contact: '',
        address: '',
        vip_status: false
      });
      fetchGuests();
    } catch (err: any) {
      setError(err.message || 'Guest registration failed.');
    }
  };

  const handleOpenEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setEditFormData({
      first_name: guest.first_name || '',
      last_name: guest.last_name || '',
      email: guest.email || '',
      phone: guest.phone || '',
      nid_passport: guest.nid_passport || '',
      emergency_contact: guest.emergency_contact || '',
      address: guest.address || '',
      vip_status: Boolean(guest.vip_status)
    });
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;
    setEditError(null);
    try {
      await api.updateGuest(editingGuest.id, editFormData);
      setIsEditOpen(false);
      setEditingGuest(null);
      fetchGuests();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update guest profile.');
    }
  };

  const handleViewHistory = async (guest: Guest) => {
    try {
      setSelectedGuest(guest);
      const res = await api.getGuestDetails(guest.id);
      setGuestBookings(res.bookings);
      setIsDetailsOpen(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGuestConfirm = async () => {
    if (!deletingGuest) return;
    setDeleteGuestError(null);
    try {
      await api.deleteGuest(deletingGuest.id);
      setDeletingGuest(null);
      fetchGuests();
    } catch (err: any) {
      setDeleteGuestError(err.message || 'Failed to delete guest.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Guest Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Register guests, view identification documents, emergency contacts, and past stay histories.</p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Guest</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guest by name, email, phone, or NID/Passport..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
              <tr>
                <th className="p-3">Guest Name</th>
                <th className="p-3">Contact Info</th>
                <th className="p-3">NID / Passport</th>
                <th className="p-3">Emergency Contact</th>
                <th className="p-3">VIP Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {guests.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {g.first_name} {g.last_name}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <Phone className="w-3.5 h-3.5 text-blue-500" /> 
                        <span className="font-mono">{g.phone}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Mail className="w-3 h-3 text-slate-400" /> {g.email}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-800 dark:text-slate-200">{g.nid_passport}</td>
                  <td className="p-3 text-slate-500">{g.emergency_contact || 'None'}</td>
                  <td className="p-3">
                    {g.vip_status ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-bold inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> VIP Client
                      </span>
                    ) : (
                      <span className="text-slate-400">Standard</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        title="Edit guest profile details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleViewHistory(g)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <History className="w-3.5 h-3.5" /> Stay History
                      </button>
                      {canDelete && (
                        <button
                          onClick={() => { setDeleteGuestError(null); setDeletingGuest(g); }}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/80 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                          title="Delete guest directory record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
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

      {/* Register Guest Modal */}
      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Register New Guest Profile">
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl font-semibold">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">First Name *</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Last Name *</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Phone Number <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">(Unique Key)</span> *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 01711223344"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">NID / Passport Number *</label>
              <input
                type="text"
                value={formData.nid_passport}
                onChange={(e) => setFormData({ ...formData, nid_passport: e.target.value })}
                placeholder="e.g. PASSPORT-US-981273"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Emergency Contact</label>
              <input
                type="text"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                placeholder="Name & Phone"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Residential Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="vip_status"
              checked={formData.vip_status}
              onChange={(e) => setFormData({ ...formData, vip_status: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded-xs"
            />
            <label htmlFor="vip_status" className="font-bold text-slate-800 dark:text-slate-200">Flag as VIP Guest (Priority Perks)</label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
            >
              Register Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Guest Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Guest Profile: ${editingGuest?.first_name} ${editingGuest?.last_name}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          {editError && <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl font-semibold">{editError}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">First Name *</label>
              <input
                type="text"
                value={editFormData.first_name}
                onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Last Name *</label>
              <input
                type="text"
                value={editFormData.last_name}
                onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address *</label>
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Phone Number <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">(Unique Key)</span> *
              </label>
              <input
                type="text"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">NID / Passport Number *</label>
              <input
                type="text"
                value={editFormData.nid_passport}
                onChange={(e) => setEditFormData({ ...editFormData, nid_passport: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Emergency Contact</label>
              <input
                type="text"
                value={editFormData.emergency_contact}
                onChange={(e) => setEditFormData({ ...editFormData, emergency_contact: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Residential Address</label>
            <input
              type="text"
              value={editFormData.address}
              onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="edit_vip_status"
              checked={editFormData.vip_status}
              onChange={(e) => setEditFormData({ ...editFormData, vip_status: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded-xs"
            />
            <label htmlFor="edit_vip_status" className="font-bold text-slate-800 dark:text-slate-200">Flag as VIP Guest (Priority Perks)</label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Guest History & Stay Records Modal */}
      <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title={`Guest Stay History: ${selectedGuest?.first_name} ${selectedGuest?.last_name}`}>
        <div className="space-y-5 text-xs">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block mb-0.5">Total Stays</span>
              <span className="text-base font-black text-slate-900 dark:text-white">{guestBookings.length} Visits</span>
            </div>
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Total Revenue</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                Tk. {guestBookings.reduce((acc, curr) => acc + (curr.total_amount || 0), 0).toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 block mb-0.5">Phone Number</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{selectedGuest?.phone}</span>
            </div>
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-0.5">VIP Designation</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {selectedGuest?.vip_status ? '⭐ VIP Client' : 'Standard Client'}
              </span>
            </div>
          </div>

          {/* Profile Details Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
            <p><span className="font-bold text-slate-700 dark:text-slate-200">Email:</span> {selectedGuest?.email || 'N/A'}</p>
            <p><span className="font-bold text-slate-700 dark:text-slate-200">NID / Passport:</span> <span className="font-mono">{selectedGuest?.nid_passport || 'N/A'}</span></p>
            <p><span className="font-bold text-slate-700 dark:text-slate-200">Emergency Contact:</span> {selectedGuest?.emergency_contact || 'None'}</p>
            <p><span className="font-bold text-slate-700 dark:text-slate-200">Address:</span> {selectedGuest?.address || 'N/A'}</p>
          </div>

          {/* Reservation History & Bill Options Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-500" />
                <span>Stay & Reservation History</span>
              </h4>
              <span className="text-[11px] text-slate-500">{guestBookings.length} records</span>
            </div>

            {guestBookings.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                No past stays or active reservations found for this guest profile.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Room</th>
                      <th className="p-2.5">Check-In</th>
                      <th className="p-2.5">Check-Out</th>
                      <th className="p-2.5">Total Amount</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5 text-right">Invoice / Bill</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {guestBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-2.5 font-bold font-mono text-slate-900 dark:text-white">{b.booking_code}</td>
                        <td className="p-2.5 font-medium">Room {b.room_number}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{b.check_in_date}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{b.check_out_date}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">Tk. {b.total_amount.toFixed(2)}</td>
                        <td className="p-2.5"><StatusBadge status={b.status} /></td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handlePrintBill(b.id)}
                            disabled={loadingInvoiceId === b.id}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                            title="View and print official hotel bill invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>{loadingInvoiceId === b.id ? 'Loading...' : 'Print Bill'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Invoice Modal for Print Bill */}
      <InvoiceModal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} invoice={selectedInvoice} />

      {/* Delete Guest Modal */}
      <Modal isOpen={!!deletingGuest} onClose={() => setDeletingGuest(null)} title="Confirm Guest Deletion">
        {deletingGuest && (
          <div className="space-y-4 text-xs">
            {deleteGuestError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl font-semibold">
                {deleteGuestError}
              </div>
            )}

            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-900 dark:text-rose-200">
              <p className="font-bold text-sm">Delete Guest Profile?</p>
              <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                Are you sure you want to delete <span className="font-bold underline">{deletingGuest.first_name} {deletingGuest.last_name}</span>?
                This action will remove their profile and details from the hotel directory.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingGuest(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGuestConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Confirm Delete Guest
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
