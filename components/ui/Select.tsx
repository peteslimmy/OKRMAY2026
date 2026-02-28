import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  variant?: 'default' | 'header' | 'minimal';
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select...',
  variant = 'default',
  className = '',
  disabled = false,
  searchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) setSearchTerm('');
  }, [isOpen]);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const DropdownMenu = () => (
    <div className={`absolute z-50 overflow-hidden bg-white border border-slate-100 rounded-[4px] shadow-xl shadow-slate-200/50 animate-fade-in ${variant === 'header' ? 'top-full left-[-1px] mt-2 w-[240px]' : variant === 'minimal' ? 'top-full right-0 mt-2 w-56' : 'top-full left-0 mt-2 w-full'}`}>
      {searchable && (
        <div className="p-2 border-b border-slate-50 sticky top-0 bg-white z-10">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter..." 
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-[4px] text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/10"
              autoFocus
            />
          </div>
        </div>
      )}
      <div className="max-h-[280px] overflow-y-auto py-1 custom-scrollbar">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-2.5 text-[12px] font-bold flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group ${
                String(option.value) === String(value) ? 'text-primary-600 bg-primary-50/50' : 'text-slate-600'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(option.value);
              }}
            >
              <span className="truncate group-hover:text-slate-900 transition-colors">{option.label}</span>
              {String(option.value) === String(value) && <Check size={14} className="shrink-0 ml-2 text-primary-500" />}
            </div>
          ))
        ) : (
          <div className="px-4 py-3 text-[11px] text-slate-400 text-center font-medium">No matches found</div>
        )}
      </div>
    </div>
  );

  if (variant === 'header') {
    return (
      <div 
        ref={containerRef}
        className={`relative group h-full border-l border-slate-100 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      >
        <div 
          className={`flex items-center h-full px-6 hover:bg-slate-50/80 transition-all duration-200 ${isOpen ? 'bg-slate-50 shadow-inner' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex flex-col pointer-events-none">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em] mb-1 transition-colors group-hover:text-primary-500">{label}</span>
              <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
                  <span className="whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis">
                    {selectedOption ? selectedOption.label : placeholder}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : 'group-hover:text-slate-600'}`} />
              </div>
          </div>
        </div>
        {isOpen && <DropdownMenu />}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <div
          className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className="truncate max-w-[150px]">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} />
        </div>
        {isOpen && <DropdownMenu />}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>}
      <div
        className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-[4px] text-sm font-bold flex items-center justify-between transition-all duration-200 ${
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-white hover:border-slate-300 hover:shadow-sm'
        } ${isOpen ? 'ring-4 ring-primary-500/10 bg-white border-primary-500/50' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`truncate ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} />
      </div>
      {isOpen && <DropdownMenu />}
    </div>
  );
};


