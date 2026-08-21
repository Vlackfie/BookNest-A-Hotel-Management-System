import React from 'react';
import { KeyRound, PlusCircle, UserPlus, CheckCircle, Clock, ArrowRight, UserCheck } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DashboardStats } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  stats: DashboardStats;
  onNavigate: (tab: string) => void;
}

export const ReceptionistDashboard: React.FC<Props> = ({ stats, onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 rounded-2xl border border-emerald-900/50 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              <span>Senior Front Desk Receptionist</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back, {user?.full_name || 'Rayhana Akter Rupa'}!</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Guest registration, walk-in reservations, key card issuing, and express check-in desk.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('checkin')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <KeyRound className="w-4 h-4" />
            <span>Check-In / Out Desk</span>
          </button>
          <button
            onClick={() => onNavigate('bookings')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
          <button
            onClick={() => onNavigate('guests')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Guest</span>
          </button>
        </div>
      </div>

      {/* Front Desk Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Available Rooms</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.availableRooms}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Occupied Rooms</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.occupiedRooms}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Reserved Rooms</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.reservedRooms}</h3>
          </div>
        </div>
      </div>

      {/* Today's Arrivals / Bookings */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Guest Bookings & Desk Queue</h3>
          <button
            onClick={() => onNavigate('checkin')}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Open Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
              <tr>
                <th className="p-3">Booking Code</th>
                <th className="p-3">Guest Name</th>
                <th className="p-3">Assigned Room</th>
                <th className="p-3">Check-In Date</th>
                <th className="p-3">Check-Out Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{b.booking_code}</td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{b.guest_name}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Room {b.room_number}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{b.check_in_date}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{b.check_out_date}</td>
                  <td className="p-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
