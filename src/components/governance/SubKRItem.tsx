import React from 'react';
import { SubKR } from '@/types';

interface SubKRItemProps {
  subKr: SubKR;
  isLocked: boolean;
  onUpdateProgress: (id: string, progress: number) => void;
}

export const SubKRItem: React.FC<SubKRItemProps> = ({ subKr, isLocked, onUpdateProgress }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 mb-2">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-slate-700">{subKr.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${subKr.progress}%` }} 
            />
          </div>
          <span className="text-xs text-slate-500 font-mono">{subKr.progress}%</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input 
          type="number" 
          disabled={isLocked}
          className="w-16 p-1 text-xs border rounded text-right bg-white disabled:bg-slate-100"
          value={subKr.progress}
          onChange={(e) => onUpdateProgress(subKr.id, parseFloat(e.target.value) || 0)}
        />
        <span className="text-xs text-slate-400">wt: {subKr.weight}</span>
      </div>
    </div>
  );
};