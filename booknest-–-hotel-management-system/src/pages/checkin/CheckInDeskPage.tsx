import React, { useState, useEffect } from 'react';
import { KeyRound, LogOut, FileText, CheckCircle2, ShieldCheck, CreditCard, DollarSign, Search, Phone } from 'lucide-react';
import { api } from '../../services/api';
import { Booking } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { InvoiceModal } from '../../components/common/InvoiceModal';

export const CheckInDeskPage: React.FC = () => {
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Check-In Modal state
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [checkInData, setCheckInData] = useState({
    deposit_amount: 100,
    key_card_number: '',
    notes: ''
  });

  // Check-Out Modal state
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [checkOutData, setCheckOutData] = useState({
    additional_charges: 0,
    received_amount: 0,
    payment_method: 'Cash',
    notes: ''
  });
  const [checkOutDetails, setCheckOutDetails] = useState<{
    priorPaid: number;
    serviceTotal: number;
    roomCharge: number;
  }>({ priorPaid: 0, serviceTotal: 0, roomCharge: 0 });

  // Generated Invoice state
  const [invoice, setInvoice] = useState<any | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const fetchActiveBookings = async () => {
    try {
      setLoading(true);
      const res = await api.getBookings();
      // Filter for Confirmed (Ready to Check-In) or Checked-In (Ready to Check-Out)
      setActiveBookings(res.bookings.filter(b => b.status === 'Confirmed' || b.status === 'Checked-In'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveBookings();
  }, []);

  const handleOpenCheckIn = (b: Booking) => {
    setSelectedBooking(b);
    setCheckInData({
      deposit_amount: 100,
      key_card_number: `KEY-${b.room_number}-${Math.floor(100 + Math.random() * 900)}`,
      notes: ''
    });
    setIsCheckInOpen(true);
  };

  const handleProcessCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      await api.checkIn({
        booking_id: selectedBooking.id,
        deposit_amount: checkInData.deposit_amount,
        key_card_number: checkInData.key_card_number,
        notes: checkInData.notes
      });
      setIsCheckInOpen(false);
      fetchActiveBookings();
      alert(`Guest checked in successfully! Key card #${checkInData.key_card_number} assigned to Room ${selectedBooking.room_number}.`);
    } catch (err: any) {
      alert(err.message || 'Check-in failed.');
    }
  };

  const handleOpenCheckOut = async (b: Booking) => {
    setSelectedBooking(b);
    let priorPaid = 0;
    let serviceTotal = 0;

    try {
      // Fetch prior payments for this booking
      const paymentsRes = await api.getPayments(`?booking_id=${b.id}`);
      if (paymentsRes.payments) {
        priorPaid = paymentsRes.payments.reduce((acc, curr) => acc + (curr.is_refund ? -curr.amount : curr.amount), 0);
      }

      // Fetch completed service requests
      const srvRes = await api.getServiceRequests(`?booking_id=${b.id}`);
      if (srvRes.requests) {
        serviceTotal = srvRes.requests
          .filter(r => r.status === 'Completed')
          .reduce((acc, curr) => acc + (curr.total_price || 0), 0);
      }
    } catch (e) {
      console.error('Error fetching checkout details:', e);
    }

    const roomCharge = b.total_amount || 0;
    const initialGross = roomCharge + serviceTotal;
    const initialDue = Math.max(0, initialGross - priorPaid);

    setCheckOutDetails({
      priorPaid,
      serviceTotal,
      roomCharge
    });

    setCheckOutData({
      additional_charges: 0,
      received_amount: initialDue,
      payment_method: 'Cash',
      notes: ''
    });

    setIsCheckOutOpen(true);
  };

  const handleProcessCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      const res = await api.checkOut({
        booking_id: selectedBooking.id,
        additional_charges: checkOutData.additional_charges,
        received_amount: checkOutData.received_amount,
        payment_method: checkOutData.payment_method,
        notes: checkOutData.notes
      });
      setIsCheckOutOpen(false);
      fetchActiveBookings();
      setInvoice(res.invoice);
      setIsInvoiceOpen(true);
    } catch (err: any) {
      alert(err.message || 'Check-out failed.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Check-In & Check-Out Desk</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Front desk key card assignment, deposit collection, incidentals billing, and guest invoice generation.</p>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer phone number, name, room, or booking code..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Arrivals Queue (Confirmed - Ready to Check In) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ready for Check-In</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {activeBookings.filter(b => b.status === 'Confirmed' && (
                !search ||
                b.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
                b.guest_phone?.includes(search) ||
                b.booking_code?.toLowerCase().includes(search.toLowerCase()) ||
                String(b.room_number).includes(search)
              )).length} Guests
            </span>
          </div>

          <div className="space-y-3">
            {activeBookings.filter(b => b.status === 'Confirmed' && (
              !search ||
              b.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
              b.guest_phone?.includes(search) ||
              b.booking_code?.toLowerCase().includes(search.toLowerCase()) ||
              String(b.room_number).includes(search)
            )).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No guests waiting for check-in.</p>
            ) : (
              activeBookings.filter(b => b.status === 'Confirmed' && (
                !search ||
                b.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
                b.guest_phone?.includes(search) ||
                b.booking_code?.toLowerCase().includes(search.toLowerCase()) ||
                String(b.room_number).includes(search)
              )).map((b) => (
                <div key={b.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{b.guest_name}</span>
                    {b.guest_phone && (
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-blue-500" />
                        <span>{b.guest_phone}</span>
                      </p>
                    )}
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Room {b.room_number} • {b.booking_code}</p>
                    <p className="text-[11px] text-slate-500">Dates: {b.check_in_date} to {b.check_out_date}</p>
                  </div>

                  <button
                    onClick={() => handleOpenCheckIn(b)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Check In</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Departures Queue (Checked-In - Ready to Check Out) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <LogOut className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Guests (Ready for Check-Out)</h3>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              {activeBookings.filter(b => b.status === 'Checked-In' && (
                !search ||
                b.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
                b.guest_phone?.includes(search) ||
                b.booking_code?.toLowerCase().includes(search.toLowerCase()) ||
                String(b.room_number).includes(search)
              )).length} Occupied
            </span>
          </div>

          <div className="space-y-3">
            {activeBookings.filter(b => b.status === 'Checked-In' && (
              !search ||
              b.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
              b.guest_phone?.includes(search) ||
              b.booking_code?.toLowerCase().includes(search.toLowerCase()) ||
              String(b.room_number).includes(search)
            )).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No active guests checked in currently.</p>
            ) : (
              activeBookings.filter(b => b.status === 'Checked-In' && (
                !search ||
                b.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
                b.guest_phone?.includes(search) ||
                b.booking_code?.toLowerCase().includes(search.toLowerCase()) ||
                String(b.room_number).includes(search)
              )).map((b) => (
                <div key={b.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{b.guest_name}</span>
                    {b.guest_phone && (
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-blue-500" />
                        <span>{b.guest_phone}</span>
                      </p>
                    )}
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Room {b.room_number} • Key #{b.key_card_number || 'N/A'}</p>
                    <p className="text-[11px] text-slate-500">Check-Out Date: {b.check_out_date}</p>
                  </div>

                  <button
                    onClick={() => handleOpenCheckOut(b)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Check Out</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Check-In Modal */}
      <Modal isOpen={isCheckInOpen} onClose={() => setIsCheckInOpen(false)} title={`Guest Express Check-In: ${selectedBooking?.guest_name}`}>
        <form onSubmit={handleProcessCheckIn} className="space-y-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <p><span className="font-bold text-slate-500">Booking Code:</span> {selectedBooking?.booking_code}</p>
            <p><span className="font-bold text-slate-500">Assigned Room:</span> Room {selectedBooking?.room_number}</p>
            <p><span className="font-bold text-slate-500">Total Stay Price:</span> ৳{selectedBooking?.total_amount.toFixed(2)}</p>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Key Card Number / RFID Tag *</label>
            <input
              type="text"
              value={checkInData.key_card_number}
              onChange={(e) => setCheckInData({ ...checkInData, key_card_number: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Security Deposit Amount (৳)</label>
            <input
              type="number"
              min="0"
              value={checkInData.deposit_amount}
              onChange={(e) => setCheckInData({ ...checkInData, deposit_amount: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Front Desk Notes</label>
            <textarea
              value={checkInData.notes}
              onChange={(e) => setCheckInData({ ...checkInData, notes: e.target.value })}
              placeholder="e.g. Identity verified via Passport. Key card handed over..."
              rows={2}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCheckInOpen(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors"
            >
              Complete Check-In
            </button>
          </div>
        </form>
      </Modal>

      {/* Check-Out Modal */}
      <Modal isOpen={isCheckOutOpen} onClose={() => setIsCheckOutOpen(false)} title={`Express Check-Out & Billing Settlement: ${selectedBooking?.guest_name}`}>
        {(() => {
          const roomCharge = checkOutDetails.roomCharge || 0;
          const serviceTotal = checkOutDetails.serviceTotal || 0;
          const extraCharges = Number(checkOutData.additional_charges) || 0;
          const grossTotal = roomCharge + serviceTotal + extraCharges;
          const priorPaid = checkOutDetails.priorPaid || 0;
          const netOutstanding = Math.max(0, grossTotal - priorPaid);
          const received = Number(checkOutData.received_amount) || 0;
          const totalPaidNow = priorPaid + received;
          const changeReturn = Math.max(0, totalPaidNow - grossTotal);
          const remainingDue = Math.max(0, grossTotal - totalPaidNow);

          return (
            <form onSubmit={handleProcessCheckOut} className="space-y-4 text-xs">
              {/* Financial Summary Card */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Room Charge:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">৳{roomCharge.toLocaleString()}</span>
                </div>
                {serviceTotal > 0 && (
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>Room Service / Amenities:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">৳{serviceTotal.toLocaleString()}</span>
                  </div>
                )}
                {extraCharges > 0 && (
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>Additional Incidentals:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">৳{extraCharges.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Gross Bill:</span>
                  <span>৳{grossTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Previously Paid Deposit:</span>
                  <span>-৳{priorPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center font-black text-rose-600 dark:text-rose-400 text-sm pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span>Net Outstanding Balance:</span>
                  <span>৳{netOutstanding.toLocaleString()}</span>
                </div>
              </div>

              {/* Input 1: Additional Incidentals */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Additional Incidentals / Damage Fee (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={checkOutData.additional_charges}
                  onChange={(e) => {
                    const extra = Number(e.target.value) || 0;
                    const newGross = roomCharge + serviceTotal + extra;
                    const newDue = Math.max(0, newGross - priorPaid);
                    setCheckOutData({
                      ...checkOutData,
                      additional_charges: extra,
                      received_amount: newDue
                    });
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  placeholder="0"
                />
              </div>

              {/* Input 2: Received Amount at Check-Out */}
              <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-black text-blue-950 dark:text-blue-200 text-xs flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Received Amount / Payment Collected (৳) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCheckOutData({ ...checkOutData, received_amount: netOutstanding })}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Exact Net Due (৳{netOutstanding})
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-blue-600 dark:text-blue-400 font-extrabold text-sm">৳</span>
                  <input
                    type="number"
                    min="0"
                    value={checkOutData.received_amount}
                    onChange={(e) => setCheckOutData({ ...checkOutData, received_amount: Number(e.target.value) })}
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl text-slate-900 dark:text-white font-black text-base focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter received amount"
                    required
                  />
                </div>

                {/* Quick Shortcuts */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-slate-500 font-medium">Quick Amount:</span>
                  {[netOutstanding, 500, 1000, 2000, 5000, 10000].map((amt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCheckOutData({ ...checkOutData, received_amount: amt })}
                      className="px-2 py-0.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-md text-[10px] font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Payment Method
                  </label>
                  <select
                    value={checkOutData.payment_method}
                    onChange={(e) => setCheckOutData({ ...checkOutData, payment_method: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="bKash">bKash Mobile Banking</option>
                    <option value="Nagad">Nagad Mobile Banking</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="POS Terminal">POS Terminal</option>
                  </select>
                </div>

                {/* Change Return / Remaining Status Display */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Payment Settlement Status
                  </label>
                  {changeReturn > 0 ? (
                    <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200">
                      <div className="font-black text-xs">Change to Return:</div>
                      <div className="text-sm font-black text-emerald-700 dark:text-emerald-300">৳{changeReturn.toLocaleString()}</div>
                    </div>
                  ) : remainingDue > 0 ? (
                    <div className="p-2.5 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200">
                      <div className="font-black text-xs">Remaining Unpaid Due:</div>
                      <div className="text-sm font-black text-amber-700 dark:text-amber-300">৳{remainingDue.toLocaleString()}</div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-800 rounded-xl text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="font-black text-xs">Fully Settled (৳0 Due)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Check-Out Notes */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Check-Out Notes</label>
                <textarea
                  value={checkOutData.notes}
                  onChange={(e) => setCheckOutData({ ...checkOutData, notes: e.target.value })}
                  placeholder="e.g. Minibar consumed, key card returned, change handed over..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCheckOutOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-xs flex items-center gap-1.5 text-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Check Out & Generate Invoice</span>
                </button>
              </div>
            </form>
          );
        })()}
      </Modal>

      {/* Invoice Modal */}
      <InvoiceModal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} invoice={invoice} />
    </div>
  );
};
