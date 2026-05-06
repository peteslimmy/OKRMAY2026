import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface StatCounterProps {
  value: string | number;
  label: string;
  colorClass?: string;
  onClick?: () => void;
  className?: string;
  showTrend?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCounter: React.FC<StatCounterProps> = ({
  value,
  label,
  colorClass = 'text-slate-900',
  onClick,
  className,
  showTrend,
  trend,
  trendValue,
}) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center text-center group cursor-pointer",
        className
      )}
    >
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("text-3xl font-bold leading-none transition-colors duration-200 group-hover:text-brand-500", colorClass)}
      >
        {value}
      </motion.div>
      
      <div className="text-caption mt-2 font-medium text-slate-500 group-hover:text-slate-700 transition-colors duration-200">
        {label}
      </div>

      {showTrend && trendValue && (
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold mt-1",
          trend === 'up' ? 'text-success-600' : trend === 'down' ? 'text-error-600' : 'text-slate-400'
        )}>
          {trend === 'up' && <span>▲</span>}
          {trend === 'down' && <span>▼</span>}
          {trendValue}
        </div>
      )}
    </div>
  );
};
