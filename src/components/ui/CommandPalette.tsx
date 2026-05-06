import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, X, FileText, Users, Settings, Target, BarChart3, Building2, Shield, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const defaultItems: SearchItem[] = useMemo(() => [
    {
      id: 'dashboard',
      title: 'Executive Dashboard',
      description: 'View company overview and KPIs',
      category: 'Main',
      icon: <Target className="w-5 h-5" />,
      action: () => navigate('/'),
      keywords: ['home', 'overview', 'kpi', 'executive'],
    },
    {
      id: 'objectives',
      title: 'Quarterly KRs',
      description: 'Manage Key Results and Objectives',
      category: 'OKR',
      icon: <Target className="w-5 h-5" />,
      action: () => navigate('/objectives'),
      keywords: ['key results', 'okr', 'objectives', 'quarter'],
    },
    {
      id: 'reporting',
      title: 'Weekly Reporting',
      description: 'Report weekly activities and tasks',
      category: 'Reports',
      icon: <FileText className="w-5 h-5" />,
      action: () => navigate('/reporting'),
      keywords: ['report', 'weekly', 'activity', 'tasks'],
    },
    {
      id: 'reports',
      title: 'All Summary Reports',
      description: 'Access all available reports',
      category: 'Reports',
      icon: <BarChart3 className="w-5 h-5" />,
      action: () => navigate('/reports'),
      keywords: ['reports', 'summary', 'analytics'],
    },
    {
      id: 'attendance',
      title: 'Attendance',
      description: 'Track meeting attendance',
      category: 'People',
      icon: <Clock className="w-5 h-5" />,
      action: () => navigate('/operations/attendance'),
      keywords: ['attendance', 'meeting', 'presence'],
    },
    {
      id: 'users',
      title: 'User Directory',
      description: 'Manage users and roles',
      category: 'Admin',
      icon: <Users className="w-5 h-5" />,
      action: () => navigate('/users'),
      keywords: ['users', 'directory', 'roles', 'team'],
    },
    {
      id: 'units',
      title: 'Business Units',
      description: 'Manage business units',
      category: 'Admin',
      icon: <Building2 className="w-5 h-5" />,
      action: () => navigate('/units'),
      keywords: ['business units', 'departments', 'teams'],
    },
    {
      id: 'settings',
      title: 'Governance Hub',
      description: 'System settings and configuration',
      category: 'Admin',
      icon: <Settings className="w-5 h-5" />,
action: () => navigate('/settings'),
  keywords: ['settings', 'governance', 'config', 'security'],
},
{
  id: 'integrity',
      title: 'Integrity Audit',
      description: 'Disciplinary management',
      category: 'Governance',
      icon: <Shield className="w-5 h-5" />,
      action: () => navigate('/integrity'),
      keywords: ['integrity', 'audit', 'disciplinary', 'penalties'],
    },
  ], [navigate]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return defaultItems;
    
    const lowerQuery = query.toLowerCase();
    return defaultItems.filter(item => 
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery) ||
      item.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
    );
  }, [query, defaultItems]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].action();
      onClose();
      setQuery('');
    } else if (e.key === 'Escape') {
      onClose();
      setQuery('');
    }
  }, [filteredItems, selectedIndex, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={() => {
          onClose();
          setQuery('');
        }}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, actions..."
            className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 outline-none text-base font-medium"
            autoFocus
          />
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded font-medium">ESC</kbd>
          </div>
          <button 
            onClick={() => {
              onClose();
              setQuery('');
            }}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">No results found</p>
              <p className="text-sm text-slate-400 mt-1">Try searching for something else</p>
            </div>
          ) : (
            (Object.entries(groupedItems) as [string, SearchItem[]][]).map(([category, items]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {category}
                </div>
                {items.map((item) => {
                  flatIndex++;
                  const currentIndex = flatIndex;
                  const isSelected = currentIndex === selectedIndex;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        onClose();
                        setQuery('');
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                        isSelected 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${isSelected ? 'text-primary-700' : 'text-slate-900'}`}>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className={`text-xs truncate ${isSelected ? 'text-primary-500' : 'text-slate-500'}`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <ArrowRight className="w-4 h-4 text-primary-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white rounded border border-slate-200 font-medium">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white rounded border border-slate-200 font-medium">↵</kbd>
              Select
            </span>
          </div>
          <span className="text-xs text-slate-400">
            Press <kbd className="px-1 py-0.5 bg-white rounded border border-slate-200 font-medium">Ctrl+K</kbd> to open
          </span>
        </div>
      </div>
    </div>
  );
};

// Hook to manage command palette state
export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, setIsOpen };
};

export default CommandPalette;