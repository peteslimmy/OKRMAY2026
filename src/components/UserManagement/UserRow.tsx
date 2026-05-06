import React from 'react';
import { Edit2, Ban, Check, Trash2, Lock } from 'lucide-react';
import { User, UserStatus } from '../../types';

interface UserRowProps {
  user: User;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
  permEditUsers: boolean;
  permDeleteUsers: boolean;
}

export const UserRow: React.FC<UserRowProps> = ({
  user,
  isSelected,
  onToggleSelection,
  onEdit,
  onToggleStatus,
  onDelete,
  permEditUsers,
  permDeleteUsers,
}) => {
  return (
    <tr className={`group hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-primary-50/30' : ''}`}>
      <td className="py-6 px-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(user.id)}
          className="w-4 h-4 rounded border-slate-200 accent-primary-500 cursor-pointer"
        />
      </td>
      <td className="py-6 px-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden ring-2 ring-white shadow-sm">
            <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 tracking-tight">{user.name}</p>
            <p className="text-xs text-slate-400 font-medium">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="py-6 px-6">
        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg border border-slate-200 uppercase">
          ID-{user.id.slice(0, 5)}
        </span>
      </td>
      <td className="py-6 px-6">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold ${user.status === UserStatus.Active
          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
          : user.status === UserStatus.Suspended
            ? 'bg-rose-50 text-rose-600 border border-rose-100'
            : 'bg-amber-50 text-amber-600 border border-amber-100'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${user.status === UserStatus.Active ? 'bg-emerald-500 animate-pulse' : user.status === UserStatus.Suspended ? 'bg-rose-500' : 'bg-amber-500'
            }`} />
          {user.status}
        </div>
      </td>
      <td className="py-6 px-6">
        <p className="text-sm font-bold text-slate-700">{user.role}</p>
      </td>
      <td className="py-6 px-6">
        <p className="text-[11px] font-bold text-slate-400 italic">2 minutes ago</p>
      </td>
      <td className="py-6 px-10 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {permEditUsers && (
            <button
              onClick={() => onEdit(user)}
              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
          )}
          {permEditUsers && (
            <button
              onClick={() => onToggleStatus(user)}
              className={`p-2 rounded-lg transition-all ${user.status === UserStatus.Active
                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              title={user.status === UserStatus.Active ? 'Freeze' : 'Restore'}
            >
              {user.status === UserStatus.Active ? <Ban size={16} /> : <Check size={16} />}
            </button>
          )}
          {permDeleteUsers && (
            <button
              onClick={() => onDelete(user)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              title="Purge"
            >
              <Trash2 size={16} />
            </button>
          )}
          {!permEditUsers && (
            <div className="flex items-center gap-1 text-slate-300">
              <Lock size={14} />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
