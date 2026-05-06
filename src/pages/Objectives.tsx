/**
 * 4CORE OKR Platform - Business Objectives Page
 */

import React, { useState } from 'react';
import { Plus, Target, Search, Filter } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../shared/components/ui/Card';
import { Button } from '../shared/components/ui/Button';
import { Badge } from '../shared/components/ui/Badge';
import { Progress } from '../shared/components/ui/Progress';
import { Input } from '../shared/components/ui/Input';
import { Modal } from '../shared/components/ui/Modal';
import { useToast } from '../shared/components/ui/Toast';
import { getCurrentQuarterInfo } from '../shared/utils/date';

interface Objective {
  id: string;
  title: string;
  quarter: string;
  progress: number;
  status: 'Active' | 'Locked' | 'Draft';
  keyResults: { id: string; title: string; progress: number; status: 'Green' | 'Amber' | 'Red' }[];
}

const Objectives: React.FC = () => {
  const { addToast } = useToast();
  const quarter = getCurrentQuarterInfo();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [objectives] = useState<Objective[]>([
    { id: '1', title: 'Revenue Growth Target', quarter: 'Q1 2026', progress: 75, status: 'Active', keyResults: [
      { id: 'kr1', title: 'Increase Q1 revenue by 20%', progress: 80, status: 'Green' },
      { id: 'kr2', title: 'Acquire 50 new enterprise clients', progress: 60, status: 'Amber' },
      { id: 'kr3', title: 'Launch premium tier', progress: 85, status: 'Green' },
    ]},
    { id: '2', title: 'Customer Satisfaction', quarter: 'Q1 2026', progress: 45, status: 'Active', keyResults: [
      { id: 'kr4', title: 'Achieve NPS score of 50+', progress: 40, status: 'Amber' },
      { id: 'kr5', title: 'Reduce response time to <4hrs', progress: 50, status: 'Green' },
    ]},
    { id: '3', title: 'Operational Excellence', quarter: 'Q1 2026', progress: 90, status: 'Active', keyResults: [
      { id: 'kr6', title: 'Automate 80% of workflows', progress: 95, status: 'Green' },
      { id: 'kr7', title: 'Reduce operational costs by 15%', progress: 85, status: 'Green' },
    ]},
    { id: '4', title: 'Team Development', quarter: 'Q1 2026', progress: 30, status: 'Active', keyResults: [
      { id: 'kr8', title: 'Complete certifications for 100 staff', progress: 20, status: 'Red' },
      { id: 'kr9', title: 'Launch mentorship program', progress: 40, status: 'Amber' },
    ]},
  ]);

  const handleAddObjective = () => {
    addToast({ type: 'success', title: 'Objective created', message: 'New objective has been added' });
    setShowAddModal(false);
  };

  const statusColors = {
    Active: 'success',
    Locked: 'neutral',
    Draft: 'warning'
  } as const;

  return (
    <div className="space-y-6 animate-fade-in h-full overflow-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Objectives & Key Results</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your quarterly OKRs</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
          New Objective
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search objectives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <Button variant="secondary" leftIcon={<Filter size={16} />}>
            Filters
          </Button>
        </CardBody>
      </Card>

      {/* Objectives Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {objectives.map((objective) => (
          <Card key={objective.id} variant="interactive" className="group">
            <CardHeader
              title={objective.title}
              subtitle={objective.quarter}
              className="group-hover:border-primary-100 transition-colors"
              action={
                <Badge variant={statusColors[objective.status]} size="sm">
                  {objective.status}
                </Badge>
              }
            />
            <CardBody className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500 group-hover:text-slate-700 transition-colors">Overall Progress</span>
                  <span className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">{objective.progress}%</span>
                </div>
                <Progress 
                  value={objective.progress} 
                  variant={objective.progress >= 70 ? 'success' : objective.progress >= 40 ? 'warning' : 'error'}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider group-hover:text-primary-500 transition-colors">Key Results</p>
                {objective.keyResults.map((kr) => (
                  <div key={kr.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-100 transition-all">
                    <div className="flex items-center gap-2">
                      <Target size={14} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                      <span className="text-sm text-slate-700 truncate max-w-[200px] font-medium">{kr.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{kr.progress}%</span>
                      <Badge 
                        variant={kr.status === 'Green' ? 'success' : kr.status === 'Amber' ? 'warning' : 'error'}
                        size="sm"
                      >
                        {kr.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Objective"
        description="Define a new objective for the current quarter"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddObjective}>Create Objective</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Objective Title" placeholder="Enter objective title" required />
          <Input label="Description" placeholder="Describe the objective" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quarter" value={`${quarter.quarterLabel} ${quarter.year}`} disabled />
            <Input label="Owner" placeholder="Select owner" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Objectives;