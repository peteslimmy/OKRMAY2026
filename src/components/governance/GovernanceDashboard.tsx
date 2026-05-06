import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, ClipboardList, ShieldAlert, Lock, Unlock, 
  LoaderCircle, AlertTriangle, ChevronRight, Zap, History,
  ShieldCheck, ArrowRight
} from 'lucide-react';
import { Objective, KeyResult, SubKR } from '../../types';
import { OKRService } from '../../services/okrService';
import { ObjectiveCard } from './ObjectiveCard';
import { KRCard } from './KRCard';
import { logger, logError } from '../../utils/logging';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

export const GovernanceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [objective, setObjective] = useState<Objective | null>(null);
  const [krs, setKrs] = useState<KeyResult[]>([]);
  const [subKrs, setSubKrs] = useState<Record<string, SubKR[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const okrService = new OKRService();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        logger.info('Loading OKR data for dashboard');
        const currentObjective = await okrService.getCurrentObjective();
        if (currentObjective) {
          setObjective(currentObjective);
          const keyResults = await okrService.getObjectiveKRs(currentObjective.id);
          setKrs(keyResults);
          
          const subKRsMap: Record<string, SubKR[]> = {};
          for (const kr of keyResults) {
            const subKeyResults = await okrService.getKRSubKRs(kr.id);
            subKRsMap[kr.id] = subKeyResults;
          }
          setSubKrs(subKRsMap);
          
          setLocked(currentObjective.status === 'Locked' || 
                  (currentObjective.lock_date && new Date() > new Date(currentObjective.lock_date)));
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        logger.error('Error loading dashboard data', { error: err });
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUpdateSubKR = async (subKrId: string, progress: number) => {
    try {
      await okrService.updateSubKRProgress(subKrId, progress);
      setSubKrs(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(krId => {
          updated[krId] = updated[krId].map(skr => 
            skr.id === subKrId ? { ...skr, progress } : skr
          );
        });
        return updated;
      });
    } catch (error) {
      logError(error as Error, { operation: 'handleUpdateSubKR', subKrId, progress });
      setError('Failed to update progress');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 animate-pulse mx-auto mb-6">
            <ShieldCheck size={32} className="text-primary-500" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Strategic Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 pb-32 animate-fade-in max-w-[1600px] mx-auto space-y-12">
      
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <Zap size={12} className="text-primary-600" />
            <span>Enterprise Performance</span>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-primary-600">Strategic Governance</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Governance Hub</h1>
            <p className="text-slate-500 font-medium max-w-xl text-sm leading-relaxed">
              Full-spectrum monitoring and immutable control of organizational OKRs. Enforces compliance via temporal reporting locks.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50">
          <button 
            onClick={() => navigate('/governance/violations')}
            className="h-12 px-6 rounded-2xl bg-white text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <ShieldAlert size={14} className="text-primary-600" />
            Violations
          </button>
          <button 
            onClick={() => navigate('/governance/audit')}
            className="h-12 px-6 rounded-2xl bg-white text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            <History size={14} className="text-slate-400" />
            Audit Trail
          </button>
          
          <button 
            onClick={async () => {
              if (!locked) return;
              const reason = prompt('Justification for lock override:');
              if (reason && objective) {
                try {
                  await okrService.createAuditLog({
                    entity_type: 'Objective',
                    entity_id: objective.id,
                    action: 'OVERRIDE',
                    performed_by: currentUser?.id || 'SYSTEM',
                    reason
                  });
                  setLocked(false);
                } catch (error) { logError(error as Error, { operation: 'override' }); }
              }
            }}
            className={`h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-[0.98] ${
              locked 
                ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20 hover:bg-primary-700' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
            }`}
          >
            {locked ? <Unlock size={14} /> : <Lock size={14} />}
            {locked ? 'Override Lock' : 'Engine Secured'}
          </button>
        </div>
      </div>

      {/* ── Core Objective ─────────────────────────────────────────── */}
      {!objective ? (
        <div className="py-24 text-center bg-white rounded-3xl border-2 border-slate-200 border-dashed max-w-3xl mx-auto">
          <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <LayoutGrid size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Initialize Strategic Period</h3>
          <p className="text-slate-500 font-medium mb-10 max-w-md mx-auto">No active strategic objective found for the current period. Begin by configuring your top-level goals.</p>
          <button 
            onClick={() => navigate('/governance/quarterly-krs')}
            className="h-14 px-10 bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-primary-600 transition-all shadow-2xl shadow-slate-900/20 flex items-center gap-3 mx-auto"
          >
            Setup Quarterly OKRs <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Core Strategic Objective</h2>
            </div>
            <ObjectiveCard objective={objective} isLocked={locked} />
          </section>

          <section className="space-y-8">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-slate-900 rounded-full"></div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Key Performance Indicators</h2>
                </div>
                <div className="px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {krs.length} Active Targets
                </div>
             </div>
            
            {krs.length === 0 ? (
              <div className="py-32 text-center bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">No Key Results defined for this objective</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {krs.map(kr => (
                  <KRCard 
                    key={kr.id} 
                    kr={kr} 
                    subKrs={subKrs[kr.id] || []} 
                    isLocked={locked} 
                    onUpdateSubKR={handleUpdateSubKR} 
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};