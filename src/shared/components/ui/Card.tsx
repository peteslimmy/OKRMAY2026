/**
 * 4CORE OKR Platform - Card Component
 * Standardized card with variants and interactive states
 */

import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'interactive' | 'outlined';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-slate-200 shadow-sm',
  elevated: 'bg-white border border-slate-100 shadow-lg',
  interactive: 'bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary-200 hover:-translate-y-1 cursor-pointer',
  outlined: 'bg-white border-2 border-slate-200'
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6'
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const interactiveClass = hoverable || variant === 'interactive'
      ? 'transition-all duration-200 ease-out active:scale-[0.99]'
      : '';

    return (
      <div
        ref={ref}
        className={`
          rounded-xl
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${interactiveClass}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`flex items-start justify-between pb-4 border-b border-slate-100 ${className}`}
      {...props}
    >
      <div>
        {title && (
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        )}
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// Card Body
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardBody: React.FC<CardBodyProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div className={`py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

// Card Footer
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter: React.FC<CardFooterProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`pt-4 border-t border-slate-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};