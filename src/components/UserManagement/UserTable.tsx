import React from 'react';
import { Filter, Download, UploadCloud, Lock } from 'lucide-react';
import { User } from '../../types';
import { UserRow } from './UserRow';
import { AdvancedFilters } from '../ui/AdvancedFilters';
import { EmptyTable } from '../ui/EmptyState';
import { TableSkeleton } from '../ui/Skeleton';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  searchTerm: string;
  filteredUsers: User[];
  selectedUserIds: Set<string>;
  setSelectedUserIds: (ids: Set<string>) => void;
  toggleUserSelection: (userId: string) => void;
  onEditUser: (user: User) => void;
  onToggleUserStatus: (user: User) => void;
  onDeleteUser: (user: User) => void;
  permAssignRoles: boolean;
  permCreateUsers: boolean;
  permEditUsers: boolean;
  permDeleteUsers: boolean;
  onBulkRoleUpdateClick: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
  advancedFilters: Record<string, any>;
  setAdvancedFilters: (filters: Record<string, any>) => void;
  availableBUs: any[];
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  searchTerm,
  filteredUsers,
  selectedUserIds,
  setSelectedUserIds,
  toggleUserSelection,
  onEditUser,
  onToggleUserStatus,
  onDeleteUser,
  permAssignRoles,
  permCreateUsers,
  permEditUsers,
  permDeleteUsers,
  onBulkRoleUpdateClick,
  onImportClick,
  onExportClick,
  advancedFilters,
  setAdvancedFilters,
  availableBUs,
}) => {
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between px-8 py-6 border-b border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button className="px-4 py-2 text-xs font-bold rounded-lg bg-white text-slate-900 shadow-sm">All Accounts</button>
            <button className="px-4 py-2 text-xs font-bold rounded-lg text-slate-500 hover:text-slate-800">External</button>
          </div>
          <button title="Filter Results" className="btn-icon">
            <Filter size={18} />
          </button>
          <AdvancedFilters
            moduleName="user-management"
            fields={[
              { key: 'role', label: 'Role', type: 'select', options: [
                { value: 'SuperAdmin', label: 'SuperAdmin' },
                { value: 'Admin', label: 'Admin' },
                { value: 'Director', label: 'Director' },
                { value: 'Manager', label: 'Manager' },
                { value: 'Viewer', label: 'Viewer' },
                { value: 'External', label: 'External' },
              ]},
              { key: 'status', label: 'Status', type: 'select', options: [
                { value: 'Active', label: 'Active' },
                { value: 'Suspended', label: 'Suspended' },
              ]},
              { key: 'department', label: 'Department', type: 'select', options: availableBUs.map(bu => ({ value: bu.name, label: bu.name })) },
            ]}
            onFilterChange={setAdvancedFilters}
            onClearAll={() => setAdvancedFilters({})}
          />
          {selectedUserIds.size > 0 && permAssignRoles && (
            <button onClick={onBulkRoleUpdateClick} className="btn-primary">
              Bulk Role ({selectedUserIds.size})
            </button>
          )}
          {selectedUserIds.size > 0 && !permAssignRoles && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-400">
              <Lock size={14} /> No Bulk Access
            </div>
          )}
          {permCreateUsers && (
            <button onClick={onImportClick} className="btn-icon" title="Bulk Provisioning">
              <UploadCloud size={18} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={onExportClick} className="btn-ghost text-sm">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="py-5 px-10 text-left">
                <input
                  type="checkbox"
                  checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
                    } else {
                      setSelectedUserIds(new Set());
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-200 accent-primary-500 cursor-pointer"
                />
              </th>
              <th className="text-left py-5 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Identity</th>
              <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifier</th>
              <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Status</th>
              <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Designation</th>
              <th className="text-left py-5 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Goal</th>
              <th className="text-right py-5 px-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-10">
                  <TableSkeleton rows={5} columns={7} />
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyTable 
                    title="No users found" 
                    description={searchTerm ? `No users matching "${searchTerm}"` : "No users have been added yet."}
                  />
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  isSelected={selectedUserIds.has(user.id)}
                  onToggleSelection={toggleUserSelection}
                  onEdit={onEditUser}
                  onToggleStatus={onToggleUserStatus}
                  onDelete={onDeleteUser}
                  permEditUsers={permEditUsers}
                  permDeleteUsers={permDeleteUsers}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
