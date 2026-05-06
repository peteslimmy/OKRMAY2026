/**
 * 4CORE OKR Platform - Business Units Page
 */

import React, { useState } from 'react';
import { Plus, Building2, Mail, Users, MoreVertical } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../shared/components/ui/Card';
import { Button } from '../shared/components/ui/Button';
import { Badge } from '../shared/components/ui/Badge';
import { Input } from '../shared/components/ui/Input';
import { Modal } from '../shared/components/ui/Modal';
import { Avatar } from '../shared/components/ui/Avatar';
import { useToast } from '../shared/components/ui/Toast';

interface BusinessUnit {
  id: string;
  name: string;
  head: string;
  email: string;
  memberCount: number;
  status: 'Active' | 'Inactive';
}

const BusinessUnits: React.FC = () => {
  const { addToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);

  const [units] = useState<BusinessUnit[]>([
    { id: '1', name: 'IDEC', head: 'John Smith', email: 'idec@fcis.com', memberCount: 45, status: 'Active' },
    { id: '2', name: 'VREG', head: 'Sarah Johnson', email: 'vreg@fcis.com', memberCount: 32, status: 'Active' },
    { id: '3', name: 'HnB', head: 'Mike Brown', email: 'hnb@fcis.com', memberCount: 28, status: 'Active' },
    { id: '4', name: 'POSSAP', head: 'Emily Davis', email: 'possap@fcis.com', memberCount: 51, status: 'Active' },
    { id: '5', name: 'WACS', head: 'David Wilson', email: 'wacs@fcis.com', memberCount: 19, status: 'Active' },
    { id: '6', name: 'NBMS', head: 'Lisa Anderson', email: 'nbms@fcis.com', memberCount: 24, status: 'Active' },
    { id: '7', name: 'HR', head: 'James Taylor', email: 'hr@fcis.com', memberCount: 12, status: 'Active' },
    { id: '8', name: 'IT', head: 'Anna Martinez', email: 'it@fcis.com', memberCount: 18, status: 'Active' },
  ]);

  const handleAddUnit = () => {
    addToast({ type: 'success', title: 'Business Unit created', message: 'New unit has been added' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in h-full overflow-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Business Units</h1>
          <p className="text-sm text-slate-500 mt-1">Manage organizational units</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
          Add Unit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {units.map((unit) => (
          <Card key={unit.id} variant="interactive" className="group">
            <CardBody className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-4 transform group-hover:rotate-6 transition-transform">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{unit.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{unit.head}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant={unit.status === 'Active' ? 'success' : 'neutral'} size="sm">
                  {unit.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 w-full group-hover:border-primary-100 transition-colors">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Users size={14} className="group-hover:text-primary-500" />
                  <span className="text-xs">{unit.memberCount} members</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Mail size={14} className="group-hover:text-primary-500" />
                  <span className="text-xs truncate">{unit.email}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Business Unit"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddUnit}>Create Unit</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Unit Name" placeholder="Enter unit name" required />
          <Input label="Head of Unit" placeholder="Select unit head" />
          <Input label="Contact Email" type="email" placeholder="unit@company.com" />
          <Input label="Department" placeholder="Select department" />
        </div>
      </Modal>
    </div>
  );
};

export default BusinessUnits;