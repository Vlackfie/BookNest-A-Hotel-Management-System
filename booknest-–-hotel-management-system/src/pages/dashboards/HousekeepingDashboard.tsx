import React from 'react';
import { Sparkles, CheckCircle2, Clock, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DashboardStats } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  stats: DashboardStats;
  onNavigate: (tab: string) => void;
}

export const HousekeepingDashboard: React.FC<Props> = ({ stats, onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-linear-to-r from-slate-900 via-purple-950 to-slate-900 p-6 rounded-2xl border border-purple-900/50 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-400/30 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              <span>Head Housekeeper</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back, {user?.full_name || 'Tanvir'}!</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Assigned room cleaning schedules, turn-around tracking, and damage reporting.
          </p>
        </div>

        <button
          onClick={() => onNavigate('housekeeping')}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Housekeeping Schedule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Rooms Needing Cleaning</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.cleaningRooms}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Clean & Ready Rooms</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.availableRooms}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Maintenance Hold</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.maintenanceRooms}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rooms Requiring Immediate Cleaning</h3>
          <button
            onClick={() => onNavigate('housekeeping')}
            className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Update Room Status</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          When a guest checks out, the system automatically sets the room status to <strong>Cleaning</strong>.
          Housekeeping staff can update the status to <strong>Completed</strong> to make it immediately <strong>Available</strong> for new bookings.
        </p>
      </div>
    </div>
  );
};



