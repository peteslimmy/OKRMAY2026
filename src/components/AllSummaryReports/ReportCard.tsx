import React from 'react';
import { Sparkles, Download } from 'lucide-react';
import { Report, CAT_META } from './data';

interface ReportCardProps {
  report: Report;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, isExpanded, onToggle }) => {
  const meta = CAT_META[report.cat];

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 cursor-pointer"
      onClick={onToggle}
    >
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg, color: meta.color }}>
            {CAT_META[report.cat]?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1 group-hover:text-primary-600 transition-colors">
              {report.title}
            </h3>
            <code className="text-[10px] font-mono text-slate-400">{report.id}</code>
          </div>
        </div>
        <p className={`text-xs text-slate-500 leading-relaxed mb-4 ${isExpanded ? '' : 'line-clamp-2'}`}>
          {report.desc}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600">
            {report.freq}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600">
            {report.roles}
          </span>
          {report.live && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}
          {report.ai && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-violet-100 text-violet-700">
              <Sparkles size={10} />
              AI
            </span>
          )}
          {report.export && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-200">
              <Download size={10} />
              Export
            </span>
          )}
        </div>
      </div>
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">
          {isExpanded ? 'Click to collapse' : 'Click for details'}
        </span>
        <div className="flex items-center gap-1 text-xs font-semibold text-primary-600">
          View Report
          <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};