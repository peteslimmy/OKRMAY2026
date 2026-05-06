import React from 'react';
import { FileX, Inbox, SearchX } from 'lucide-react';
import { Button } from './Button';

type EmptyStateVariant = 'default' | 'no-results' | 'no-files';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const icons: Record<EmptyStateVariant, React.ReactNode> = {
  default: <Inbox className="w-12 h-12 text-slate-300" />,
  'no-results': <SearchX className="w-12 h-12 text-slate-300" />,
  'no-files': <FileX className="w-12 h-12 text-slate-300" />
};

const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="mb-4 p-3 bg-slate-50 rounded-full">
        {icons[variant]}
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;