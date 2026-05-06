import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  ArrowLeft, 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3, 
  Target, 
  ShieldAlert,
  ChevronRight,
  Download,
  Filter,
  RefreshCw,
  LayoutGrid,
  FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

interface Violation {
  id: string;
  category_id: string;
  violator_id: string;
  bu_id: string;
  week_reference: string;
  notes: string;
  status: 'UNPAID' | 'PAID' | 'VOID';
  created_at: string;
  updated_at: string;
}

interface ViolationCategory {
  id: string;
  name: string;
  description: string;
  severity_level: 'Minor' | 'Major' | 'Critical';
  default_fine_amount: number;
}

interface BusinessUnit {
  id: string;
  name: string;
}

const ReportingAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [categories, setCategories] = useState<ViolationCategory[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [violationsRes, categoriesRes, buRes] = await Promise.all([
        supabase.from('violations').select('*').order('created_at', { ascending: false }),
        supabase.from('violation_categories').select('*'),
        supabase.from('business_units').select('*')
      ]);
      
      if (violationsRes.error) throw new Error(violationsRes.error.message);
      if (categoriesRes.error) throw new Error(categoriesRes.error.message);
      if (buRes.error) throw new Error(buRes.error.message);
      
      setViolations(violationsRes.data as Violation[]);
      setCategories(categoriesRes.data as ViolationCategory[]);
      setBusinessUnits(buRes.data as BusinessUnit[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analytical data synchronization failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare data for charts
  const violationsByBU = businessUnits.map(bu => {
    const count = violations.filter(v => v.bu_id === bu.id).length;
    return { name: bu.name, count };
  }).sort((a, b) => b.count - a.count);

  const violationsByCategory = categories.map(category => {
    const count = violations.filter(v => v.category_id === category.id).length;
    return { name: category.name, count };
  }).sort((a, b) => b.count - a.count);

  const statusData = [
    { name: 'Unpaid', count: violations.filter(v => v.status === 'UNPAID').length, color: '#dc6803' },
    { name: 'Paid', count: violations.filter(v => v.status === 'PAID').length, color: '#10b981' },
    { name: 'Void', count: violations.filter(v => v.status === 'VOID').length, color: '#94a3b8' }
  ];

  const totalFines = violations.reduce((sum, v) => {
     const cat = categories.find(c => c.id === v.category_id);
     return sum + (cat?.default_fine_amount || 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Synthesizing Governance Intelligence...</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          <p className="text-sm font-black tracking-tight">{payload[0].value} Incidents</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto space-y-12 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <BarChart3 size={12} className="text-primary-600" />
            <span>Governance Intelligence</span>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-primary-600 uppercase">Performance Reporting</span>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Governance Intelligence</h1>
            <p className="text-slate-500 font-medium max-w-xl">
              Advanced behavioral analytics and disciplinary variance reporting for the strategic ecosystem.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={fetchData}
            className="flex items-center justify-center w-12 h-12 rounded-2xl border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-900 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => navigate('/governance')}
            className="flex items-center justify-center w-12 h-12 rounded-2xl border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Incidents', value: violations.length, icon: ShieldAlert, color: 'text-slate-900' },
          { label: 'Compliance Variance', value: `₦${totalFines.toLocaleString()}`, icon: TrendingUp, color: 'text-primary-600' },
          { label: 'Active Business Units', value: businessUnits.length, icon: LayoutGrid, color: 'text-slate-900' },
          { label: 'Unresolved Protocols', value: violations.filter(v => v.status === 'UNPAID').length, icon: Target, color: 'text-rose-600' }
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{kpi.label}</p>
            <div className="flex items-center justify-between">
               <p className={`text-3xl font-black tracking-tight ${kpi.color}`}>{kpi.value}</p>
               <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <kpi.icon size={18} className="text-slate-300" />
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-10 flex flex-col gap-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Business Unit Variance</h3>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><MoreVertical size={18} /></button>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={violationsByBU} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#dc6803" 
                  radius={[8, 8, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-10 flex flex-col gap-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Incident Classification</h3>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><MoreVertical size={18} /></button>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={violationsByCategory} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill="#10b981" 
                  radius={[0, 8, 8, 0]} 
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
             <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Status Lifecycle</h3>
          </div>
          
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-2xl font-black text-slate-900">{violations.length}</span>
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
             {statusData.map((s, i) => (
               <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{s.count}</span>
               </div>
             ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/20 flex flex-col justify-between"
        >
           <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                 <h3 className="text-lg font-black tracking-tight uppercase tracking-widest text-sm">Actionable Intelligence</h3>
                 <p className="text-slate-400 text-xs font-medium">Compliance protocol optimization insights.</p>
              </div>
              <FileText className="text-primary-500 opacity-50" size={32} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Critical Trend Detection</p>
                 <p className="text-sm font-medium text-slate-300 leading-relaxed">
                   Current data indicates a <span className="text-primary-500 font-black">12% increase</span> in minor variances across the Technology business unit. Recommend temporal locking enforcement for Week 19.
                 </p>
              </div>
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Financial Impact Projection</p>
                 <p className="text-sm font-medium text-slate-300 leading-relaxed">
                   Projected disciplinary credits for Q2: <span className="text-emerald-400 font-black">₦2,450,000</span>. Strategic fund buffer is at optimal capacity for operational disbursement.
                 </p>
              </div>
           </div>

           <div className="mt-12 flex items-center gap-6">
              <button className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary-500/20 active:scale-95 flex items-center gap-2">
                 <Download size={14} />
                 Generate Detailed Intelligence Report
              </button>
              <button className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                 <Filter size={14} />
                 Temporal Comparison Mode
              </button>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportingAnalytics;