import React, { useState } from 'react';
import { User as UserIcon, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden select-none">
      {/* Ambient Glowing Blur Spheres (Green, Purple, Blue) */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-purple-950/50">
        
        {/* Left Branding & Visual Section */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
                BookNest
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 uppercase tracking-widest">
                v2.5 Live
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest font-bold text-purple-400/90 mt-1">
              Hotel Management Portal
            </p>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed font-normal">
            Effortless property operations. Manage rooms, guest check-ins, overlapping reservation protection, housekeeping, and real-time financial logs in one unified dashboard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {[
              { text: 'Role-Based Authorization', color: 'text-emerald-400' },
              { text: 'Double-Booking Prevention', color: 'text-purple-400' },
              { text: 'Express Key Card Check-In', color: 'text-blue-400' },
              { text: 'Real-Time Financial Reports', color: 'text-teal-400' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/40 backdrop-blur-md rounded-xl border border-white/5 text-xs text-slate-200"
              >
                <CheckCircle2 className={`w-4 h-4 ${item.color} shrink-0`} />
                <span className="font-medium truncate">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Glass Authentication Form Card */}
        <div className="lg:col-span-6 bg-slate-950/70 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Sign In to Hotel Portal
              </h2>
              <p className="text-xs text-slate-400 mt-1">Enter your account credentials to continue.</p>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl text-xs text-white placeholder-slate-500 transition-all outline-none"
                    placeholder="e.g. owner@booknest.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl text-xs text-white placeholder-slate-500 transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 via-purple-600 to-blue-600 hover:from-emerald-400 hover:via-purple-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};




