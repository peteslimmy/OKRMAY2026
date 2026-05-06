import React from 'react';
import { Scale, Settings2, History, Target, Download, ChevronRight, ShieldAlert } from 'lucide-react';

interface IntegrityHeaderProps {
  activeTab: 'audit' | 'config' | 'history';
  onTabChange: (tab: 'audit' | 'config' | 'history') => void;
}

export const IntegrityHeader: React.FC<IntegrityHeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <Target size={12} className="text-primary-600" />
          <span>Governance Architecture</span>
          <ChevronRight size={10} className="text-slate-300" />
          <span className="text-primary-600">Integrity Protocol</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg shadow-primary-500/20">
               <ShieldAlert size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Integrity Engine</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-xl">
            Enforce behavioral compliance and tactical accuracy across the OKR ecosystem with systemic disciplinary logic.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {[
            { id: 'audit', label: 'Tactical Audit', icon: <Scale size={14} /> },
            { id: 'config', label: 'Logic Config', icon: <Settings2 size={14} /> },
            { id: 'history', label: 'Audit Trail', icon: <History size={14} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id as 'audit' | 'config' | 'history')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === t.id 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => alert("Report Exported")}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-95"
        >
          <Download size={16} /> Export Governance Data
        </button>
      </div>
    </div>
  );
};