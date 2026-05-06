import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, AlertCircle, Target, Users, Building2,
  FileText, ChevronRight, RefreshCw, Zap, Shield,
  Clock, CheckCircle2, AlertTriangle, BarChart3, Activity,
  CheckSquare, ListChecks, Calendar, Keyboard,
  Brain, FileOutput, RotateCcw, Play,
  AlertOctagon, ChevronDown, X,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Tooltip as RechartsTooltip, XAxis, LineChart, Line, YAxis, CartesianGrid } from 'recharts';
import { StatCard } from './StatCard';
import { GovernanceScoreWidget } from './GovernanceScoreWidget';
import { KRHeatmap } from './KRHeatmap';
import { DashboardFilterBar, DashboardFilters } from './FilterBar';
import { DeltaBadge } from './DeltaBadge';
import { ExecutiveSummary } from './ExecutiveSummary';
import { AutoRefreshToggle } from './AutoRefresh';
import { ExportButton } from './ExportButton';
import { StatCardSkeleton, ChartSkeleton, HeatmapSkeleton, SectionSkeleton } from './LoadingSkeleton';
import { FadeIn, AnimatedCounter, PulseDot } from './EntranceAnimations';
import { Tooltip, InfoBadge } from './Tooltip';
import { calculateWeeklyBPI } from '../../utils/bpiCalculation';
import { getRecentAnomalies } from '../../utils/anomalyDetection';
import { supabase } from '../../lib/supabase';
import { getWATTime, getWeeklyMetrics, getHistoricalPerformance, getBusinessUnits, getCurrentWeekRange } from '../../utils';
import { MOCK_DASHBOARD_METRICS, MOCK_BUSINESS_UNITS, MOCK_USERS, MOCK_WEEKLY_REPORTS } from '../../utils/mock-data';

interface DashboardStats {
  activeObjectives: number;
  businessUnits: number;
  pendingReports: number;
  totalUsers: number;
  onTrack: number;
  atRisk: number;
  behind: number;
  reportsSubmitted: number;
  reportsMissing: number;
}

interface TrendPoint {
  label: string;
  score: number;
}

interface KPICardProps {
  label: string;
  value: string | number;
  suffix?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const KPICard: React.FC<KPICardProps> = ({ 
  label, 
  value, 
  suffix = '', 
  subtitle,
  trend, 
  trendValue,
  icon, 
  variant = 'default' 
}) => {
  const variantStyles = {
    default: { 
      bg: 'bg-white', 
      border: 'border-slate-100', 
      iconBg: 'bg-slate-100', 
      iconColor: 'text-slate-600',
      valueColor: 'text-slate-900',
      labelColor: 'text-slate-500',
    },
    success: { 
      bg: 'bg-white', 
      border: 'border-emerald-100', 
      iconBg: 'bg-emerald-50', 
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-600',
      labelColor: 'text-emerald-700',
    },
    warning: { 
      bg: 'bg-white', 
      border: 'border-amber-100', 
      iconBg: 'bg-amber-50', 
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-600',
      labelColor: 'text-amber-700',
    },
    danger: { 
      bg: 'bg-white', 
      border: 'border-rose-100', 
      iconBg: 'bg-rose-50', 
      iconColor: 'text-rose-600',
      valueColor: 'text-rose-600',
      labelColor: 'text-rose-700',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.bg} ${styles.border} rounded-2xl p-5 shadow-sm border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold ${styles.labelColor} uppercase tracking-wide`}>{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${styles.iconBg}`}>
          <div className={styles.iconColor}>{icon}</div>
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-3xl font-bold ${styles.valueColor}`}>{value}</span>
        {suffix && <span className="text-base font-medium text-slate-400">{suffix}</span>}
      </div>
      {subtitle && (
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-xs font-medium text-slate-500">{subtitle}</span>
          {trend && (
            <span className={`text-xs font-medium ${
              trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500'
            }`}>
              {trendValue && `• ${trendValue}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<DashboardFilters | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [bpiScore, setBpiScore] = useState<number>(0);
  const [anomalyCount, setAnomalyCount] = useState<number>(0);
  const [stats, setStats] = useState<DashboardStats>({
    activeObjectives: 0,
    businessUnits: 0,
    pendingReports: 0,
    totalUsers: 0,
    onTrack: 0,
    atRisk: 0,
    behind: 0,
    reportsSubmitted: 0,
    reportsMissing: 0,
  });
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [weeklyMetrics, setWeeklyMetrics] = useState<{
    tasksCompleted: number;
    goalsCompleted: number;
    onTrackRate: number;
    completionRate: number;
    goalsDelta: number;
    completionDelta: number;
  }>({
    tasksCompleted: 0,
    goalsCompleted: 0,
    onTrackRate: 0,
    completionRate: 0,
    goalsDelta: 0,
    completionDelta: 0
  });

  const now = getWATTime ? getWATTime() : new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const currentWeek = Math.ceil((now.getTime() - startOfYear.getTime()) / (86400000 * 7));
  const weekRange = getCurrentWeekRange ? getCurrentWeekRange() : `W${currentWeek} ${now.getFullYear()}`;
  const totalWeeks = 52;
  const weekPct = Math.round((currentWeek / totalWeeks) * 100);

const loadData = useCallback(async () => {
    setLoading(true);
    
    const week = filters?.week || currentWeek;
    const year = filters?.year || now.getFullYear();
    const mockMetrics = MOCK_DASHBOARD_METRICS.overview;
    const mockBus = MOCK_BUSINESS_UNITS.length;
    const mockUsers = MOCK_USERS.length;
    const mockReports = MOCK_WEEKLY_REPORTS.filter(r => r.week === week && r.status === 'Submitted').length;

    const weekVariance = (week - 10) * 3;
    const dynamicOnTrack = Math.max(50, Math.min(95, 67 + weekVariance));
    const dynamicCompletion = Math.max(60, Math.min(95, 85 + weekVariance));
    const dynamicSubmitted = Math.max(3, Math.min(15, 8 + Math.floor((week - 10) / 2)));

    setBpiScore(87 + Math.floor((week - 10) / 2));
    setAnomalyCount(Math.max(0, 5 - weekVariance));
    setWeeklyMetrics({
      tasksCompleted: Math.floor(mockMetrics.activeObjectives * 0.9 + (week * 0.1)),
      goalsCompleted: dynamicSubmitted,
      onTrackRate: dynamicOnTrack,
      completionRate: dynamicCompletion,
      goalsDelta: week > 14 ? 5 : -2,
      completionDelta: week > 14 ? 3 : -1
    });

    setStats({
      activeObjectives: Math.floor(mockMetrics.activeObjectives * 0.9 + (week * 0.1)),
      businessUnits: mockBus,
      pendingReports: mockMetrics.weeklyReportsDue - dynamicSubmitted,
      totalUsers: mockUsers,
      onTrack: Math.floor(dynamicOnTrack * 0.12),
      atRisk: Math.floor((100 - dynamicOnTrack) * 0.03),
      behind: Math.floor((100 - dynamicOnTrack) * 0.02),
      reportsSubmitted: dynamicSubmitted,
      reportsMissing: mockMetrics.weeklyReportsDue - dynamicSubmitted,
    });

    setTrend(MOCK_DASHBOARD_METRICS.historicalPerformance.map(p => ({
      label: `W${p.week}`,
      score: Math.max(50, Math.min(100, p.overall + (week - 10) * 3))
    })));

    try {
      const year = filters?.year || now.getFullYear();
      const buFilter = filters?.buFilter || undefined;

      const [bpi, anomalies, metrics, performance, busRes, usersRes, goalsRes] = await Promise.race([
        Promise.all([
          calculateWeeklyBPI().catch(() => 0),
          getRecentAnomalies(7).catch(() => [] as any[]),
          getWeeklyMetrics(week, year, buFilter).catch(() => null),
          getHistoricalPerformance(8).catch(() => []),
          getBusinessUnits(),
          supabase.from('profiles').select('id').eq('status', 'Active'),
          supabase.from('goals').select('id, week, year').eq('year', year),
        ]),
        new Promise(resolve => setTimeout(() => resolve(null), 2000))
      ]) as any;

      if (bpi === null) {
        setLoading(false);
        return;
      }

      const busCount = busRes?.data?.length || 0;
      const usersCount = usersRes?.data?.length || 0;
      const goals = goalsRes?.data || [];

      if (busCount > 0 || usersCount > 0 || goals.length > 0) {
        setBpiScore(bpi || 87);
        setAnomalyCount(anomalies?.length || 0);
        
        if (metrics) {
          setWeeklyMetrics({
            tasksCompleted: metrics.tasksCompleted,
            goalsCompleted: metrics.goalsCompleted,
            onTrackRate: metrics.onTrackRate,
            completionRate: metrics.completionRate,
            goalsDelta: metrics.goalsCompletedDelta,
            completionDelta: metrics.completionRateDelta
          });
        }

        const onTrack = metrics ? Math.round((metrics.onTrackRate / 100) * (metrics.tasksCompleted || 1)) : 8;
        const atRisk = metrics ? Math.round(((100 - metrics.onTrackRate) / 100) * 0.3 * (metrics.tasksCompleted || 1)) : 3;
        const behind = metrics ? Math.round(((100 - metrics.onTrackRate) / 100) * 0.7 * (metrics.tasksCompleted || 1)) : 1;

        const submittedThisWeek = goals?.filter((g: any) => g.week === week).length || 0;
        const reportsMissing = Math.max(0, busCount - submittedThisWeek);

        setStats({
          activeObjectives: metrics?.tasksCompleted || mockMetrics.activeObjectives,
          businessUnits: busCount,
          pendingReports: reportsMissing,
          totalUsers: usersCount,
          onTrack,
          atRisk,
          behind,
          reportsSubmitted: submittedThisWeek,
          reportsMissing,
        });

        if (performance?.length > 0) {
          setTrend(performance.map((p: any) => ({
            label: `W${p.week}`,
            score: p.score
          })));
        }
      }
    } catch (err) {
      console.log('Using mock data (DB unavailable)');
    } finally {
      setLoading(false);
    }
  }, [currentWeek, filters, now]);

  const handleFilterChange = useCallback((newFilters: DashboardFilters) => {
    setFilters(newFilters);
  }, []);

  useEffect(() => { loadData(); }, [loadData, filters]);

  useEffect(() => {
    const interval = setInterval(() => loadData(), 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowShortcuts(true);
      }
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const progressPct = stats.activeObjectives > 0
    ? Math.round(((stats.onTrack + stats.atRisk * 0.5) / stats.activeObjectives) * 100)
    : 0;

  return (
    <div id="executive-dashboard" className="space-y-8 bg-slate-50 min-h-screen p-6 lg:p-8 pb-24 animate-fade-in max-w-[1600px] mx-auto">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <header className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <Activity size={12} className="text-brand-600" />
              <span>Strategic Hub</span>
              <ChevronRight size={10} className="text-slate-300" />
              <span className="text-brand-600 font-semibold">Executive Dashboard</span>
            </div>
            
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
              <span className="text-slate-400">|</span>
              <p className="text-slate-500 font-medium">
                Real-time monitoring of organizational performance, OKR progression, and governance health.
              </p>
            </div>
          </div>
        </div>

        {/* ── Filter Row ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <DashboardFilterBar onFilterChange={handleFilterChange} compact />
        </div>
      </header>

      {/* ── KPI Cards Row ─────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Goals Completed"
          value={`${weeklyMetrics.goalsCompleted}%`}
          subtitle="of quarterly targets"
          icon={<Target size={18} />}
          variant="success"
        />
        <KPICard
          label="On-Track Rate"
          value={`${weeklyMetrics.onTrackRate}%`}
          subtitle="performance score"
          icon={<TrendingUp size={18} />}
          variant={weeklyMetrics.onTrackRate >= 70 ? 'success' : weeklyMetrics.onTrackRate >= 40 ? 'warning' : 'danger'}
          trend={weeklyMetrics.onTrackRate >= 70 ? 'up' : weeklyMetrics.onTrackRate >= 40 ? 'neutral' : 'down'}
          trendValue={weeklyMetrics.onTrackRate >= 70 ? 'On Track' : weeklyMetrics.onTrackRate >= 40 ? 'At Risk' : 'Behind'}
        />
        <KPICard
          label="Submission Rate"
          value={`${weeklyMetrics.completionRate}%`}
          subtitle="reports submitted"
          icon={<CheckCircle2 size={18} />}
          variant="default"
        />
        <KPICard
          label="Behind Progress"
          value={`${stats.behind}`}
          subtitle="objectives need attention"
          icon={<AlertTriangle size={18} />}
          variant="danger"
          trend="down"
          trendValue="Needs Attention"
        />
      </section>

      {/* ── Second Row: AI Summary + Governance ─────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Executive Summary */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Brain size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">AI Executive Summary</h3>
                <p className="text-xs text-slate-500">{weekRange}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors">
              <RotateCcw size={14} />
              Regenerate
            </button>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-700 leading-relaxed">
              {weeklyMetrics.onTrackRate >= 70 ? (
                <>Organization performance is strong with <span className="font-semibold text-emerald-600">{weeklyMetrics.onTrackRate}% on-track rate</span>. Continue current trajectory and focus on sustaining momentum through Week {currentWeek + 1}.</>
              ) : weeklyMetrics.onTrackRate >= 40 ? (
                <>Performance at-risk with <span className="font-semibold text-amber-600">{weeklyMetrics.onTrackRate}% on-track rate</span>. Recommend immediate review of lagging key results across affected business units.</>
              ) : (
                <>Critical attention needed. <span className="font-semibold text-rose-600">{stats.behind} objectives behind</span>. Urgent intervention required to prevent quarter-end slippage.</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>{stats.onTrack} On Track</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span>{stats.atRisk} At Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
              <span>{stats.behind} Behind</span>
            </div>
          </div>
        </div>

        {/* Governance Health */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Shield size={18} className="text-slate-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Governance Health</h3>
            </div>
            {anomalyCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg">
                <AlertOctagon size={12} className="text-rose-500" />
                <span className="text-xs font-semibold text-rose-600">{anomalyCount}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">Violations</span>
              <span className="text-lg font-bold text-slate-900">{anomalyCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm text-slate-600">BPI Score</span>
              <span className="text-lg font-bold text-brand-600">{bpiScore}</span>
            </div>
            {anomalyCount > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2">
                <AlertCircle size={14} className="text-rose-500" />
                <span className="text-xs font-medium text-rose-700">Action Required</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Performance Trend Chart ───────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Activity size={18} className="text-slate-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Performance Trend (8 Weeks)</h3>
          </div>
          <button
            onClick={() => navigate('/reports')}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            All Reports <ChevronRight size={14} />
          </button>
        </div>

        <div className="h-64">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-10 h-10 border-3 border-slate-100 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : trend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#94a3b8' }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#94a3b8' }} 
                  axisLine={false} 
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl">
                          <p className="text-xs font-medium text-slate-400 mb-0.5">{label}</p>
                          <p className="text-sm font-bold">{payload[0].value}% Score</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
              <BarChart3 size={48} opacity={0.2} />
              <p className="text-xs font-medium uppercase tracking-wider">No trend data</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Bottom Action Bar ─────────────────────────────────────────────── */}
      <section className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              autoRefresh 
                ? 'bg-brand-50 text-brand-700 border border-brand-200' 
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              autoRefresh ? 'border-brand-500 bg-brand-500' : 'border-slate-400'
            }`}>
              {autoRefresh && <Play size={8} className="text-white fill-white" />}
            </div>
            Auto-refresh
          </button>

          {/* Export PDF */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all">
            <FileOutput size={16} />
            Export PDF
          </button>
        </div>

        {/* Critical indicator */}
        {stats.behind > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertOctagon size={14} className="text-rose-500" />
            <span className="text-xs font-semibold text-rose-700">Critical: {stats.behind} objectives behind</span>
          </div>
        )}

        {/* All Reports link */}
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          All Reports
          <ChevronRight size={16} />
        </button>
      </section>
    </div>
  );
};

export default Dashboard;