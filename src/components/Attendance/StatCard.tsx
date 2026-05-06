import React from 'react';
import { ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  trend?: { value: string; up: boolean };
  rating?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, suffix, trend, rating }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{title}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
      {suffix && <span className="text-slate-400 text-sm font-medium">{suffix}</span>}
      {trend && (
        <span className={`flex items-center gap-0.5 text-xs font-bold ${trend.up ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend.value}
        </span>
      )}
    </div>
    {rating !== undefined && (
      <div className="flex gap-0.5 mt-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={12} fill={s <= Math.floor(rating) ? "#f59e0b" : "transparent"} className={s <= Math.floor(rating) ? "text-amber-500" : "text-slate-200"} />
        ))}
      </div>
    )}
  </div>
);