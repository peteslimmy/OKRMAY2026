import React from 'react';
import { KeyResult, SubKR } from '@/types';
import { SubKRItem } from './SubKRItem';

interface KRCardProps {
  kr: KeyResult;
  subKrs: SubKR[];
  isLocked: boolean;
  onUpdateSubKR: (subKrId: string, progress: number) => void;
}

export const KRCard: React.FC<KRCardProps> = ({ kr, subKrs, isLocked, onUpdateSubKR }) => {
  const statusColor = {
    Green: 'bg-green-500',
    Amber: 'bg-amber-500',
    Red: 'bg-red-500',
  }[kr.status];

  return (
    <div className="flex flex-col p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1 block">{kr.kr_slot}</span>
          <h3 className="text-lg font-black text-slate-900 leading-tight tracking-tight">{kr.title}</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-white text-xs font-bold ${statusColor}`}>
          {kr.status}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-500 font-medium">Overall Progress</span>
          <span className="text-sm font-bold text-slate-700">{kr.progress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full shadow-inner ${statusColor}`} 
            style={{ width: `${kr.progress}%` }} 
          />
        </div>
      </div>

      <div className="flex-1">
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3 tracking-tight">Sub-Key Results</h4>
        <div className="space-y-2">
          {subKrs.map(subKr => (
            <SubKRItem 
              key={subKr.id} 
              subKr={subKr} 
              isLocked={isLocked} 
              onUpdateProgress={onUpdateSubKR} 
            />
          ))}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <span className="text-[10px] text-slate-400">Version {kr.version}</span>
        <span className="text-[10px] text-slate-400 italic">Updated {new Date(kr.updated_at || '').toLocaleDateString()}</span>
      </div>
    </div>
  );
};