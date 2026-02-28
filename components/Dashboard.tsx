
import React, { useState, useEffect, useMemo } from 'react';
import { Target, TrendingUp, TrendingDown, ShieldCheck, Zap, Activity, Loader2, LineChart as LineChartIcon, ArrowRight, MoreVertical, Sparkles, BrainCircuit, FileText, Activity as PulseIcon, Building2, Users as UsersIcon, ChevronRight, Globe, Layers, Database } from 'lucide-react';
import { KPICardProps, KeyResult, Activity as ActivityType, User, BUPerformanceDataPoint, UserRole, BusinessUnit, StrategicNote } from '../types';
import { BUPerformanceMatrix } from './BUPerformanceMatrix';
import { getCurrentQuarterInfo, getRegistryUsers, getBUPerformanceData, calculateGovernanceHealth, getSessionUser, getRegistryKeyResults, getBusinessUnits } from '../utils';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../supabaseClient';
import DOMPurify from 'dompurify';

const MiniSparkline: React.FC<{ data: any[], color: string, id: string }> = ({ data, color, id }) => (
  <div className="h-16 w-full -mb-1 opacity-80" style={{ minWidth: 0, minHeight: 0 }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="score"
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${id})`}
          dot={false}
          isAnimationActive={true}
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const KPICard: React.FC<KPICardProps & { sparkData: any[], color?: string }> = ({ title, value, trendValue, trendUp, sparkData, color = "#f97316" }) => (
  <div className="bg-white rounded-[4px] border border-slate-200 shadow-sm hover:shadow-md transition-all animate-scale-in flex flex-col overflow-hidden group">
    <div className="p-5 flex-1">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-[13px] font-bold text-slate-700 uppercase tracking-tight">{title}</h4>
        <button className="text-slate-300 hover:text-slate-500 p-1 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-3xl font-black text-slate-900 tracking-tighter">{value}</span>
        <div className="flex items-center gap-1">
          <span className={`flex items-center text-xs font-bold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trendUp ? <TrendingUp size={14} className="mr-0.5" /> : <TrendingDown size={14} className="mr-0.5" />}
            {trendValue}%
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap">vs last</span>
        </div>
      </div>
    </div>
    <MiniSparkline data={sparkData} color={color} id={title.replace(/\s+/g, '-').toLowerCase()} />
  </div>
);

export const Dashboard: React.FC<{ selectedYear: number, selectedBu: string; selectedWeek: string; }> = ({ selectedYear, selectedBu, selectedWeek }) => {
  const [dbKRs, setDbKRs] = useState<KeyResult[]>([]);
  const [dbActivities, setDbActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<BUPerformanceDataPoint[]>([]);
  const [registry, setRegistry] = useState<User[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [allYearsKRs, setAllYearsKRs] = useState<{ [key: number]: number }>({});

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [users, performance, session, cloudKrs, cloudActs, bus] = await Promise.all([
        getRegistryUsers(),
        getBUPerformanceData(),
        getSessionUser(),
        getRegistryKeyResults(selectedYear),
        supabase.from('activities').select('*').eq('year', selectedYear),
        getBusinessUnits()
      ]);

      setRegistry(users);
      setBusinessUnits(bus);
      setCurrentUser(session);
      setDbKRs(cloudKrs);

      // Secondary fetch for KR counts across years for the registry explorer
      const [krs2025, krs2026] = await Promise.all([
        getRegistryKeyResults(2025),
        getRegistryKeyResults(2026)
      ]);
      setAllYearsKRs({ 2025: krs2025.length, 2026: krs2026.length });

      const parsedActs = (cloudActs.data as any[] || []).map(a => ({
        ...a,
        tasks: typeof a.tasks === 'string' ? JSON.parse(a.tasks) : (a.tasks || [])
      }));
      setDbActivities(parsedActs);

      const projectedData = [...performance];
      if (performance.length > 0) {
        const last = performance[performance.length - 1];
        const velocity = (last.totalCompanyScore - (performance[performance.length - 2]?.totalCompanyScore || last.totalCompanyScore)) || 2;
        for (let i = 1; i <= 4; i++) {
          projectedData.push({
            week: `W${parseInt(last.week.replace(/\D/g, '')) + i}`,
            totalCompanyScore: Math.min(100, last.totalCompanyScore + (velocity * i)),
            isProjected: true
          } as any);
        }
      }
      setTrendData(projectedData);
    } catch (error) {
      console.error("Dashboard error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    window.addEventListener('4COREUserUpdate', fetchDashboardData);
    window.addEventListener('4COREBUUpdate', fetchDashboardData);
    return () => {
      window.removeEventListener('4COREUserUpdate', fetchDashboardData);
      window.removeEventListener('4COREBUUpdate', fetchDashboardData);
    };
  }, [selectedYear]);

  const filteredActivities = useMemo(() => {
    const isBypassActive = currentUser?.role === UserRole.SuperAdmin || currentUser?.role === UserRole.Admin;
    let baseFiltered = dbActivities.filter(a => isBypassActive || (a.department === currentUser?.department));

    if (selectedWeek !== 'all') {
      const weekNum = parseInt(selectedWeek.replace(/\D/g, ''));
      baseFiltered = baseFiltered.filter(a => a.week === weekNum);
    }
    if (selectedBu !== 'all') {
      baseFiltered = baseFiltered.filter(act => act.department === selectedBu);
    }
    return baseFiltered;
  }, [dbActivities, selectedWeek, selectedBu, currentUser]);

  const governanceHealth = useMemo(() => calculateGovernanceHealth(filteredActivities), [filteredActivities]);

  const generateAiSynthesis = async () => {
    if (generatingAi || filteredActivities.length === 0) return;
    setGeneratingAi(true);
    try {
      // Use the local SDK pattern as established in the codebase
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
      const ai = new (GoogleGenAI as any)({ apiKey });
      const prompt = `Perform an executive synthesis of the following tactical reporting nodes for ${selectedWeek}:
      ${JSON.stringify(filteredActivities.map(a => ({ title: a.title, score: a.score, comments: a.comments })))}
      Current Governance Health: ${governanceHealth}%
      Provide:
      1. A 3-sentence executive summary.
      2. Top 2 critical blockers identified.
      3. One strategic recommendation for next week.
      Keep it high-density and professional.`;

      const response = await (ai.models as any).generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      setAiBriefing(response.text || response.response?.text() || 'Synthesis unavailable.');
    } catch (e) {
      setAiBriefing('Error generating strategic briefing.');
    } finally {
      setGeneratingAi(false);
    }
  };

  const executionScore = useMemo(() => {
    if (filteredActivities.length === 0) return 0;
    const totalScore = filteredActivities.reduce((acc, act) => acc + act.score, 0);
    return Math.round(totalScore / filteredActivities.length);
  }, [filteredActivities]);

  const sparklineData = useMemo(() => {
    const base = trendData.filter(d => !(d as any).isProjected);
    return {
      execution: base.map(d => ({ score: d.totalCompanyScore || 0 })),
      compliance: [governanceHealth, governanceHealth, governanceHealth].map(s => ({ score: s })),
      krs: [2, 3, 3, 4, dbKRs.length].map(s => ({ score: s })),
      nodes: [10, 15, 12, 18, filteredActivities.length].map(s => ({ score: s }))
    };
  }, [trendData, dbKRs.length, filteredActivities.length, governanceHealth]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
      <Loader2 className="w-10 h-10 animate-spin text-primary-500 mb-4" />
      <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Harvesting Intelligence...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Execution Score" value={`${executionScore}%`} trendValue={12} trendUp={true} sparkData={sparklineData.execution} color="#f97316" subtitle={null} />
        <KPICard title="Governance Health" value={`${governanceHealth}%`} trendValue={governanceHealth > 70 ? 5 : -2} trendUp={governanceHealth > 70} sparkData={sparklineData.compliance} color="#10b981" subtitle={null} />
        <KPICard title="Active KRs" value={dbKRs.length.toString()} trendValue={5} trendUp={true} sparkData={sparklineData.krs} color="#3b82f6" subtitle={null} />
        <KPICard title="Total Nodes" value={filteredActivities.length.toString()} trendValue={8} trendUp={true} sparkData={sparklineData.nodes} color="#8b5cf6" subtitle={null} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[4px] border border-slate-200 shadow-sm animate-slide-up relative">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Execution Velocity & Projection</h3>
              <p className="text-[12px] font-medium text-slate-400 mt-0.5 uppercase tracking-wider">Strategic performance trailing cycle with 4-week forecast</p>
            </div>
          </div>
          <div className="h-[280px] w-full" style={{ minWidth: 0, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorMainScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tickMargin={12} />
                <YAxis stroke="#94a3b8" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', padding: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="totalCompanyScore"
                  stroke="#f97316"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMainScore)"
                  strokeDasharray={(entry: any) => (entry.payload.isProjected ? "5 5" : "")}
                />
                <ReferenceLine y={governanceHealth} stroke="#10b981" strokeDasharray="3 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-900 p-10 rounded-[4px] text-white flex flex-col justify-between relative overflow-hidden group shadow-lg border border-white/5 animate-slide-up">
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-400 mb-4 block">Performance Synthesis</span>
            {aiBriefing ? (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-xl font-bold leading-tight">Weekly Briefing</h3>
                <div className="text-slate-300 text-sm leading-relaxed overflow-y-auto max-h-[160px] custom-scrollbar pr-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(aiBriefing.replace(/\n/g, '<br/>')) }} />
                <button onClick={() => setAiBriefing(null)} className="text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Dismiss Intelligence</button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mt-2 leading-tight tracking-tight">4CORE AI Briefing</h3>
                <p className="text-slate-400 text-sm mt-5 leading-relaxed font-medium">Generate a context-aware strategic synthesis of current reporting nodes.</p>
                <button
                  onClick={generateAiSynthesis}
                  disabled={generatingAi || filteredActivities.length === 0}
                  className="mt-10 w-full py-4 bg-white text-slate-950 rounded-[4px] text-[11px] font-black uppercase tracking-wider hover:bg-primary-500 hover:text-white transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {generatingAi ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {generatingAi ? 'Processing...' : 'Synthesize Performance'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <BUPerformanceMatrix selectedBuId={selectedBu} selectedWeek={selectedWeek} />
      </div>

      {/* NEW: Governance Registry Explorer for Visibility */}
      <div className="bg-white p-10 rounded-[4px] border border-slate-200 shadow-sm animate-slide-up mt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Governance Registry Explorer</h3>
            <p className="text-sm text-slate-500 mt-2 font-medium">Global diagnostic overview of active entities, strategic roadmaps, and identities.</p>
          </div>
          <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 rounded-[4px] border border-slate-100">
            <Database className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cloud Status: Synchronized</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Section: Business Units Explorer */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-500" /> Business Units ({businessUnits.length})
            </h4>
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
              {businessUnits.map(bu => (
                <div key={bu.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-[4px] hover:bg-white hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-[4px] flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors shadow-sm">
                      <Globe size={18} />
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-slate-800 block">{bu.name}</span>
                      <span className="text-[9px] font-black uppercase text-slate-400">Head: {registry.find(u => u.id === bu.head_user_id)?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {businessUnits.length === 0 && <p className="text-[11px] text-slate-400 italic">No business units discovered in registry.</p>}
            </div>
          </div>

          {/* Section: Strategic Key Results Roadmap */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-500" /> Strategic Baseline
            </h4>
            <div className="space-y-4">
              {[2025, 2026].map(year => (
                <div key={year} className="p-6 bg-slate-900 rounded-[4px] text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Target size={80} />
                  </div>
                  <div className="relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">Roadmap cycle</span>
                    <h5 className="text-3xl font-black tracking-tighter mt-1">{year} FISCAL</h5>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="px-3 py-1.5 bg-white/10 rounded-[4px] text-[10px] font-black uppercase tracking-widest">
                        {allYearsKRs[year] || 0} Key Results Active
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Identity Registry Summary */}
          <div className="space-y-6">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-primary-500" /> Identity Registry ({registry.length})
            </h4>
            <div className="bg-slate-50/50 border border-slate-100 rounded-[4px] p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'SuperAdmins', count: registry.filter(u => u.role === UserRole.SuperAdmin).length, color: 'bg-rose-500' },
                  { label: 'Admins', count: registry.filter(u => u.role === UserRole.Admin).length, color: 'bg-primary-500' },
                  { label: 'Directors', count: registry.filter(u => u.role === UserRole.Director).length, color: 'bg-indigo-500' },
                  { label: 'Managers', count: registry.filter(u => u.role === UserRole.Manager).length, color: 'bg-emerald-500' }
                ].map(stat => (
                  <div key={stat.label} className="bg-white p-4 rounded-[4px] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</span>
                    <span className="text-2xl font-black text-slate-900">{stat.count}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-widest">Active nodes</span>
                <span className="text-[10px] font-black text-slate-900">{registry.filter(u => u.status === 'Active').length} IDENTITIES</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};





