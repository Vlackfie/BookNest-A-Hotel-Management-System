import React, { useState, useEffect } from 'react';
import { BedDouble, Plus, Search, Filter, Edit, Trash2, Sparkles, Wrench, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Room, RoomType, RoomStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'rooms' | 'types'>('rooms');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    room_number: '',
    room_type_id: 1,
    floor: 1,
    price_per_night: 120,
    status: 'Available' as RoomStatus,
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      let params = '?';
      if (search) params += `search=${encodeURIComponent(search)}&`;
      if (selectedStatus) params += `status=${selectedStatus}&`;
      if (selectedFloor) params += `floor=${selectedFloor}&`;

      const [resRooms, resTypes] = await Promise.all([
        api.getRooms(params),
        api.getRoomTypes()
      ]);

      setRooms(resRooms.rooms);
      setRoomTypes(resTypes.roomTypes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [search, selectedStatus, selectedFloor]);

  const handleOpenModal = (room?: Room) => {
    setError(null);
    if (room) {
      setEditingRoom(room);
      setFormData({
        room_number: room.room_number,
        room_type_id: room.room_type_id,
        floor: room.floor,
        price_per_night: room.price_per_night,
        status: room.status,
        notes: room.notes || ''
      });
    } else {
      setEditingRoom(null);
      setFormData({
        room_number: '',
        room_type_id: roomTypes[0]?.id || 1,
        floor: 1,
        price_per_night: 120,
        status: 'Available',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingRoom) {
        await api.updateRoom(editingRoom.id, formData);
      } else {
        await api.createRoom(formData);
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      setError(err.message || 'Action failed.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRoom) return;
    setDeleteError(null);
    try {
      await api.deleteRoom(deletingRoom.id);
      setDeletingRoom(null);
      fetchRooms();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete room.');
    }
  };

  const handleQuickStatusChange = async (room: Room, newStatus: RoomStatus) => {
    try {
      await api.updateRoom(room.id, { status: newStatus, is_clean: newStatus === 'Available' ? true : room.is_clean });
      fetchRooms();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Ambient background glow accents */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Hero / Header Section */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-purple-950/40 to-slate-900/90 backdrop-blur-md p-6 rounded-2xl border border-purple-500/20 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-emerald-500 via-purple-600 to-blue-600 rounded-2xl shadow-md shadow-purple-500/20 text-white shrink-0">
            <BedDouble className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
                Room Management
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                Live Inventory
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage live room availability, pricing tiers, cleaning status, and room category specs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 p-1 rounded-xl flex gap-1 shadow-inner">
            <button
              onClick={() => setActiveSubTab('rooms')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'rooms'
                  ? 'bg-gradient-to-r from-emerald-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rooms Grid
            </button>
            <button
              onClick={() => setActiveSubTab('types')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'types'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Room Categories
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-purple-600 to-blue-600 hover:from-emerald-400 hover:via-purple-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'rooms' ? (
        <>
          {/* Filters & Search Bar */}
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search room number or type..."
                className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-semibold text-slate-500 dark:text-slate-400">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Dirty">Dirty</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Floor:</span>
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="">All Floors</option>
                  <option value="1">Floor 1</option>
                  <option value="2">Floor 2</option>
                  <option value="3">Floor 3</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rooms Grid Cards with Eye-Catching Effects */}
          {loading ? (
            <div className="p-16 text-center text-xs text-purple-400 font-semibold animate-pulse flex flex-col items-center gap-2">
              <Sparkles className="w-6 h-6 animate-spin" />
              <span>Loading rooms inventory...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="group relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200 dark:border-slate-800/80 hover:border-purple-500/50 rounded-2xl p-4 shadow-md hover:shadow-xl hover:shadow-purple-950/20 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Subtle hover gradient glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xl font-black text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors">
                        Room {room.room_number}
                      </span>
                      <StatusBadge status={room.status} />
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">{room.room_type_name}</p>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          F-{room.floor}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Cap: <span className="font-semibold text-slate-700 dark:text-slate-300">{room.capacity || 2} Persons</span>
                      </p>
                      <div className="pt-1 flex items-baseline gap-1">
                        <span className="text-slate-900 dark:text-white font-black text-base">৳{room.price_per_night}</span>
                        <span className="text-[10px] font-normal text-slate-400">/ night</span>
                      </div>
                    </div>

                    {room.notes && (
                      <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800 line-clamp-2">
                        {room.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="relative z-10 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {(room.status === 'Cleaning' || room.status === 'Dirty') && (
                        <button
                          onClick={() => handleQuickStatusChange(room, 'Available')}
                          title="Mark Clean & Available"
                          className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-lg transition-all text-[11px] font-bold flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" /> Cleaned
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(room)}
                        className="p-1.5 text-slate-400 hover:text-purple-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Room"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setDeleteError(null); setDeletingRoom(room); }}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Room Types Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roomTypes.map((type) => (
            <div
              key={type.id}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-md space-y-3 relative overflow-hidden group hover:border-purple-500/40 transition-all"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-purple-400 transition-colors">
                  {type.name}
                </h3>
                <span className="text-lg font-black bg-gradient-to-r from-emerald-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
                  ৳{type.base_price} <span className="text-xs text-slate-400 font-normal">/ night</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{type.description}</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Included Amenities:
                </span>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{type.amenities}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoom ? `Edit Room ${editingRoom.room_number}` : 'Add New Room'}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl font-semibold">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Room Number *</label>
              <input
                type="text"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                placeholder="e.g. 106"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Room Category *</label>
              <select
                value={formData.room_type_id}
                onChange={(e) => {
                  const typeId = Number(e.target.value);
                  const typeObj = roomTypes.find(t => t.id === typeId);
                  setFormData({ ...formData, room_type_id: typeId, price_per_night: typeObj ? typeObj.base_price : formData.price_per_night });
                }}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
              >
                {roomTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} (৳{t.base_price}/night)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Floor</label>
              <input
                type="number"
                min="1"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Price Per Night (৳) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price_per_night}
                onChange={(e) => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Occupied">Occupied</option>
                <option value="Dirty">Dirty</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Internal Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Special instructions or room specifics..."
              rows={3}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors"
            >
              Save Room
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Room Modal */}
      <Modal isOpen={!!deletingRoom} onClose={() => setDeletingRoom(null)} title="Confirm Room Deletion">
        {deletingRoom && (
          <div className="space-y-4 text-xs">
            {deleteError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl font-semibold">
                {deleteError}
              </div>
            )}

            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-900 dark:text-rose-200">
              <p className="font-bold text-sm">Delete Room {deletingRoom.room_number}?</p>
              <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                Are you sure you want to permanently delete <span className="font-bold">Room {deletingRoom.room_number}</span> ({deletingRoom.room_type_name})?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingRoom(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Confirm Delete Room
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};



