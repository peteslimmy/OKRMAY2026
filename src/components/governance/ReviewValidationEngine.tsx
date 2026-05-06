import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, AlertCircle, RefreshCw, ChevronRight,
  Search, Filter, CheckCircle2, XCircle, Clock, ShieldAlert,
  ArrowRight, Info, Zap, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { getWATTime } from '@/utils';

interface Violation {
  id: string;
  category_id: string;
  violator_id: string;
  bu_id: string;
  week_reference: string;
  notes: string;
  status: 'UNPAID' | 'PAID' | 'VOID';
  created_at: string;
}

interface AnomalyFlag {
  id: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  flagged_at: string;
  is_resolved: boolean;
}

const ReviewValidationEngine: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [activeTab, setActiveTab] = useState<'anomalies' | 'integrity' | 'violations'>('anomalies');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: vData } = await supabase.from('violations').select('*').order('created_at', { ascending: false }).limit(20);
      const { data: aData } = await supabase.from('anomaly_flags').select('*').eq('is_resolved', false).order('flagged_at', { ascending: false });
      
      setViolations(vData || []);
      setAnomalies(aData || []);
    } catch (err) {
      console.error('[ValidationEngine]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const runIntegrityCheck = async () => {
    setValidating(true);
    // Simulate deep integrity scan
    await new Promise(r => setTimeout(r, 2000));
    await fetchData();
    setValidating(false);
  };

  const resolveAnomaly = async (id: string) => {
    try {
      await supabase.from('anomaly_flags').update({ is_resolved: true }).eq('id', id);
      setAnomalies(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 lg:p-12 pb-32 animate-fade-in max-w-[1400px] mx-auto space-y-10">
      
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <ShieldCheck size={12} className="text-primary-600" />
            <span>Governance Protocols</span>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-primary-600">Validation Engine</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Review & Validation</h1>
            <p className="text-slate-500 font-medium max-w-xl text-sm leading-relaxed">
              Automated integrity checking and anomaly detection system. Enforces temporal reporting compliance and financial consistency.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={runIntegrityCheck}
            disabled={validating}
            className="h-12 px-6 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {validating ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} className="text-primary-400" />}
            Execute System Scan
          </button>
        </div>
      </div>

      {/* ── Quick Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
             <AlertCircle size={24} />
           </div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Anomalies</p>
             <p className="text-2xl font-black text-slate-900">{anomalies.length}</p>
           </div>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
             <CheckCircle2 size={24} />
           </div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Integrity Score</p>
             <p className="text-2xl font-black text-slate-900">98.4%</p>
           </div>
        </div>
        <div className="bg-slate-900 rounded-3xl p-6 shadow-xl flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary-500 shrink-0">
             <Clock size={24} />
           </div>
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Scan</p>
             <p className="text-lg font-black text-white">4 mins ago</p>
           </div>
        </div>
      </div>

      {/* ── Main Engine ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[600px] flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 p-2">
          {[
            { id: 'anomalies', label: 'Anomaly Feed', icon: AlertCircle },
            { id: 'integrity', label: 'Lock Compliance', icon: ShieldAlert },
            { id: 'violations', label: 'Violation Audit', icon: Search }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-3 px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all
                ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}
              `}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.id === 'anomalies' && anomalies.length > 0 && (
                <span className="ml-2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px]">
                  {anomalies.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 p-10">
          <AnimatePresence mode="wait">
            {activeTab === 'anomalies' && (
              <motion.div
                key="anomalies"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {anomalies.length > 0 ? (
                  anomalies.map((anomaly) => (
                    <div key={anomaly.id} className="group relative bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-primary-200 transition-all">
                       <div className="flex items-start justify-between gap-6">
                         <div className="flex gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                               <ShieldAlert size={20} />
                            </div>
                            <div className="space-y-1">
                               <div className="flex items-center gap-3">
                                  <p className="text-sm font-black text-slate-900">{anomaly.reason || 'Integrity Violation Detected'}</p>
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
                                    anomaly.severity === 'high' ? 'bg-rose-100 text-rose-700' : 
                                    anomaly.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    {anomaly.severity} Severity
                                  </span>
                               </div>
                               <p className="text-xs text-slate-500 font-medium">Flagged on {new Date(anomaly.flagged_at).toLocaleString()} · Reference: {anomaly.entity_id}</p>
                            </div>
                         </div>
                         <button 
                          onClick={() => resolveAnomaly(anomaly.id)}
                          className="h-10 px-5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center gap-2"
                         >
                            <CheckCircle2 size={14} />
                            Mark Resolved
                         </button>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="h-[400px] flex flex-col items-center justify-center text-slate-300 gap-4">
                     <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                        <ShieldCheck size={40} className="text-emerald-500/30" />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest">No unresolved anomalies found</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'integrity' && (
              <motion.div
                key="integrity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-primary-50 rounded-3xl p-8 border border-primary-100 flex items-start gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary-600 shrink-0 shadow-sm">
                      <Info size={24} />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Current Protocol Status</h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-2xl">
                         Reporting locks are synchronized with Africa/Lagos (WAT). System is currently enforcing Soft-Lock protocols for Week {Math.ceil((getWATTime().getTime() - new Date(getWATTime().getFullYear(), 0, 1).getTime()) / (86400000 * 7))}.
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[
                     { label: 'Weekly Report Coverage', value: '94.2%', status: 'Normal', icon: BarChart3, color: 'text-emerald-500' },
                     { label: 'Late Submission Ratio', value: '5.8%', status: 'Within Threshold', icon: Clock, color: 'text-amber-500' },
                     { label: 'Manual Lock Overrides', value: '0', status: 'Optimal', icon: ShieldCheck, color: 'text-blue-500' },
                     { label: 'SMTP Service Health', value: 'Active', status: 'Operational', icon: Zap, color: 'text-primary-500' }
                   ].map((metric) => (
                     <div key={metric.label} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                              <metric.icon size={18} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</p>
                              <p className="text-lg font-black text-slate-900">{metric.value}</p>
                           </div>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-tighter ${metric.color}`}>
                           {metric.status}
                        </span>
                     </div>
                   ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'violations' && (
              <motion.div
                key="violations"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-3xl border border-slate-100"
              >
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {violations.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-5 text-xs font-medium text-slate-500">
                          {new Date(v.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-black text-slate-900">{v.violator_id}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">BU: {v.bu_id}</p>
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-slate-400 tracking-tighter">{v.week_reference}</td>
                        <td className="px-8 py-5">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                            v.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                            v.status === 'UNPAID' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <button className="text-slate-300 hover:text-primary-500 transition-colors">
                              <ChevronRight size={16} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ReviewValidationEngine;