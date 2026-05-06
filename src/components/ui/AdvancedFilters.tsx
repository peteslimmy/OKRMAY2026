import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Save, Download, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number';
  options?: FilterOption[];
  placeholder?: string;
  defaultValue?: any;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
  module: string;
}

interface AdvancedFiltersProps {
  fields: FilterField[];
  onFilterChange: (filters: Record<string, any>) => void;
  onClearAll?: () => void;
  moduleName: string;
  initialFilters?: Record<string, any>;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  fields,
  onFilterChange,
  onClearAll,
  moduleName,
  initialFilters = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  // Load saved filters on mount
  useEffect(() => {
    const stored = localStorage.getItem(`saved_filters_${moduleName}`);
    if (stored) {
      setSavedFilters(JSON.parse(stored));
    }
  }, [moduleName]);

  // Apply initial filters
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
      onFilterChange(initialFilters);
    }
  }, [initialFilters]);

  const handleFilterChange = useCallback((key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleClearAll = () => {
    setFilters({});
    onFilterChange({});
    onClearAll?.();
  };

  const handleSaveFilter = () => {
    if (!newFilterName.trim()) return;
    
    const newFilter: SavedFilter = {
      id: `filter_${Date.now()}`,
      name: newFilterName.trim(),
      filters: { ...filters },
      createdAt: new Date().toISOString(),
      module: moduleName
    };
    
    const updatedFilters = [...savedFilters, newFilter];
    setSavedFilters(updatedFilters);
    localStorage.setItem(`saved_filters_${moduleName}`, JSON.stringify(updatedFilters));
    
    setNewFilterName('');
    setShowSaveModal(false);
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    setFilters(filter.filters);
    onFilterChange(filter.filters);
  };

  const handleDeleteFilter = (filterId: string) => {
    const updatedFilters = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updatedFilters);
    localStorage.setItem(`saved_filters_${moduleName}`, JSON.stringify(updatedFilters));
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== undefined && v !== null).length;

  const renderField = (field: FilterField) => {
    const value = filters[field.key] ?? field.defaultValue ?? '';
    
    switch (field.type) {
      case 'select':
        return (
<select
  value={value}
  onChange={(e) => handleFilterChange(field.key, e.target.value)}
  className="select"
>
            <option value="">{field.placeholder || `Select ${field.label}`}</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label} {opt.count !== undefined ? `(${opt.count})` : ''}
              </option>
            ))}
          </select>
        );
      
      case 'multiselect': {
        const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
        return (
          <div className="space-y-2">
<select
  value=""
  onChange={(e) => {
    if (e.target.value && !selectedValues.includes(e.target.value)) {
      handleFilterChange(field.key, [...selectedValues, e.target.value]);
    }
  }}
  className="select"
>
              <option value="">Add {field.label}</option>
              {field.options?.filter(opt => !selectedValues.includes(opt.value)).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedValues.map(val => {
                  const opt = field.options?.find(o => o.value === val);
                  return (
                    <span key={val} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs">
                      {opt?.label || val}
                      <button onClick={() => handleFilterChange(field.key, selectedValues.filter(v => v !== val))} className="hover:text-primary-900">
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      case 'number':
        return (
<input
  type="number"
  value={value}
  onChange={(e) => handleFilterChange(field.key, e.target.value)}
  placeholder={field.placeholder}
  className="input"
/>
        );
      
      case 'date':
      case 'daterange':
        return (
<input
  type="date"
  value={value}
  onChange={(e) => handleFilterChange(field.key, e.target.value)}
  className="input"
/>
        );
      
      default:
        return (
<input
  type="text"
  value={value}
  onChange={(e) => handleFilterChange(field.key, e.target.value)}
  placeholder={field.placeholder || `Search ${field.label.toLowerCase()}...`}
  className="input"
/>
        );
    }
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
<button
  onClick={() => setIsOpen(!isOpen)}
  className={`btn-secondary flex items-center gap-2 ${
    activeFilterCount > 0 
      ? 'bg-primary-50 border-primary-300 text-primary-700' 
      : ''
  }`}
>
        <SlidersHorizontal size={16} />
        <span className="font-medium text-sm">Filters</span>
        {activeFilterCount > 0 && (
          <span className="px-1.5 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[400px] card animate-scale-in overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 card-header">
            <h3 className="font-semibold text-slate-900">Advanced Filters</h3>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className="border-b border-slate-200">
              <div className="px-4 py-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Saved Filters</span>
              </div>
              <div className="px-4 pb-3 flex flex-wrap gap-2">
                {savedFilters.map(filter => (
                  <div key={filter.id} className="group flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs">
                    <button 
                      onClick={() => handleLoadFilter(filter)}
                      className="font-medium text-slate-700 hover:text-primary-600"
                    >
                      {filter.name}
                    </button>
                    <button 
                      onClick={() => handleDeleteFilter(filter.id)}
                      className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Fields */}
          <div className="max-h-[400px] overflow-y-auto">
            {fields.map(field => (
              <div key={field.key} className="px-4 py-3 border-b border-slate-100 last:border-0">
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                  {field.label}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-4 py-3 card-footer">
            <button
              onClick={handleClearAll}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Clear All
            </button>
            <div className="flex gap-2">
<button
  onClick={() => setShowSaveModal(true)}
  className="btn-secondary flex items-center gap-1.5"
>
                <Save size={14} />
                Save
              </button>
<button
  onClick={() => setIsOpen(false)}
  className="btn-primary"
>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Filter Modal */}
      {showSaveModal && (
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
  <div className="modal animate-scale-in w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Save Filter</h3>
<input
  type="text"
  value={newFilterName}
  onChange={(e) => setNewFilterName(e.target.value)}
  placeholder="Filter name..."
  className="input mb-4"
  autoFocus
/>
            <div className="flex gap-3">
<button
  onClick={() => setShowSaveModal(false)}
  className="flex-1 btn-secondary"
>
                Cancel
              </button>
<button
  onClick={handleSaveFilter}
  disabled={!newFilterName.trim()}
  className="flex-1 btn-primary"
>
                Save Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;