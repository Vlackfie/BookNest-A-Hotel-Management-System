import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Calendar, PieChart as PieIcon } from 'lucide-react';
import { api } from '../../services/api';
import { DashboardStats } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

export const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getAnalytics();
        setStats(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !stats) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading reporting analytics engine...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Reporting & Business Analytics</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comprehensive financial reports, occupancy rates, monthly booking trends, and revenue distribution.</p>
      </div>

      {/* Summary Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Total Revenue</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">৳{(Number(stats.totalRevenue) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 inline-block">
            {stats.totalRevenue > 0 ? 'Recorded Payments Total' : 'Initial Zero Revenue Balance'}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Occupancy</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.occupancyRate}%</h2>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1 inline-block">{stats.occupiedRooms} / {stats.totalRooms} Rooms Occupied</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bookings Recorded</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.monthlyBookingsCount}</h2>
          <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1 inline-block">Active & Completed Stays</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Revenue Performance (৳)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueByMonth}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room Status Breakdown Donut */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inventory Status Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.roomStatusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
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
        </div>
      </div>
    </div>
  );
};
