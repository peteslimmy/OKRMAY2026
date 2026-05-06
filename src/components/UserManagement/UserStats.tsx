import React from 'react';
import { User, UserStatus } from '../../types';

interface UserStatsProps {
  users: User[];
}

export const UserStats: React.FC<UserStatsProps> = ({ users }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card hover:shadow-card-hover transition-all">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Total Identities</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-black text-slate-900 leading-none tracking-tight">{users.length.toLocaleString()}</h3>
          <span className="badge-success">+12%</span>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Active Now</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-black text-slate-900 leading-none tracking-tight">
            {users.filter(u => u.status === UserStatus.Active).length}
          </h3>
          <div className="flex -space-x-2">
            {users.slice(0, 3).map((u, i) => (
              <img key={i} src={u.avatarUrl} className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="" />
            ))}
            {users.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                +{users.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Pending Review</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-black text-slate-900 leading-none tracking-tight">0</h3>
          <span className="badge-warning">Action Req.</span>
        </div>
      </div>

      <div className="card p-6">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Suspended</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-black text-slate-900 leading-none tracking-tight">
            {users.filter(u => u.status !== UserStatus.Active).length}
          </h3>
          <span className="badge-neutral">-2%</span>
        </div>
      </div>
    </div>
  );
};
