import React from 'react';
import { cn } from '../../lib/utils';
import { Plus, Search, FileText, Users, Briefcase, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'search' | 'error' | 'success';
  className?: string;
}

const variantConfig = {
  default: {
    icon: <FileText size={48} />,
    bgColor: 'bg-slate-50',
    iconColor: 'text-slate-400',
  },
  search: {
    icon: <Search size={48} />,
    bgColor: 'bg-slate-50',
    iconColor: 'text-slate-400',
  },
  error: {
    icon: <AlertCircle size={48} />,
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-400',
  },
  success: {
    icon: <Briefcase size={48} />,
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-400',
  },
};

const sizeClasses = {
  sm: 'p-6',
  md: 'p-8',
  lg: 'p-12',
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  variant = 'default',
  className,
}) => {
  const config = variantConfig[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-xl',
        config.bgColor,
        sizeClasses[size],
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className={cn('mb-4', config.iconColor)}>
        {icon || config.icon}
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-slate-600 max-w-md mb-6">{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {action.icon || <Plus size={16} />}
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Pre-configured empty states for common use cases
export const EmptyStateNoData = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    title="No data found"
    description="There are no items to display yet. Get started by creating your first item."
    action={onAdd ? { label: 'Add New', onClick: onAdd } : undefined}
  />
);

export const EmptyStateNoResults = ({ onClear }: { onClear?: () => void }) => (
  <EmptyState
    variant="search"
    title="No results found"
    description="We couldn't find any results matching your search. Try adjusting your filters or search terms."
    secondaryAction={onClear ? { label: 'Clear Filters', onClick: onClear } : undefined}
  />
);

export const EmptyStateNoUsers = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    icon={<Users size={48} />}
    title="No users yet"
    description="Your team is empty. Add team members to start collaborating on objectives."
    action={onAdd ? { label: 'Add User', onClick: onAdd } : undefined}
  />
);

export const EmptyStateNoUnits = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    icon={<Briefcase size={48} />}
    title="No business units"
    description="Create business units to organize your team and track objectives by department."
    action={onAdd ? { label: 'Create Unit', onClick: onAdd } : undefined}
  />
);

export const EmptyStateError = ({ onRetry }: { onRetry?: () => void }) => (
  <EmptyState
    variant="error"
    title="Something went wrong"
    description="We encountered an error while loading your data. Please try again."
    action={onRetry ? { label: 'Try Again', onClick: onRetry } : undefined}
  />
);

// Alias for backward compatibility
export const EmptyTable = EmptyStateNoData;

EmptyState.displayName = 'EmptyState';
