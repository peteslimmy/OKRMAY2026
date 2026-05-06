import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface DeltaBadgeProps {
  delta: number;
  label?: string;
  size?: 'sm' | 'md';
}

export const DeltaBadge: React.FC<DeltaBadgeProps> = ({ 
  delta, 
  label = 'vs last week',
  size = 'sm' 
}) => {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const isNeutral = delta === 0;

  const sizeClasses = size === 'sm' 
    ? 'text-[10px] px-1.5 py-0.5' 
    : 'text-xs px-2 py-1';

  const iconSize = size === 'sm' ? 10 : 12;

  if (isNeutral) {
    return (
      <span className={`flex items-center gap-1 ${sizeClasses} bg-slate-100 text-slate-500 rounded-full font-bold`}>
        <Minus size={iconSize} />
        <span>0% {label}</span>
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-1 ${sizeClasses} rounded-full font-bold ${
      isPositive 
        ? 'bg-emerald-50 text-emerald-600' 
        : 'bg-rose-50 text-rose-600'
    }`}>
      {isPositive ? (
        <TrendingUp size={iconSize} />
      ) : (
        <TrendingDown size={iconSize} />
      )}
      <span>{isPositive ? '+' : ''}{delta}% {label}</span>
    </span>
  );
};