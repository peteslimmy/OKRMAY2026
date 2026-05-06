import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  delay = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div 
          className={`absolute z-50 px-3 py-2 text-[10px] font-bold text-white bg-slate-900 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${positions[position]}`}
        >
          {content}
          <div className={`absolute w-2 h-2 bg-slate-900 rotate-45 ${
            position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
            position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
            'right-full top-1/2 -translate-y-1/2 -mr-1'
          }`} />
        </div>
      )}
    </div>
  );
};

interface InfoBadgeProps {
  label: string;
  value: string | number;
  tooltip?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

export const InfoBadge: React.FC<InfoBadgeProps> = ({
  label,
  value,
  tooltip,
  trend,
  trendValue
}) => {
  const badge = (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
      <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
      <span className="text-xs font-black text-slate-700">{value}</span>
      {trend && (
        <span className={`text-[10px] font-bold ${
          trend === 'up' ? 'text-emerald-600' : 
          trend === 'down' ? 'text-rose-600' : 
          'text-slate-400'
        }`}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
          {trendValue ? ` ${Math.abs(trendValue)}%` : ''}
        </span>
      )}
    </div>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{badge}</Tooltip>;
  }

  return badge;
};