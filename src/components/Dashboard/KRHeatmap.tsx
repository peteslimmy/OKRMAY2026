import React, { useEffect, useState, useMemo } from 'react';
import { getKRProgressByBU, getBusinessUnits, getWATTime } from '../../utils';
import { DashboardFilters } from './FilterBar';
import { HeatmapModal } from './HeatmapModal';

interface KRHeatmapProps {
  filters?: DashboardFilters;
}

interface KRHeatmapCell {
  kr: string;
  krId: string;
  bu: string;
  buId: string;
  score: number;
  status: 'Green' | 'Amber' | 'Red';
}

export const KRHeatmap: React.FC<KRHeatmapProps> = ({ filters }) => {
  const [data, setData] = useState<KRHeatmapCell[]>([]);
  const [businessUnits, setBusinessUnits] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<KRHeatmapCell | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const now = getWATTime ? getWATTime() : new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const currentWeek = Math.ceil((now.getTime() - startOfYear.getTime()) / (86400000 * 7));
        const week = filters?.week || currentWeek;
        const year = filters?.year || now.getFullYear();
        const buFilter = filters?.buFilter || undefined;

        const [progressData, busData] = await Promise.all([
          getKRProgressByBU(week, year, buFilter),
          getBusinessUnits()
        ]);

        setData(progressData);
        setBusinessUnits(busData);
      } catch (e) {
        console.error('[Heatmap]', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters?.week, filters?.year, filters?.buFilter]);

  const krLabels = useMemo(() => [...new Set(data.map(d => d.kr))], [data]);
  const buLabels = useMemo(() => [...new Set(data.map(d => d.bu))], [data]);

if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading heatmap data...</p>
      </div>
    );
  }

  const getScoreGradient = (score: number, status: string) => {
    if (status === 'Green') {
      return score >= 80 
        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30' 
        : 'bg-gradient-to-br from-emerald-500 to-emerald-600';
    }
    if (status === 'Amber') {
      return score >= 50 
        ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-500/30' 
        : 'bg-gradient-to-br from-amber-500 to-amber-600';
    }
    return 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/30';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-3 text-left text-[9px] font-black text-slate-400 uppercase sticky left-0 bg-white z-10 border-b-2 border-slate-100">BU \ KR</th>
            {krLabels.map(kr => (
              <th key={kr} className="p-3 text-center text-[9px] font-black text-slate-400 uppercase min-w-[90px] border-b-2 border-slate-100">{kr}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buLabels.map((bu, idx) => (
            <tr key={bu} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
              <td className="p-3 text-left text-[10px] font-bold text-slate-600 sticky left-0 bg-white/90 backdrop-blur z-10 border-r-2 border-slate-100">{bu}</td>
              {krLabels.map(kr => {
                const cell = data.find(d => d.kr === kr && d.bu === bu);
                const gradientClass = cell ? getScoreGradient(cell.score, cell.status) : 'bg-slate-100';
                return (
                  <td key={`${bu}-${kr}`} className="p-2 text-center">
                    <button
                      onClick={() => cell && setSelectedCell(cell)}
                      disabled={!cell}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-200 disabled:cursor-default disabled:hover:scale-100 ${gradientClass}`}
                      title={`${bu} - ${kr}: ${cell?.score ?? 0}%`}
                    >
                      {cell?.score ?? 0}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCell && (
        <HeatmapModal
          kr={selectedCell.kr}
          krId={selectedCell.krId}
          bu={selectedCell.bu}
          buId={selectedCell.buId}
          score={selectedCell.score}
          status={selectedCell.status}
          onClose={() => setSelectedCell(null)}
        />
      )}
    </div>
  );
};