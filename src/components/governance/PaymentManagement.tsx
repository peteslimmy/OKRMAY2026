import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert,
  ChevronRight,
  Download,
  Building2,
  Wallet,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

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

interface User {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

const PaymentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [categories, setCategories] = useState<ViolationCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [violationsRes, categoriesRes, usersRes] = await Promise.all([
        supabase.from('violations').select('*').eq('status', 'UNPAID').order('created_at', { ascending: false }),
        supabase.from('violation_categories').select('*'),
        supabase.from('profiles').select('id, name, email, firstName, lastName')
      ]);
      
      if (violationsRes.error) throw new Error(violationsRes.error.message);
      if (categoriesRes.error) throw new Error(categoriesRes.error.message);
      if (usersRes.error) throw new Error(usersRes.error.message);
      
      setViolations(violationsRes.data as Violation[]);
      setCategories(categoriesRes.data as ViolationCategory[]);
      setUsers(usersRes.data as User[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during data synchronization.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayViolation = async (violationId: string) => {
    try {
      // In a real implementation, this would open a payment modal or gateway
      setSuccess(`Governance node ${violationId.slice(0, 8)} cleared successfully.`);
      setTimeout(() => setSuccess(null), 3000);
      await fetchData(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Financial synchronization failed.');
    }
  };

  const totalOutstanding = violations.reduce((sum, v) => {
    const cat = categories.find(c => c.id === v.category_id);
    return sum + (cat?.default_fine_amount || 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Financial Ledger...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto space-y-12 animate-fade-in pb-24">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <Wallet size={12} className="text-primary-600" />
            <span>Financial Governance</span>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-primary-600 uppercase">Payment Terminal</span>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Payment Terminal</h1>
            <p className="text-slate-500 font-medium max-w-xl">
              Resolve outstanding governance penalties and authorize cryptographic fund transfers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/governance')}
            className="flex items-center justify-center w-12 h-12 rounded-2xl border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-4 text-emerald-600"
          >
            <CheckCircle2 size={24} />
            <span className="text-sm font-black uppercase tracking-widest">{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-primary-100 p-8 shadow-xl shadow-primary-500/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <CreditCard size={120} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Outstanding Fines</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-primary-600 tracking-tight">₦{totalOutstanding.toLocaleString()}</span>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest">
            <AlertTriangle size={14} />
            <span>Requires Immediate Resolution</span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pending Incidents</p>
          <p className="text-4xl font-black text-slate-900 tracking-tight">{violations.length}</p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Clock size={14} />
            <span>Awaiting Action</span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col justify-between">
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Action</p>
             <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all active:scale-95">
               Bulk Resolution Mode
             </button>
           </div>
           <p className="text-[9px] text-slate-400 font-medium text-center mt-4 uppercase tracking-[0.1em]">Only authorized treasurers can proceed</p>
        </div>
      </div>

      {/* Unpaid Violations Registry */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
             <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-widest text-sm">Actionable Variance Registry</h3>
          </div>
          <button
            onClick={fetchData}
            className="p-3 text-slate-400 hover:text-primary-600 bg-white border border-slate-100 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="pl-10 pr-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel Node</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Variance Class</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fine Amount</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Week Ref</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Protocol Status</th>
                <th className="pl-6 pr-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {violations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <CheckCircle2 size={48} className="text-emerald-500" />
                      <p className="font-black uppercase tracking-[0.3em] text-xs">Financial Clearance: No Pending Fines</p>
                    </div>
                  </td>
                </tr>
              ) : (
                violations.map((violation) => {
                  const category = categories.find(c => c.id === violation.category_id);
                  const user = users.find(u => u.id === violation.violator_id);
                  return (
                    <tr key={violation.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="pl-10 pr-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-black text-slate-600 uppercase">
                              {user ? (user.firstName ? `${user.firstName[0]}${user.lastName?.[0] || ''}` : user.name?.[0]) : '?'}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 tracking-tight">
                              {user?.name || 'Unknown Node'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                              {user?.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-slate-700 tracking-tight uppercase tracking-widest">{category?.name}</span>
                           <span className="text-[10px] text-slate-400 font-medium">{category?.severity_level} Severity</span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-sm font-black text-primary-600 tracking-tight">
                          ₦{category?.default_fine_amount?.toLocaleString() || '0.00'}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {violation.week_reference}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-widest">
                          <AlertTriangle size={10} />
                          {violation.status}
                        </span>
                      </td>
                      <td className="pl-6 pr-10 py-6 text-right">
                        <button 
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-500 transition-all active:scale-95"
                          onClick={() => handlePayViolation(violation.id)}
                        >
                          Resolve
                          <ArrowUpRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             Authorized by Governance Protocol 4.0
           </p>
           <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
             <Download size={14} />
             Export Financial Statement
           </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;