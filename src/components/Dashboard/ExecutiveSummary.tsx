import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { callAIDirect, AIMessage } from '../../utils';

interface ExecutiveSummaryProps {
  week: number;
  year: number;
  onTrackRate: number;
  atRiskCount: number;
  behindCount: number;
  goalsCompleted: number;
  goalsExpected: number;
  anomalyCount: number;
  topPerformingBU?: string;
  attentionNeededBU?: string;
}

interface SummaryData {
  overview: string;
  highlights: string[];
  actionItems: string[];
}

const CACHE_KEY = 'executive_summary_cache';
const CACHE_DURATION = 5 * 60 * 1000;

interface CachedSummary {
  week: number;
  year: number;
  timestamp: number;
  summary: SummaryData;
}

const getCachedSummary = (week: number, year: number): SummaryData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedSummary = JSON.parse(cached);
    const isStale = Date.now() - data.timestamp > CACHE_DURATION;
    const isSamePeriod = data.week === week && data.year === year;
    
    if (!isStale && isSamePeriod) {
      return data.summary;
    }
  } catch {
    return null;
  }
  return null;
};

const setCachedSummary = (week: number, year: number, summary: SummaryData) => {
  try {
    const cacheData: CachedSummary = {
      week,
      year,
      timestamp: Date.now(),
      summary
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Ignore cache errors
  }
};

const parseSummaryResponse = (text: string): SummaryData => {
  const lines = text.split('\n').filter(l => l.trim());
  
  let overview = '';
  const highlights: string[] = [];
  const actionItems: string[] = [];
  
  let currentSection: 'overview' | 'highlights' | 'actionItems' = 'overview';
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('highlight') || lowerLine.includes('top') || lowerLine.includes('positive')) {
      currentSection = 'highlights';
      continue;
    }
    if (lowerLine.includes('action') || lowerLine.includes('attention') || lowerLine.includes('risk') || lowerLine.includes('concern')) {
      currentSection = 'actionItems';
      continue;
    }
    
    const cleanLine = line.replace(/^[#\-*\d.]+\s*/, '').trim();
    if (!cleanLine) continue;
    
    if (currentSection === 'overview') {
      overview += (overview ? ' ' : '') + cleanLine;
    } else if (currentSection === 'highlights' && cleanLine.length > 5) {
      highlights.push(cleanLine);
    } else if (currentSection === 'actionItems' && cleanLine.length > 5) {
      actionItems.push(cleanLine);
    }
  }
  
  if (!overview && highlights.length === 0 && actionItems.length === 0) {
    return {
      overview: text.slice(0, 500),
      highlights: ['Week data processed successfully'],
      actionItems: ['Continue monitoring KR progress']
    };
  }
  
  return { overview, highlights, actionItems };
};

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  week,
  year,
  onTrackRate,
  atRiskCount,
  behindCount,
  goalsCompleted,
  goalsExpected,
  anomalyCount,
  topPerformingBU,
  attentionNeededBU
}) => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const generateSummary = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCachedSummary(week, year);
      if (cached) {
        setSummary(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    const completionRate = goalsExpected > 0 ? Math.round((goalsCompleted / goalsExpected) * 100) : 0;
    
    const prompt: AIMessage[] = [
      {
        role: 'system',
        content: 'You are an executive briefing assistant. Generate concise, actionable weekly summaries for board presentations and operational reviews.'
      },
      {
        role: 'user',
        content: `Generate a 3-paragraph executive summary for Week ${week}, ${year} with:
        
1. OVERVIEW (2-3 sentences): Overall performance summary including on-track %, completion rate, and key metrics
2. HIGHLIGHTS (3 bullet points): Top performing areas, BUs exceeding targets, positive trends  
3. ACTION ITEMS (3 bullet points): Areas needing attention, at-risk KRs, overdue items

Data:
- On-Track Rate: ${onTrackRate}%
- At Risk KRs: ${atRiskCount}
- Behind KRs: ${behindCount}
- Goals Completed: ${goalsCompleted}/${goalsExpected} (${completionRate}%)
- Anomalies Detected: ${anomalyCount}
- Top Performing BU: ${topPerformingBU || 'Data pending'}
- Needs Attention: ${attentionNeededBU || 'None'}
- Total Active KRs: ${atRiskCount + behindCount + onTrackRate > 0 ? Math.round(onTrackRate / 100 * 20) + atRiskCount + behindCount : 15}

Format: Use clear headings (Overview, Highlights, Action Items) and keep each point under 15 words.`
      }
    ];

    try {
      const response = await callAIDirect(prompt);
      const parsed = parseSummaryResponse(response);
      setSummary(parsed);
      setCachedSummary(week, year, parsed);
    } catch (err) {
      console.error('[ExecutiveSummary] Failed to generate:', err);
      setError('Unable to generate summary. AI service may be unavailable.');
    } finally {
      setLoading(false);
    }
  }, [week, year, onTrackRate, atRiskCount, behindCount, goalsCompleted, goalsExpected, anomalyCount, topPerformingBU, attentionNeededBU]);

  useEffect(() => {
    generateSummary();
  }, [week, year]);

  const getHealthStatus = () => {
    if (onTrackRate >= 70 && anomalyCount === 0) return { label: 'HEALTHY', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (onTrackRate >= 40 || anomalyCount > 0) return { label: 'AT RISK', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'CRITICAL', color: 'text-rose-600', bg: 'bg-rose-50' };
  };

  const health = getHealthStatus();

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
      <div 
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-violet-600 flex items-center justify-center shadow-xl shadow-primary-500/20">
              <Sparkles size={24} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
              <div className={`w-2.5 h-2.5 rounded-full ${onTrackRate >= 70 ? 'bg-emerald-500' : onTrackRate >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">AI Executive Summary</h3>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
              <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold">W{week}</span>
              <span className="text-slate-300">·</span>
              <span>{year}</span>
              {loading && <span className="text-primary-500 animate-pulse">Generating...</span>}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-2 ${health.bg} ${health.color.replace('text-', 'border-').replace('600', '-200')} ${health.color}`}>
            <div className={`w-2 h-2 rounded-full ${onTrackRate >= 70 ? 'bg-emerald-500' : onTrackRate >= 40 ? 'bg-amber-500' : 'bg-rose-500'} animate-pulse`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{health.label}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              generateSummary(true);
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-primary-600 bg-primary-50 rounded-xl border border-primary-100 hover:bg-primary-100 hover:shadow-md transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            Regenerate
          </button>
          {expanded ? (
            <ChevronUp size={18} className="text-slate-400" />
          ) : (
            <ChevronDown size={18} className="text-slate-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 border-t border-slate-100">
          {loading && !summary && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 size={24} className="animate-spin text-primary-500 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating summary...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
              <AlertCircle size={16} className="text-rose-500" />
              <p className="text-xs font-bold text-rose-600">{error}</p>
            </div>
          )}

          {summary && (
            <div className="py-6 space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Overview</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{summary.overview}</p>
              </div>

              {summary.highlights.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Highlights
                  </h4>
                  <ul className="space-y-2">
                    {summary.highlights.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        <span className="text-xs font-medium text-slate-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.actionItems.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Action Items
                  </h4>
                  <ul className="space-y-2">
                    {summary.actionItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span className="text-xs font-medium text-slate-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};