import React from 'react';
import { Wrench, AlertCircle, CheckCircle2, DollarSign, ArrowRight, UserCheck } from 'lucide-react';
import { DashboardStats } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  stats: DashboardStats;
  onNavigate: (tab: string) => void;
}

export const MaintenanceDashboard: React.FC<Props> = ({ stats, onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-linear-to-r from-slate-900 via-rose-950 to-slate-900 p-6 rounded-2xl border border-rose-900/50 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-400/30 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              <span>Lead Maintenance Technician</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back, {user?.full_name || 'Tawhid Sharihar'}!</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            View assigned equipment repair tickets, priority levels, repair costs, and task completion.
          </p>
        </div>

        <button
          onClick={() => onNavigate('maintenance')}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <Wrench className="w-4 h-4" />
          <span>Open Repair Tickets</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Open Tickets</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingMaintenanceCount}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Rooms In Maintenance</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.maintenanceRooms}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Operational Rooms</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalRooms - stats.maintenanceRooms}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Business Rule Mandate</h3>
          <button
            onClick={() => onNavigate('maintenance')}
            className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Assign & Repair Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <p className="font-bold text-slate-900 dark:text-white">⚙️ Business Rule #9 Enforcement:</p>
          <p>Every maintenance request must be explicitly assigned to an employee before it can be marked as <strong>Completed</strong>. Upon completion, the room is released back to the cleaning queue.</p>
        </div>
      </div>
    </div>
  );
};



