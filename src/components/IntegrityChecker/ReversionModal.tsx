import React from 'react';
import { RotateCcw, Check, Undo2, LoaderCircle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReversionModalProps {
  isBulkMode: boolean;
  selectedCount: number;
  taskTitle?: string;
  applyPenalty: boolean;
  penaltyConfig: number;
  waiveReason: string;
  submitting: boolean;
  onApplyPenaltyChange: (val: boolean) => void;
  onWaiveReasonChange: (val: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ReversionModal: React.FC<ReversionModalProps> = ({
  isBulkMode,
  selectedCount,
  taskTitle,
  applyPenalty,
  penaltyConfig,
  waiveReason,
  submitting,
  onApplyPenaltyChange,
  onWaiveReasonChange,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onCancel}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200"
      >
        <button 
          onClick={onCancel}
          className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all z-20"
        >
          <X size={20} />
        </button>

        <div className="relative p-10 lg:p-14 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-primary-50 rounded-3xl flex items-center justify-center text-primary-600 mb-8 relative z-10 shadow-inner">
            <RotateCcw size={48} strokeWidth={2.5} />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-3">
              {isBulkMode ? 'Bulk Reversion Protocol' : 'Revert Progress'}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              {isBulkMode 
                ? `Revert progress for ${selectedCount} selected key results`
                : `Revert "${taskTitle}" to previous state`
              }
            </p>
          </div>

          <div className="w-full space-y-4 mb-10 relative z-10">
            <div
              onClick={() => onApplyPenaltyChange(!applyPenalty)}
              className={`group flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                applyPenalty 
                  ? 'bg-primary-50 border-primary-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                  applyPenalty 
                    ? 'bg-primary-600 border-primary-600 shadow-lg shadow-primary-500/20' 
                    : 'bg-white border-slate-300'
                }`}>
                  {applyPenalty && <Check size={18} className="text-white" />}
                </div>
                <div className="text-left">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-tight block">Apply Disciplinary Penalty</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5 block">
                    {isBulkMode ? `Protocol Impact: -${penaltyConfig * selectedCount}%` : `Systemic adjustment: -${penaltyConfig}%`}
                  </span>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {!applyPenalty && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Governance Waiver Authorization</label>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 text-rose-600 rounded-lg">
                       <AlertCircle size={10} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Mandatory</span>
                    </div>
                  </div>
                  <textarea
                    value={waiveReason}
                    onChange={(e) => onWaiveReasonChange(e.target.value)}
                    placeholder="Provide formal justification for this exception..."
                    rows={4}
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/10 focus:bg-white shadow-inner transition-all resize-none"
                  ></textarea>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full relative z-10">
            <button
              onClick={onCancel}
              disabled={submitting}
              className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all disabled:opacity-50 active:scale-95"
            >
              Abort Protocol
            </button>
            <button
              onClick={onConfirm}
              disabled={submitting || (!applyPenalty && !waiveReason.trim())}
              className={`flex-[1.5] py-5 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale active:scale-95 ${
                applyPenalty ? 'bg-primary-600 shadow-primary-500/20 hover:bg-primary-500' : 'bg-slate-900 shadow-slate-900/20 hover:bg-slate-800'
              }`}
            >
              {submitting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <Undo2 size={16} />}
              {submitting ? 'Synchronizing Cloud...' : 'Confirm System Override'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};