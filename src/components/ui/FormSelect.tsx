import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ValidationRule, validateField } from '../../validators/formValidation';

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  rules?: ValidationRule;
  onValidationChange?: (isValid: boolean, error: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-5 py-4 text-base',
};

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  rules,
  onValidationChange,
  size = 'md',
  options,
  placeholder = 'Select an option',
  className,
  value = '',
  onChange,
  onBlur,
  ...props
}) => {
  const [touched, setTouched] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    if (rules && touched) {
      const validationError = validateField(String(value), rules);
      setInternalError(validationError);
      onValidationChange?.(!validationError, validationError);
    }
  }, [value, rules, touched, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    setTouched(true);
    onBlur?.(e);
  };

  const displayError = error || internalError;
  const hasError = !!displayError;
  const isValid = touched && !hasError && rules && String(value).trim().length > 0;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
          {label}
          {rules?.required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          {...props}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'w-full bg-white border rounded-lg text-sm text-slate-900 appearance-none cursor-pointer',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            sizeClasses[size],
            'pr-10',
            hasError
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : isValid
              ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20'
              : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/30',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${props.id || props.name}-error` : undefined}
        >
          {!rules?.required && (
            <option value="">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
          {isValid && (
            <CheckCircle size={18} className="text-emerald-500" />
          )}
          {hasError && (
            <AlertCircle size={18} className="text-rose-500" />
          )}
          <ChevronDown size={18} className="text-slate-400" />
        </div>
      </div>

      {hasError && (
        <p
          id={`${props.id || props.name}-error`}
          className="text-xs text-rose-600 mt-1 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle size={12} />
          {displayError}
        </p>
      )}

      {rules && touched && !hasError && String(value).trim().length > 0 && (
        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
          <CheckCircle size={12} />
          Valid
        </p>
      )}
    </div>
  );
};

FormSelect.displayName = 'FormSelect';
