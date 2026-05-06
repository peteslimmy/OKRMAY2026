import React, { useState, useEffect } from 'react';
import { Plus, Calendar, ChevronRight } from 'lucide-react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AttendanceStatus, AttendanceRecord } from '../../types';
import { getAttendanceRecords } from '../../utils';
import { StatCard } from './StatCard';
import { AttendanceTable } from './AttendanceTable';
import { AttendanceSidebar } from './AttendanceSidebar';

const MOCK_TREND_DATA = import.meta.env.DEV ? [
  { name: 'SEP 25', value: 78 },
  { name: 'OCT 02', value: 83 },
  { name: 'OCT 09', value: 80 },
  { name: 'OCT 16', value: 91 },
  { name: 'OCT 23', value: 89 },
] : [];

export const Attendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const records = await getAttendanceRecords(selectedDate);
        setAttendanceRecords(records);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
        setAttendanceRecords([]);
      }
    };

    fetchAttendance();
  }, [selectedDate]);

  const totalInvited = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === AttendanceStatus.Present || r.status === AttendanceStatus.Remote).length;
  const actualAttendees = presentCount;
  const avgEngagement = attendanceRecords.length > 0
    ? (attendanceRecords.reduce((sum, r) => sum + r.participationScore, 0) / attendanceRecords.length).toFixed(1)
    : '0';
  const lateArrivals = attendanceRecords.filter(r => r.timeJoined && new Date(r.timeJoined).getMinutes() > 10).length;

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.Present:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Present</span>;
      case AttendanceStatus.Remote:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-bold border border-sky-100"><div className="w-1.5 h-1.5 rounded-full bg-sky-600" /> Remote</span>;
      case AttendanceStatus.Absent:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-100"><div className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Absent</span>;
      case AttendanceStatus.Excused:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold border border-slate-200 text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Excused</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Weekly Meeting Attendance</h1>
          <div className="flex items-center gap-2 mt-2 text-slate-400 font-medium text-sm">
            <span>Project Alpha Sync</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Week of Oct 23 - Oct 29, 2023</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200/80 rounded-xl shadow-sm text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-all">
            <Calendar size={18} className="text-slate-400" />
            <span>Oct 23 - Oct 29</span>
            <ChevronRight size={14} className="rotate-90 text-slate-400" />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-900/20 hover:bg-primary-700 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-white">
            <Plus size={18} className="text-white" />
            <span>New Meeting</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Invited" value={totalInvited} suffix="Participants" />
        <StatCard title="Actual Attendees" value={actualAttendees} trend={{ value: `${Math.round((actualAttendees / totalInvited) * 100)}%`, up: true }} />
        <StatCard title="Avg Engagement" value={avgEngagement} rating={parseFloat(avgEngagement as string) / 2} />
        <StatCard title="Late Arrivals" value={lateArrivals} trend={{ value: lateArrivals < 5 ? "improvement" : "", up: lateArrivals < 5 }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden relative group">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Weekly Participation Trend</h3>
                <p className="text-sm text-slate-400 font-medium">Attendance percentages over the last 5 meetings</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Attendance %</span>
                </div>
              </div>
            </div>
            <div className="h-[280px] w-full">
              {MOCK_TREND_DATA.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_TREND_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                      dy={12}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#f97316"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      dot={{ r: 5, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 7, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No attendance trend data available
                </div>
              )}
            </div>
          </div>

          <AttendanceTable records={attendanceRecords} onStatusBadge={getStatusBadge} />
        </div>

        <AttendanceSidebar />
      </div>
    </div>
  );
};