import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { getButtonAriaProps } from '../../../utils/accessibility';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isFullWidth?: boolean;
  ariaLabel?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white shadow-sm hover:bg-primary-700 hover:shadow-md focus-visible:ring-primary-500',
  secondary: 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-slate-300',
  outline: 'border-2 border-slate-200 text-slate-600 bg-white hover:border-primary-300 hover:text-primary-600',
  ghost: 'text-slate-600 bg-transparent hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md',
  success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-md',
  sm: 'px-3 py-2 text-sm gap-2 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

const iconSizes: Record<ButtonSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  isFullWidth = false,
  disabled,
  className,
  children,
  ariaLabel,
  ...props
}, ref) => {
  const ariaProps = getButtonAriaProps(
    ariaLabel || (typeof children === 'string' ? children : 'Button'),
    disabled,
    isLoading
  );

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        isFullWidth && 'w-full',
        className
      )}
      {...ariaProps}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" size={iconSizes[size]} aria-hidden="true" />
      ) : leftIcon ? (
        <span className="shrink-0" aria-hidden="true">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0" aria-hidden="true">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';