import { useState } from 'react';
import { LayoutDashboard, Settings, Lock } from 'lucide-react';
import { QuarterlyOKRBoard } from './QuarterlyOKRBoard';
import { QuarterlyOKREditor } from './QuarterlyOKREditor';
import { useAuth } from '@/hooks/useAuth';

type TabType = 'board' | 'editor';

export const QuarterlyOKR: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('board');
  const { currentUser } = useAuth();
  
  const isAdmin = currentUser?.role === 'SuperAdmin' || currentUser?.role === 'Admin';
  const canAccessEditor = isAdmin;

  const handleTabChange = (tab: TabType) => {
    if (tab === 'editor' && !canAccessEditor) return;
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl inline-flex">
        <button
          onClick={() => handleTabChange('board')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'board'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <LayoutDashboard size={18} />
          Board
        </button>
        <button
          onClick={() => handleTabChange('editor')}
          disabled={!canAccessEditor}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'editor'
              ? 'bg-white text-orange-600 shadow-sm'
              : canAccessEditor
                ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                : 'text-slate-300 cursor-not-allowed opacity-50'
          }`}
        >
          <Settings size={18} />
          Editor
          {!canAccessEditor && <Lock size={12} />}
        </button>
      </div>

      <div className="animate-fade-in">
        {activeTab === 'board' ? <QuarterlyOKRBoard /> : (
          canAccessEditor ? <QuarterlyOKREditor /> : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Editor Access Required</h3>
              <p className="text-sm text-slate-400">Only Admin and Super Admin can access the Editor.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};