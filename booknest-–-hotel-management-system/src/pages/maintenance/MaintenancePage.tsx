import React, { useState, useEffect } from 'react';
import { Wrench, Plus, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';
import { Maintenance, Room, Employee } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const MaintenancePage: React.FC = () => {
  const [tickets, setTickets] = useState<Maintenance[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // New Ticket Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    room_id: 0,
    issue_description: '',
    priority: 'Medium'
  });

  // Assign / Complete Ticket Modal state
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<Maintenance | null>(null);
  const [actionData, setActionData] = useState({
    assigned_to: 0,
    status: 'In Progress',
    cost: 0,
    resolution_notes: ''
  });
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resMaint, resRooms, resEmp] = await Promise.all([
        api.getMaintenance(),
        api.getRooms(),
        api.getEmployees()
      ]);
      setTickets(resMaint.tickets);
      setRooms(resRooms.rooms);
      const maintStaff = resEmp.employees.filter(e => e.department === 'Maintenance' || e.role_name === 'Maintenance Staff');
      setEmployees(maintStaff.length > 0 ? maintStaff : resEmp.employees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createMaintenance(formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenAction = (t: Maintenance) => {
    setActiveTicket(t);
    setError(null);
    setActionData({
      assigned_to: t.assigned_employee_id || t.assigned_to || employees[0]?.id || 0,
      status: t.status === 'Open' ? 'In Progress' : t.status,
      cost: t.repair_cost || t.cost || 50,
      resolution_notes: t.resolution_notes || 'Inspected and repaired issue.'
    });
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket) return;
    setError(null);

    // Business Rule #9 Enforcement
    if (actionData.status === 'Completed' && !actionData.assigned_to) {
      setError('⚠️ Business Rule #9 Failure: Maintenance tickets must be assigned to an employee before completing.');
      return;
    }

    try {
      await api.updateMaintenance(activeTicket.id, {
        ...actionData,
        assigned_employee_id: actionData.assigned_to,
        repair_cost: actionData.cost
      });
      setIsActionModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Maintenance Hub & Repair Tickets</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Report equipment defects, assign technician tickets, track repair costs, and release rooms back to service.</p>
        </div>

        <button
          onClick={() => { setFormData({ room_id: rooms[0]?.id || 0, issue_description: 'Air Conditioning thermostat malfunction', priority: 'High' }); setIsModalOpen(true); }}
          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Report Maintenance Issue</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
              <tr>
                <th className="p-3">Room</th>
                <th className="p-3">Issue Description</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Assigned Technician</th>
                <th className="p-3">Repair Cost</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">Room {t.room_number}</td>
                  <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">{t.issue_description}</td>
                  <td className="p-3"><StatusBadge status={t.priority} /></td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{t.assigned_employee_name || t.employee_name || 'Unassigned'}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">৳{(Number(t.cost) || 0).toFixed(2)}</td>
                  <td className="p-3"><StatusBadge status={t.status} /></td>
                  <td className="p-3 text-right">
                    {t.status !== 'Completed' && (
                      <button
                        onClick={() => handleOpenAction(t)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <Wrench className="w-3 h-3" /> Update Ticket
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Maintenance Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report Maintenance Issue">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1">Room *</label>
            <select
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>Room {r.room_number} ({r.room_type_name})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold block mb-1">Issue Description *</label>
            <textarea
              value={formData.issue_description}
              onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              placeholder="Detail broken equipment or repair required..."
              rows={3}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              required
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Priority Level</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority (Urgent)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold">Submit Ticket</button>
          </div>
        </form>
      </Modal>

      {/* Update / Assign Ticket Modal */}
      <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} title={`Update Ticket - Room ${activeTicket?.room_number}`}>
        <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl font-semibold">{error}</div>}

          <div>
            <label className="font-bold block mb-1">Assign Maintenance Technician *</label>
            <select
              value={actionData.assigned_to}
              onChange={(e) => setActionData({ ...actionData, assigned_to: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            >
              <option value={0}>-- Unassigned --</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">Ticket Status</label>
              <select
                value={actionData.status}
                onChange={(e) => setActionData({ ...actionData, status: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1">Parts & Labor Cost (৳)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={actionData.cost}
                onChange={(e) => setActionData({ ...actionData, cost: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">Resolution Notes</label>
            <textarea
              value={actionData.resolution_notes}
              onChange={(e) => setActionData({ ...actionData, resolution_notes: e.target.value })}
              rows={2}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsActionModalOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
