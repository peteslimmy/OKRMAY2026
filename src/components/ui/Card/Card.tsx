import React from 'react';
import { cn } from '../../../lib/utils';

type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
type CardVariant = 'default' | 'bordered' | 'elevated' | 'flat';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  padding?: CardPadding;
  isInteractive?: boolean;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
};

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-white border border-slate-200 shadow-sm',
  bordered: 'bg-white border border-slate-200',
  elevated: 'bg-white shadow-lg',
  flat: 'bg-slate-50',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  isInteractive = false,
  onClick,
  as: Component = 'div',
}) => {
  const isClickable = Boolean(onClick);

  return (
    <Component
      onClick={onClick}
      className={cn(
        'rounded-xl',
        paddingClasses[padding],
        variantClasses[variant],
        isInteractive && 'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
        isClickable && !isInteractive && 'cursor-pointer',
        className
      )}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      {children}
    </Component>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, action }) => (
  <div className={cn('flex items-center justify-between mb-4', className)}>
    <div className="flex items-center gap-3">{children}</div>
    {action && <div>{action}</div>}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className, as: Component = 'h3' }) => (
  <Component className={cn('text-lg font-bold text-slate-900', className)}>{children}</Component>
);

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => (
  <p className={cn('text-sm text-slate-500 mt-1', className)}>{children}</p>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={cn('', className)}>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={cn('mt-4 pt-4 border-t border-slate-100', className)}>{children}</div>
);