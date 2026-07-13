import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BedDouble, LogOut, UserCheck } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex bg-slate-950 text-slate-100">
            {/* Structural Navigation Sidebar Control Matrix */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
                <div>
                    <div className="h-16 flex items-center px-6 border-b border-slate-800">
                        <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">BookNest Core</span>
                    </div>
                    <nav className="p-4 space-y-1">
                        <a href="#dashboard" className="flex items-center gap-3 px-4 py-3 bg-slate-800 text-indigo-400 rounded-xl text-sm font-medium">
                            <LayoutDashboard className="w-4 h-4" /> System Dashboard
                        </a>
                        <a href="#rooms" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl text-sm font-medium transition-all">
                            <BedDouble className="w-4 h-4" /> Room Configurations
                        </a>
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase">
                            {user?.role[0]}
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">{user?.email}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{user?.role}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-semibold py-2.5 rounded-xl transition-all"
                    >
                        <LogOut className="w-3.5 h-3.5" /> Disconnect Session
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-8 flex items-center justify-between">
                    <h1 className="text-sm font-bold tracking-tight text-slate-300">Operational Workspace Engine</h1>
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                        <UserCheck className="w-3.5 h-3.5" /> Node Cluster Verified
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8">{children}</main>
            </div>
        </div>
    );
}