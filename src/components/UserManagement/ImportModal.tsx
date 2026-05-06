import React from 'react';
import { X, UploadCloud, Download, Trash2, LoaderCircle, AlertTriangle, CheckCircle2, DatabaseZap } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importCsvData: string;
  setImportCsvData: (data: string) => void;
  bulkImportResults: { success: number, failures: string[] } | null;
  onBulkUpload: () => void;
  onDownloadTemplate: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  importCsvData,
  setImportCsvData,
  bulkImportResults,
  onBulkUpload,
  onDownloadTemplate,
  onFileChange,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in border border-white/20">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white">
          <div>
            <h3 className="font-black text-slate-900 uppercase tracking-tight text-xl leading-none">Bulk Identity Provisioning</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic">Registry Protocol: Recursive Identity injection</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-[4px] text-slate-300 transition-all hover:text-slate-600"><X size={24} /></button>
        </div>

        <div className="p-10 space-y-6">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-[4px] border border-slate-100 mb-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">CSV Source Selection</label>
              <p className="text-[11px] text-slate-600 font-bold">Upload a .csv file or paste raw data directly below.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-[4px] text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
                <UploadCloud size={14} className="text-primary-500" /> Upload File
                <input type="file" className="hidden" accept=".csv" onChange={onFileChange} />
              </label>
              <button
                onClick={onDownloadTemplate}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-50 text-primary-600 rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-primary-100 transition-all"
              >
                <Download size={14} /> Template
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Payload Manifest (CSV Text)</label>
            {importCsvData && (
              <button onClick={() => setImportCsvData('')} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 flex items-center gap-1">
                <Trash2 size={12} /> Clear Workspace
              </button>
            )}
          </div>

          <div className="relative">
            <textarea
              value={importCsvData}
              onChange={(e) => setImportCsvData(e.target.value)}
              placeholder="firstName,lastName,email,role,department&#10;John,Doe,john.doe@fcis.com,Manager,IT"
              className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-[4px] text-xs font-mono outline-none focus:ring-4 focus:ring-primary-500/10 transition-all resize-none"
            />
            <div className="absolute bottom-4 right-4 text-[9px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">
              Line Delimited / Comma Separated
            </div>
          </div>

          {bulkImportResults && (
            <div className={`p-6 rounded-[4px] border border-dashed animate-slide-up ${bulkImportResults.failures.length > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-emerald-50/50 border-emerald-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                {bulkImportResults.failures.length > 0 ? <AlertTriangle className="text-amber-500" size={18} /> : <CheckCircle2 className="text-emerald-500" size={18} />}
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Import Analysis Complete</span>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-600">Successfully Prepared: <span className="text-emerald-600">{bulkImportResults.success} Identities</span></p>
                {bulkImportResults.failures.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] font-bold text-rose-600 mb-2">Protocol Violations ({bulkImportResults.failures.length}):</p>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                      {bulkImportResults.failures.map((f, i) => (
                        <p key={i} className="text-[10px] font-medium text-slate-500 bg-white/50 px-2 py-1 rounded">Critical Error: {f}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-8 py-5 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            disabled={isSubmitting}
          >
            Abort Protocol
          </button>
          <button
            onClick={onBulkUpload}
            disabled={isSubmitting || !importCsvData.trim()}
            className="flex items-center gap-3 px-10 py-5 rounded-full text-[12px] font-black uppercase tracking-[0.1em] bg-slate-900 text-white shadow-2xl hover:bg-primary-600 transition-all disabled:opacity-50"
          >
            {isSubmitting ? <LoaderCircle className="w-5 h-5 animate-spin" /> : <DatabaseZap size={18} />} Execute Batch Injection
          </button>
        </div>
      </div>
    </div>
  );
};
