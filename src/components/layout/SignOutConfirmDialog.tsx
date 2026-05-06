import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SignOutConfirmDialogProps {
  isOpen: boolean;
  isSigningOut: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SignOutConfirmDialog: React.FC<SignOutConfirmDialogProps> = ({
  isOpen,
  isSigningOut,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-modal w-full max-w-md overflow-hidden animate-scale-in border border-slate-100">
        <div className="p-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">End Identity Session?</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
            Are you sure you want to disconnect from the <span className="font-bold text-slate-900">Governance Registry</span>?
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              disabled={isSigningOut}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isSigningOut}
              className="flex-[2] py-3 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-900/20 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              {isSigningOut ? 'Terminating...' : 'Confirm Sign Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};