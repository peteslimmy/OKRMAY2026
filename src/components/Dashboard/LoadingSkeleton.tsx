import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="w-12 h-12 rounded-xl" />
    </div>
    <Skeleton className="h-10 w-20 mb-4" />
    <Skeleton className="h-3 w-32" />
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-10">
    <div className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-3">
        <Skeleton className="w-1.5 h-6 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-3 w-24" />
    </div>
    <div className="flex items-center justify-center h-64">
      <div className="flex items-end gap-2 h-48">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="w-8 rounded-t-lg" style={{ height: `${40 + Math.random() * 40}%` }} />
        ))}
      </div>
    </div>
  </div>
);

export const HeatmapSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-10">
    <div className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-3">
        <Skeleton className="w-1.5 h-6 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16 shrink-0" />
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-16" />
          ))}
        </div>
        {[...Array(5)].map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-2 mb-2">
            <Skeleton className="h-10 w-16 shrink-0" />
            {[...Array(6)].map((_, colIdx) => (
              <Skeleton key={colIdx} className="h-10 w-16 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SectionSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10">
    <div className="flex items-center gap-3 mb-8">
      <Skeleton className="w-1.5 h-6 rounded-full" />
      <Skeleton className="h-4 w-32" />
    </div>
    <div className="space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
          <div className="flex items-center gap-3">
            <Skeleton className="w-2.5 h-2.5 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
  </div>
);