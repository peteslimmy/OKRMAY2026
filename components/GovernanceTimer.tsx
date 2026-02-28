
import React, { useState, useEffect } from 'react';
import { Clock, Lock, CheckCircle2, CalendarDays, ShieldAlert, Zap, Radio } from 'lucide-react';
import { getLockState, getWATTime, formatDateWAT, getCurrentWeekRange, logAudit, getGovernanceConfig } from '../utils';

export const GovernanceTimer: React.FC = () => {
  const [watTime, setWatTime] = useState<string>("Loading, 00:00:00");
  const [lockState, setLockState] = useState(getLockState());
  const [weekRange, setWeekRange] = useState("");

  useEffect(() => {
    setWeekRange(getCurrentWeekRange());
    
    let lastCheckMinute = -1;

    const handleUpdate = () => {
      setLockState(getLockState());
    };

    window.addEventListener('4COREGovernanceUpdate', handleUpdate);

    const timer = setInterval(() => {
      const now = getWATTime();
      setWatTime(formatDateWAT(now));
      const currentLock = getLockState();
      setLockState(currentLock);

      const day = now.getDay();
      const hour = now.getHours();
      const minute = now.getMinutes();

      if (minute !== lastCheckMinute) {
        lastCheckMinute = minute;
      }

    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('4COREGovernanceUpdate', handleUpdate);
    };
  }, []);

  const timeSegments = watTime.split(', ');
  const displayDate = timeSegments[0] || "Invalid Date";
  const displayTime = timeSegments[1] || "--:--:--";

  return (
    <div className="flex items-center bg-white/80 backdrop-blur-md rounded-[4px] shadow-sm border border-white/40 divide-x divide-slate-200">
      {/* Reporting Cycle Section */}
      <div className="hidden xl:flex flex-col items-start px-3 py-1.5 bg-slate-50/50 rounded-l-2xl">
         <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mb-0.5 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> Reporting Cycle
         </span>
         <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">{weekRange}</span>
      </div>

      {/* WAT Time Section */}
      <div className="flex flex-col items-center justify-center px-4 py-1 relative">
        <div className="absolute top-2 right-2 flex items-center gap-1">
           <Radio size={8} className="text-emerald-500 animate-pulse" />
           <span className="text-[7px] font-black text-emerald-600 uppercase tracking-tighter">Live</span>
        </div>
        <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mb-0.5">WAT Time</span>
        <span className="text-2xl font-mono font-bold text-primary-600 leading-none tracking-tight">{displayTime}</span>
        <span className="text-[10px] text-slate-500 font-medium">{displayDate}</span>
      </div>
      
      {/* Dynamic Content Lock Section */}
      <div className="flex items-center space-x-2 px-3 py-1.5">
        <div className={`p-1.5 rounded-full bg-white border ${lockState.manualContentOverride ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}>
           {lockState.manualContentOverride ? (
             <Zap className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
           ) : lockState.contentLock.isLocked ? (
             <Lock className="w-3.5 h-3.5 text-slate-500" />
           ) : (
             <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
           )}
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
             {lockState.manualContentOverride ? 'MANUAL CONTENT LOCK' : `Content Lock (${lockState.contentLock.label})`}
          </span>
          <span className={`text-[11px] font-bold ${lockState.isContentLocked ? 'text-rose-600' : 'text-slate-600'}`}>
             {lockState.isContentLocked ? 'LOCKED' : lockState.contentLock.countdown}
          </span>
        </div>
      </div>

      {/* Final/Full Lock Section */}
      <div className="flex items-center space-x-2 px-3 py-1.5">
        <div className={`p-1.5 rounded-full bg-white border ${lockState.manualFinalOverride ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}>
           {lockState.manualFinalOverride ? (
             <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
           ) : lockState.finalLock.isLocked ? (
             <Lock className="w-3.5 h-3.5 text-slate-500" />
           ) : (
             <Clock className="w-3.5 h-3.5 text-slate-500" />
           )}
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">
             {lockState.manualFinalOverride ? 'MANUAL FULL LOCK' : `Full Lock (${lockState.finalLock.label})`}
          </span>
          <span className={`text-[11px] font-bold ${lockState.isFinalLocked ? 'text-rose-700' : 'text-slate-600'}`}>
             {lockState.isFinalLocked ? 'LOCKED' : lockState.finalLock.countdown}
          </span>
        </div>
      </div>
    </div>
  );
};



