import React from 'react';
import { Users, AlertCircle, Wrench, ShieldAlert, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { StatsCard } from '../../components/common/StatsCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DashboardStats } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  stats: DashboardStats;
  onNavigate: (tab: string) => void;
}

export const ManagerDashboard: React.FC<Props> = ({ stats, onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl border border-blue-900/50 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-400/30 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              <span>General Hotel Manager</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back, {user?.full_name || 'Prosenjeet'}!</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Operational oversight, staff coordination, inventory warnings, and reservation management.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Rooms"
          value={stats.totalRooms}
          subtitle={`${stats.availableRooms} Available | ${stats.occupiedRooms} Occupied`}
          icon={Users}
          color="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
        />
        <StatsCard
          title="Pending Maintenance"
          value={stats.pendingMaintenanceCount}
          subtitle="Open repair tickets"
          icon={Wrench}
          color="bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={stats.lowStockAlertsCount}
          subtitle="Items below min threshold"
          icon={AlertCircle}
          color="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
        />
        <StatsCard
          title="Active Staff"
          value={stats.employeeCount}
          subtitle="Employees registered"
          icon={Sparkles}
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
        />
      </div>

      {/* Action Required Banners */}
      {stats.lowStockAlertsCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Inventory Alert Triggered</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{stats.lowStockAlertsCount} stock items have dropped below safety thresholds. Restock immediately.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
          >
            Manage Inventory
          </button>
        </div>
      )}

      {/* Recent Bookings & Quick Management */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Guest Reservations</h3>
          <button
            onClick={() => onNavigate('bookings')}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>All Reservations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Guest</th>
                <th className="p-3">Room</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">{b.booking_code}</td>
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{b.guest_name}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">Room {b.room_number} ({b.room_type_name})</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{b.check_in_date} to {b.check_out_date}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">৳{b.total_amount.toFixed(2)}</td>
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
