import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Calendar,
  FileDown,
  Mail,
  History,
  Sparkles,
  ChevronRight,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Star,
  CheckCircle2,
  Globe,
  Clock,
  UserMinus
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { AttendanceStatus, AttendanceRecord } from '../types';
import { getAttendanceRecords } from '../utils';

const MOCK_TREND_DATA = import.meta.env.DEV ? [
  { name: 'SEP 25', value: 78 },
  { name: 'OCT 02', value: 83 },
  { name: 'OCT 09', value: 80 },
  { name: 'OCT 16', value: 91 },
  { name: 'OCT 23', value: 89 },
] : [];

const MOCK_ATTENDANCE_LIST: AttendanceRecord[] = import.meta.env.DEV ? [
  {
    id: '1',
    userId: 'u1',
    userName: 'Alex Chen',
    userAvatar: 'https://i.pravatar.cc/150?u=alex',
    department: 'Engineering',
    status: AttendanceStatus.Present,
    timeJoined: '10:02 AM',
    participationScore: 95
  },
  {
    id: '2',
    userId: 'u2',
    userName: 'Sarah Miller',
    userAvatar: 'https://i.pravatar.cc/150?u=sarah',
    department: 'Product',
    status: AttendanceStatus.Remote,
    timeJoined: '10:05 AM',
    participationScore: 72
  },
  {
    id: '3',
    userId: 'u3',
    userName: 'Marcus King',
    userAvatar: 'https://i.pravatar.cc/150?u=marcus',
    department: 'Design',
    status: AttendanceStatus.Absent,
    timeJoined: null,
    participationScore: 0
  },
  {
    id: '4',
    userId: 'u4',
    userName: 'Jordan Lee',
    userAvatar: 'https://i.pravatar.cc/150?u=jordan',
    department: 'Engineering',
    status: AttendanceStatus.Excused,
    timeJoined: null,
    participationScore: 0
  }
] : [];

const StatCard: React.FC<{
  title: string;
  value: string | number;
  suffix?: string;
  trend?: { value: string; up: boolean };
  rating?: number;
}> = ({ title, value, suffix, trend, rating }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{title}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
      {suffix && <span className="text-slate-400 text-sm font-medium">{suffix}</span>}
      {trend && (
        <span className={`flex items-center gap-0.5 text-xs font-bold ${trend.up ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend.value}
        </span>
      )}
    </div>
    {rating !== undefined && (
      <div className="flex gap-0.5 mt-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star key={s} size={12} fill={s <= Math.floor(rating) ? "#f59e0b" : "transparent"} className={s <= Math.floor(rating) ? "text-amber-500" : "text-slate-200"} />
        ))}
      </div>
    )}
  </div>
);

export const Attendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Fetch attendance records from database
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const records = await getAttendanceRecords(selectedDate);
        if (records.length > 0) {
          setAttendanceRecords(records);
        } else if (import.meta.env.DEV) {
          // Fall back to mock data only in development
          setAttendanceRecords(MOCK_ATTENDANCE_LIST);
        }
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
        if (import.meta.env.DEV) {
          setAttendanceRecords(MOCK_ATTENDANCE_LIST);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedDate]);

  // Calculate stats from actual data
  const totalInvited = attendanceRecords.length || 48;
  const presentCount = attendanceRecords.filter(r => r.status === AttendanceStatus.Present || r.status === AttendanceStatus.Remote).length;
  const actualAttendees = presentCount || 42;
  const avgEngagement = attendanceRecords.length > 0
    ? (attendanceRecords.reduce((sum, r) => sum + r.participationScore, 0) / attendanceRecords.length).toFixed(1)
    : '9.2';
  const lateArrivals = attendanceRecords.filter(r => r.timeJoined && new Date(r.timeJoined).getMinutes() > 10).length || 3;

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
      {/* Header */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Invited" value={totalInvited} suffix="Participants" />
        <StatCard title="Actual Attendees" value={actualAttendees} trend={{ value: `${Math.round((actualAttendees / totalInvited) * 100)}%`, up: true }} />
        <StatCard title="Avg Engagement" value={avgEngagement} rating={parseFloat(avgEngagement as string) / 2} />
        <StatCard title="Late Arrivals" value={lateArrivals} trend={{ value: lateArrivals < 5 ? "improvement" : "", up: lateArrivals < 5 }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content (Chart + Table) */}
        <div className="lg:col-span-9 space-y-8">
          {/* Trend Chart */}
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
                      tickFormatter={(val, index) => `${val} (${MOCK_TREND_DATA[index].value}%)`}
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

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Attendance List</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    aria-label="Filter by Department"
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer outline-none"
                  >
                    <option>All Departments</option>
                    <option>Engineering</option>
                    <option>Product</option>
                    <option>Design</option>
                  </select>
                  <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                </div>
                <button
                  title="Filter List"
                  aria-label="Filter List"
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <Filter size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Participant Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Department</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Time Joined</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Participation Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={record.userAvatar} alt="" className="w-9 h-9 rounded-full border border-slate-200 object-cover" />
                          <span className="text-sm font-bold text-slate-700">{record.userName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-500">{record.department}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-600 tracking-tight">{record.timeJoined || '--:--'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 max-w-[160px]">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${record.participationScore >= 80 ? 'bg-primary-500' : record.participationScore > 0 ? 'bg-sky-500' : 'bg-slate-200'}`}
                              style={{ width: `${record.participationScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-black text-slate-700 w-8">{record.participationScore > 0 ? `${record.participationScore}%` : (record.status === AttendanceStatus.Excused ? '--' : '0%')}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-400">Showing 4 of 48 participants</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">Previous</button>
                <button className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors shadow-md">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-8">
          {/* Quick Actions */}
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

          {/* Smart Insights */}
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

          {/* Meeting Settings */}
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
      </div>
    </div>
  );
};
