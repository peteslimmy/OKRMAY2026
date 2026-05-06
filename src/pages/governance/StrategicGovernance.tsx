/**
 * 4CORE OKR Platform - Strategic Governance Page
 */

import React from 'react';
import { Shield, Lock, Unlock, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { Progress } from '../../shared/components/ui/Progress';
import { getCurrentQuarterInfo } from '../../shared/utils/date';

const StrategicGovernance: React.FC = () => {
  const quarter = getCurrentQuarterInfo();

  const governanceScore = 78;
  const lockStatus = { content: false, final: false };

  const metrics = [
    { label: 'Objectives Locked', value: '12/15', status: 'success' },
    { label: 'KR Updates On Time', value: '92%', status: 'success' },
    { label: 'Violations Pending', value: '3', status: 'warning' },
    { label: 'Pending Approvals', value: '5', status: 'info' },
  ];

  const recentDecisions = [
    { id: '1', title: 'Q1 Objectives Approved', date: 'Jan 15, 2026', status: 'Approved' },
    { id: '2', title: 'Budget Allocation for HnB', date: 'Jan 10, 2026', status: 'Approved' },
    { id: '3', title: 'New Violation Policy', date: 'Jan 5, 2026', status: 'Under Review' },
  ];

  return (
    <div className="space-y-6 animate-fade-in h-full overflow-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Strategic Governance</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of governance metrics and controls</p>
        </div>
        <Badge variant="primary" size="md" dot>
          {quarter.quarterLabel} {quarter.year}
        </Badge>
      </div>

      {/* Governance Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader 
            title="Governance Health Score" 
            subtitle="Overall governance compliance and performance"
          />
          <CardBody>
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                  <circle
                    cx="64" cy="64" r="56" fill="none"
                    stroke="#f97316" strokeWidth="12"
                    strokeDasharray={351.86}
                    strokeDashoffset={351.86 - (governanceScore / 100) * 351.86}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900">{governanceScore}</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{metric.label}</span>
                    <Badge variant={metric.status as 'success' | 'warning' | 'info'} size="sm">
                      {metric.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="interactive">
          <CardHeader title="Quarter Locks" subtitle="Content locking status" />
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-primary-50 transition-colors">
              <div className="flex items-center gap-3">
                {lockStatus.content ? (
                  <Lock className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Unlock className="w-5 h-5 text-slate-400 group-hover:text-primary-500" />
                )}
                <span className="text-sm text-slate-700 font-medium">Content Lock</span>
              </div>
              <Badge variant={lockStatus.content ? 'success' : 'neutral'} size="sm">
                {lockStatus.content ? 'Locked' : 'Open'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-primary-50 transition-colors">
              <div className="flex items-center gap-3">
                {lockStatus.final ? (
                  <Lock className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Unlock className="w-5 h-5 text-slate-400 group-hover:text-primary-500" />
                )}
                <span className="text-sm text-slate-700 font-medium">Final Lock</span>
              </div>
              <Badge variant={lockStatus.final ? 'success' : 'neutral'} size="sm">
                {lockStatus.final ? 'Locked' : 'Open'}
              </Badge>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 flex items-center gap-1 italic">
                <Clock size={12} /> Content locks on Day 2 at 6:00 PM WAT
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Alerts */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">3 pending violations require review</p>
          <p className="text-xs text-amber-600 mt-1">Review and resolve to maintain governance score</p>
        </div>
      </div>

      {/* Recent Decisions */}
      <Card>
        <CardHeader title="Recent Governance Decisions" subtitle="Latest approved items" />
        <CardBody className="p-0">
          <div className="divide-y divide-slate-100">
            {recentDecisions.map((decision) => (
              <div key={decision.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">{decision.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{decision.date}</p>
                </div>
                <Badge variant={decision.status === 'Approved' ? 'success' : 'warning'} size="sm">
                  {decision.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default StrategicGovernance;