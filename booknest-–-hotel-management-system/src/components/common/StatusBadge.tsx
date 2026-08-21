import React from 'react';

interface StatusBadgeProps {
  status?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status = '' }) => {
  const safeStatus = status ? String(status) : '';
  const getStyle = (st: string) => {
    switch ((st || '').toLowerCase()) {
      case 'available':
      case 'confirmed':
      case 'active':
      case 'completed':
      case 'present':
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60';
      case 'occupied':
      case 'checked-in':
      case 'in progress':
      case 'urgent':
      case 'high':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60';
      case 'reserved':
      case 'pending':
      case 'open':
      case 'assigned':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/60';
      case 'cleaning':
      case 'dirty':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60';
      case 'maintenance':
      case 'cancelled':
      case 'absent':
      case 'refunded':
      case 'terminated':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md border ${getStyle(safeStatus)} inline-flex items-center gap-1.5 whitespace-nowrap`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      {safeStatus || 'N/A'}
    </span>
  );
};




