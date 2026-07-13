import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BedDouble, Plus, Search, Filter } from 'lucide-react';

export default function RoomManagement() {
    const [rooms, setRooms] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoomDataMatrix();
    }, [search, statusFilter]);

    const fetchRoomDataMatrix = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/rooms?search=${search}&status=${statusFilter}`);
            if (res.data.success) {
                setRooms(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching inventory array mapping datasets.', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Room Inventory Control</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Physical property management grid and live tracking controls</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/10">
                    <Plus className="w-4 h-4" /> Provision New Unit
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by exact room identifier..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-slate-200"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">All Structural States</option>
                        <option value="Available">Available</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="h-48 bg-slate-900/50 border border-slate-800/50 rounded-2xl flex items-center justify-center text-xs font-medium text-slate-500">
                    Querying primary relational array layers...
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900 px-6">
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 pl-6">Room Unit</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Classification Type</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Floor Level</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Base Price Metric</th>
                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 pr-6">Operational Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {rooms.map((room) => (
                                <tr key={room.id} className="hover:bg-slate-800/20 transition-colors">
                                    <td className="p-4 text-xs font-bold text-white pl-6 flex items-center gap-3">
                                        <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><BedDouble className="w-3.5 h-3.5" /></div>
                                        Unit {room.room_number}
                                    </td>
                                    <td className="p-4 text-xs text-slate-300">{room.room_type_name}</td>
                                    <td className="p-4 text-xs text-slate-400">Level {room.floor}</td>
                                    <td className="p-4 text-xs font-medium text-emerald-400">${room.base_price}/night</td>
                                    <td className="p-4 text-xs pr-6">
                                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wide border ${
                                            room.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            room.status === 'Occupied' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                            room.status === 'Cleaning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                        }`}>
                                            {room.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {rooms.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-500 font-medium">No system records matched your filter criteria.</div>
                    )}
                </div>
            )}
        </div>
    );
}