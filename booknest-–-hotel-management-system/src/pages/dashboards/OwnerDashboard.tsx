import React from 'react';
import { BedDouble, DollarSign, Calendar, Users, AlertTriangle, Activity, ArrowUpRight, UserCheck } from 'lucide-react';
import { StatsCard } from '../../components/common/StatsCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DashboardStats } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface Props {
  stats: DashboardStats;
  onNavigate: (tab: string) => void;
}

export const OwnerDashboard: React.FC<Props> = ({ stats, onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-emerald-950/80 via-purple-950/80 to-slate-900 p-6 rounded-2xl border border-purple-800/40 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-400/30 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              <span>Owner & Chief Executive</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Welcome back, {user?.full_name || 'Sadikul Hossain'}!</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Vlackfie International Hotel HMS real-time analytics hub. Overviewing gross revenue, occupancy rates, and cross-departmental operations.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-purple-600 to-blue-600 hover:from-emerald-400 hover:via-purple-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4" />
            <span>Financial Reports</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Gross Revenue"
          value={`৳${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="All processed stay payments"
          icon={DollarSign}
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          trend={stats.totalRevenue > 0 ? 'Active Revenue' : 'Initial Zero Balance'}
        />
        <StatsCard
          title="Room Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          subtitle={`${stats.occupiedRooms} of ${stats.totalRooms} rooms occupied`}
          icon={BedDouble}
          color="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
        />
        <StatsCard
          title="Monthly Bookings"
          value={stats.monthlyBookingsCount}
          subtitle="Confirmed reservations"
          icon={Calendar}
          color="bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400"
        />
        <StatsCard
          title="Active Workforce"
          value={stats.employeeCount}
          subtitle="Across 5 departments"
          icon={Users}
          color="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue & Bookings Monthly Growth</h3>
              <p className="text-xs text-slate-500">Historical performance breakdown</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
              Upward Trend
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueByMonth}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Status Donut Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time Room Status</h3>
            <p className="text-xs text-slate-500">Live room inventory state</p>
          </div>
          <div className="h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.roomStatusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.roomStatusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {stats.roomStatusBreakdown.map((st) => (
              <div key={st.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }}></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">{st.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{st.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">System Activity & Audit Trail</h3>
          </div>
          <button
            onClick={() => onNavigate('system')}
            className="text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>View All Logs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {stats.recentActivities.map((act) => (
            <div key={act.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 dark:text-white">{act.username}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                  {act.module}
                </span>
                <span className="text-slate-600 dark:text-slate-400">{act.action} - {act.details}</span>
              </div>
              <span className="text-[10px] text-slate-400">{act.created_at}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function BarChartIcon(props: any) {
  return <Activity {...props} />;
}
