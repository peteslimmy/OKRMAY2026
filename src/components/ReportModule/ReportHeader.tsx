import React from 'react';
import { FileText, ShieldCheck, Plus, Download, UploadCloud } from 'lucide-react';
import { AdvancedFilters } from '../ui/AdvancedFilters';
import { Button } from '../ui';

interface ReportHeaderProps {
  currentUserDept: string;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedWeek: number | null;
  setSelectedWeek: (week: number | null) => void;
  currentFilterWeekNum: number;
  canCreate: boolean;
  onNewUpdateClick: () => void;
  onTemplateDownload: () => void;
  onBulkUpload: (file: File) => void;
  advancedFilters: Record<string, any>;
  setAdvancedFilters: (filters: Record<string, any>) => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  currentUserDept,
  selectedYear,
  setSelectedYear,
  selectedWeek,
  setSelectedWeek,
  currentFilterWeekNum,
  canCreate,
  onNewUpdateClick,
  onTemplateDownload,
  onBulkUpload,
  advancedFilters,
  setAdvancedFilters,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg animate-float">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="display-lg text-slate-900 mb-1">Weekly Reporting</h1>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-sm text-slate-500 font-medium">Cycle W{currentFilterWeekNum} • {currentUserDept}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
            className="px-3 py-1.5 bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="w-px h-4 bg-slate-200" />
          <select 
            value={selectedWeek ?? ''} 
            onChange={(e) => setSelectedWeek(e.target.value ? parseInt(e.target.value) : null)} 
            className="px-3 py-1.5 bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer"
          >
            <option value="">W{currentFilterWeekNum}</option>
            {/* Week options would be passed in or generated here */}
          </select>
        </div>

        {canCreate && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onTemplateDownload} className="hover-lift">
              <Download size={16} className="mr-2" /> Template
            </Button>
            <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 text-sm font-semibold hover:bg-slate-200 transition-all cursor-pointer hover-lift">
              <UploadCloud size={16} /> Upload
              <input type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) onBulkUpload(e.target.files[0]); }} />
            </label>
            <Button variant="primary" size="sm" onClick={onNewUpdateClick} glow className="hover-lift">
              <Plus size={18} className="mr-2" /> New Update
            </Button>
          </div>
        )}
        
        <AdvancedFilters
          moduleName="weekly-reporting"
          fields={[
            { key: 'status', label: 'Status', type: 'select', options: [
              { value: 'Done', label: 'Done' },
              { value: 'NotDone', label: 'Not Done' },
              { value: 'Undefined', label: 'Undefined' },
            ]},
            { key: 'department', label: 'Department', type: 'multiselect', options: [
              { value: 'CEO', label: 'CEO' },
              { value: 'Finance', label: 'Finance' },
              { value: 'HR', label: 'HR' },
              { value: 'Operations', label: 'Operations' },
              { value: 'Technology', label: 'Technology' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Sales', label: 'Sales' },
              { value: 'Legal', label: 'Legal' },
              { value: 'Registry', label: 'Registry' },
              { value: 'BUS.DEV', label: 'BUS.DEV' },
            ]},
          ]}
          onFilterChange={setAdvancedFilters}
          onClearAll={() => setAdvancedFilters({})}
        />
      </div>
    </div>
  );
};
