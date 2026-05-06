import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text',
  width,
  height 
}) => {
  const baseClasses = 'animate-pulse bg-slate-200';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 4,
  showHeader = true 
}) => {
  return (
    <div className="w-full">
      {showHeader && (
        <div className="flex gap-4 mb-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} variant="text" height={16} className="flex-1" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 py-3 border-b border-slate-100">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              variant="text" 
              height={14} 
              className="flex-1" 
            />
          ))}
        </div>
      ))}
    </div>
  );
};

interface CardSkeletonProps {
  count?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`card-${i}`} className="bg-white p-6 rounded-2xl border border-slate-200">
          <Skeleton variant="text" height={12} width="40%" className="mb-4" />
          <Skeleton variant="text" height={32} width="60%" className="mb-2" />
          <Skeleton variant="text" height={12} width="30%" />
        </div>
      ))}
    </div>
  );
};

interface ChartSkeletonProps {
  height?: number;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ height = 300 }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <Skeleton variant="text" height={20} width="30%" className="mb-6" />
      <Skeleton variant="rectangular" height={height} />
    </div>
  );
};

interface ListSkeletonProps {
  items?: number;
  avatar?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ items = 5, avatar = true }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={`list-${i}`} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
          {avatar && (
            <Skeleton variant="circular" width={40} height={40} />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" height={14} width="40%" />
            <Skeleton variant="text" height={12} width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
};

interface FormSkeletonProps {
  fields?: number;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({ fields = 4 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={`form-${i}`}>
          <Skeleton variant="text" height={14} width="30%" className="mb-2" />
          <Skeleton variant="rectangular" height={44} />
        </div>
      ))}
    </div>
  );
};

interface KPISkeletonProps {
  count?: number;
}

export const KPISkeleton: React.FC<KPISkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={`kpi-${i}`} className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="rectangular" width={60} height={20} className="rounded-full" />
          </div>
          <Skeleton variant="text" height={36} width="50%" className="mb-2" />
          <Skeleton variant="text" height={12} width="40%" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;