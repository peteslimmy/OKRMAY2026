/**
 * 4CORE OKR Platform - Reports Page
 */

import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../shared/components/ui/Card';
import { Button } from '../shared/components/ui/Button';
import { Badge } from '../shared/components/ui/Badge';
import { Input } from '../shared/components/ui/Input';
import { Select } from '../shared/components/ui/Select';
import { Progress } from '../shared/components/ui/Progress';

const Reports: React.FC = () => {
  const [period, setPeriod] = useState('q1-2026');

  const reports = [
    { id: '1', title: 'Q1 2026 OKR Summary', type: 'Quarterly', date: 'Mar 31, 2026', status: 'Ready', size: '2.4 MB' },
    { id: '2', title: 'February Weekly Report', type: 'Weekly', date: 'Feb 28, 2026', status: 'Ready', size: '1.1 MB' },
    { id: '3', title: 'January Performance Review', type: 'Monthly', date: 'Jan 31, 2026', status: 'Ready', size: '3.2 MB' },
    { id: '4', title: 'Q4 2025 Annual Summary', type: 'Quarterly', date: 'Dec 31, 2025', status: 'Ready', size: '5.8 MB' },
    { id: '5', title: 'December Weekly Report', type: 'Weekly', date: 'Dec 31, 2025', status: 'Ready', size: '1.3 MB' },
  ];

  const stats = [
    { label: 'Total Reports', value: '24', trend: '+12%' },
    { label: 'This Quarter', value: '8', trend: '+3' },
    { label: 'Generated Today', value: '2', trend: '0' },
  ];

  return (
    <div className="space-y-6 animate-fade-in h-full overflow-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-1">View and export OKR reports</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<BarChart3 size={16} />}>
            Analytics
          </Button>
          <Button variant="primary" leftIcon={<Download size={18} />}>
            Export All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} variant="interactive" className="group">
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium group-hover:text-primary-600 transition-colors">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
              <Badge variant="neutral" size="sm" className="group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">{stat.trend}</Badge>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="flex flex-wrap gap-4">
          <Select
            label="Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: 'q1-2026', label: 'Q1 2026' },
              { value: 'q4-2025', label: 'Q4 2025' },
              { value: '2025', label: 'Full Year 2025' },
            ]}
            className="min-w-[150px]"
          />
          <Select
            label="Type"
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'weekly', label: 'Weekly' },
            ]}
            className="min-w-[150px]"
          />
          <Input placeholder="Search reports..." leftIcon={<FileText size={16} />} className="flex-1 min-w-[200px]" />
        </CardBody>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader title="Generated Reports" subtitle={`${reports.length} reports available`} />
        <CardBody className="p-0">
          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{report.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">{report.type}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar size={12} /> {report.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">{report.size}</span>
                  <Badge variant="success" size="sm">{report.status}</Badge>
                  <Button variant="ghost" size="sm">
                    <Download size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Reports;