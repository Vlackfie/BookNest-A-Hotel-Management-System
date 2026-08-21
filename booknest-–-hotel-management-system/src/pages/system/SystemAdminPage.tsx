import React, { useState, useEffect } from 'react';
import { Settings, Activity, Download, Database, ShieldCheck, Check } from 'lucide-react';
import { api } from '../../services/api';
import { ActivityLog, SystemSetting } from '../../types';

export const SystemAdminPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'settings'>('logs');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resLogs, resSet] = await Promise.all([
        api.getActivityLogs(),
        api.getSettings()
      ]);
      setLogs(resLogs.logs);
      setSettings(resSet.settings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.setting_key === key ? { ...s, setting_value: value } : s));
  };

  const handleSaveSettings = async () => {
    try {
      await api.updateSettings(settings);
      alert('System configuration updated successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBackupDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ logs, settings, timestamp: new Date().toISOString() }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Vlackfie_System_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">System Administration & Audit Logs</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Audit Trail logs, system policies, tax rate configuration, and database JSON export/backup.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'logs' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Audit Trail
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
            >
              System Config
            </button>
          </div>

          <button
            onClick={handleBackupDownload}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Backup</span>
          </button>
        </div>
      </div>

      {activeTab === 'logs' ? (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold uppercase">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 text-slate-500">{l.created_at}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{l.username || 'System'}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 font-bold">{l.module}</span></td>
                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{l.action}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{l.details}</td>
                    <td className="p-3 text-slate-400">{l.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Global System Parameters</h3>
              <p className="text-xs text-slate-500">Modify system-wide policies, currency, and tax parameters.</p>
            </div>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {settings.map((s) => (
              <div key={s.id} className="space-y-1">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">{s.setting_key.replace(/_/g, ' ').toUpperCase()}</label>
                <input
                  type="text"
                  value={s.setting_value}
                  onChange={(e) => handleSettingChange(s.setting_key, e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono"
                />
                {s.description && <p className="text-[10px] text-slate-400">{s.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
