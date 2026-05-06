/**
 * 4CORE OKR Platform - Attendance Page
 */

import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, Users, Calendar, Download } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../shared/components/ui/Card';
import { Button } from '../shared/components/ui/Button';
import { Badge } from '../shared/components/ui/Badge';
import { Input } from '../shared/components/ui/Input';
import { Select } from '../shared/components/ui/Select';
import { Avatar } from '../shared/components/ui/Avatar';
import { getCurrentWeekRange } from '../shared/utils/date';

interface AttendanceRecord {
  id: string;
  name: string;
  department: string;
  status: 'Present' | 'Absent' | 'Remote' | 'Excused';
  timeJoined?: string;
  score: number;
}

const Attendance: React.FC = () => {
  const [week, setWeek] = useState('current');
  const weekRange = getCurrentWeekRange();

  const [records] = useState<AttendanceRecord[]>([
    { id: '1', name: 'John Smith', department: 'Finance', status: 'Present', timeJoined: '09:02 AM', score: 100 },
    { id: '2', name: 'Sarah Johnson', department: 'Sales', status: 'Present', timeJoined: '09:15 AM', score: 95 },
    { id: '3', name: 'Mike Brown', department: 'Marketing', status: 'Remote', timeJoined: '09:30 AM', score: 90 },
    { id: '4', name: 'Emily Davis', department: 'Operations', status: 'Absent', score: 0 },
    { id: '5', name: 'David Wilson', department: 'IT', status: 'Excused', score: 100 },
    { id: '6', name: 'Lisa Anderson', department: 'HR', status: 'Present', timeJoined: '09:05 AM', score: 100 },
    { id: '7', name: 'James Taylor', department: 'Finance', status: 'Present', timeJoined: '09:10 AM', score: 98 },
    { id: '8', name: 'Anna Martinez', department: 'Sales', status: 'Remote', timeJoined: '09:20 AM', score: 92 },
  ]);

  const statusIcons = {
    Present: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    Absent: <XCircle className="w-4 h-4 text-red-500" />,
    Remote: <Clock className="w-4 h-4 text-blue-500" />,
    Excused: <CheckCircle className="w-4 h-4 text-amber-500" />,
  };

  const statusVariants = {
    Present: 'success' as const,
    Absent: 'error' as const,
    Remote: 'info' as const,
    Excused: 'warning' as const,
  };

  const presentCount = records.filter(r => r.status === 'Present').length;
  const remoteCount = records.filter(r => r.status === 'Remote').length;
  const absentCount = records.filter(r => r.status === 'Absent').length;

  return (
    <div className="space-y-6 animate-fade-in h-full overflow-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Attendance</h1>
          <p className="text-sm text-slate-500 mt-1">Weekly meeting attendance tracking</p>
        </div>
        <Button variant="primary" leftIcon={<Download size={18} />}>
          Export
        </Button>
      </div>

      {/* Week Info */}
      <Card>
        <CardBody className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-50 rounded-lg">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{weekRange}</p>
              <p className="text-xs text-slate-500">Week {new Date().getWeek?.() || 18}</p>
            </div>
          </div>
          <Select
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            options={[
              { value: 'current', label: 'Current Week' },
              { value: 'last', label: 'Last Week' },
              { value: '2weeks', label: '2 Weeks Ago' },
            ]}
          />
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card variant="interactive" className="group">
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{records.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Total Members</p>
          </CardBody>
        </Card>
        <Card variant="interactive" className="group">
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform inline-block">{presentCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Present</p>
          </CardBody>
        </Card>
        <Card variant="interactive" className="group">
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform inline-block">{remoteCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Remote</p>
          </CardBody>
        </Card>
        <Card variant="interactive" className="group">
          <CardBody className="text-center">
            <p className="text-3xl font-bold text-red-600 group-hover:scale-110 transition-transform inline-block">{absentCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">Absent</p>
          </CardBody>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader title="Attendance Records" subtitle={`${presentCount + remoteCount} of ${records.length} present`} />
        <CardBody className="p-0">
          <div className="divide-y divide-slate-100">
            {records.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar name={record.name} size="md" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{record.name}</h4>
                    <p className="text-xs text-slate-500">{record.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {record.timeJoined && (
                    <span className="text-xs text-slate-500">{record.timeJoined}</span>
                  )}
                  <div className="flex items-center gap-2">
                    {statusIcons[record.status]}
                    <Badge variant={statusVariants[record.status]} size="sm">
                      {record.status}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 w-12 text-right">
                    {record.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Attendance;