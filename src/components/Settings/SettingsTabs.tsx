import React, { useState } from 'react';
import { Mail, X, LoaderCircle, CheckCircle2, XCircle, AlertTriangle, RefreshCcw, Save, Lock, Unlock, ShieldAlert, Clock } from 'lucide-react';
import { GovernanceConfig } from '../../types';

interface SecurityTabProps {
  domains: string[];
  isAddingDomain: boolean;
  newDomainInput: string;
  isAdmin: boolean;
  onAddDomain: () => void;
  onSetAddingDomain: (val: boolean) => void;
  onNewDomainInputChange: (val: string) => void;
  onRemoveDomain: (d: string) => void;
  setDirty: () => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  domains,
  isAddingDomain,
  newDomainInput,
  isAdmin,
  onAddDomain,
  onSetAddingDomain,
  onNewDomainInputChange,
  onRemoveDomain,
  setDirty,
}) => {
  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Security Boundaries</h3>
        <p className="text-sm text-slate-500 mt-1">Restrict access to validated corporate domains.</p>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        {domains.map(d => (
          <span key={d} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-3 shadow-sm group">
            <Mail size={12} className="text-primary-500" /> @{d}
            <X
              onClick={() => { if (confirm(`Revoke whitelist for @${d}?`)) { onRemoveDomain(d); setDirty(); } }}
              className="w-3 h-3 text-slate-300 hover:text-red-500 cursor-pointer transition-colors"
            />
          </span>
        ))}
        <button
          onClick={() => onSetAddingDomain(true)}
          className="px-5 py-2.5 border-2 border-dashed border-primary-200 text-primary-600 rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-primary-50 transition-all"
        >
          + Add Boundary
        </button>
      </div>

      {isAddingDomain && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-md p-8 shadow-2xl w-full max-w-sm border border-slate-100 animate-scale-in">
            <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight mb-4">Define Boundary</h4>
            <p className="text-xs text-slate-500 mb-6 font-medium">Add a corporate domain (e.g., example.com) to the platform whitelist.</p>
            <input
              type="text"
              value={newDomainInput}
              onChange={(e) => onNewDomainInputChange(e.target.value)}
              placeholder="domain.com"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-md text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500/20 mb-6"
              onKeyDown={(e) => e.key === 'Enter' && onAddDomain()}
            />
            <div className="flex gap-3">
              <button onClick={() => onSetAddingDomain(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-md text-[11px] font-black uppercase tracking-widest">Cancel</button>
              <button onClick={onAddDomain} className="flex-1 py-4 bg-primary-600 text-white rounded-md text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">Authorize</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProtocolsTabProps {
  govConfig: GovernanceConfig;
  setGovConfig: React.Dispatch<React.SetStateAction<GovernanceConfig>>;
  isSaving: boolean;
  onSave: () => void;
}

export const ProtocolsTab: React.FC<ProtocolsTabProps> = ({
  govConfig,
  setGovConfig,
  isSaving,
  onSave,
}) => {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Governance Protocols</h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">Configure disciplinary locks and deadline thresholds.</p>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-3 px-8 py-4 rounded-md text-[11px] font-black uppercase bg-primary-600 text-white shadow-2xl shadow-primary-500/30 hover:bg-primary-700 transition-all"
        >
          {isSaving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save size={16} />}
          {isSaving ? 'Syncing...' : 'Save Protocols'}
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight flex items-center gap-2"><Lock size={16} /> Content Lock Override</h4>
          <div className={`p-8 rounded-md border-2 border-dashed transition-all flex items-center justify-between ${govConfig.manualContentLock ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-sm font-bold text-slate-700 leading-relaxed max-w-[200px]">
              {govConfig.manualContentLock ? 'CONTENT IS FROZEN. Registry edits restricted.' : 'Strategic reporting is active. Edits are authorized.'}
            </p>
            <button onClick={() => setGovConfig(prev => ({ ...prev, manualContentLock: !prev.manualContentLock }))} className={`px-6 py-4 rounded-md text-[10px] font-black uppercase transition-all shadow-xl ${govConfig.manualContentLock ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
              {govConfig.manualContentLock ? 'UNLOCK CONTENT' : 'ACTIVATE LOCK'}
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight flex items-center gap-2"><ShieldAlert size={16} /> Full Registry Override (Full Lock)</h4>
          <div className={`p-8 rounded-md border-2 border-dashed transition-all flex items-center justify-between ${govConfig.manualFinalLock ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-sm font-bold text-slate-700 leading-relaxed max-w-[200px]">
              {govConfig.manualFinalLock ? 'PLATFORM IS FULLY FROZEN. All status updates restricted.' : 'Execution monitoring is active. Status updates are authorized.'}
            </p>
            <button onClick={() => setGovConfig(prev => ({ ...prev, manualFinalLock: !prev.manualFinalLock }))} className={`px-6 py-4 rounded-md text-[10px] font-black uppercase transition-all shadow-xl ${govConfig.manualFinalLock ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
              {govConfig.manualFinalLock ? 'UNFREEZE PLATFORM' : 'ACTIVATE FULL LOCK'}
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight flex items-center gap-2"><Unlock size={16} /> Emergency Lock Override</h4>
          <div className={`p-8 rounded-md border-2 border-dashed transition-all flex items-center justify-between ${govConfig.disableLocks ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
            <p className="text-sm font-bold text-slate-700 leading-relaxed max-w-[200px]">
              {govConfig.disableLocks ? 'ALL LOCKS DISABLED. Reporting is open for all past weeks.' : 'Standard governance locks are active.'}
            </p>
            <button onClick={() => setGovConfig(prev => ({ ...prev, disableLocks: !prev.disableLocks }))} className={`px-6 py-4 rounded-md text-[10px] font-black uppercase transition-all shadow-xl ${govConfig.disableLocks ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white'}`}>
              {govConfig.disableLocks ? 'RESTORE LOCKS' : 'DISABLE ALL LOCKS'}
            </button>
          </div>
        </div>
        <div className="space-y-6 lg:col-span-2">
          <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight flex items-center gap-2"><Clock size={16} /> Automated Thresholds (WAT)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-100 rounded-md shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-3">Content Freeze Day</span>
              <input type="number" min="0" max="14" value={govConfig.contentLockDay} onChange={(e) => setGovConfig(prev => ({ ...prev, contentLockDay: parseInt(e.target.value) || 0 }))} className="w-full bg-slate-50 p-2 rounded-md text-xs font-black" />
              <p className="text-[8px] text-slate-400 mt-2">Days from week start (0=Mon)</p>
            </div>
            <div className="p-5 bg-white border border-slate-100 rounded-md shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-3">Content Freeze Time</span>
              <input type="time" value={govConfig.contentLockTime} onChange={(e) => setGovConfig(prev => ({ ...prev, contentLockTime: e.target.value }))} className="w-full bg-slate-50 p-2 rounded-md text-xs font-black" />
            </div>
            <div className="p-5 bg-white border border-slate-100 rounded-md shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-3">Full Freeze Day</span>
              <input type="number" min="0" max="14" value={govConfig.finalLockDay} onChange={(e) => setGovConfig(prev => ({ ...prev, finalLockDay: parseInt(e.target.value) || 0 }))} className="w-full bg-slate-50 p-2 rounded-md text-xs font-black" />
              <p className="text-[8px] text-slate-400 mt-2">Days from week start (0=Mon)</p>
            </div>
            <div className="p-5 bg-white border border-slate-100 rounded-md shadow-sm">
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-3">Full Freeze Time</span>
              <input type="time" value={govConfig.finalLockTime} onChange={(e) => setGovConfig(prev => ({ ...prev, finalLockTime: e.target.value }))} className="w-full bg-slate-50 p-2 rounded-md text-xs font-black" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NotificationsTabProps {
  govConfig: GovernanceConfig;
  setGovConfig: React.Dispatch<React.SetStateAction<GovernanceConfig>>;
  testEmail: string;
  setTestEmail: (val: string) => void;
  isTestingSMTP: boolean;
  testResult: { success: boolean; message: string } | null;
  isSaving: boolean;
  onTestSMTP: () => void;
  onSave: () => void;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  govConfig,
  setGovConfig,
  testEmail,
  setTestEmail,
  isTestingSMTP,
  testResult,
  isSaving,
  onTestSMTP,
  onSave,
}) => {
  return (
    <div className="space-y-10 animate-slide-up">
      <div className="flex justify-between items-end border-b border-slate-100 pb-8">
        <div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Notification Hub</h3>
          <p className="text-xs text-slate-500 mt-1">Configure automated dispatch protocols and SMTP nodes.</p>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-8 py-4 rounded-md text-[11px] font-black uppercase bg-primary-600 text-white shadow-2xl shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center gap-2"
        >
          {isSaving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save size={16} />}
          {isSaving ? 'Syncing...' : 'Authorize Config'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className={`p-8 rounded-md border-2 border-dashed transition-all flex flex-col gap-6 ${govConfig.smtpEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight flex items-center gap-2">
                <Mail size={16} className={govConfig.smtpEnabled ? 'text-emerald-600' : 'text-slate-400'} /> Mail Delivery
              </h4>
              <button
                onClick={() => setGovConfig(prev => ({ ...prev, smtpEnabled: !prev.smtpEnabled }))}
                className={`w-12 h-6 rounded-full relative transition-all ${govConfig.smtpEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${govConfig.smtpEnabled ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Toggle the dispatch engine for welcome emails, performance reminders, and lock warnings.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">SMTP Host</label>
              <input
                type="text"
                value={govConfig.smtpHost || ''}
                onChange={(e) => setGovConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-md text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
                placeholder="mail.corporate.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">SMTP Port</label>
              <input
                type="number"
                value={govConfig.smtpPort || ''}
                onChange={(e) => setGovConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-md text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
                placeholder="587"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Auth Username</label>
              <input
                type="text"
                value={govConfig.smtpUser || ''}
                onChange={(e) => setGovConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-md text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
                placeholder="dispatch@corporate.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Security Key (Password)</label>
              <div className="relative">
                <input
                  type="password"
                  value={govConfig.smtpPass || ''}
                  onChange={(e) => setGovConfig(prev => ({ ...prev, smtpPass: e.target.value }))}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-md text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
                  placeholder="••••••••••••"
                />
                <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-md border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Handshake Verification</h5>
                <p className="text-[10px] text-slate-400 font-medium mt-1">Dispatch a test packet to verify relay authorization.</p>
              </div>
              {testResult && (
                <div className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 animate-fade-in ${testResult.success ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                  {testResult.success ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {testResult.success ? 'Verification Passed' : 'Verification Failed'}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <input
                type="email"
                placeholder="test-recipient@domain.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 p-4 bg-white border border-slate-200 rounded-md text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/5 transition-all"
              />
              <button
                onClick={onTestSMTP}
                disabled={!testEmail || isTestingSMTP}
                className="px-6 py-4 bg-slate-900 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isTestingSMTP ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <RefreshCcw size={14} />}
                {isTestingSMTP ? 'Relaying...' : 'Test Node'}
              </button>
            </div>

            {testResult && !testResult.success && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-md flex gap-3 text-rose-700 animate-slide-up">
                <AlertTriangle size={16} className="shrink-0" />
                <p className="text-[10px] font-medium leading-relaxed">{testResult.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};