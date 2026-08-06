import React from 'react';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  CalendarCheck,
  KeyRound,
  CreditCard,
  UserCheck,
  Sparkles,
  Wrench,
  Boxes,
  ConciergeBell,
  BarChart3,
  Settings,
  FileCode2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user } = useAuth();
  const role = user?.role_name || 'Owner';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Operations', roles: ['Owner', 'Manager', 'Receptionist', 'Housekeeping Staff', 'Maintenance Staff'] },
    { id: 'rooms', label: 'Room Management', icon: BedDouble, category: 'Operations', roles: ['Owner', 'Manager', 'Receptionist', 'Housekeeping Staff', 'Maintenance Staff'] },
    { id: 'bookings', label: 'Reservations', icon: CalendarCheck, category: 'Operations', roles: ['Owner', 'Manager', 'Receptionist'] },
    { id: 'checkin', label: 'Check-In / Out Desk', icon: KeyRound, category: 'Operations', roles: ['Owner', 'Manager', 'Receptionist'] },
    { id: 'guests', label: 'Guest Directory', icon: Users, category: 'Operations', roles: ['Owner', 'Manager', 'Receptionist'] },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard, category: 'Admin', roles: ['Owner', 'Manager', 'Receptionist'] },
    { id: 'employees', label: 'Employee Directory', icon: UserCheck, category: 'Admin', roles: ['Owner', 'Manager'] },
    { id: 'housekeeping', label: 'Housekeeping', icon: Sparkles, category: 'Admin', roles: ['Owner', 'Manager', 'Housekeeping Staff'] },
    { id: 'maintenance', label: 'Maintenance Hub', icon: Wrench, category: 'Admin', roles: ['Owner', 'Manager', 'Maintenance Staff'] },
    { id: 'inventory', label: 'Inventory Control', icon: Boxes, category: 'Admin', roles: ['Owner', 'Manager', 'Housekeeping Staff', 'Maintenance Staff'] },
    { id: 'services', label: 'Hotel Services', icon: ConciergeBell, category: 'Admin', roles: ['Owner', 'Manager', 'Receptionist'] },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3, category: 'Admin', roles: ['Owner', 'Manager'] },
    { id: 'system', label: 'System & Audit Logs', icon: Settings, category: 'System', roles: ['Owner'] },
    { id: 'docs', label: 'SQL Architecture', icon: FileCode2, category: 'System', roles: ['Owner', 'Manager', 'Receptionist', 'Housekeeping Staff', 'Maintenance Staff'] }
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(role));

  const operationsItems = filteredItems.filter(i => i.category === 'Operations');
  const adminItems = filteredItems.filter(i => i.category === 'Admin');
  const systemItems = filteredItems.filter(i => i.category === 'System');

  const getInitials = (name?: string) => {
    if (!name) return 'JD';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const renderNavGroup = (title: string, items: typeof menuItems) => {
    if (items.length === 0) return null;
    return (
      <div key={title} className="mb-3">
        <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-3 py-2">
          {title}
        </div>
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/15 via-purple-500/15 to-blue-500/15 text-emerald-300 font-bold border-r-2 border-emerald-400 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-purple-400" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col border-r border-slate-800 shrink-0 select-none">
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="relative p-1 bg-slate-950 rounded-xl border border-purple-500/30 shrink-0">
          <img
            src="/logo.jpg"
            alt="BookNest Logo"
            className="w-8 h-8 object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h1 className="text-white font-extrabold text-lg tracking-tight leading-none bg-gradient-to-r from-emerald-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
            BookNest
          </h1>
          <span className="text-[9px] uppercase font-bold text-purple-400 tracking-wider block mt-0.5">Hotel Management System</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto custom-scrollbar">
        {renderNavGroup('Operations', operationsItems)}
        {renderNavGroup('Admin', adminItems)}
        {renderNavGroup('System', systemItems)}
      </nav>

      {/* User Footer Card */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 via-purple-600 to-blue-600 flex items-center justify-center text-xs font-extrabold text-white shrink-0 shadow-md">
            {getInitials(user?.full_name)}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'System User'}</p>
            <p className="text-[10px] text-purple-300/80 font-medium truncate">{role}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
        </div>
      </div>
    </aside>
  );
};

