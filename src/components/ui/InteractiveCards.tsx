import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronRight, ArrowUp, ArrowDown, TrendingUp, TrendingDown, MoreVertical, ExternalLink } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  bgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'glass';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  bgColor,
  trend,
  onClick,
  className,
  size = 'md',
  variant = 'default',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const valueSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const iconSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const variantClasses = {
    default: 'bg-white border border-slate-200',
    gradient: 'bg-gradient-to-br from-brand-500 to-brand-600 text-white border-0',
    glass: 'bg-white/80 backdrop-blur-lg border border-white/20',
  };

  return (
    <div
      className={cn(
        'card card-interactive rounded-2xl transition-all duration-300',
        sizeClasses[size],
        variantClasses[variant],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">
            {title}
          </p>
          <p className={cn('font-bold', valueSizeClasses[size])}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm opacity-80 mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'rounded-xl flex items-center justify-center transition-transform duration-300',
              iconSizeClasses[size],
              bgColor || 'bg-brand-50',
              isHovered && 'scale-110 rotate-3'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-current/10">
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
              trend.isPositive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
            )}
          >
            {trend.isPositive ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            {Math.abs(trend.value)}%
          </div>
          <span className="text-xs opacity-70">{trend.label || 'vs last period'}</span>
        </div>
      )}

      {onClick && (
        <div className="flex items-center justify-end mt-4 pt-4 border-t border-current/10">
          <ChevronRight
            size={20}
            className={cn(
              'transition-transform duration-300 opacity-50',
              isHovered && 'translate-x-1 opacity-100'
            )}
          />
        </div>
      )}
    </div>
  );
};

interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'border';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'glass';
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  onClick,
  className,
  hoverEffect = 'lift',
  size = 'md',
  variant = 'default',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white border border-slate-200',
    elevated: 'bg-white border-0 shadow-lg',
    glass: 'bg-white/80 backdrop-blur-lg border border-white/20',
  };

  const hoverEffectClasses = {
    lift: isHovered ? '-translate-y-2 shadow-xl' : '',
    glow: isHovered ? 'shadow-2xl shadow-brand-500/20' : '',
    scale: isHovered ? 'scale-105' : '',
    border: isHovered ? 'border-brand-500' : '',
  };

  return (
    <div
      className={cn(
        'card card-interactive rounded-2xl transition-all duration-300',
        sizeClasses[size],
        variantClasses[variant],
        hoverEffectClasses[hoverEffect],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  color?: 'brand' | 'success' | 'warning' | 'error' | 'info';
}

const colorClasses = {
  brand: 'bg-brand-50 text-brand-600 border-brand-200',
  success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  warning: 'bg-amber-50 text-amber-600 border-amber-200',
  error: 'bg-rose-50 text-rose-600 border-rose-200',
  info: 'bg-blue-50 text-blue-600 border-blue-200',
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  icon,
  onClick,
  className,
  color = 'brand',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'card card-interactive p-5 rounded-xl border transition-all duration-300',
        colorClasses[color],
        onClick && 'cursor-pointer',
        isHovered && 'scale-105 shadow-lg',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">
            {label}
          </p>
          <p className="text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {change >= 0 ? (
                <ArrowUp size={14} className="text-emerald-600" />
              ) : (
                <ArrowDown size={14} className="text-rose-600" />
              )}
              <span
                className={cn(
                  'text-xs font-semibold',
                  change >= 0 ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300',
              isHovered && 'scale-110 rotate-6'
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const actionVariantClasses = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
  danger: 'bg-rose-500 hover:bg-rose-600 text-white',
};

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  onClick,
  className,
  variant = 'primary',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      className={cn(
        'card card-interactive p-6 rounded-2xl text-left transition-all duration-300',
        actionVariantClasses[variant],
        isHovered && 'scale-105 shadow-xl',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 transition-transform duration-300',
            isHovered && 'scale-110 rotate-6'
          )}
        >
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-sm opacity-90">{description}</p>
        </div>
        <ChevronRight
          size={20}
          className={cn(
            'transition-transform duration-300 opacity-70',
            isHovered && 'translate-x-1 opacity-100'
          )}
        />
      </div>
    </button>
  );
};

interface LinkCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  href: string;
  external?: boolean;
  className?: string;
  variant?: 'default' | 'subtle' | 'accent';
}

const linkVariantClasses = {
  default: 'bg-white border border-slate-200 hover:border-brand-300',
  subtle: 'bg-slate-50 border border-slate-200 hover:border-slate-300',
  accent: 'bg-brand-50 border border-brand-200 hover:border-brand-300',
};

export const LinkCard: React.FC<LinkCardProps> = ({
  title,
  description,
  icon,
  href,
  external = false,
  className,
  variant = 'default',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn(
        'card card-interactive p-5 rounded-xl transition-all duration-300 block',
        linkVariantClasses[variant],
        isHovered && 'scale-105 shadow-lg',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300',
              isHovered && 'scale-110 rotate-6'
            )}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
          )}
        </div>
        {external && (
          <ExternalLink
            size={16}
            className={cn(
              'text-slate-400 transition-transform duration-300',
              isHovered && 'translate-x-1 translate-y-[-2px]'
            )}
          />
        )}
      </div>
    </a>
  );
};

interface CounterCardProps {
  label: string;
  count: number;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  color?: 'brand' | 'success' | 'warning' | 'error' | 'info';
  showZero?: boolean;
}

export const CounterCard: React.FC<CounterCardProps> = ({
  label,
  count,
  icon,
  onClick,
  className,
  color = 'brand',
  showZero = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!showZero && count === 0) return null;

  return (
    <div
      className={cn(
        'card card-interactive p-4 rounded-xl border transition-all duration-300 cursor-pointer',
        colorClasses[color],
        isHovered && 'scale-105 shadow-lg',
        className
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300',
              isHovered && 'scale-110 rotate-6'
            )}
          >
            {icon}
          </div>
        )}
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
            {label}
          </p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
        <ChevronRight
          size={16}
          className={cn(
            'transition-transform duration-300 opacity-50',
            isHovered && 'translate-x-1 opacity-100'
          )}
        />
      </div>
    </div>
  );
};
