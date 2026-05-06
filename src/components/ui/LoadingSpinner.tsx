import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'slate';
  className?: string;
  ariaLabel?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorClasses = {
  primary: 'text-primary-600',
  success: 'text-emerald-600',
  warning: 'text-amber-500',
  error: 'text-rose-600',
  slate: 'text-slate-400',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className,
  ariaLabel = 'Loading',
}) => {
  return (
    <Loader2
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      aria-label={ariaLabel}
      role="status"
    />
  );
};

LoadingSpinner.displayName = 'LoadingSpinner';
