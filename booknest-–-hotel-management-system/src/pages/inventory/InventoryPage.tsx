import React, { useState, useEffect } from 'react';
import { Boxes, Plus, AlertTriangle, ShieldAlert, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { InventoryItem } from '../../types';
import { Modal } from '../../components/common/Modal';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    item_name: '',
    category: 'Toiletries',
    quantity: 50,
    unit: 'pcs',
    min_stock_level: 20,
    cost_per_unit: 2.50
  });

  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState(25);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.getInventory();
      setItems(res.inventory);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addInventory(addForm);
      setIsAddOpen(false);
      fetchInventory();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;
    try {
      await api.updateInventory(activeItem.id, { quantity: activeItem.quantity + restockQty });
      setIsRestockOpen(false);
      fetchInventory();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const lowStockItems = items.filter(i => i.quantity <= (i.min_stock_level ?? i.min_stock_alert ?? 10));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Inventory & Supply Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hotel supplies control, safety threshold warnings, non-negative inventory protection, and restock logs.</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Safety Threshold Alert</h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{lowStockItems.length} inventory items (e.g. {lowStockItems[0].item_name}) have dropped below minimum reorder levels.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
              <tr>
                <th className="p-3">Item Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Stock On Hand</th>
                <th className="p-3">Min Safety Threshold</th>
                <th className="p-3">Unit Cost</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((i) => {
                const minThreshold = i.min_stock_level ?? i.min_stock_alert ?? 10;
                const isLow = i.quantity <= minThreshold;
                return (
                  <tr key={i.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{i.item_name}</td>
                    <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{i.category}</td>
                    <td className="p-3 font-black text-slate-900 dark:text-white text-sm">{i.quantity} {i.unit}</td>
                    <td className="p-3 text-slate-500">{minThreshold} {i.unit}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">৳{(Number(i.cost_per_unit) || 0).toFixed(2)}</td>
                    <td className="p-3">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-bold">Low Stock</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">Optimal</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => { setActiveItem(i); setRestockQty(25); setIsRestockOpen(true); }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Stock Item">
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1">Item Name *</label>
            <input type="text" value={addForm.item_name} onChange={(e) => setAddForm({ ...addForm, item_name: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1">Category</label>
              <select value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl">
                <option value="Toiletries">Toiletries</option>
                <option value="Linens">Linens & Bedding</option>
                <option value="Cleaning Supplies">Cleaning Supplies</option>
                <option value="Maintenance Parts">Maintenance Parts</option>
                <option value="Food & Beverage">Food & Beverage</option>
              </select>
            </div>
            <div>
              <label className="font-bold block mb-1">Unit Type</label>
              <input type="text" value={addForm.unit} onChange={(e) => setAddForm({ ...addForm, unit: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-bold block mb-1">Initial Qty</label>
              <input type="number" min="0" value={addForm.quantity} onChange={(e) => setAddForm({ ...addForm, quantity: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
            </div>
            <div>
              <label className="font-bold block mb-1">Min Threshold</label>
              <input type="number" min="0" value={addForm.min_stock_level} onChange={(e) => setAddForm({ ...addForm, min_stock_level: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
            </div>
            <div>
              <label className="font-bold block mb-1">Unit Cost (৳)</label>
              <input type="number" min="0" step="0.01" value={addForm.cost_per_unit} onChange={(e) => setAddForm({ ...addForm, cost_per_unit: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Add Item</button>
          </div>
        </form>
      </Modal>

      {/* Restock Modal */}
      <Modal isOpen={isRestockOpen} onClose={() => setIsRestockOpen(false)} title={`Restock ${activeItem?.item_name}`}>
        <form onSubmit={handleRestockSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1">Quantity to Add *</label>
            <input type="number" min="1" value={restockQty} onChange={(e) => setRestockQty(Number(e.target.value))} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl" required />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setIsRestockOpen(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Confirm Restock</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
