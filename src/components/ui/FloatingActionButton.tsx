import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, FileText, Users, Target, Building2, BarChart3, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'create' | 'view' | 'manage';
  shortcut?: string;
}

interface FloatingActionButtonProps {
  userRole?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const actions: QuickAction[] = [
    { id: 'new-report', label: 'New Report', icon: <FileText size={18} />, action: () => navigate('/reporting'), category: 'create', shortcut: 'R' },
    { id: 'new-kr', label: 'New Key Result', icon: <Target size={18} />, action: () => navigate('/objectives'), category: 'create', shortcut: 'K' },
    { id: 'new-user', label: 'New User', icon: <Users size={18} />, action: () => navigate('/users'), category: 'create', shortcut: 'U' },
    { id: 'new-unit', label: 'New Unit', icon: <Building2 size={18} />, action: () => navigate('/units'), category: 'create' },
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} />, action: () => navigate('/'), category: 'view' },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} />, action: () => navigate('/settings'), category: 'manage' },
  ];

  const canCreate = userRole === 'SuperAdmin' || userRole === 'Admin' || userRole === 'Director';

  const filteredActions = canCreate ? actions : actions.filter(a => a.category !== 'create');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAction = (action: QuickAction) => {
    action.action();
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50">
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${isOpen ? 'rotate-90' : ''}`}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>

      {/* Actions Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-16 right-0 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
          >
            <div className="p-2 max-h-[300px] overflow-y-auto">
              {filteredActions.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">{action.label}</p>
                  </div>
                  {action.shortcut && (
                    <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-400">
                      {action.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActionButton;