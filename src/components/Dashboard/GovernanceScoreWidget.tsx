import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { calculateGovernanceHealth } from '../../utils';

export const GovernanceScoreWidget: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const health = await calculateGovernanceHealth();
        setScore(health);
      } catch {
        setScore(0);
      } finally {
        setLoading(false);
      }
    };
    fetchScore();
  }, []);

  const getScoreColor = (s: number) => {
    if (s >= 70) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' };
    if (s >= 40) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' };
  };

  const colors = getScoreColor(score);

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-8 rounded-3xl border-2 transition-all duration-500 ${colors.bg} ${colors.border} shadow-inner`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-black flex items-center gap-2 text-slate-900 uppercase tracking-widest">
          <ShieldCheck size={16} className="text-primary-500" /> System Integrity
        </h3>
        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${colors.badge}`}>
          {score >= 70 ? 'HEALTHY' : score >= 40 ? 'AT RISK' : 'CRITICAL'}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <div className={`text-4xl font-bold ${colors.text}`}>{score}</div>
        <div className="text-xs text-slate-500 mb-1">/ 100</div>
      </div>
      <div className="mt-4 w-full bg-slate-200/50 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 shadow-inner ${score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};