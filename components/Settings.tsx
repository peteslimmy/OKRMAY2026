
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Settings2,
  History,
  AlertTriangle,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Info,
  Save,
  LoaderCircle,
  Search,
  ChevronDown,
  Activity as ActivityIcon,
  ShieldAlert,
  ArrowRightLeft,
  X,
  FileText,
  Zap,
  Palette,
  ImageIcon,
  Upload,
  Mail,
  Clock,
  Download,
  Globe,
  Fingerprint,
  Lock,
  Unlock
} from 'lucide-react';
import { canConfigureSystem, canViewSettings, canViewAuditLogs, ALLOWED_DOMAINS, AUDIT_LOGS, exportAuditLogsToCSV, logAudit, addAllowedDomain, removeAllowedDomain, getGovernanceConfig, saveGovernanceConfig, getSessionUser, testSMTPSettings } from '../utils';
import { GovernanceConfig } from '../src/types';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('4core_settings_tab') || 'audit');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const [domains, setDomains] = useState<string[]>(ALLOWED_DOMAINS);
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [brandAssets, setBrandAssets] = useState({
    logo: localStorage.getItem('4CORE_logo') || '',
    landingImage: localStorage.getItem('4CORE_landing') || '',
    loginImage: localStorage.getItem('4CORE_login_bg') || ''
  });

  // Fixed: Initialized state with allowedDomains to match the GovernanceConfig interface requirement.
  const [govConfig, setGovConfig] = useState<GovernanceConfig>({
    contentLockDay: 2,
    contentLockTime: "18:00",
    finalLockDay: 2,
    finalLockTime: "11:00",
    manualContentLock: false,
    manualFinalLock: false,
    allowedDomains: ALLOWED_DOMAINS,
    disableLocks: false
  });

  const [testEmail, setTestEmail] = useState('');
  const [isTestingSMTP, setIsTestingSMTP] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const checkPerms = async () => {
      const allowed = await canConfigureSystem();
      setIsAdmin(allowed);
      if (!allowed && (activeTab === 'general' || activeTab === 'protocols' || activeTab === 'brand')) {
        setActiveTab('audit');
      }
    };
    checkPerms();
    getGovernanceConfig().then(config => {
      setGovConfig(config);
      setBrandAssets({
        logo: config.brandLogo || localStorage.getItem('4CORE_logo') || '',
        landingImage: config.brandLandingImage || localStorage.getItem('4CORE_landing') || '',
        loginImage: config.brandLoginImage || localStorage.getItem('4CORE_login_bg') || ''
      });
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('4core_settings_tab', activeTab);
  }, [activeTab]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof brandAssets) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Security Protocol: File size must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBrandAssets(prev => ({ ...prev, [key]: base64String }));
        setIsDirty(true);
        setSaveSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      const finalConfig = {
        ...govConfig,
        brandLogo: brandAssets.logo,
        brandLandingImage: brandAssets.landingImage,
        brandLoginImage: brandAssets.loginImage
      };
      await saveGovernanceConfig(finalConfig);

      localStorage.setItem('4CORE_logo', brandAssets.logo);
      localStorage.setItem('4CORE_landing', brandAssets.landingImage);
      localStorage.setItem('4CORE_login_bg', brandAssets.loginImage);

      logAudit('SYSTEM', 'Modified branding configuration', { assets: Object.keys(brandAssets).filter(k => !!brandAssets[k as keyof typeof brandAssets]) });
      window.dispatchEvent(new Event('4COREBrandUpdate'));
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert("Persistence Failure.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGovernance = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      // Sync allowedDomains from utility state before saving
      const finalConfig = { ...govConfig, allowedDomains: ALLOWED_DOMAINS };
      saveGovernanceConfig(finalConfig);
      logAudit('SYSTEM', 'Adjusted governance thresholds', { config: finalConfig });
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert("Sync Failure.");
    } finally {
      setIsSaving(false);
    }
  };

  // Fixed: Implemented handleAddDomainAction to handle new boundary authorization.
  const handleAddDomainAction = () => {
    if (newDomainInput.trim()) {
      addAllowedDomain(newDomainInput.trim());
      setDomains([...ALLOWED_DOMAINS]);
      logAudit('SYSTEM', 'Added domain whitelist boundary', { domain: newDomainInput });
      setNewDomainInput('');
      setIsAddingDomain(false);
      setIsDirty(true);
    }
  };

  const handleTestSMTP = async () => {
    if (!testEmail) return;
    setIsTestingSMTP(true);
    setTestResult(null);
    const result = await testSMTPSettings(govConfig, testEmail);
    setTestResult(result);
    setIsTestingSMTP(false);
  };

  const tabs = [
    { id: 'general', label: 'Security', icon: <ShieldCheck />, check: () => isAdmin },
    { id: 'protocols', label: 'Protocols', icon: <Zap />, check: () => isAdmin },
    { id: 'brand', label: 'Brand & Identity', icon: <Palette />, check: () => isAdmin },
    { id: 'notifications', label: 'Notifications', icon: <Mail />, check: () => isAdmin },
    { id: 'audit', label: 'Audit Trace', icon: <FileText />, check: () => true },
  ];

  const BrandUploadCard = ({ title, description, assetKey, currentImage }: { title: string, description: string, assetKey: keyof typeof brandAssets, currentImage: string }) => (
    <div className="bg-white border border-slate-200 rounded-[4px] overflow-hidden flex flex-col group transition-all hover:border-primary-200 hover:shadow-lg">
      <div className="aspect-video bg-slate-50 relative flex items-center justify-center overflow-hidden border-b border-slate-100">
        {currentImage ? (
          <>
            <img src={currentImage} alt={title} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => { setBrandAssets(prev => ({ ...prev, [assetKey]: '' })); setIsDirty(true); }} className="p-3 bg-white/20 backdrop-blur-md text-white rounded-[4px] hover:bg-rose-500 transition-colors shadow-xl">
                <RefreshCcw size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-300">
            <ImageIcon size={56} strokeWidth={1} />
            <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Asset Upload</span>
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight mb-2">{title}</h4>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed line-clamp-2">{description}</p>
        <div className="mt-auto">
          <label className="block w-full text-center px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-all cursor-pointer shadow-sm">
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, assetKey)} />
            <div className="flex items-center justify-center gap-2">
              <Upload size={14} />
              {currentImage ? 'Replace Strategic Asset' : 'Upload Identity Asset'}
            </div>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Governance Hub</h2>
        <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-500" /> Platform Security & Identity Node
        </p>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-slate-200 rounded-xl w-fit">
        {tabs.map(tab => tab.check() && (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSaveSuccess(false); }}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`
            }
          >
            {React.cloneElement(tab.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card p-8">
        {activeTab === 'general' && (
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
                    onClick={() => { if (confirm(`Revoke whitelist for @${d}?`)) { removeAllowedDomain(d); setDomains([...ALLOWED_DOMAINS]); logAudit('SYSTEM', 'Revoked domain whitelist', { domain: d }); setIsDirty(true); } }}
                    className="w-3 h-3 text-slate-300 hover:text-red-500 cursor-pointer transition-colors"
                  />
                </span>
              ))}
              <button
                onClick={() => setIsAddingDomain(true)}
                className="px-5 py-2.5 border-2 border-dashed border-primary-200 text-primary-600 rounded-[4px] text-[11px] font-black uppercase tracking-widest hover:bg-primary-50 transition-all"
              >
                + Add Boundary
              </button>
            </div>

            {/* Added: Modal to support adding domain boundaries */}
            {isAddingDomain && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-[4px] p-8 shadow-2xl w-full max-w-sm border border-slate-100 animate-scale-in">
                  <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight mb-4">Define Boundary</h4>
                  <p className="text-xs text-slate-500 mb-6 font-medium">Add a corporate domain (e.g., example.com) to the platform whitelist.</p>
                  <input
                    type="text"
                    value={newDomainInput}
                    onChange={(e) => setNewDomainInput(e.target.value)}
                    placeholder="domain.com"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500/20 mb-6"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddDomainAction()}
                  />
                  <div className="flex gap-3">
                    <button onClick={() => setIsAddingDomain(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[4px] text-[11px] font-black uppercase tracking-widest">Cancel</button>
                    <button onClick={handleAddDomainAction} className="flex-1 py-4 bg-primary-600 text-white rounded-[4px] text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20">Authorize</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'protocols' && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">Governance Protocols</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Configure disciplinary locks and deadline thresholds.</p>
              </div>
              <button
                onClick={handleSaveGovernance}
                disabled={isSaving}
                className="flex items-center gap-3 px-8 py-4 rounded-[4px] text-[11px] font-black uppercase bg-primary-600 text-white shadow-2xl shadow-primary-500/30 hover:bg-primary-700 transition-all"
              >
                {isSaving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Syncing...' : 'Save Protocols'}
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight flex items-center gap-2"><Lock size={16} /> Content Lock Override</h4>
                <div className={`p-8 rounded-[4px] border-2 border-dashed transition-all flex items-center justify-between ${govConfig.manualContentLock ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed max-w-[200px]">
                    {govConfig.manualContentLock ? 'CONTENT IS FROZEN. Registry edits restricted.' : 'Strategic reporting is active. Edits are authorized.'}
                  </p>
                  <button onClick={() => setGovConfig(prev => ({ ...prev, manualContentLock: !prev.manualContentLock }))} className={`px-6 py-4 rounded-[4px] text-[10px] font-black uppercase transition-all shadow-xl ${govConfig.manualContentLock ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    {govConfig.manualContentLock ? 'UNLOCK CONTENT' : 'ACTIVATE LOCK'}
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight flex items-center gap-2"><ShieldAlert size={16} /> Full Registry Override (Full Lock)</h4>
                <div className={`p-8 rounded-[4px] border-2 border-dashed transition-all flex items-center justify-between ${govConfig.manualFinalLock ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed max-w-[200px]">
                    {govConfig.manualFinalLock ? 'PLATFORM IS FULLY FROZEN. All status updates restricted.' : 'Execution monitoring is active. Status updates are authorized.'}
                  </p>
                  <button onClick={() => setGovConfig(prev => ({ ...prev, manualFinalLock: !prev.manualFinalLock }))} className={`px-6 py-4 rounded-[4px] text-[10px] font-black uppercase transition-all shadow-xl ${govConfig.manualFinalLock ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    {govConfig.manualFinalLock ? 'UNFREEZE PLATFORM' : 'ACTIVATE FULL LOCK'}
                  </button>
                </div>
              </div>
              <div className="space-y-6">
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight flex items-center gap-2"><Unlock size={16} /> Emergency Lock Override</h4>
                <div className={`p-8 rounded-[4px] border-2 border-dashed transition-all flex items-center justify-between ${govConfig.disableLocks ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed max-w-[200px]">
                    {govConfig.disableLocks ? 'ALL LOCKS DISABLED. Reporting is open for all past weeks.' : 'Standard governance locks are active.'}
                  </p>
                  <button onClick={() => setGovConfig(prev => ({ ...prev, disableLocks: !prev.disableLocks }))} className={`px-6 py-4 rounded-[4px] text-[10px] font-black uppercase transition-all shadow-xl ${govConfig.disableLocks ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white'}`}>
                    {govConfig.disableLocks ? 'RESTORE LOCKS' : 'DISABLE ALL LOCKS'}
                  </button>
                </div>
              </div>
              <div className="space-y-6 lg:col-span-2">
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight flex items-center gap-2"><Clock size={16} /> Automated Thresholds (WAT)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white border border-slate-100 rounded-[4px] shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-3">Content Freeze Schedule</span>
                    <input type="time" value={govConfig.contentLockTime} onChange={(e) => setGovConfig(prev => ({ ...prev, contentLockTime: e.target.value }))} className="w-full bg-slate-50 p-2 rounded-[4px] text-xs font-black" />
                  </div>
                  <div className="p-5 bg-white border border-slate-100 rounded-[4px] shadow-sm">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-3">Full Status Freeze Schedule</span>
                    <input type="time" value={govConfig.finalLockTime} onChange={(e) => setGovConfig(prev => ({ ...prev, finalLockTime: e.target.value }))} className="w-full bg-slate-50 p-2 rounded-[4px] text-xs font-black" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'brand' && (
          <div className="space-y-10">
            <div className="flex justify-between items-end border-b border-slate-100 pb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Visual Identity</h3>
                <p className="text-xs text-slate-500 mt-1">Define organizational presence across the platform.</p>
              </div>
              <button onClick={handleSaveBranding} disabled={!isDirty || isSaving} className={`px-8 py-4 rounded-[4px] text-[11px] font-black uppercase shadow-2xl transition-all ${isDirty ? 'bg-primary-600 text-white shadow-primary-500/20' : 'bg-slate-100 text-slate-300'}`}>Commit Assets</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <BrandUploadCard title="Main Logo" description="Primary anchor asset." assetKey="logo" currentImage={brandAssets.logo} />
              <BrandUploadCard title="Hero Image" description="Landing interface background." assetKey="landingImage" currentImage={brandAssets.landingImage} />
              <BrandUploadCard title="Auth UI" description="Ambient login background." assetKey="loginImage" currentImage={brandAssets.loginImage} />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-10 animate-slide-up">
            <div className="flex justify-between items-end border-b border-slate-100 pb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Notification Hub</h3>
                <p className="text-xs text-slate-500 mt-1">Configure automated dispatch protocols and SMTP nodes.</p>
              </div>
              <button
                onClick={handleSaveGovernance}
                disabled={isSaving}
                className="px-8 py-4 rounded-[4px] text-[11px] font-black uppercase bg-primary-600 text-white shadow-2xl shadow-primary-500/30 hover:bg-primary-700 transition-all flex items-center gap-2"
              >
                {isSaving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Syncing...' : 'Authorize Config'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1 space-y-6">
                <div className={`p-8 rounded-[4px] border-2 border-dashed transition-all flex flex-col gap-6 ${govConfig.smtpEnabled ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
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
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
                      placeholder="mail.corporate.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">SMTP Port</label>
                    <input
                      type="number"
                      value={govConfig.smtpPort || ''}
                      onChange={(e) => setGovConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
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
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
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
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
                        placeholder="••••••••••••"
                      />
                      <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-[4px] border border-slate-200 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-tight">Handshake Verification</h5>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">Dispatch a test packet to verify relay authorization.</p>
                    </div>
                    {testResult && (
                      <div className={`px-4 py-2 rounded-[4px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 animate-fade-in ${testResult.success ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
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
                      className="flex-1 p-4 bg-white border border-slate-200 rounded-[4px] text-sm font-bold outline-none focus:ring-4 focus:ring-primary-500/5 transition-all"
                    />
                    <button
                      onClick={handleTestSMTP}
                      disabled={!testEmail || isTestingSMTP}
                      className="px-6 py-4 bg-slate-900 text-white rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isTestingSMTP ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <RefreshCcw size={14} />}
                      {isTestingSMTP ? 'Relaying...' : 'Test Node'}
                    </button>
                  </div>

                  {testResult && !testResult.success && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-[4px] flex gap-3 text-rose-700 animate-slide-up">
                      <AlertTriangle size={16} className="shrink-0" />
                      <p className="text-[10px] font-medium leading-relaxed">{testResult.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-8 animate-slide-up">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Granular Audit Trace</h3>
                <p className="text-xs text-slate-500 mt-1">Deep high-fidelity traceability of all governance transactions.</p>
              </div>
              <button onClick={exportAuditLogsToCSV} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-[4px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all">
                <Download size={14} /> Export Protocol Logs
              </button>
            </div>
            <div className="overflow-hidden rounded-[4px] border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-5">Timestamp (WAT)</th>
                    <th className="px-6 py-5">Operator / Node</th>
                    <th className="px-6 py-5">Strategic Action</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {AUDIT_LOGS.map(log => {
                    const isExpanded = expandedLogId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr className={`hover:bg-slate-50/50 transition-colors ${isExpanded ? 'bg-slate-50/30' : ''}`}>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="font-mono text-[11px] font-bold text-slate-700">{new Date(log.timestamp).toLocaleTimeString()}</span>
                              <span className="text-[9px] text-slate-400 font-medium">{new Date(log.timestamp).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-[4px] flex items-center justify-center font-black text-[10px] text-primary-600 border border-primary-100">{log.userName[0]}</div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-[11px]">{log.userName}</span>
                                <span className="font-mono text-[9px] text-slate-400 flex items-center gap-1"><Globe size={8} /> {log.ipAddress || '105.112.XX.XX'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                              <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-md text-[8px] font-black uppercase tracking-widest border border-primary-100 w-fit">{log.action}</span>
                              <span className="text-slate-600 font-bold text-[11px] truncate max-w-[200px]">{log.details}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase">
                              <ShieldCheck size={12} /> SECURED
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className={`p-2 rounded-[4px] transition-all ${isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50/50 font-montserrat">
                            <td colSpan={5} className="px-10 py-6 border-b border-slate-100 animate-slide-up">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Fingerprint size={12} className="text-primary-500" /> Transaction Metadata
                                  </h5>
                                  <div className="bg-white p-4 rounded-[4px] border border-slate-200 font-mono text-[10px] text-slate-600 shadow-inner overflow-x-auto whitespace-pre">
                                    {JSON.stringify(log.metadata || { node_id: log.id, protocol: 'HTTPS/WAT' }, null, 2)}
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Info size={12} className="text-primary-500" /> Granular Changes
                                  </h5>
                                  <div className="bg-white p-5 rounded-[4px] border border-slate-200 space-y-3 shadow-inner min-h-[100px]">
                                    {log.metadata?.changes ? (
                                      Object.entries(log.metadata.changes).map(([field, change]: any) => (
                                        <div key={field} className="flex flex-col gap-1 pb-2 border-b border-slate-50 last:border-0">
                                          <span className="text-[9px] font-black text-slate-400 uppercase">{field}</span>
                                          <div className="flex items-center gap-2 text-[11px]">
                                            <span className="text-rose-500 line-through opacity-60">{String(change.old)}</span>
                                            <RefreshCcw size={8} className="text-slate-300" />
                                            <span className="text-emerald-600 font-bold">{String(change.new)}</span>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-[11px] text-slate-400 italic">No field-level delta archived for this transaction type.</p>
                                    )}
                                    <div className="pt-2 flex items-center gap-2 text-[9px] text-slate-400">
                                      <ShieldAlert size={10} className="text-amber-500" />
                                      Validated via Governance Node 105.112.XX.XX
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};





