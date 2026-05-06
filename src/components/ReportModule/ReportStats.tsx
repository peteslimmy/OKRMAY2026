import React from 'react';
import { FileText, TrendingUp, CheckCircle, Users } from 'lucide-react';
import { StatCard3D } from '../ui/Charts3D';

interface ReportStatsProps {
  totalGoals: number;
  overallAvg: number;
  completedTasks: number;
  totalTasks: number;
  department: string;
}

export const ReportStats: React.FC<ReportStatsProps> = ({ totalGoals, overallAvg, completedTasks, totalTasks, department }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard3D 
        title="Total Goals" 
        value={totalGoals.toString()} 
        subtitle="Active this period"
        icon={<FileText size={20} />} 
        bgColor="bg-blue-50" 
      />
      <StatCard3D 
        title="Avg Score" 
        value={`${overallAvg}%`} 
        subtitle="Across all KRs"
        icon={<TrendingUp size={20} />} 
        bgColor={overallAvg >= 70 ? 'bg-emerald-50' : overallAvg >= 40 ? 'bg-amber-50' : 'bg-rose-50'} 
      />
      <StatCard3D 
        title="Tasks Completed" 
        value={`${completedTasks}/${totalTasks}`} 
        subtitle="Execution rate"
        icon={<CheckCircle size={20} />} 
        bgColor="bg-purple-50" 
      />
      <StatCard3D 
        title="Department" 
        value={department} 
        subtitle="Assigned domain"
        icon={<Users size={20} />} 
        bgColor="bg-cyan-50" 
      />
    </div>
  );
};
