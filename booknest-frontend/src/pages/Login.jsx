import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShieldCheck, Lock, Mail } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data.success) {
                login(res.data.user, res.data.accessToken);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication baseline mapping fault.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 mb-3">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">BookNest Gateway</h2>
                    <p className="text-sm text-slate-400 mt-1">Enterprise Core Hotel Management Platform</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Corporate Identity Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                            <input 
                                type="email" 
                                required 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="name@booknest.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Security Access Token passphrase</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                            <input 
                                type="password" 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center"
                    >
                        {loading ? 'Validating Signatures...' : 'Establish Secure Connection'}
                    </button>
                </form>
            </div>
        </div>
    );
}