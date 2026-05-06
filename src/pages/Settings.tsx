/**
 * 4CORE OKR Platform - Settings Page
 */

import React, { useState } from 'react';
import { User, Shield, Bell, Palette, Lock, Database, Save, Building2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../shared/components/ui/Card';
import { Button } from '../shared/components/ui/Button';
import { Input, Textarea } from '../shared/components/ui/Input';
import { Select } from '../shared/components/ui/Select';
import { Tabs, TabPanel } from '../shared/components/ui/Tabs';
import { Badge } from '../shared/components/ui/Badge';
import { Avatar } from '../shared/components/ui/Avatar';
import { useAuth } from '../shared/hooks/useAuth';
import { useToast } from '../shared/components/ui/Toast';
import { getRoleDisplayName } from '../shared/utils/permissions';
import { LogoUpload } from '../components/layout/Sidebar/LogoUpload';

const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = () => {
    addToast({ type: 'success', title: 'Settings saved', message: 'Your changes have been saved' });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'company', label: 'Company', icon: <Building2 size={16} /> },
    { id: 'security', label: 'Security', icon: <Shield size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'preferences', label: 'Preferences', icon: <Palette size={16} /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in h-full overflow-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and preferences</p>
      </div>

      <Tabs tabs={tabs} defaultTab="profile" onChange={setActiveTab}>
        {/* Profile Tab */}
        <TabPanel tabId="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardBody className="text-center">
                <Avatar
                  src={currentUser?.avatarUrl}
                  name={currentUser?.name || ''}
                  size="xl"
                  className="mx-auto mb-4"
                />
                <h3 className="font-semibold text-slate-900">{currentUser?.name}</h3>
                <p className="text-sm text-slate-500">{currentUser?.email}</p>
                <Badge variant="primary" className="mt-3">{getRoleDisplayName(currentUser?.role || 'Viewer')}</Badge>
              </CardBody>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader title="Profile Information" />
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="First Name" defaultValue={currentUser?.firstName} />
                  <Input label="Last Name" defaultValue={currentUser?.lastName} />
                </div>
                <Input label="Email" type="email" defaultValue={currentUser?.email} disabled />
                <Input label="Department" defaultValue={currentUser?.department} />
                <Select
                  label="Role"
                  defaultValue={currentUser?.role}
                  options={[
                    { value: 'Viewer', label: 'Viewer' },
                    { value: 'Manager', label: 'Manager' },
                    { value: 'Director', label: 'Director' },
                    { value: 'Admin', label: 'Admin' },
                  ]}
                />
                <div className="pt-4">
                  <Button variant="primary" leftIcon={<Save size={16} />} onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </TabPanel>

        {/* Company Tab */}
          <TabPanel tabId="company">
            <Card>
              <CardHeader title="Company Branding" subtitle="Upload your company logo for the sidebar" />
              <CardBody className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <LogoUpload
                    currentLogo={undefined}
                    onUpload={async (file) => {
                      // Handle logo upload - would integrate with Supabase storage
                      addToast({ type: 'success', title: 'Logo uploaded', message: 'Company logo has been updated' });
                    }}
                    onRemove={async () => {
                      addToast({ type: 'info', title: 'Logo removed', message: 'Company logo has been removed' });
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Company Name" defaultValue="CENTRA OKR" />
                  <Input label="Industry" defaultValue="Technology" />
                </div>

                <Input label="Company Website" defaultValue="https://centra.com" />

                <div className="pt-4">
                  <Button variant="primary" leftIcon={<Save size={16} />} onClick={handleSave}>
                    Save Company Settings
                  </Button>
                </div>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Security Tab */}
        <TabPanel tabId="security">
          <Card>
            <CardHeader title="Security Settings" subtitle="Manage your password and security options" />
            <CardBody className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Password</p>
                    <p className="text-xs text-slate-500">Last changed 30 days ago</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm">Change Password</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security</p>
                  </div>
                </div>
                <Badge variant="success">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Active Sessions</p>
                    <p className="text-xs text-slate-500">Manage your active sessions</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm">View Sessions</Button>
              </div>
            </CardBody>
          </Card>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel tabId="notifications">
          <Card>
            <CardHeader title="Notification Preferences" subtitle="Choose how you want to be notified" />
            <CardBody className="space-y-4">
              {['Email notifications', 'Weekly digest', 'KR milestone alerts', 'Comment mentions'].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <span className="text-sm text-slate-700">{item}</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary-500" />
                </div>
              ))}
            </CardBody>
          </Card>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel tabId="preferences">
          <Card>
            <CardHeader title="Display Preferences" subtitle="Customize your experience" />
            <CardBody className="space-y-4">
              <Select
                label="Language"
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'fr', label: 'French' },
                ]}
              />
              <Select
                label="Timezone"
                options={[
                  { value: 'wat', label: 'West Africa (WAT)' },
                  { value: 'gmt', label: 'GMT' },
                ]}
              />
              <Select
                label="Date Format"
                options={[
                  { value: 'mdy', label: 'MM/DD/YYYY' },
                  { value: 'dmy', label: 'DD/MM/YYYY' },
                ]}
              />
            </CardBody>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default Settings;