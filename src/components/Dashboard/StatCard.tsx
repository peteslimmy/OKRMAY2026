import React from 'react';
import { DeltaBadge } from './DeltaBadge';

interface StatCardProps {
  bgColor: string;
  icon: React.ReactNode;
  title?: string;
  value?: string | number;
  subtitle?: string;
  delta?: number;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  bgColor, 
  icon, 
  title, 
  value, 
  subtitle, 
  delta 
}) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
    <div 
      className="w-12 h-12 rounded-xl text-white flex justify-center items-center shrink-0" 
      style={{ backgroundColor: bgColor }}
    >
      {icon}
    </div>
    <div className="flex-1 flex flex-col justify-center text-right">
      {value !== undefined && (
        <div className="flex items-center justify-end gap-2">
          <div className="text-2xl font-bold text-slate-900 leading-none">{value}</div>
          {delta !== undefined && delta !== 0 && (
            <DeltaBadge delta={delta} label="vs LW" size="sm" />
          )}
        </div>
      )}
      {title && (
        <div className="flex items-center gap-2 text-slate-800 font-medium text-sm">
          {title}
        </div>
      )}
      {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
    </div>
  </div>
);