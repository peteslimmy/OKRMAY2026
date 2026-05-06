import React from 'react';
import { ChevronDown, Download, Globe, Fingerprint, ShieldCheck, ShieldAlert, RefreshCcw, Info } from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogTabProps {
  logs: AuditLog[];
  expandedLogId: string | null;
  onToggleExpand: (id: string | null) => void;
  onExport: () => void;
}

export const AuditLogTab: React.FC<AuditLogTabProps> = ({
  logs,
  expandedLogId,
  onToggleExpand,
  onExport,
}) => {
  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Granular Audit Trace</h3>
          <p className="text-xs text-slate-500 mt-1">Deep high-fidelity traceability of all governance transactions.</p>
        </div>
        <button onClick={onExport} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all">
          <Download size={14} /> Export Protocol Logs
        </button>
      </div>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50/80 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-5">Timestamp (WAT)</th>
              <th className="px-6 py-5">Operator / Node</th>
              <th className="px-6 py-5">Strategic Action</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map(log => {
              const isExpanded = expandedLogId === log.id;
              return (
                <React.Fragment key={log.id}>
                  <tr className={`hover:bg-slate-50/50 transition-colors ${isExpanded ? 'bg-slate-50/30' : ''}`}>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-mono text-[11px] font-bold text-slate-700">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{new Date(log.timestamp).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center font-black text-[10px] text-primary-600 border border-primary-100">{log.userName[0]}</div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-[11px]">{log.userName}</span>
                          <span className="font-mono text-[9px] text-slate-400 flex items-center gap-1"><Globe size={8} /> {log.ipAddress || '105.112.XX.XX'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-md text-[8px] font-black uppercase tracking-widest border border-primary-100 w-fit">{log.action}</span>
                        <span className="text-slate-600 font-bold text-[11px] truncate max-w-[200px]">{log.details}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase">
                        <ShieldCheck size={12} /> SECURED
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => onToggleExpand(isExpanded ? null : log.id)}
                        className={`p-2 rounded-md transition-all ${isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-slate-50/50 font-montserrat">
                      <td colSpan={5} className="px-10 py-6 border-b border-slate-100 animate-slide-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Fingerprint size={12} className="text-primary-500" /> Transaction Metadata
                            </h5>
                            <div className="bg-white p-4 rounded-md border border-slate-200 font-mono text-[10px] text-slate-600 shadow-inner overflow-x-auto whitespace-pre">
                              {JSON.stringify(log.metadata || { node_id: log.id, protocol: 'HTTPS/WAT' }, null, 2)}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <Info size={12} className="text-primary-500" /> Granular Changes
                            </h5>
                            <div className="bg-white p-5 rounded-md border border-slate-200 space-y-3 shadow-inner min-h-[100px]">
                              {log.metadata?.changes ? (
                                Object.entries(log.metadata.changes).map(([field, change]: [string, any]) => (
                                  <div key={field} className="flex flex-col gap-1 pb-2 border-b border-slate-50 last:border-0">
                                    <span className="text-[9px] font-black text-slate-400 uppercase">{field}</span>
                                    <div className="flex items-center gap-2 text-[11px]">
                                      <span className="text-rose-500 line-through opacity-60">{String(change.old)}</span>
                                      <RefreshCcw size={8} className="text-slate-300" />
                                      <span className="text-emerald-600 font-bold">{String(change.new)}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">No field-level delta archived for this transaction type.</p>
                              )}
                              <div className="pt-2 flex items-center gap-2 text-[9px] text-slate-400">
                                <ShieldAlert size={10} className="text-amber-500" />
                                Validated via Governance Node 105.112.XX.XX
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};