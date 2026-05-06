import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '../../lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  overlayClassName?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  progress,
  showProgress = false,
  size = 'lg',
  className,
  overlayClassName,
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm',
        overlayClassName
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div
        className={cn(
          'bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[300px]',
          className
        )}
      >
        <LoadingSpinner size={size} ariaLabel="Loading" />
        <p className="text-sm font-medium text-slate-700">{message}</p>
        {showProgress && progress !== undefined && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

LoadingOverlay.displayName = 'LoadingOverlay';
