import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  showPassword?: boolean;
  required?: boolean;
  autoFocus?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  showPasswordToggle,
  onTogglePassword,
  showPassword,
  required,
  autoFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-600 mb-2">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200',
              isFocused ? 'text-brand-600' : 'text-slate-400'
            )}
          >
            {icon}
          </div>
        )}
        <input
          type={showPassword ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'w-full px-4 py-3 bg-white border rounded-xl text-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            icon && 'pl-12',
            showPasswordToggle && 'pr-12',
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : isFocused
              ? 'border-brand-500 focus:border-brand-500 focus:ring-brand-500/20'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/20'
          )}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? 'Hide' : 'Show'} 
            {/* Note: I'll let the consumer pass the icon if needed, but for now just text or a simple indicator */}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-2 text-rose-600 text-sm animate-fade-in">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
