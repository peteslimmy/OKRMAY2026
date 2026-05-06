/**
 * 4CORE OKR Platform - Integrity Checker
 */

import React, { useState } from 'react';
import { Shield, RefreshCw, AlertTriangle, CheckCircle, Database, FileText, Users } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../shared/components/ui/Card';
import { Button } from '../shared/components/ui/Button';
import { Badge } from '../shared/components/ui/Badge';
import { Progress, CircularProgress } from '../shared/components/ui/Progress';
import { Tabs, TabPanel } from '../shared/components/ui/Tabs';
import { useToast } from '../shared/components/ui/Toast';

const IntegrityChecker: React.FC = () => {
  const { addToast } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  const integrityScore = 94;

  const systemChecks = [
    { id: '1', name: 'Database Consistency', status: 'pass', details: 'All tables synchronized' },
    { id: '2', name: 'Orphaned Records', status: 'pass', details: 'No orphaned sub-KRs found' },
    { id: '3', name: 'User Permissions', status: 'pass', details: 'All roles properly configured' },
    { id: '4', name: 'Data Validation', status: 'warning', details: '3 records need review' },
    { id: '5', name: 'Audit Trail', status: 'pass', details: 'All actions logged' },
  ];

  const integrityAlerts = [
    { id: '1', severity: 'warning', message: '3 key results have inconsistent progress values', type: 'Data' },
    { id: '2', severity: 'info', message: 'Quarterly objectives auto-archived successfully', type: 'System' },
    { id: '3', severity: 'success', message: 'Database backup completed', type: 'System' },
  ];

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      addToast({ type: 'success', title: 'Scan complete', message: 'System integrity verified' });
    }, 2000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'database', label: 'Database' },
    { id: 'audit', label: 'Audit Log' },
  ];

  return (
    <div className="space-y-6 animate-fade-in h-full overflow-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">System Integrity</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor and maintain data integrity</p>
        </div>
        <Button 
          variant="primary" 
          leftIcon={<RefreshCw size={18} className={isScanning ? 'animate-spin' : ''} />} 
          onClick={handleRunScan}
          isLoading={isScanning}
        >
          Run Integrity Scan
        </Button>
      </div>

      {/* Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Integrity Score" subtitle="Overall system health" />
          <CardBody>
            <div className="flex items-center gap-8">
              <CircularProgress value={integrityScore} size={100} variant="success" />
              <div className="flex-1 space-y-3">
                {systemChecks.map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {check.status === 'pass' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-sm text-slate-700">{check.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{check.details}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader title="Alerts" subtitle="Recent system notices" />
          <CardBody className="space-y-3">
            {integrityAlerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg ${
                alert.severity === 'warning' ? 'bg-amber-50' :
                alert.severity === 'success' ? 'bg-emerald-50' : 'bg-blue-50'
              }`}>
                <div className="flex items-start gap-2">
                  {alert.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                  ) : alert.severity === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                  ) : (
                    <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm text-slate-700">{alert.message}</p>
                    <Badge variant={alert.severity === 'warning' ? 'warning' : alert.severity === 'success' ? 'success' : 'info'} size="sm" className="mt-1">
                      {alert.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="overview">
        <TabPanel tabId="overview">
          <Card>
            <CardHeader title="System Health" subtitle="Detailed integrity report" />
            <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <Database className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">15</p>
                <p className="text-xs text-slate-500">Database Tables</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">1,247</p>
                <p className="text-xs text-slate-500">Records</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-900">156</p>
                <p className="text-xs text-slate-500">Active Users</p>
              </div>
            </CardBody>
          </Card>
        </TabPanel>

        <TabPanel tabId="database">
          <Card>
            <CardHeader title="Database Integrity" subtitle="Table-level validation" />
            <CardBody className="space-y-2">
              {systemChecks.map((check) => (
                <div key={check.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{check.name}</p>
                    <p className="text-xs text-slate-500">{check.details}</p>
                  </div>
                  <Badge variant={check.status === 'pass' ? 'success' : 'warning'} size="sm">
                    {check.status === 'pass' ? 'Verified' : 'Review'}
                  </Badge>
                </div>
              ))}
            </CardBody>
          </Card>
        </TabPanel>

        <TabPanel tabId="audit">
          <Card>
            <CardHeader title="Audit Log" subtitle="Recent system actions" />
            <CardBody className="p-0">
              <div className="divide-y divide-slate-100">
                {[
                  { action: 'Integrity Scan', user: 'System', time: '2 minutes ago' },
                  { action: 'Backup Created', user: 'System', time: '1 hour ago' },
                  { action: 'User Role Updated', user: 'Admin', time: '3 hours ago' },
                  { action: 'KR Modified', user: 'Director', time: 'Yesterday' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{log.action}</p>
                      <p className="text-xs text-slate-500">{log.user}</p>
                    </div>
                    <span className="text-xs text-slate-400">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default IntegrityChecker;