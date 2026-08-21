import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardStats } from '../../types';
import { OwnerDashboard } from './OwnerDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { ReceptionistDashboard } from './ReceptionistDashboard';
import { HousekeepingDashboard } from './HousekeepingDashboard';
import { MaintenanceDashboard } from './MaintenanceDashboard';

interface Props {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getAnalytics();
        setStats(data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Vlackfie real-time dashboard analytics...</span>
      </div>
    );
  }

  const role = user?.role_name || 'Owner';

  switch (role) {
    case 'Owner':
      return <OwnerDashboard stats={stats} onNavigate={onNavigate} />;
    case 'Manager':
      return <ManagerDashboard stats={stats} onNavigate={onNavigate} />;
    case 'Receptionist':
      return <ReceptionistDashboard stats={stats} onNavigate={onNavigate} />;
    case 'Housekeeping Staff':
      return <HousekeepingDashboard stats={stats} onNavigate={onNavigate} />;
    case 'Maintenance Staff':
      return <MaintenanceDashboard stats={stats} onNavigate={onNavigate} />;
    default:
      return <OwnerDashboard stats={stats} onNavigate={onNavigate} />;
  }
};
