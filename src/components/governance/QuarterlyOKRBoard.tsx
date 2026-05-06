import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, TrendingUp, AlertCircle, CheckCircle, Clock, Target } from 'lucide-react';
import { QuarterlyOKRService, YearlyThemeWithQuarters, QuarterlyObjectiveWithKRs, KeyResultWithSubKRs } from '@/services/quarterlyOKRService';
import { QuarterType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const QUARTERS: QuarterType[] = [QuarterType.Q1, QuarterType.Q2, QuarterType.Q3, QuarterType.Q4];

const QUARTER_COLORS: Record<QuarterType, { bg: string; border: string; accent: string; text: string }> = {
  [QuarterType.Q1]: { bg: 'bg-orange-50', border: 'border-orange-100', accent: 'bg-orange-500', text: 'text-orange-600' },
  [QuarterType.Q2]: { bg: 'bg-orange-50/70', border: 'border-orange-100', accent: 'bg-orange-600', text: 'text-orange-700' },
  [QuarterType.Q3]: { bg: 'bg-orange-50/50', border: 'border-orange-100', accent: 'bg-orange-700', text: 'text-orange-800' },
  [QuarterType.Q4]: { bg: 'bg-orange-50/30', border: 'border-orange-100', accent: 'bg-orange-800', text: 'text-orange-900' }
};

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ progress, size = 48, strokeWidth = 4, color = '#f97316' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-slate-100"
      />
      <motion.circle
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeLinecap="round"
      />
    </svg>
  );
};

interface KRNodeProps {
  kr: KeyResultWithSubKRs;
  quarterColor: string;
}

const KRNode: React.FC<KRNodeProps> = ({ kr, quarterColor }) => {
  const [expanded, setExpanded] = useState(false);
  const statusColors = {
    Green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Amber: 'bg-orange-50 text-orange-700 border-orange-200',
    Red: 'bg-rose-50 text-rose-700 border-rose-200'
  };
  const statusIcons = {
    Green: <CheckCircle className="w-3 h-3" />,
    Amber: <Clock className="w-3 h-3" />,
    Red: <AlertCircle className="w-3 h-3" />
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm hover:border-slate-300 transition-all">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg ${quarterColor} flex items-center justify-center shrink-0 shadow-sm`}>
             <span className="text-[10px] font-black text-white">{kr.kr_slot}</span>
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm block">{kr.title}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${statusColors[kr.status]}`}>
                {statusIcons[kr.status]}
                {kr.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-slate-900">{Math.round(kr.progress)}%</span>
            <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${kr.progress}%` }}
                 className={`h-full ${quarterColor}`}
               />
            </div>
          </div>
          <div className={`p-1 rounded-lg transition-colors ${expanded ? 'bg-slate-100' : ''}`}>
            {expanded ? <ChevronDown className="w-4 h-4 text-slate-600" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 bg-white">
              <div className="h-px bg-slate-100 mb-4" />
              {kr.description && (
                <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">{kr.description}</p>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Target Milestones</span>
                  <span className="text-[10px] font-bold text-slate-400">{kr.subKRs.length} Sub-KRs</span>
                </div>
                {kr.subKRs.length === 0 ? (
                  <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-[10px] text-slate-400 font-medium italic">No milestones defined for this track</p>
                  </div>
                ) : (
                  kr.subKRs.map((subKR, idx) => (
                    <div key={subKR.id} className="flex items-center justify-between bg-slate-50/50 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{subKR.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {subKR.weight !== 1 && (
                          <span className="text-[10px] font-black text-slate-400 uppercase">W:{subKR.weight}</span>
                        )}
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          subKR.progress >= 75 ? 'bg-emerald-100 text-emerald-700' :
                          subKR.progress >= 50 ? 'bg-orange-100 text-orange-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {Math.round(subKR.progress)}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface QuarterColumnProps {
  quarter: QuarterType;
  objective: QuarterlyObjectiveWithKRs | null;
  theme: YearlyThemeWithQuarters;
}

const QuarterColumn: React.FC<QuarterColumnProps> = ({ quarter, objective, theme: _theme }) => {
  const colors = QUARTER_COLORS[quarter];
  const isLocked = objective?.status === 'Locked';

  return (
    <div className={`flex-1 min-w-[340px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]`}>
      <div className={`p-5 border-b border-slate-100 relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 w-1 h-full ${colors.accent}`} />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h3 className="font-black text-xl text-slate-900 tracking-tight">{quarter}</h3>
            {objective && (
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded mt-1 inline-block ${
                objective.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                objective.status === 'Locked' ? 'bg-slate-100 text-slate-500' :
                'bg-orange-100 text-orange-700'
              }`}>
                {objective.status}
              </span>
            )}
          </div>
          {objective && (
            <div className="flex items-center gap-3">
              <ProgressRing 
                progress={objective.progress} 
                size={44} 
                strokeWidth={4} 
                color={colors.accent.replace('bg-', 'var(--').replace('-600', '-600)')} 
              />
              <span className="text-lg font-black text-slate-900">{Math.round(objective.progress)}%</span>
            </div>
          )}
        </div>
        {objective && (
          <p className="text-xs font-bold text-slate-500 mt-3 line-clamp-2 leading-relaxed">{objective.title}</p>
        )}
      </div>

      <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
        {objective ? (
          objective.keyResults.length > 0 ? (
            objective.keyResults.map(kr => (
              <KRNode key={kr.id} kr={kr} quarterColor={colors.accent} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Key Results</p>
              <p className="text-xs text-slate-400 mt-1">Ready for strategic alignment</p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center mx-auto mb-4">
               <Target className="w-8 h-8 text-slate-100" />
            </div>
            <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Awaiting Objective</p>
            <p className="text-xs text-slate-400 mt-1">Configure in the Strategy Editor</p>
          </div>
        )}
      </div>

      {isLocked && (
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-2 justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-200 rounded-lg py-2">
            <Clock size={12} />
            <span>Temporal Lock Active</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const QuarterlyOKRBoard: React.FC = () => {
  const [theme, setTheme] = useState<YearlyThemeWithQuarters | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const service = new QuarterlyOKRService();

  useEffect(() => {
    loadTheme();
  }, [selectedYear]);

  const loadTheme = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getYearlyThemeByYear(selectedYear);
      setTheme(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Strategy Hub...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-rose-500" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Sync Disturbance</h3>
        <p className="text-slate-500 font-medium text-sm mb-6 max-w-xs mx-auto">{error}</p>
        <button
          onClick={loadTheme}
          className="btn-primary bg-primary-600 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
        >
          Initialize Retry
        </button>
      </div>
    );
  }

  const quartersMap = new Map(QUARTERS.map(q => [q, null]));
  theme?.quarters.forEach(q => quartersMap.set(q.quarter, q));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary-50 rounded-lg">
                <Target size={20} className="text-primary-600" />
             </div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Strategic OKR Board</h2>
          </div>
          <p className="text-slate-500 font-medium text-sm">Visualizing organizational alignment across fiscal quarters.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Fiscal Cycle</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
          >
            {[2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {theme && (
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-orange-400 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
          <div className={`relative p-8 rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8 relative z-10">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-lg">
                    {theme.year} ANNUAL THEME
                  </div>
                  {theme.is_active && (
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-widest border border-emerald-100">
                      Primary Nexus
                    </div>
                  )}
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{theme.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed max-w-3xl">{theme.description}</p>
              </div>
              <div className="flex flex-col items-center lg:items-end bg-slate-50 p-6 rounded-2xl border border-slate-100 min-w-[200px]">
                <div className="text-5xl font-black text-primary-600 tracking-tighter">
                  {Math.round(theme.quarters.reduce((sum, q) => sum + q.progress, 0) / (theme.quarters.length || 1))}%
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Strategic Velocity</div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full mt-4 overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.round(theme.quarters.reduce((sum, q) => sum + q.progress, 0) / (theme.quarters.length || 1))}%` }}
                     className="h-full bg-primary-600 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar scroll-smooth">
        {QUARTERS.map(quarter => (
          <QuarterColumn
            key={quarter}
            quarter={quarter}
            objective={quartersMap.get(quarter) || null}
            theme={theme || { id: '', year: selectedYear, title: '', description: '', is_active: false, created_at: '', updated_at: '', created_by: '', updated_by: '', quarters: [] }}
          />
        ))}
      </div>
    </div>
  );
};