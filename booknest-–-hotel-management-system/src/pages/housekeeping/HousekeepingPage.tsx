import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { Housekeeping, Room, Employee } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const HousekeepingPage: React.FC = () => {
  const [schedules, setSchedules] = useState<Housekeeping[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    room_id: 0,
    housekeeper_id: 0,
    scheduled_date: new Date().toISOString().split('T')[0],
    notes: 'Routine turnover cleaning'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resHk, resRooms, resEmp] = await Promise.all([
        api.getHousekeeping(),
        api.getRooms(),
        api.getEmployees()
      ]);
      setSchedules(resHk.schedules);
      setRooms(resRooms.rooms);
      const hkEmployees = resEmp.employees.filter(e => e.department === 'Housekeeping' || e.role_name === 'Housekeeping Staff');
      setEmployees(hkEmployees.length > 0 ? hkEmployees : resEmp.employees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedEmpId = Number(formData.housekeeper_id) || employees[0]?.id || 0;
      const selectedRoomId = Number(formData.room_id) || rooms[0]?.id || 0;
      await api.assignHousekeeping({
        ...formData,
        room_id: selectedRoomId,
        housekeeper_id: selectedEmpId,
        assigned_employee_id: selectedEmpId
      });
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.updateHousekeepingStatus(id, { status });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Housekeeping Schedule & Turnover</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Assign room turnover tasks, track cleaning progress, and update room cleanliness status.</p>
        </div>

        <button
          onClick={() => {
            setFormData({
              room_id: rooms[0]?.id || 0,
              housekeeper_id: employees[0]?.id || 0,
              scheduled_date: new Date().toISOString().split('T')[0],
              notes: 'Routine turnover cleaning'
            });
            setIsModalOpen(true);
          }}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Cleaning Task</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
              <tr>
                <th className="p-3">Room</th>
                <th className="p-3">Assigned Housekeeper</th>
                <th className="p-3">Scheduled Date</th>
                <th className="p-3">Cleaning Status</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {schedules.map((hk) => (
                <tr key={hk.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">Room {hk.room_number}</td>
                  <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">{hk.housekeeper_name || hk.employee_name || 'Unassigned'}</td>
                  <td className="p-3 text-slate-500">{hk.scheduled_date}</td>
                  <td className="p-3"><StatusBadge status={hk.status} /></td>
                  <td className="p-3 text-slate-500">{hk.notes}</td>
                  <td className="p-3 text-right">
                    {hk.status !== 'Completed' && (
                      <button
                        onClick={() => handleUpdateStatus(hk.id, 'Completed')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <CheckCircle className="w-3 h-3" /> Mark Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Cleaning Task">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1">Room *</label>
            <select
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>Room {r.room_number} ({r.status})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1">Housekeeper *</label>
            <select
              value={formData.housekeeper_id}
              onChange={(e) => setFormData({ ...formData, housekeeper_id: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1">Scheduled Date</label>
            <input
              type="date"
              value={formData.scheduled_date ? String(formData.scheduled_date).slice(0, 10) : ''}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold">Assign Task</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};



