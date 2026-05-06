import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Plus, 
  RefreshCw, 
  FileText, 
  Building2, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Search,
  SlidersHorizontal,
  Download,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_VIOLATION_CATEGORIES, MOCK_VIOLATIONS, MOCK_USERS, MOCK_BUSINESS_UNITS } from '@/utils/mock-data';

interface ViolationCategory {
  id: string;
  name: string;
  description: string;
  severity_level: 'Minor' | 'Major' | 'Critical';
  default_fine_amount: number;
  is_active: boolean;
}

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  department: string;
}

interface BusinessUnit {
  id: string;
  name: string;
}

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
  category?: ViolationCategory;
  violator?: Profile;
  business_unit?: BusinessUnit;
}

const StatusBadge: React.FC<{ status: Violation['status'] }> = ({ status }) => {
  const config = {
    PAID: { label: 'Resolved', icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    UNPAID: { label: 'Action Required', icon: AlertTriangle, cls: 'bg-rose-50 text-rose-600 border-rose-100' },
    VOID: { label: 'Voided', icon: XCircle, cls: 'bg-slate-50 text-slate-400 border-slate-200' },
  };
  const { label, icon: Icon, cls } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${cls}`}>
      <Icon size={12} />
      {label}
    </span>
  );
};

const SeverityBadge: React.FC<{ severity?: ViolationCategory['severity_level'] }> = ({ severity }) => {
  if (!severity) return <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">—</span>;
  const cls = {
    Minor: 'bg-amber-50 text-amber-600 border-amber-100',
    Major: 'bg-orange-50 text-orange-600 border-orange-100',
    Critical: 'bg-rose-50 text-rose-600 border-rose-100',
  }[severity];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${cls}`}>
      {severity}
    </span>
  );
};

const ViolationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [violations, setViolations] = useState<Violation[]>([]);
  const [categories, setCategories] = useState<ViolationCategory[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [violationsRes, categoriesRes, buRes, profilesRes] = await Promise.all([
        supabase.from('violations').select('*').order('created_at', { ascending: false }),
        supabase.from('violation_categories').select('*').order('name'),
        supabase.from('business_units').select('id, name'),
        supabase.from('profiles').select('id, firstName, lastName, name, department'),
      ]);

      const dbCategories = (categoriesRes.data ?? []) as ViolationCategory[];
      const dbBusinessUnits = (buRes.data ?? []) as BusinessUnit[];
      const dbProfiles = (profilesRes.data ?? []) as Profile[];
      const dbViolations = violationsRes.data ?? [];

      const useMockData = dbCategories.length === 0 && dbViolations.length === 0;

      const categories = useMockData ? MOCK_VIOLATION_CATEGORIES : dbCategories;
      const businessUnits = useMockData ? MOCK_BUSINESS_UNITS : dbBusinessUnits;
      const profiles = useMockData ? MOCK_USERS : dbProfiles;
      const violationsData = useMockData ? MOCK_VIOLATIONS : dbViolations;

      setCategories(categories);
      setBusinessUnits(businessUnits.map(b => ({ id: b.id, name: b.name })));
      setProfiles(profiles.map(p => ({ id: p.id, name: p.name, firstName: p.firstName, lastName: p.lastName, department: p.department })));

      const resolved = (violationsData as Violation[]).map(v => ({
        ...v,
        category: categories.find(c => c.id === v.category_id),
        violator: profiles.find(p => p.id === v.violator_id),
        business_unit: businessUnits.find(b => b.id === v.bu_id),
      }));

      setViolations(resolved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load violations data.');
      setCategories(MOCK_VIOLATION_CATEGORIES);
      setBusinessUnits(MOCK_BUSINESS_UNITS.map(b => ({ id: b.id, name: b.name })));
      setProfiles(MOCK_USERS.map(p => ({ id: p.id, name: p.name, firstName: p.firstName, lastName: p.lastName, department: p.department })));
      setViolations(MOCK_VIOLATIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredViolations = violations.filter(v => 
    v.violator?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.business_unit?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unpaidCount = violations.filter(v => v.status === 'UNPAID').length;
  const paidCount = violations.filter(v => v.status === 'PAID').length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Compliance Registry...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto space-y-12 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <ShieldAlert size={12} className="text-primary-600" />
            <span>Governance Hub</span>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-primary-600">Compliance & Violations</span>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Violation Registry</h1>
            <p className="text-slate-500 font-medium max-w-xl">
              Monitor, enforce, and resolve OKR compliance variances across organizational nodes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           <button
            onClick={() => navigate('/governance/audit')}
            className="flex items-center gap-2 px-6 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <FileText size={16} className="text-slate-400" />
            Audit Ledger
          </button>
          <button
            onClick={() => navigate('/governance/violations/new')}
            className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-500 transition-all active:scale-95"
          >
            <Plus size={16} />
            Record Violation
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {[
          { label: 'System Violations', value: violations.length, icon: ShieldAlert, color: 'text-primary-600', bg: 'bg-primary-50', border: 'border-primary-100' },
          { label: 'Unpaid Fines', value: unpaidCount, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
          { label: 'Resolved Cases', value: paidCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Risk Categories', value: categories.length, icon: Building2, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' },
        ].map((stat) => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={stat.label} 
            className={`bg-white rounded-[2rem] border ${stat.border} p-8 shadow-sm transition-all`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-inner`}>
                <stat.icon size={24} />
              </div>
              <ArrowUpRight size={20} className="text-slate-200" />
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Table Controls */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="relative flex-1 max-w-md group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
             <input 
               type="text"
               placeholder="Search violators, categories, or units..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
             />
           </div>
           
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <SlidersHorizontal size={14} />
               <span>Protocol View</span>
             </div>
             <button
                onClick={fetchData}
                className="p-3 text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-xl transition-all"
                title="Synchronize Registry"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
           </div>
        </div>

        {/* Violations Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="pl-10 pr-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Violator Identity</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Unit</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Variance Class</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Severity Profile</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="pl-6 pr-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredViolations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <CheckCircle2 size={48} className="text-slate-400" />
                        <p className="font-black uppercase tracking-[0.3em] text-xs">Registry Clean: No Violations Detected</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredViolations.map((v) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={v.id} 
                      className="group hover:bg-slate-50/50 transition-all"
                    >
                      <td className="pl-10 pr-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0 shadow-sm">
                            <span className="text-xs font-black text-primary-700 uppercase">
                              {v.violator ? `${v.violator.firstName[0]}${v.violator.lastName[0]}` : '?'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 tracking-tight">
                              {v.violator?.name ?? <span className="text-slate-400 italic font-medium">Anonymous Node</span>}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {v.violator?.department || 'Unassigned Unit'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-xs font-bold text-slate-600">
                          {v.business_unit?.name ?? <span className="text-slate-300 italic font-medium">Systemic</span>}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-black text-slate-800 tracking-tight">
                            {v.category?.name ?? <span className="text-slate-300 italic font-medium">Uncategorized</span>}
                          </span>
                          {v.category?.default_fine_amount != null && (
                            <span className="text-[10px] font-black text-primary-600">
                              ₦{v.category.default_fine_amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <SeverityBadge severity={v.category?.severity_level} />
                      </td>
                      <td className="px-6 py-6">
                        <StatusBadge status={v.status} />
                      </td>
                      <td className="pl-6 pr-10 py-6 text-right">
                        <button
                          onClick={() => navigate(`/governance/violations/${v.id}`)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95"
                        >
                          Details
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        
        {/* Footer Controls */}
        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             Showing {filteredViolations.length} of {violations.length} archived incidents
           </p>
           <button 
             className="flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] hover:text-primary-700 transition-colors"
             onClick={() => window.print()}
           >
             <Download size={14} />
             Export Compliance Report
           </button>
        </div>
      </div>
    </div>
  );
};

export default ViolationDashboard;