import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, X, RotateCcw, Calendar, Building2 } from 'lucide-react';
import { getBusinessUnits, getWATTime, getRecentWeekRanges } from '../../utils';

interface FilterBarProps {
  onFilterChange: (filters: DashboardFilters) => void;
  compact?: boolean;
}

export interface DashboardFilters {
  week: number;
  year: number;
  buFilter: string | null;
  krFilter: string | null;
}

const DEFAULT_FILTERS: DashboardFilters = {
  week: 1,
  year: 2026,
  buFilter: null,
  krFilter: null
};

const FilterSelect: React.FC<{
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}> = ({ value, onChange, options, placeholder, disabled, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`appearance-none bg-white border border-slate-200 rounded-xl ${sizeClasses[size]} text-slate-700 font-medium cursor-pointer hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 pr-8 transition-all duration-200 disabled:opacity-50`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
};

export const DashboardFilterBar: React.FC<FilterBarProps> = ({ onFilterChange, compact = false }) => {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [businessUnits, setBusinessUnits] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(!compact);

  useEffect(() => {
    const now = getWATTime ? getWATTime() : new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const currentWeek = Math.ceil((now.getTime() - startOfYear.getTime()) / (86400000 * 7));

    const initialFilters = {
      ...DEFAULT_FILTERS,
      week: currentWeek,
      year: now.getFullYear()
    };
    setFilters(initialFilters);
    onFilterChange(initialFilters);

    const loadBUs = async () => {
      try {
        const bus = await getBusinessUnits();
        setBusinessUnits(bus);
      } catch (e) {
        console.error('[FilterBar] Failed to load BUs', e);
      } finally {
        setLoading(false);
      }
    };
    loadBUs();
  }, [onFilterChange]);

  const handleFilterChange = (key: keyof DashboardFilters, value: number | string | null) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const now = getWATTime ? getWATTime() : new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const currentWeek = Math.ceil((now.getTime() - startOfYear.getTime()) / (86400000 * 7));
    
    const reset = { ...DEFAULT_FILTERS, week: currentWeek, year: now.getFullYear() };
    setFilters(reset);
    onFilterChange(reset);
  };

  const weekOptions = getRecentWeekRanges ? getRecentWeekRanges().map(w => ({
    value: parseInt(w.value.replace('W', '')),
    label: w.label
  })) : Array.from({ length: 52 }, (_, i) => ({
    value: i + 1,
    label: `Week ${i + 1}`
  }));

  const yearOptions = [2025, 2026, 2027, 2028].map(y => ({ value: y, label: y.toString() }));

  const buOptions = businessUnits.map(bu => ({ value: bu.name, label: bu.name }));

  const hasActiveFilters = filters.buFilter || filters.krFilter;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">Filter Data</span>
        
        <div className="flex items-center gap-2">
          <FilterSelect
            value={filters.week}
            onChange={(v) => handleFilterChange('week', parseInt(v))}
            options={weekOptions}
            placeholder="Week"
            size="sm"
          />

          <FilterSelect
            value={filters.year}
            onChange={(v) => handleFilterChange('year', parseInt(v))}
            options={yearOptions}
            placeholder="Year"
            size="sm"
          />

          <FilterSelect
            value={filters.buFilter || ''}
            onChange={(v) => handleFilterChange('buFilter', v || null)}
            options={buOptions}
            placeholder="All Business Units"
            disabled={loading}
            size="sm"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div 
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Filter size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Filter Data</h3>
            <p className="text-xs text-slate-500">Customize dashboard view</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg">
              {filters.buFilter ? '1' : '0'} Active
            </span>
          )}
          <ChevronDown 
            size={20} 
            className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-4">
            <FilterSelect
              value={filters.week}
              onChange={(v) => handleFilterChange('week', parseInt(v))}
              options={weekOptions}
              placeholder="Week"
            />

            <FilterSelect
              value={filters.year}
              onChange={(v) => handleFilterChange('year', parseInt(v))}
              options={yearOptions}
              placeholder="Year"
            />

            <div className="h-10 w-px bg-slate-200" />

            <FilterSelect
              value={filters.buFilter || ''}
              onChange={(v) => handleFilterChange('buFilter', v || null)}
              options={buOptions}
              placeholder="All Business Units"
              disabled={loading}
            />

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-100 transition-all duration-200"
              >
                <RotateCcw size={14} />
                Reset Filters
              </button>
            )}

            <div className="ml-auto flex items-center gap-3 text-xs">
              {filters.buFilter && (
                <div className="flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-2 rounded-xl border border-brand-100">
                  <Building2 size={14} />
                  <span className="font-semibold">{filters.buFilter}</span>
                  <button 
                    className="ml-1 hover:bg-brand-100 rounded-lg p-0.5 transition-colors"
                    onClick={() => handleFilterChange('buFilter', null)}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                Week {filters.week}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {filters.year}
              </span>
              {filters.buFilter && (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  {filters.buFilter}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">
              {businessUnits.length} business units available
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export type { DashboardFilters };