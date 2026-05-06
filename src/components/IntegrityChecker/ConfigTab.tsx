import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Settings2, Target, BarChart3, Info, Lock, Zap, ShieldCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConfigTabProps {
  penaltyConfig: number;
  onPenaltyChange: (val: number) => void;
  onSave: () => void;
}

export const ConfigTab: React.FC<ConfigTabProps> = ({ penaltyConfig, onPenaltyChange, onSave }) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 lg:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Settings2 size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Disciplinary Logic Configuration</h2>
                <p className="text-slate-400 text-sm font-medium">Fine-tune the systemic response to performance variances.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 self-start md:self-auto">
              <ShieldCheck size={14} />
              Protocol Operational
            </div>
          </div>

          <div className="space-y-16">
            <div className="relative">
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Adjustment Disciplinary Penalty</label>
                  <p className="text-slate-500 text-sm font-medium">Percentage point reduction applied per node status reversion.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-primary-600">-{penaltyConfig.toFixed(0)}</span>
                  <span className="text-xl font-black text-primary-400">%</span>
                </div>
              </div>
              
              <div className="relative py-4">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 bg-slate-100 rounded-full border border-slate-200 shadow-inner"></div>
                <motion.div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-3 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                  initial={false}
                  animate={{ width: `${(penaltyConfig / 20) * 100}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={penaltyConfig}
                  onChange={(e) => onPenaltyChange(parseInt(e.target.value))}
                  className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-8 opacity-0 cursor-pointer z-10"
                />
                <motion.div 
                   className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-4 border-primary-600 rounded-full shadow-2xl z-0 pointer-events-none"
                   animate={{ left: `calc(${(penaltyConfig / 20) * 100}% - 16px)` }}
                />
              </div>
              
              <div className="flex justify-between mt-4 px-1">
                {[0, 5, 10, 15, 20].map(val => (
                  <div key={val} className="flex flex-col items-center gap-1">
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <span className="text-[10px] font-black text-slate-400">-{val}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-primary-100 group-hover:text-primary-200 transition-colors">
                  <Zap size={64} strokeWidth={1} />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-white shadow-sm text-primary-600 rounded-xl border border-slate-100">
                      <Target size={20} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Automated Impact Analysis</h4>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    The proposed <span className="text-primary-600 font-black">-{penaltyConfig}%</span> adjustment reduces systemic friction by <span className="text-slate-900 font-bold">{20 - penaltyConfig}%</span> while maintaining high compliance efficacy across all operational vectors.
                  </p>
                </div>
              </div>
              
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 text-orange-100 group-hover:text-orange-200 transition-colors">
                  <Activity size={64} strokeWidth={1} />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-white shadow-sm text-orange-600 rounded-xl border border-slate-100">
                      <BarChart3 size={20} />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Simulated Preview</h4>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    Projected outcome suggests a balanced throughput. Risk of disciplinary recidivism remains within the <span className="text-emerald-600 font-bold">"Optimized"</span> threshold for this configuration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-12 py-8 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>System state synced: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-6 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
              Reset Values
            </button>
            <button
              onClick={onSave}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-4 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/20 hover:bg-primary-500 active:scale-95 transition-all"
            >
              <Lock size={16} /> Commit Protocol
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-black text-slate-900 tracking-tight">Audit Velocity Profile</h3>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">7-Day Analysis</span>
          </div>
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Mon', value: 30 },
                { name: 'Tue', value: 45 },
                { name: 'Wed', value: 25 },
                { name: 'Thu', value: 60 },
                { name: 'Fri', value: 35 },
                { name: 'Sat', value: 80 },
                { name: 'Sun', value: 95 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                  {[30, 45, 25, 60, 35, 80, 95].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#f97316' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Anomalous Activity</h3>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 min-h-[400px]">
            {[
              { id: '1', title: 'Protocol Variance-99', time: '2 minutes ago', value: '-5.0%', type: 'V' },
              { id: '2', title: 'Latency Threshold', time: '1 hour ago', value: '-1.2%', type: 'L' },
              { id: '3', title: 'Identity Mismatch', time: '4 hours ago', value: '-0.8%', type: 'I' },
              { id: '4', title: 'Tactical Overreach', time: '12 hours ago', value: '-2.5%', type: 'T' },
            ].map((v) => (
              <div key={v.id} className="py-5 flex items-center justify-between first:pt-0 last:pb-0 group">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110 ${
                    v.type === 'V' ? 'bg-rose-50 text-rose-600' : 
                    v.type === 'L' ? 'bg-amber-50 text-amber-600' :
                    'bg-slate-50 text-slate-600'
                  }`}>
                    {v.type}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{v.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.time}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${
                   v.value.startsWith('-5') ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                }`}>
                  {v.value}
                </span>
              </div>
            ))}
            <button className="w-full mt-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary-600 transition-all border-t border-slate-50">
              Analyze All Trace Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};