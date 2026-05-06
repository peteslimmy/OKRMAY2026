import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Download,
  Filter,
  Search,
  Calendar,
  ChevronRight,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

interface FundLedgerEntry {
  id: string;
  entry_type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  created_at: string;
  created_by: string;
}

const LedgerView: React.FC = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<FundLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const { currentUser } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('fund_ledger')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ledgerError) throw new Error(ledgerError.message);
      
      const typedData = ledgerData as FundLedgerEntry[];
      setEntries(typedData);
      
      const totalBalance = typedData.reduce((acc, entry) => {
        return entry.entry_type === 'CREDIT' ? acc + entry.amount : acc - entry.amount;
      }, 0);
      
      setBalance(totalBalance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ledger synchronization failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCredits = entries
    .filter(e => e.entry_type === 'CREDIT')
    .reduce((sum, e) => sum + e.amount, 0);
    
  const totalDebits = entries
    .filter(e => e.entry_type === 'DEBIT')
    .reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Auditing Cryptographic Ledger...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto space-y-12 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <History size={12} className="text-primary-600" />
            <span>Financial Governance</span>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-primary-600 uppercase">Strategic Ledger</span>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Strategic Ledger</h1>
            <p className="text-slate-500 font-medium max-w-xl">
              Immutable audit trail of all governance fund movements and disciplinary credits.
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

      {/* Financial Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Scale size={100} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Consolidated Balance</p>
          <p className="text-4xl font-black tracking-tight">₦{balance.toLocaleString()}</p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-primary-400 uppercase tracking-widest">
            <TrendingUp size={14} />
            <span>Fund Health: Optimal</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm"
        >
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Credited Penalties</p>
          <p className="text-4xl font-black text-emerald-600 tracking-tight">₦{totalCredits.toLocaleString()}</p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <ArrowUpRight size={14} className="text-emerald-500" />
            <span>Inflow via Disciplinary Action</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm"
        >
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Disbursement outflow</p>
          <p className="text-4xl font-black text-rose-600 tracking-tight">₦{totalDebits.toLocaleString()}</p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <ArrowDownLeft size={14} className="text-rose-500" />
            <span>Operational Expenditure</span>
          </div>
        </motion.div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transaction History</h3>
             </div>
             
             <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl">
                <Search size={14} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter by description..." 
                  className="text-[10px] font-bold text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-300 w-48"
                />
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="p-3 text-slate-400 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-all shadow-sm">
                <Filter size={18} />
             </button>
             <button className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 transition-all shadow-lg active:scale-95">
                <Download size={14} />
                Export CSV
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/30 text-left">
                <th className="pl-10 pr-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Type</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="pl-6 pr-10 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cumulative Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry, index) => {
                // Calculate running balance for display
                let runningBalance = 0;
                for (let i = entries.length - 1; i >= index; i--) {
                  runningBalance += (entries[i].entry_type === 'CREDIT' ? entries[i].amount : -entries[i].amount);
                }
                
                return (
                  <tr key={entry.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="pl-10 pr-6 py-6">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-slate-300" />
                        <span className="text-xs font-bold text-slate-600">
                          {new Date(entry.created_at).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        entry.entry_type === 'CREDIT' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {entry.entry_type === 'CREDIT' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                        {entry.entry_type}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <p className="text-sm font-black text-slate-900 tracking-tight leading-snug">
                        {entry.description}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`text-sm font-black tracking-tight ${
                        entry.entry_type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {entry.entry_type === 'CREDIT' ? '+' : '-'} ₦{entry.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="pl-6 pr-10 py-6 text-right">
                      <span className="text-sm font-black text-slate-900 tracking-tight">
                        ₦{runningBalance.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100">
           <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 Strategic Governance Ledger | Cryptographically Signed
              </p>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chain Synchronized</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerView;