import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardLayout } from './components/layout/DashboardLayout';

import { DashboardView } from './pages/dashboards/DashboardView';
import { RoomsPage } from './pages/rooms/RoomsPage';
import { GuestsPage } from './pages/guests/GuestsPage';
import { BookingsPage } from './pages/bookings/BookingsPage';
import { CheckInDeskPage } from './pages/checkin/CheckInDeskPage';
import { PaymentsPage } from './pages/payments/PaymentsPage';
import { EmployeesPage } from './pages/employees/EmployeesPage';
import { HousekeepingPage } from './pages/housekeeping/HousekeepingPage';
import { MaintenancePage } from './pages/maintenance/MaintenancePage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { HotelServicesPage } from './pages/services/HotelServicesPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SystemAdminPage } from './pages/system/SystemAdminPage';
import { SystemDocsPage } from './pages/docs/SystemDocsPage';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-xs font-bold">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Initializing Vlackfie International Hotel System...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout>
      {(currentTab, setCurrentTab) => {
        switch (currentTab) {
          case 'dashboard':
            return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
          case 'rooms':
            return <RoomsPage />;
          case 'guests':
            return <GuestsPage />;
          case 'bookings':
            return <BookingsPage />;
          case 'checkin':
            return <CheckInDeskPage />;
          case 'payments':
            return <PaymentsPage />;
          case 'employees':
            return <EmployeesPage />;
          case 'housekeeping':
            return <HousekeepingPage />;
          case 'maintenance':
            return <MaintenancePage />;
          case 'inventory':
            return <InventoryPage />;
          case 'services':
            return <HotelServicesPage />;
          case 'reports':
            return <ReportsPage />;
          case 'system':
            return <SystemAdminPage />;
          case 'docs':
            return <SystemDocsPage />;
          default:
            return <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />;
        }
      }}
    </DashboardLayout>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
