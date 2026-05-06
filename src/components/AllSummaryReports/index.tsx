import React, { useState, useMemo } from 'react';
import { Search, FileText, TrendingUp, BarChart3, Sparkles } from 'lucide-react';
import { REPORTS, CAT_META, Report } from './data';
import { ReportCard } from './ReportCard';

const AllSummaryReports: React.FC = () => {
  const [currentCat, setCurrentCat] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'performance', label: 'Performance' },
    { key: 'okr', label: 'OKR & KR' },
    { key: 'financial', label: 'Financial' },
    { key: 'governance', label: 'Governance' },
    { key: 'people', label: 'People' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'audit', label: 'Audit & Security' },
    { key: 'strategic', label: 'Strategic' },
  ];

  const filteredReports = useMemo(() => {
    return REPORTS.filter(r => {
      const matchCat = currentCat === 'all' || r.cat === currentCat;
      const matchSearch = !searchTerm ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.freq.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [currentCat, searchTerm]);

  const byCategory: Record<string, Report[]> = {};
  filteredReports.forEach(r => {
    if (!byCategory[r.cat]) byCategory[r.cat] = [];
    byCategory[r.cat].push(r);
  });

  const order = Object.keys(CAT_META);
  const totalReports = REPORTS.length;
  const catCount = Object.keys(CAT_META).length;
  const liveCount = REPORTS.filter(r => r.live).length;
  const aiCount = REPORTS.filter(r => r.ai).length;

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-20">
      <div className="mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Report Library</h1>
          <p className="text-slate-500 text-sm">Browse and access all available reports across the platform</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <FileText size={20} className="text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{totalReports}</div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Reports</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl blue-50 flex items-center justify-center" style={{ background: '#eff6ff' }}>
                <BarChart3 size={20} style={{ color: '#2563eb' }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{catCount}</div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Categories</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <TrendingUp size={18} className="text-emerald-600 ml-1" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{liveCount}</div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">Live Reports</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <Sparkles size={18} className="text-violet-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{aiCount}</div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">AI-Enhanced</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by name, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          <span className="text-sm font-medium text-slate-500 py-2">Filter:</span>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCurrentCat(cat.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                currentCat === cat.key
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <FileText size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No reports match your search criteria</p>
          </div>
        ) : (
          <div className="space-y-8">
            {order.map(cat => {
              const items = byCategory[cat];
              if (!items) return null;
              const meta = CAT_META[cat];
              return (
                <div key={cat}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: meta.bg, color: meta.color }}>
                      {meta.icon}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{meta.label}</h2>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                      {items.length} {items.length === 1 ? 'report' : 'reports'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.map(r => (
                      <ReportCard
                        key={r.id}
                        report={r}
                        isExpanded={expandedCards.has(r.id)}
                        onToggle={() => toggleExpand(r.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSummaryReports;