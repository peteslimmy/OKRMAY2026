import React from 'react';
import { AttendanceStatus, AttendanceRecord } from '../../types';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onStatusBadge: (status: AttendanceStatus) => React.ReactNode;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({ records, onStatusBadge }) => {
  return (
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
          </div>
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
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                  No attendance records found
                </td>
              </tr>
            ) : (
              records.map((record) => (
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
                    {onStatusBadge(record.status)}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-slate-100 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-400">{records.length > 0 ? `Showing ${records.length} participants` : 'No participants'}</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50">Previous</button>
          <button className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors shadow-md">Next</button>
        </div>
      </div>
    </div>
  );
};