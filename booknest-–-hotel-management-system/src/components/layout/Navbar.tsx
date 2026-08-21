import React from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { NotificationDropdown } from '../common/NotificationDropdown';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded border border-emerald-200/60 dark:border-emerald-800/60 uppercase tracking-wide">
            System Live
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            Vlackfie International Hotel
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationDropdown />

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.full_name}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
              {user?.role_name}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

