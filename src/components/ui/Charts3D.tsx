import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface Chart3DConfig {
  data: { name: string; value: number; color: string; gradient?: string }[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  animate?: boolean;
  onSliceClick?: (index: number, item: { name: string; value: number }) => void;
}

interface Bar3DConfig {
  data: { label: string; value: number; color?: string }[];
  width?: number;
  height?: number;
  barWidth?: number;
  maxValue?: number;
  showValues?: boolean;
  animate?: boolean;
  onBarClick?: (index: number, item: { label: string; value: number }) => void;
}

interface Counter3DConfig {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  color?: string;
  animate?: boolean;
  duration?: number;
  onClick?: () => void;
}

export const Chart3D: React.FC<Chart3DConfig> = ({
  data,
  width = 300,
  height = 300,
  innerRadius = 60,
  outerRadius = 90,
  showLabels = true,
  showLegend = true,
  animate = true,
  onSliceClick,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animatedData, setAnimatedData] = useState<number[]>(
    animate ? new Array(data.length).fill(0) : data.map((d) => d.value)
  );

  const total = data.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    if (!animate) return;

    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedData(data.map((item) => item.value * eased));

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [data, animate]);

  const renderSlice = (
    startAngle: number,
    endAngle: number,
    innerR: number,
    outerR: number,
    color: string,
    index: number,
    percent: number
  ) => {
    const isHovered = hoveredIndex === index;
    const midAngle = (startAngle + endAngle) / 2;
    const isLargeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    const startX = Math.cos(midAngle) * (outerR + (isHovered ? 8 : 0));
    const startY = Math.sin(midAngle) * (outerR + (isHovered ? 8 : 0));

    return (
      <g
        key={index}
        className="cursor-pointer transition-all duration-200"
        style={{ transform: `translate(${isHovered ? startX * 0.1 : 0}px, ${isHovered ? startY * 0.1 : 0}px)` }}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        onClick={() => onSliceClick?.(index, data[index])}
      >
        <defs>
          <linearGradient id={`pie-gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="50%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
          <filter id={`pie-shadow-${index}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity={isHovered ? 0.3 : 0.1} />
          </filter>
        </defs>
        <path
          d={`
            M ${Math.cos(startAngle) * innerR} ${Math.sin(startAngle) * innerR}
            L ${Math.cos(startAngle) * outerR} ${Math.sin(startAngle) * outerR}
            A ${outerR} ${outerR} 0 ${isLargeArc} 1 ${Math.cos(endAngle) * outerR} ${Math.sin(endAngle) * outerR}
            L ${Math.cos(endAngle) * innerR} ${Math.sin(endAngle) * innerR}
            A ${innerR} ${innerR} 0 ${isLargeArc} 0 ${Math.cos(startAngle) * innerR} ${Math.sin(startAngle) * innerR}
          `}
          fill={`url(#pie-gradient-${index})`}
          filter={`url(#pie-shadow-${index})`}
          className="transition-all duration-200"
          style={{
            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
            transformOrigin: 'center',
          }}
        />
        <path
          d={`
            M ${Math.cos(startAngle) * outerR} ${Math.sin(startAngle) * outerR}
            A ${outerR} ${outerR} 0 ${isLargeArc} 1 ${Math.cos(endAngle) * outerR} ${Math.sin(endAngle) * outerR}
            L ${Math.cos(endAngle) * (outerR - 8)} ${Math.sin(endAngle) * (outerR - 8)}
            A ${outerR - 8} ${outerR - 8} 0 ${isLargeArc} 0 ${Math.cos(startAngle) * (outerR - 8)} ${Math.sin(startAngle) * (outerR - 8)}
            Z
          `}
          fill="rgba(255, 255, 255, 0.3)"
        />
      </g>
    );
  };

  let currentAngle = -Math.PI / 2;
  const slices = animatedData.map((value, index) => {
    const percent = value / total;
    const sliceAngle = (value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    return renderSlice(
      startAngle,
      endAngle,
      innerRadius,
      outerRadius,
      data[index].color,
      index,
      percent
    );
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${width / 2}, ${height / 2})`}>
          <ellipse
            cx="0"
            cy="8"
            rx={outerRadius + 10}
            ry={outerRadius / 4 + 10}
            fill="rgba(0, 0, 0, 0.1)"
            filter="url(#pie-shadow-0)"
          />
          {slices}
          {innerRadius > 0 && (
            <ellipse
              cx="0"
              cy="0"
              rx={innerRadius - 5}
              ry={(innerRadius - 5) / 4}
              fill="white"
            />
          )}
        </g>
      </svg>
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {data.map((item, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-200',
                hoveredIndex === index
                  ? 'bg-slate-100 shadow-sm'
                  : 'hover:bg-slate-50'
              )}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSliceClick?.(index, item)}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-medium text-slate-700">{item.name}</span>
              <span className="text-xs font-bold text-slate-900">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const BarChart3D: React.FC<Bar3DConfig> = ({
  data,
  width = 400,
  height = 250,
  barWidth = 40,
  maxValue: propMaxValue,
  showValues = true,
  animate = true,
  onBarClick,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animatedValues, setAnimatedValues] = useState<number[]>(
    animate ? new Array(data.length).fill(0) : data.map((d) => d.value)
  );

  const maxValue = propMaxValue || Math.max(...data.map((d) => d.value));

  useEffect(() => {
    if (!animate) return;

    const duration = 800;
    const steps = 40;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const eased = 1 - Math.pow(1 - progress, 2);

      setAnimatedValues(data.map((item) => item.value * eased));

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [data, animate]);

  const barSpacing = 20;
  const totalWidth = data.length * barWidth + (data.length - 1) * barSpacing;
  const startX = (width - totalWidth) / 2;
  const availableHeight = height - 40;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        {data.map((item, index) => (
          <linearGradient key={index} id={`bar-gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={item.color || '#f97316'} stopOpacity="1" />
            <stop offset="50%" stopColor={item.color || '#f97316'} stopOpacity="0.8" />
            <stop offset="100%" stopColor={item.color || '#ea580c'} stopOpacity="0.9" />
          </linearGradient>
        ))}
        <filter id="bar-shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.15" />
        </filter>
      </defs>
      {data.map((item, index) => {
        const x = startX + index * (barWidth + barSpacing);
        const barHeight = (animatedValues[index] / maxValue) * availableHeight;
        const y = height - 30 - barHeight;
        const isHovered = hoveredIndex === index;

        return (
          <g
            key={index}
            className="cursor-pointer transition-all duration-200"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onBarClick?.(index, item)}
          >
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="6"
              fill={`url(#bar-gradient-${index})`}
              filter="url(#bar-shadow)"
              className="transition-all duration-200"
              style={{
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transformOrigin: `${x + barWidth / 2}px bottom`,
                transformBox: 'fill-box',
              }}
            />
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight / 3}
              rx="6"
              fill="rgba(255, 255, 255, 0.25)"
            />
            <ellipse
              cx={x + barWidth / 2}
              cy={height - 24}
              rx={barWidth / 2 + 4}
              ry="6"
              fill="rgba(0, 0, 0, 0.1)"
            />
            <text
              x={x + barWidth / 2}
              y={height - 8}
              textAnchor="middle"
              className="text-xs font-medium fill-slate-500"
            >
              {item.label}
            </text>
            {showValues && (
              <text
                x={x + barWidth / 2}
                y={y - 10}
                textAnchor="middle"
                className="text-sm font-bold fill-slate-700 transition-all duration-200"
                style={{ opacity: animatedValues[index] > 0 ? 1 : 0 }}
              >
                {item.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export const Counter3D: React.FC<Counter3DConfig> = ({
  value,
  label,
  suffix = '',
  prefix = '',
  icon,
  color = '#f97316',
  animate = true,
  duration = 1500,
  onClick,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value);
      return;
    }

    let startTime: number;
    let animationFrameId: number;

    const animateCounter = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.floor(eased * value));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateCounter);
      }
    };

    animationFrameId = requestAnimationFrame(animateCounter);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, animate, duration]);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 cursor-pointer',
        'bg-white border border-slate-200',
        isHovered
          ? 'border-brand-300 shadow-lg -translate-y-1'
          : 'shadow-sm'
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <defs>
        <linearGradient id="counter-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
        <filter id="counter-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.2" />
        </filter>
      </defs>

      <div
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300',
          isHovered && 'opacity-100'
        )}
        style={{
          background: `linear-gradient(135deg, ${color}10 0%, transparent 50%)`,
        }}
      />

      {icon && (
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300',
            isHovered && 'scale-110 rotate-3'
          )}
          style={{ backgroundColor: `${color}20` }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      )}

      <div className="relative z-10 text-center">
        <div
          className="text-4xl font-bold transition-all duration-300"
          style={{
            color,
            textShadow: isHovered ? `0 0 20px ${color}40` : 'none',
          }}
        >
          {prefix}
          {displayValue.toLocaleString()}
          {suffix}
        </div>
        <div className="text-sm font-medium text-slate-600 mt-1">{label}</div>
      </div>

      {isHovered && (
        <div
          className="absolute -bottom-2 w-8 h-1 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          }}
        />
      )}
    </div>
  );
};

export const StatCard3D: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  bgColor?: string;
  onClick?: () => void;
  className?: string;
}> = ({ title, value, subtitle, icon, bgColor = 'bg-brand-50', onClick, className }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer',
        'bg-white',
        isHovered
          ? 'border-brand-300 shadow-xl -translate-y-1'
          : 'border-slate-200 shadow-sm',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: '1000px' }}
    >
      <div
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none',
          isHovered && 'opacity-100'
        )}
        style={{
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, transparent 50%)',
          transform: 'translateY(-4px)',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                bgColor,
                isHovered && 'scale-110 rotate-3'
              )}
            >
              {icon}
            </div>
          )}
        </div>

        {onClick && (
          <div className="flex items-center justify-end pt-3 border-t border-slate-100">
            <span
              className={cn(
                'text-xs font-medium text-slate-400 transition-all duration-200',
                isHovered && 'text-brand-600'
              )}
            >
              {isHovered ? 'Click to view' : 'View details'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const MetricCard3D: React.FC<{
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  color?: 'brand' | 'success' | 'warning' | 'error' | 'info';
}> = ({ label, value, change, icon, onClick, className, color = 'brand' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const colorMap = {
    brand: { bg: 'bg-brand-50', text: 'text-brand-600', border: 'border-brand-200' },
    success: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    error: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
    info: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  };

  const colors = colorMap[color];

  return (
    <div
      className={cn(
        'relative p-5 rounded-xl border transition-all duration-300 cursor-pointer',
        'bg-white',
        isHovered
          ? `${colors.border} shadow-lg -translate-y-1`
          : 'border-slate-200 shadow-sm',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 mb-2">{label}</p>
          <p className="text-2xl font-bold" style={{ color: colors.text }}>
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-xs font-semibold',
                  change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {change >= 0 ? '+' : ''}
                {change}%
              </span>
              <span className="text-xs text-slate-400">vs last period</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300',
              colors.bg,
              isHovered && 'scale-110 rotate-6'
            )}
          >
            <span className={colors.text}>{icon}</span>
          </div>
        )}
      </div>

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 h-1 rounded-b-xl transition-all duration-300',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}
        style={{ backgroundColor: colors.text.replace('600', '400') }}
      />
    </div>
  );
};