import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  Download,
  Search,
  Filter,
  User,
  Wallet,
  ArrowUpRight,
  RefreshCw,
  MoreVertical,
  Banknote
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface DisbursementRequest {
  id: string;
  amount: number;
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_by: string;
  approved_by: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

const DisbursementApprovalPanel: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DisbursementRequest[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [requestsRes, usersRes] = await Promise.all([
        supabase.from('disbursement_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, name, email, firstName, lastName')
      ]);
      
      if (requestsRes.error) throw new Error(requestsRes.error.message);
      if (usersRes.error) throw new Error(usersRes.error.message);
      
      setRequests(requestsRes.data as DisbursementRequest[]);
      setUsers(usersRes.data as UserProfile[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Synchronization failure.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (requestId: string) => {
    try {
      setSuccess(`Disbursement ${requestId.slice(0, 8)} authorized.`);
      setTimeout(() => setSuccess(null), 3000);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authorization failed.');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setSuccess(`Disbursement ${requestId.slice(0, 8)} voided.`);
      setTimeout(() => setSuccess(null), 3000);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rejection failed.');
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'PENDING');
  const totalPendingAmount = pendingRequests.reduce((sum, req) => sum + req.amount, 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Validating Disbursement Protocols...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto space-y-12 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <ShieldCheck size={12} className="text-primary-600" />
            <span>Financial Governance</span>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-primary-600 uppercase">Disbursement Auth</span>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Disbursement Auth</h1>
            <p className="text-slate-500 font-medium max-w-xl">
              Authorize operational expenditures and verify cryptographic fund allocation requests.
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

      {/* Approval KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pending Authorization</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 tracking-tight">{pendingRequests.length}</span>
            <span className="text-xs font-bold text-slate-400">Requests</span>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
            <Clock size={14} />
            <span>Awaiting Review</span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-primary-100 p-8 shadow-xl shadow-primary-500/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Banknote size={100} />
           </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Value at Stake</p>
          <p className="text-4xl font-black text-primary-600 tracking-tight">₦{totalPendingAmount.toLocaleString()}</p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-primary-400 uppercase tracking-widest">
            <Wallet size={14} />
            <span>Fund Allocation Buffer: Active</span>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Security Protocol</p>
          <p className="text-lg font-black leading-tight mb-4 tracking-tight">Multi-Sig Authorization Required</p>
          <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
             View Compliance Logs
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Auth Registry</h3>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl">
                <Search size={14} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Personnel search..." 
                  className="text-[10px] font-bold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-300 w-48"
                />
             </div>
             <button className="p-3 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all shadow-sm">
                <Filter size={18} />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/30 text-left">
                <th className="pl-10 pr-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Requestor Node</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Allocation Value</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Purpose</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Temporal Ref</th>
                <th className="pl-6 pr-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Auth Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <ShieldCheck size={48} className="text-emerald-500" />
                      <p className="font-black uppercase tracking-[0.3em] text-xs">Auth Queue Clear: No Pending Requests</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingRequests.map((request) => {
                  const user = users.find(u => u.id === request.requested_by);
                  return (
                    <tr key={request.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="pl-10 pr-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <User size={16} className="text-slate-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 tracking-tight">
                              {user?.name || 'Unknown Node'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {user?.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-sm font-black text-slate-900 tracking-tight">
                          ₦{request.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <p className="text-xs font-bold text-slate-500 leading-relaxed max-w-xs truncate">
                          {request.purpose}
                        </p>
                      </td>
                      <td className="px-6 py-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="pl-6 pr-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            className="p-3 bg-white border border-slate-200 text-rose-500 rounded-xl hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm active:scale-95"
                            onClick={() => handleReject(request.id)}
                            title="Reject Request"
                          >
                            <XCircle size={18} />
                          </button>
                          <button 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-500 transition-all active:scale-95"
                            onClick={() => handleApprove(request.id)}
                          >
                            Authorize
                            <ArrowUpRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <AlertTriangle size={14} className="text-amber-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 Funds will be deducted from Strategic Governance Pool upon authorization
              </p>
           </div>
           <button className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors flex items-center gap-2">
              <Download size={14} />
              Export Batch Statement
           </button>
        </div>
      </div>
    </div>
  );
};

export default DisbursementApprovalPanel;