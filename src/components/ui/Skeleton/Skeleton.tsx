import React from 'react';
import { cn } from '../../../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'shimmer',
}) => {
  const baseClass = 'bg-slate-200';
  const animationClass = animation === 'none' ? '' :
    animation === 'pulse' ? 'animate-pulse' :
    'animate-shimmer';

  const variantClass = variant === 'circular' ? 'rounded-full' :
    variant === 'rectangular' ? 'rounded-lg' : 'rounded';

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={cn(baseClass, animationClass, variantClass, className)}
      style={style}
      aria-hidden="true"
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} height={16} width={i === lines - 1 ? '60%' : '100%'} />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 bg-white rounded-xl border border-slate-200', className)}>
    <div className="flex items-center gap-4 mb-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton height={20} width="60%" />
        <Skeleton height={14} width="40%" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5, cols = 4, className
}) => (
  <div className={cn('border border-slate-200 rounded-lg overflow-hidden', className)}>
    <div className="bg-slate-50 border-b border-slate-200 p-4">
      <div className="flex gap-8">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={14} width={80} />
        ))}
      </div>
    </div>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div key={rowIdx} className="p-4 border-b border-slate-100 last:border-0">
        <div className="flex gap-8">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} height={16} width={colIdx === 0 ? 120 : 80} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 bg-white rounded-xl border border-slate-200', className)}>
    <Skeleton height={20} width={160} className="mb-6" />
    <div className="flex items-end justify-between h-40 gap-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          width="100%"
          height={`${Math.floor(Math.random() * 60) + 40}%`}
          animation="shimmer"
        />
      ))}
    </div>
  </div>
);