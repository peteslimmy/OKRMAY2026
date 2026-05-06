/**
 * 4CORE OKR Platform - User Management
 */

import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Mail, MoreVertical, Shield, Trash2, Edit } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../shared/components/ui/Card';
import { Button } from '../shared/components/ui/Button';
import { Badge } from '../shared/components/ui/Badge';
import { Input } from '../shared/components/ui/Input';
import { Select } from '../shared/components/ui/Select';
import { Modal } from '../shared/components/ui/Modal';
import { Avatar } from '../shared/components/ui/Avatar';
import { Table } from '../shared/components/ui/Table';
import { useToast } from '../shared/components/ui/Toast';
import { UserRole } from '../shared/types';
import { getRoleDisplayName, getRoleBadgeColor } from '../shared/utils/permissions';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'Suspended';
  lastActive: string;
}

const UserManagement: React.FC = () => {
  const { addToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [users] = useState<User[]>([
    { id: '1', name: 'System Administrator', email: 'admin@fcis.com', role: UserRole.SuperAdmin, department: 'IT', status: 'Active', lastActive: 'Now' },
    { id: '2', name: 'Corporate Director', email: 'director@fcis.com', role: UserRole.Director, department: 'Finance', status: 'Active', lastActive: '2h ago' },
    { id: '3', name: 'Hnb User', email: 'hnb@fcis.com', role: UserRole.Manager, department: 'Strategic Planning', status: 'Active', lastActive: '1d ago' },
    { id: '4', name: 'Vreg User', email: 'vreg@fcis.com', role: UserRole.Manager, department: 'Strategic Planning', status: 'Active', lastActive: '3h ago' },
    { id: '5', name: 'Idec User', email: 'idec@fcis.com', role: UserRole.Manager, department: 'Operations', status: 'Active', lastActive: '5h ago' },
    { id: '6', name: 'C4h User', email: 'c4h@fcis.com', role: UserRole.Manager, department: 'Strategic Planning', status: 'Suspended', lastActive: '30d ago' },
  ]);

  const activeCount = users.filter(u => u.status === 'Active').length;
  const suspendedCount = users.filter(u => u.status === 'Suspended').length;

  const handleAddUser = () => {
    addToast({ type: 'success', title: 'User added', message: 'New user has been created' });
    setShowAddModal(false);
  };

  const columns = [
    { 
      key: 'user', 
      header: 'User',
      render: (u: User) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-slate-900">{u.name}</p>
            <p className="text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
      )
    },
    { key: 'role', header: 'Role', render: (u: User) => (
      <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${getRoleBadgeColor(u.role)}`}>
        {getRoleDisplayName(u.role)}
      </span>
    )},
    { key: 'department', header: 'Department' },
    { key: 'status', header: 'Status', render: (u: User) => (
      <Badge variant={u.status === 'Active' ? 'success' : 'error'} size="sm">{u.status}</Badge>
    )},
    { key: 'lastActive', header: 'Last Active' },
    {
      key: 'actions',
      header: '',
      render: () => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm"><Edit size={14} /></Button>
          <Button variant="ghost" size="sm"><Trash2 size={14} /></Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in h-full overflow-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage users and their roles</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-50 rounded-lg">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{users.length}</p>
              <p className="text-xs text-slate-500">Total Users</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-lg">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
              <p className="text-xs text-slate-500">Active</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-lg">
              <Users className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{suspendedCount}</p>
              <p className="text-xs text-slate-500">Suspended</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={18} />}
            className="flex-1"
          />
          <Select
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'SuperAdmin', label: 'Super Admin' },
              { value: 'Admin', label: 'Admin' },
              { value: 'Director', label: 'Director' },
              { value: 'Manager', label: 'Manager' },
              { value: 'Viewer', label: 'Viewer' },
            ]}
          />
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'Active', label: 'Active' },
              { value: 'Suspended', label: 'Suspended' },
            ]}
          />
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card>
        <CardBody className="p-0">
          <Table columns={columns} data={users} keyExtractor={(u) => u.id} />
        </CardBody>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddUser}>Add User</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" placeholder="Enter full name" required />
          <Input label="Email" type="email" placeholder="user@company.com" required />
          <Select
            label="Role"
            options={[
              { value: 'Viewer', label: 'Viewer' },
              { value: 'Manager', label: 'Manager' },
              { value: 'Director', label: 'Director' },
              { value: 'Admin', label: 'Admin' },
              { value: 'SuperAdmin', label: 'Super Admin' },
            ]}
          />
          <Select
            label="Department"
            options={[
              { value: 'it', label: 'IT' },
              { value: 'finance', label: 'Finance' },
              { value: 'operations', label: 'Operations' },
              { value: 'hr', label: 'HR' },
              { value: 'strategic', label: 'Strategic Planning' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;