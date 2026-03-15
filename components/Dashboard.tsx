
import React, { useState, useEffect, useMemo } from 'react';
import { Target, TrendingUp, TrendingDown, ShieldCheck, Zap, Activity, Loader2, LineChart as LineChartIcon, ArrowRight, MoreVertical, Sparkles, BrainCircuit, FileText, Activity as PulseIcon, Building2, Users as UsersIcon, ChevronRight, Globe, Layers, Database } from 'lucide-react';
import { KPICardProps, KeyResult, Activity as ActivityType, User, BUPerformanceDataPoint, UserRole, BusinessUnit, StrategicNote } from '../types';
import { BUPerformanceMatrix } from './BUPerformanceMatrix';
import { getCurrentQuarterInfo, getRegistryUsers, getBUPerformanceData, calculateGovernanceHealth, getSessionUser, getRegistryKeyResults, getBusinessUnits } from '../utils';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';
import { supabase } from '../supabaseClient';
import DOMPurify from 'dompurify';

const MiniSparkline: React.FC<{ data: any[], color: string, id: string }> = ({ data, color, id }) => (
  <div className="h-10 w-full -mb-1 opacity-80" style={{ minWidth: 0, minHeight: 0 }}>
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
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all animate-scale-in flex flex-col overflow-hidden group">
    <div className="p-4 flex-1">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{title}</h4>
        <button className="text-slate-300 hover:text-slate-500 p-1 transition-colors" title="More options">
          <MoreVertical size={14} />
        </button>
      </div>
      <div className="flex items-baseline gap-2 mb-0">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        <div className="flex items-center gap-1">
          <span className={`flex items-center text-xs font-semibold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trendUp ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
            {trendValue}%
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide whitespace-nowrap">vs last</span>
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setAiBriefing('Authentication required for AI synthesis.');
        return;
      }

      const prompt = `Perform an executive synthesis of the following tactical reporting nodes for ${selectedWeek}:
      ${JSON.stringify(filteredActivities.map(a => ({ title: a.title, score: a.score, comments: a.comments })))}
      Current Governance Health: ${governanceHealth}%
      Provide:
      1. A 3-sentence executive summary.
      2. Top 2 critical blockers identified.
      3. One strategic recommendation for next week.
      Keep it high-density and professional.`;

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt,
          model: 'gemini-2.0-flash',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'AI service unavailable' }));
        throw new Error(errorData.error || 'AI service unavailable');
      }

      const data = await response.json();
      setAiBriefing(data.text || 'Synthesis unavailable.');
    } catch (e) {
      console.error('AI Synthesis Error:', e);
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
      <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-6" />
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Harvesting Intelligence...</h3>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        <KPICard title="Execution Score" value={`${executionScore}%`} trendValue={12} trendUp={true} sparkData={sparklineData.execution} color="#f97316" />
        <KPICard title="Governance Health" value={`${governanceHealth}%`} trendValue={governanceHealth > 70 ? 5 : -2} trendUp={governanceHealth > 70} sparkData={sparklineData.compliance} color="#10b981" />
        <KPICard title="Active KRs" value={dbKRs.length.toString()} trendValue={5} trendUp={true} sparkData={sparklineData.krs} color="#3b82f6" />
        <KPICard title="Reporting Nodes" value={filteredActivities.length.toString()} trendValue={8} trendUp={true} sparkData={sparklineData.nodes} color="#8b5cf6" />
        <KPICard title="Active Identities" value={registry.length.toString()} trendValue={3} trendUp={true} sparkData={sparklineData.nodes} color="#ec4899" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-slide-up relative">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Execution Velocity & Projection</h3>
              <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wide">Strategic performance trailing cycle with 4-week forecast</p>
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
        <div className="bg-slate-900 p-6 rounded-xl text-white flex flex-col justify-between relative overflow-hidden group shadow-lg border border-white/5 animate-slide-up">
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-400 mb-3 block">Performance Synthesis</span>
            {aiBriefing ? (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-bold leading-tight">Weekly Briefing</h3>
                <div className="text-slate-300 text-sm leading-relaxed overflow-y-auto max-h-[160px] custom-scrollbar pr-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(aiBriefing.replace(/\n/g, '<br/>')) }} />
                <button onClick={() => setAiBriefing(null)} className="text-xs font-semibold text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Dismiss Intelligence</button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold mt-2 leading-tight">4CORE AI Briefing</h3>
                <p className="text-slate-400 text-sm mt-4 leading-relaxed font-medium">Generate a context-aware strategic synthesis of current reporting nodes.</p>
                <button
                  onClick={generateAiSynthesis}
                  disabled={generatingAi || filteredActivities.length === 0}
                  className="mt-6 w-full py-3 bg-white text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
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
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-card animate-slide-up mt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Governance Registry Explorer</h2>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Diagnostic overview of operational entities, strategic roadmaps, and global identities.</p>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <Database className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Node Sync: Synchronized</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Section: Business Units Explorer */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-500" /> Business Units ({businessUnits.length})
            </h3>
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-3 custom-scrollbar">
              {businessUnits.map(bu => (
                <div key={bu.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-card hover:border-primary-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors shadow-sm">
                      <Globe size={18} />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-slate-800 tracking-tight">{bu.name}</h4>
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide mt-0.5">Head: {registry.find(u => u.id === bu.head_user_id)?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>
              ))}
              {businessUnits.length === 0 && <p className="text-sm text-slate-400 italic px-2">No business units discovered in registry.</p>}
            </div>
          </div>

          {/* Section: Strategic Key Results Roadmap */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-500" /> Strategic Baseline
            </h3>
            <div className="space-y-4">
              {[2025, 2026].map(year => (
                <div key={year} className="p-6 bg-slate-900 rounded-xl text-white relative overflow-hidden group shadow-lg">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Target size={70} />
                  </div>
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-400">Roadmap cycle</span>
                    <h5 className="text-2xl font-bold tracking-tight mt-1">{year} FISCAL</h5>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs font-bold uppercase tracking-wide border border-white/5">
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
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-primary-500" /> Identity Registry ({registry.length})
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'SuperAdmins', count: registry.filter(u => u.role === UserRole.SuperAdmin).length, color: 'bg-rose-500' },
                  { label: 'Admins', count: registry.filter(u => u.role === UserRole.Admin).length, color: 'bg-primary-500' },
                  { label: 'Directors', count: registry.filter(u => u.role === UserRole.Director).length, color: 'bg-indigo-500' },
                  { label: 'Managers', count: registry.filter(u => u.role === UserRole.Manager).length, color: 'bg-emerald-500' }
                ].map(stat => (
                  <div key={stat.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-card flex flex-col items-center justify-center text-center group hover:border-primary-100 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{stat.label}</span>
                    <span className="text-2xl font-bold text-slate-900">{stat.count}</span>
                  </div>
                ))}
              </div>
              <div className="pt-5 border-t border-slate-200 flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-widest">Active nodes</span>
                <span className="text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded-full border border-slate-200">{registry.filter(u => u.status === 'Active').length} IDENTITIES</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};





