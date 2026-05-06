import React, { useState, useEffect, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children?: ReactNode;
  check: () => Promise<boolean>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, check }) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    check().then(setAllowed);
  }, [check]);

  if (allowed === null) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
        <p className="mt-4 text-sm text-slate-500">Verifying credentials...</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 glass-surface rounded-xl border border-slate-200/60 m-8 animate-scale-in shadow-modal">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center mb-6">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Restricted</h1>
        <p className="text-slate-500 mt-2 font-medium">Insufficient clearance for this governance node.</p>
        <NavLink
          to="/"
          className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all text-sm font-bold uppercase tracking-widest"
        >
          Return to Dashboard
        </NavLink>
      </div>
    );
  }

  return <>{children}</>;
};