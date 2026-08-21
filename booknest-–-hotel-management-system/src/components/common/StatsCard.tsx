import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  trend?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-100 dark:border-purple-800/40',
  trend
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
      <div>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        {trend && (
          <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/40">
            {trend}
          </span>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

