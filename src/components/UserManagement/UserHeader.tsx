import React from 'react';
import { Search, Bell, HelpCircle, Plus, Lock } from 'lucide-react';

interface UserHeaderProps {
  searchTerm: string;
  handleSearch: (term: string) => void;
  permCreateUsers: boolean;
  onNewIdentityClick: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ 
  searchTerm, 
  handleSearch, 
  permCreateUsers, 
  onNewIdentityClick 
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Organization</span>
          <span className="text-primary-500">Identities</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identity Management</h1>
        <p className="text-slate-500 text-sm font-medium">Directory of all authorized users and system principals.</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search identities, groups, or roles..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-[360px] pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <button title="Notifications" className="relative p-2.5 bg-white text-slate-400 hover:text-primary-600 rounded-xl transition-all border border-slate-200 shadow-sm transition-all">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
          </button>
          <button title="Help Center" className="p-2.5 bg-white text-slate-400 hover:text-slate-800 rounded-xl transition-all border border-slate-200 shadow-sm transition-all">
            <HelpCircle size={20} />
          </button>
          <div className="w-px h-8 bg-slate-200 mx-2"></div>
          {permCreateUsers ? (
            <button
              onClick={onNewIdentityClick}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all hover:translate-y-[-2px] active:translate-y-0"
            >
              <Plus size={18} /> New Identity
            </button>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-400 rounded-xl text-sm font-bold cursor-not-allowed" title="Insufficient permissions: USERS_CREATE required">
              <Lock size={16} /> No Create Access
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
