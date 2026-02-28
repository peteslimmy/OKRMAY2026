
import React, { useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getBusinessUnits, getBUPerformanceData } from '../utils';
import { BusinessUnit, BUPerformanceDataPoint } from '../types';
import { Building2, Calendar, ChevronDown } from 'lucide-react';

interface BUPerformanceMatrixProps {
  selectedWeek: string;
  selectedBuId: string;
}

const colors = [
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#eab308', // Yellow
  '#6366f1', // Indigo
  '#d946ef', // Fuchsia
  '#14b8a6', // Teal
  '#f472b6', // Pink
  '#a855f7', // Purple
  '#22c55e', // Green
  '#dc2626', // Red-ish
];

// Custom Tooltip for Stacked Bar Chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const totalCompanyScore = payload[0].payload.totalCompanyScore;
    return (
      <div className="bg-white/95 p-4 rounded-[4px] shadow-lg border border-slate-200 text-sm">
        <p className="font-bold text-slate-800 mb-2">{label} - Company Average: {totalCompanyScore}%</p>
        {payload.map((entry: any, index: number) => {
          const buName = entry.dataKey;
          const buScore = entry.value;

          return (
            <p key={`item-${index}`} className="text-slate-700 flex justify-between gap-4">
              <span style={{ color: entry.color }}>{buName}:</span>
              <span className="font-semibold">{buScore}%</span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};


export const BUPerformanceMatrix: React.FC<BUPerformanceMatrixProps> = ({ selectedWeek, selectedBuId }) => {
  const [allBUs, setAllBUs] = useState<BusinessUnit[]>([]);
  const [chartData, setChartData] = useState<BUPerformanceDataPoint[]>([]);

  useEffect(() => {
    getBusinessUnits().then(setAllBUs);
  }, []);

  useEffect(() => {
    getBUPerformanceData(selectedBuId === 'all' ? undefined : selectedBuId, selectedWeek === 'all' ? undefined : selectedWeek)
      .then(setChartData);
  }, [selectedBuId, selectedWeek]);

  // Data is filtered by API/Utility now, but if mock returns all, we might filter here if needed. 
  // Assuming getBUPerformanceData returns appropriate data.
  
  // Prepare data for insights (last week's averages)
  const lastWeekData = chartData.length > 0 ? chartData[chartData.length - 1] : null;
  const lastWeekAverages = allBUs.slice(0, 4).map(bu => ({
    name: bu.name,
    score: lastWeekData ? (lastWeekData[bu.name as keyof BUPerformanceDataPoint] as number || 0) : 0,
  }));
  const lastWeekCompanyAverage = lastWeekData?.totalCompanyScore || 0;


  return (
    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[4px] shadow-lg border border-white/20 animate-scale-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-800 tracking-tight">Business Unit Performance Matrix</h3>
          <p className="text-sm text-slate-500">Weekly breakdown of execution scores by business unit.</p>
        </div>
      </div>
      
      <div className="h-80 w-full" style={{ minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="week" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              cursor={{fill: 'rgba(241, 245, 249, 0.5)'}}
              content={<CustomTooltip />}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            {allBUs.map((bu, idx) => (
              <Bar key={bu.id} dataKey={bu.name} fill={colors[idx % colors.length]} stackId="a" radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {lastWeekAverages.map((buAvg, idx) => (
          <div key={buAvg.name} className="bg-white/50 rounded-[4px] p-4 border border-white/40">
            <span className="text-xs text-slate-500 uppercase font-semibold">Current Avg.</span>
            <div className="text-lg font-bold text-slate-800 mt-1">
              {buAvg.score}%
            </div>
            <div className="text-xs font-medium text-slate-400">{buAvg.name}</div>
          </div>
        ))}
         <div className="bg-primary-50/50 rounded-[4px] p-4 border border-primary-200 col-span-2 md:col-span-full">
            <span className="text-xs text-primary-600 uppercase font-semibold">Company Average</span>
            <div className="text-lg font-bold text-primary-800 mt-1">
              {lastWeekCompanyAverage}%
            </div>
            <div className="text-xs font-medium text-primary-500">Overall performance for the selected period.</div>
          </div>
      </div>
    </div>
  );
};


