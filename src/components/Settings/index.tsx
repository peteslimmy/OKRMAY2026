import React, { useState, useEffect } from 'react';
import { ShieldCheck, Settings2, FileText, Mail, Bot, Cpu, Sparkles, TestTube, Save, LoaderCircle, Download, Shield, Trash2, RotateCcw, User } from 'lucide-react';
import { MFASetup } from './MFASetup';
import { canConfigureSystem, canViewSettings, ALLOWED_DOMAINS, AUDIT_LOGS, exportAuditLogsToCSV, logAudit, addAllowedDomain, removeAllowedDomain, getGovernanceConfig, saveGovernanceConfig, testSMTPSettings, callAIDirect, AIMessage, clearAllCache, clearBrowserData, getRegistryUsers, setSimulatedUser } from '../../utils';
import { GovernanceConfig } from '../../types';
import { BrandUploadCard } from './BrandUploadCard';
import { SecurityTab, ProtocolsTab, NotificationsTab } from './SettingsTabs';
import { AuditLogTab } from './AuditLogTab';

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

  const [aiProvider, setAiProvider] = useState<'nvidia' | 'openrouter' | 'local'>(() => {
    const storedProvider = localStorage.getItem('4core_ai_provider') as 'nvidia' | 'openrouter' | 'local';
    if (storedProvider) return storedProvider;
    return import.meta.env.VITE_LOCAL_AI_URL ? 'local' : 'nvidia';
  });
  const [aiModel, setAiModel] = useState<string>(() => {
    const storedModel = localStorage.getItem('4core_ai_model');
    if (storedModel) return storedModel;
    return import.meta.env.VITE_LOCAL_AI_URL ? 'gemma4:latest' : 'minimax-m2.5';
  });
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [clearCacheMsg, setClearCacheMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [availableUsers, setAvailableUsers] = useState<{id: string; email: string; name: string; role: string}[]>([]);

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

  useEffect(() => {
    getRegistryUsers().then(users => {
      setAvailableUsers(users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
    });
  }, []);

  const handleSwitchUser = (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    if (user) {
      const fullUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ').slice(1).join(' '),
        role: user.role as any,
        department: 'Strategic Planning',
        status: 'Active' as const
      };
      setSimulatedUser(fullUser);
      setClearCacheMsg({ type: 'success', text: `Switched to ${user.email}. Navigate to see changes.` });
      setTimeout(() => setClearCacheMsg(null), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: 'logo' | 'landingImage' | 'loginImage') => {
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

  const handleClearAsset = (key: 'logo' | 'landingImage' | 'loginImage') => {
    setBrandAssets(prev => ({ ...prev, [key]: '' }));
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

  const handleAddDomain = () => {
    if (newDomainInput.trim()) {
      addAllowedDomain(newDomainInput.trim());
      setDomains([...ALLOWED_DOMAINS]);
      logAudit('SYSTEM', 'Added domain whitelist boundary', { domain: newDomainInput });
      setNewDomainInput('');
      setIsAddingDomain(false);
      setIsDirty(true);
    }
  };

  const handleRemoveDomain = (d: string) => {
    removeAllowedDomain(d);
    setDomains([...ALLOWED_DOMAINS]);
    logAudit('SYSTEM', 'Revoked domain whitelist', { domain: d });
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
    { id: 'mfa', label: 'MFA', icon: <Shield />, check: () => true },
    { id: 'protocols', label: 'Protocols', icon: <Settings2 />, check: () => isAdmin },
    { id: 'brand', label: 'Brand & Identity', icon: <FileText />, check: () => isAdmin },
    { id: 'notifications', label: 'Notifications', icon: <Mail />, check: () => isAdmin },
    { id: 'ai', label: 'AI Models', icon: <Bot />, check: () => isAdmin },
    { id: 'system', label: 'System', icon: <RotateCcw />, check: () => isAdmin },
    { id: 'audit', label: 'Audit Trace', icon: <FileText />, check: () => true },
  ];

  const aiModels = aiProvider === 'nvidia'
    ? [
        { value: 'minimax-m2.5', label: 'MiniMax M2.5 (NVIDIA NIM)' },
        { value: 'minimax-m2.7', label: 'MiniMax M2.7 (NVIDIA NIM)' },
        { value: 'minimax-text-01', label: 'MiniMax Text 01 (NVIDIA NIM)' },
      ]
    : aiProvider === 'openrouter'
      ? [
          { value: 'openai/gpt-4o', label: 'GPT-4o' },
          { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
          { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
          { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku' },
          { value: 'google/gemini-pro-1.5', label: 'Gemini Pro 1.5' },
        ]
      : [
          { value: 'gemma4:latest', label: 'Gemma 4 (Local Ollama)' },
          { value: 'qwen3.6:latest', label: 'Qwen 3.6 (Local Ollama)' },
        ];

  const handleTestAI = async () => {
    setIsTestingAI(true);
    setAiTestResult(null);
    try {
      const messages: AIMessage[] = [
        { role: 'user', content: 'Say "Hello from 4CORE!" in exactly 3 words.' }
      ];
      const result = await callAIDirect(messages, aiProvider, aiModel);
      setAiTestResult({ success: true, message: result });
    } catch (e: any) {
      setAiTestResult({ success: false, message: e.message });
    }
    setIsTestingAI(false);
  };

  const saveAISettings = () => {
    localStorage.setItem('4core_ai_provider', aiProvider);
    localStorage.setItem('4core_ai_model', aiModel);
    setIsDirty(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

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
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            {React.cloneElement(tab.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card p-8">
        {activeTab === 'general' && (
          <SecurityTab
            domains={domains}
            isAddingDomain={isAddingDomain}
            newDomainInput={newDomainInput}
            isAdmin={isAdmin}
            onAddDomain={handleAddDomain}
            onSetAddingDomain={setIsAddingDomain}
            onNewDomainInputChange={setNewDomainInput}
            onRemoveDomain={handleRemoveDomain}
            setDirty={() => setIsDirty(true)}
          />
        )}

        {activeTab === 'mfa' && <MFASetup />}

        {activeTab === 'protocols' && (
          <ProtocolsTab
            govConfig={govConfig}
            setGovConfig={setGovConfig}
            isSaving={isSaving}
            onSave={handleSaveGovernance}
          />
        )}

        {activeTab === 'brand' && (
          <div className="space-y-10">
            <div className="flex justify-between items-end border-b border-slate-100 pb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Visual Identity</h3>
                <p className="text-xs text-slate-500 mt-1">Define organizational presence across the platform.</p>
              </div>
              <button onClick={handleSaveBranding} disabled={!isDirty || isSaving} className={`px-8 py-4 rounded-md text-[11px] font-black uppercase shadow-2xl transition-all ${isDirty ? 'bg-primary-600 text-white shadow-primary-500/20' : 'bg-slate-100 text-slate-300'}`}>Commit Assets</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <BrandUploadCard title="Main Logo" description="Primary anchor asset." assetKey="logo" currentImage={brandAssets.logo} onUpload={handleFileUpload} onClear={handleClearAsset} setDirty={() => setIsDirty(true)} />
              <BrandUploadCard title="Hero Image" description="Landing interface background." assetKey="landingImage" currentImage={brandAssets.landingImage} onUpload={handleFileUpload} onClear={handleClearAsset} setDirty={() => setIsDirty(true)} />
              <BrandUploadCard title="Auth UI" description="Ambient login background." assetKey="loginImage" currentImage={brandAssets.loginImage} onUpload={handleFileUpload} onClear={handleClearAsset} setDirty={() => setIsDirty(true)} />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab
            govConfig={govConfig}
            setGovConfig={setGovConfig}
            testEmail={testEmail}
            setTestEmail={setTestEmail}
            isTestingSMTP={isTestingSMTP}
            testResult={testResult}
            isSaving={isSaving}
            onTestSMTP={handleTestSMTP}
            onSave={handleSaveGovernance}
          />
        )}

        {activeTab === 'ai' && (
          <div className="space-y-8 animate-slide-up">
            <div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">AI Model Configuration</h3>
              <p className="text-xs text-slate-500 mt-1">Configure AI providers for the 4CORE AI Assistant.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                <div className="bg-slate-50/80 p-4 border-b border-slate-100">
                  <h4 className="text-xs font-black text-slate-600 uppercase">AI Provider</h4>
                </div>
                <div className="p-6 space-y-4">
                  <label className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover:bg-primary-50 transition-colors" style={aiProvider === 'nvidia' ? { borderColor: 'var(--primary-500)', backgroundColor: 'var(--primary-50)' } : {}}>
                    <input type="radio" name="provider" checked={aiProvider === 'nvidia'} onChange={() => { setAiProvider('nvidia'); setAiModel('minimax-m2.5'); }} className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Cpu size={16} className="text-primary-600" />
                        <span className="font-semibold text-sm">NVIDIA NIM</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">MiniMax M2.7 via NVIDIA integrate API</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover:bg-primary-50 transition-colors" style={aiProvider === 'openrouter' ? { borderColor: 'var(--primary-500)', backgroundColor: 'var(--primary-50)' } : {}}>
                    <input type="radio" name="provider" checked={aiProvider === 'openrouter'} onChange={() => { setAiProvider('openrouter'); setAiModel('openai/gpt-4o-mini'); }} className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-primary-600" />
                        <span className="font-semibold text-sm">OpenRouter</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">OpenAI, Anthropic, Google, MiniMax</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border rounded-md cursor-pointer hover:bg-primary-50 transition-colors" style={aiProvider === 'local' ? { borderColor: 'var(--primary-500)', backgroundColor: 'var(--primary-50)' } : {}}>
                    <input type="radio" name="provider" checked={aiProvider === 'local'} onChange={() => { setAiProvider('local'); setAiModel('deepseek-ai/deepseek-v4-pro'); }} className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Cpu size={16} className="text-primary-600" />
                        <span className="font-semibold text-sm">Local Ollama</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Ollama running your local DeepSeek V4 models</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                <div className="bg-slate-50/80 p-4 border-b border-slate-100 flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-600 uppercase">Model Selection</h4>
                  <span className="text-[10px] text-slate-400">{aiProvider}</span>
                </div>
                <div className="p-6">
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {aiModels.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-md p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-500/20 rounded-lg">
                  <TestTube size={24} className="text-primary-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">Test AI Configuration</h4>
                  <p className="text-slate-400 text-xs mb-4">Run a quick test to verify your AI provider is working correctly.</p>
                  <button
                    onClick={handleTestAI}
                    disabled={isTestingAI}
                    className="px-6 py-3 bg-primary-600 text-white rounded-md text-xs font-semibold hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {isTestingAI ? <LoaderCircle size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {isTestingAI ? 'Testing...' : 'Run Test'}
                  </button>
                  {aiTestResult && (
                    <div className={`mt-4 p-4 rounded-md text-xs font-mono ${aiTestResult.success ? 'bg-emerald-900/50 text-emerald-300' : 'bg-rose-900/50 text-rose-300'}`}>
                      {aiTestResult.success ? (
                        <div className="flex items-start gap-2">
                          <Sparkles size={14} className="mt-0.5 flex-shrink-0" />
                          <span>{aiTestResult.message}</span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2">
                          <span>{aiTestResult.message}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button onClick={saveAISettings} className="px-8 py-4 bg-primary-600 text-white rounded-md text-xs font-black uppercase tracking-widest hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all">
              Save AI Settings
            </button>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-8 animate-slide-up">
            <div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">System Utilities</h3>
              <p className="text-xs text-slate-500 mt-1">Manage cache and browser data.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="bg-slate-50/80 p-4 border-b border-slate-100">
                <h4 className="text-xs font-black text-slate-600 uppercase flex items-center gap-2">
                  <User size={14} /> Switch User (Development Mode)
                </h4>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-500 mb-4">Select a user to simulate their session. This allows testing different roles and permissions.</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleSwitchUser(user.id)}
                      className="w-full text-left px-4 py-3 border border-slate-200 rounded-md hover:bg-primary-50 hover:border-primary-300 transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                      <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-1 rounded">{user.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                <div className="bg-slate-50/80 p-4 border-b border-slate-100">
                  <h4 className="text-xs font-black text-slate-600 uppercase flex items-center gap-2">
                    <RotateCcw size={14} /> Clear App Cache
                  </h4>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-500 mb-4">Clear cached users, business units, and OKR data. Will force fresh data fetch from database.</p>
                  <button
                    onClick={() => {
                      clearAllCache();
                      setClearCacheMsg({ type: 'success', text: 'App cache cleared successfully!' });
                      setTimeout(() => setClearCacheMsg(null), 3000);
                    }}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-md text-xs font-bold uppercase hover:bg-slate-200 transition-colors"
                  >
                    Clear Cache
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                <div className="bg-slate-50/80 p-4 border-b border-slate-100">
                  <h4 className="text-xs font-black text-slate-600 uppercase flex items-center gap-2">
                    <Trash2 size={14} /> Clear All Browser Data
                  </h4>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-500 mb-4">Clear all local storage, session storage, and cached data. You will need to refresh the page.</p>
                  <button
                    onClick={() => {
                      clearBrowserData();
                      setClearCacheMsg({ type: 'success', text: 'Browser data cleared! Please refresh the page.' });
                    }}
                    className="px-6 py-3 bg-red-50 text-red-600 rounded-md text-xs font-bold uppercase hover:bg-red-100 transition-colors"
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>

            {clearCacheMsg && (
              <div className={`p-4 rounded-md text-sm font-medium ${clearCacheMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {clearCacheMsg.text}
              </div>
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <AuditLogTab
            logs={AUDIT_LOGS}
            expandedLogId={expandedLogId}
            onToggleExpand={setExpandedLogId}
            onExport={exportAuditLogsToCSV}
          />
        )}
      </div>
    </div>
  );
};