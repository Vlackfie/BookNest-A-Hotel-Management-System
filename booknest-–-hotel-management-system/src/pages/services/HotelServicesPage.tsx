import React, { useState, useEffect } from 'react';
import { ConciergeBell, Plus, CheckCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { HotelService, ServiceRequest, Booking } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const HotelServicesPage: React.FC = () => {
  const [services, setServices] = useState<HotelService[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // New Order Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState({
    booking_id: 0,
    service_id: 0,
    quantity: 1,
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSrv, resReq, resBook] = await Promise.all([
        api.getServices(),
        api.getServiceRequests(),
        api.getBookings()
      ]);
      setServices(resSrv.services);
      setRequests(resReq.requests);
      setBookings(resBook.bookings.filter(b => b.status === 'Checked-In'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createServiceRequest(orderForm);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.updateServiceRequestStatus(id, status);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Hotel Services & Orders</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage hotel service catalog (Food & Beverage room service, Laundry, Spa, Airport Transfer) and guest requests.</p>
        </div>

        <button
          onClick={() => { setOrderForm({ booking_id: bookings[0]?.id || 0, service_id: services[0]?.id || 0, quantity: 1, notes: 'Deliver to room immediately' }); setIsModalOpen(true); }}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Room Order</span>
        </button>
      </div>

      {/* Services Catalog Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((srv) => (
          <div key={srv.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{srv.category}</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">৳{(Number(srv.price) || 0).toFixed(2)}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{srv.name}</h3>
            <p className="text-xs text-slate-500">{srv.description}</p>
          </div>
        ))}
      </div>

      {/* Service Orders Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Guest Room Service Requests</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
              <tr>
                <th className="p-3">Room</th>
                <th className="p-3">Guest Name</th>
                <th className="p-3">Service Name</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Total Charges</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">Room {r.room_number}</td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{r.guest_name}</td>
                  <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{r.service_name}</td>
                  <td className="p-3 font-bold">x{r.quantity}</td>
                  <td className="p-3 font-black text-slate-900 dark:text-white">৳{(Number(r.total_price) || 0).toFixed(2)}</td>
                  <td className="p-3"><StatusBadge status={r.status} /></td>
                  <td className="p-3 text-right">
                    {r.status !== 'Completed' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'Completed')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <CheckCircle className="w-3 h-3" /> Fulfill Order
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Place Room Order">
        <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1">Select Active Occupied Room *</label>
            <select
              value={orderForm.booking_id}
              onChange={(e) => setOrderForm({ ...orderForm, booking_id: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              required
            >
              <option value={0}>-- Select Occupied Guest --</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>Room {b.room_number} - Guest: {b.guest_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">Select Hotel Service *</label>
              <select
                value={orderForm.service_id}
                onChange={(e) => setOrderForm({ ...orderForm, service_id: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} (${s.price.toFixed(2)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={orderForm.quantity}
                onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Submit Order</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};



