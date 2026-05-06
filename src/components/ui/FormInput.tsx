import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ValidationRule, validateField } from '../../validators/formValidation';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
  rules?: ValidationRule;
  onValidationChange?: (isValid: boolean, error: string | null) => void;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-sm',
  lg: 'px-5 py-4 text-base',
};

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  showPasswordToggle = false,
  rules,
  onValidationChange,
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  value = '',
  onChange,
  onBlur,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const inputType = showPasswordToggle && showPassword ? 'text' : props.type;

  useEffect(() => {
    if (rules && touched) {
      const validationError = validateField(String(value), rules);
      setInternalError(validationError);
      onValidationChange?.(!validationError, validationError);
    }
  }, [value, rules, touched, onValidationChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
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
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          {...props}
          type={inputType}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'w-full bg-white border rounded-lg text-sm text-slate-900 placeholder:text-slate-400',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            sizeClasses[size],
            leftIcon && 'pl-10',
            (rightIcon || showPasswordToggle) && 'pr-10',
            hasError
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : isValid
              ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20'
              : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/30',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${props.id || props.name}-error` : undefined}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {rightIcon && !showPasswordToggle && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {rightIcon}
          </div>
        )}

        {isValid && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
            <CheckCircle size={18} />
          </div>
        )}

        {hasError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none">
            <AlertCircle size={18} />
          </div>
        )}
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

FormInput.displayName = 'FormInput';
