import React from 'react';
import { Objective } from '@/types';

interface ObjectiveCardProps {
  objective: Objective;
  isLocked: boolean;
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, isLocked }) => {
  return (
    <div className={`p-8 rounded-2xl border-2 transition-all duration-500 ${
      isLocked ? 'bg-slate-50 border-slate-200' : 'bg-white border-primary-100 shadow-sm'
    }`}>
      {isLocked && (
        <div className="flex justify-end mb-4">
          <div className="px-3 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg uppercase tracking-widest">
            Locked after Month 1
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black rounded-lg uppercase tracking-widest border border-primary-100">
              {objective.quarter} {objective.year}
            </span>
            <span className={`text-xs font-medium ${isLocked ? 'text-slate-400' : 'text-green-600'}`}>
              {isLocked ? '● Locked' : '● Active'}
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{objective.title}</h1>
          <p className="text-slate-500 font-medium max-w-3xl leading-relaxed text-sm">{objective.description}</p>
        </div>
        
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200 min-w-[200px]">
          <span className="text-xs font-bold text-slate-400 uppercase mb-2">Objective Progress</span>
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle 
                cx="48" cy="48" r="40" 
                stroke="currentColor" strokeWidth="8" 
                fill="transparent" className="text-slate-200" 
              />
              <circle 
                cx="48" cy="48" r="40" 
                stroke="currentColor" strokeWidth="8" 
                fill="transparent" 
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * objective.progress) / 100}
                className="text-primary-600 transition-all duration-1000 ease-out" 
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-2xl font-black text-slate-800">{Math.round(objective.progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};