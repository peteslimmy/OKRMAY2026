import React from 'react';
import { FileDown, Mail, History, Sparkles } from 'lucide-react';

export const AttendanceSidebar: React.FC = () => {
  return (
    <div className="lg:col-span-3 space-y-8">
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Quick Actions</h4>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:border-primary-200 hover:bg-primary-50/30 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-white group-hover:text-primary-600 transition-colors">
                <FileDown size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700">Export Full Report</span>
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:border-primary-200 hover:bg-primary-50/30 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-white group-hover:text-primary-600 transition-colors">
                <Mail size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700">Follow-up Absentees</span>
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm hover:border-primary-200 hover:bg-primary-50/30 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-white group-hover:text-primary-600 transition-colors">
                <History size={20} />
              </div>
              <span className="text-sm font-bold text-slate-700">View History</span>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
              <Sparkles size={16} fill="currentColor" />
            </div>
            <h4 className="text-sm font-black text-slate-900 tracking-tight">Smart Insights</h4>
          </div>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            Engagement is up by <span className="text-primary-600 font-bold">12%</span> compared to last week. Late arrivals dropped significantly in the <span className="font-bold text-slate-900 tracking-tight">Engineering</span> department.
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 text-primary-200/20 rotate-12">
          <Sparkles size={80} fill="currentColor" />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Meeting Settings</h4>
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm divide-y divide-slate-100">
          <div className="flex items-center justify-between p-4">
            <span className="text-sm font-semibold text-slate-700">Auto-generate report</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" aria-label="Auto-generate report" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4">
            <span className="text-sm font-semibold text-slate-700">Notify on late arrival</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" aria-label="Notify on late arrival" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};