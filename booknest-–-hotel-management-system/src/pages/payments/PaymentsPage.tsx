import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, RefreshCw, Plus, Search, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { Payment, Booking } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Receive Payment Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    booking_id: 0,
    amount: 100,
    payment_method: 'Credit Card',
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [refundingPayment, setRefundingPayment] = useState<Payment | null>(null);
  const [refundError, setRefundError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const [resPay, resBook] = await Promise.all([
        api.getPayments(),
        api.getBookings()
      ]);
      setPayments(resPay.payments);
      setBookings(resBook.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleOpenModal = () => {
    setError(null);
    setFormData({
      booking_id: bookings[0]?.id || 0,
      amount: 100,
      payment_method: 'Credit Card',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.booking_id) {
      setError('Please select a booking.');
      return;
    }
    try {
      await api.createPayment(formData);
      setIsModalOpen(false);
      fetchPayments();
    } catch (err: any) {
      setError(err.message || 'Payment processing failed.');
    }
  };

  const handleRefundConfirm = async () => {
    if (!refundingPayment) return;
    setRefundError(null);
    try {
      await api.processRefund({
        booking_id: refundingPayment.booking_id,
        amount: refundingPayment.amount,
        notes: `Refund issued for transaction #${refundingPayment.transaction_id}`
      });
      setRefundingPayment(null);
      fetchPayments();
    } catch (err: any) {
      setRefundError(err.message || 'Refund failed.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Payment & Financial Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Record guest payments, view transaction histories, issue refunds, and manage payment methods.</p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Payment Ledger Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
              <tr>
                <th className="p-3">Transaction Ref</th>
                <th className="p-3">Booking Code</th>
                <th className="p-3">Guest Name</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Method</th>
                <th className="p-3">Payment Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{p.transaction_id}</td>
                  <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{p.booking_code}</td>
                  <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">{p.guest_name}</td>
                  <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">৳{(Number(p.amount) || 0).toFixed(2)}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 font-semibold">{p.payment_method}</td>
                  <td className="p-3 text-slate-500">{p.payment_date}</td>
                  <td className="p-3"><StatusBadge status={p.status} /></td>
                  <td className="p-3 text-right">
                    {p.status === 'Completed' && (
                      <button
                        onClick={() => { setRefundError(null); setRefundingPayment(p); }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ml-auto"
                      >
                        <RefreshCw className="w-3 h-3" /> Issue Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Guest Payment">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl font-semibold">{error}</div>}

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Booking *</label>
            <select
              value={formData.booking_id}
              onChange={(e) => setFormData({ ...formData, booking_id: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              required
            >
              <option value={0}>-- Select Booking --</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>{b.booking_code} - Guest: {b.guest_name} (Total: ৳{(Number(b.total_amount) || 0).toFixed(2)})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Amount (৳) *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Method *</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Payment">Mobile Payment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Notes / Transaction Reference</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Card authorization code or POS receipt number..."
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
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
            >
              Confirm Transaction
            </button>
          </div>
        </form>
      </Modal>

      {/* Issue Refund Modal */}
      <Modal isOpen={!!refundingPayment} onClose={() => setRefundingPayment(null)} title="Confirm Transaction Refund">
        {refundingPayment && (
          <div className="space-y-4 text-xs">
            {refundError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl font-semibold">
                {refundError}
              </div>
            )}

            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-900 dark:text-amber-200">
              <p className="font-bold text-sm">Issue refund for transaction #{refundingPayment.transaction_id}?</p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                Amount to refund: <span className="font-bold">৳{(Number(refundingPayment.amount) || 0).toFixed(2)}</span> for booking <span className="font-bold">{refundingPayment.booking_code}</span> ({refundingPayment.guest_name}).
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRefundingPayment(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRefundConfirm}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Process Refund
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};



