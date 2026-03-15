import React from 'react';
import { FileText, Users, Building2, Target, Shield, Settings, Plus, Search, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
    type?: 'default' | 'search' | 'error' | 'custom';
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

// Pre-defined empty states for common scenarios
export const EmptyState: React.FC<EmptyStateProps> = ({
    type = 'default',
    icon,
    title,
    description,
    action,
    className = ''
}) => {
    // Default icons based on type
    const defaultIcons = {
        default: <FileText className="w-12 h-12 text-slate-300" />,
        search: <Search className="w-12 h-12 text-slate-300" />,
        error: <AlertCircle className="w-12 h-12 text-rose-300" />,
        custom: icon,
    };

    const defaultDescriptions = {
        default: 'No data available yet. Get started by adding your first item.',
        search: 'No results found. Try adjusting your search criteria.',
        error: 'Something went wrong. Please try again later.',
        custom: description,
    };

    return (
        <div className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}>
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                {defaultIcons[type] || defaultIcons.default}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 max-w-md mb-6">
                {description || defaultDescriptions[type] || defaultDescriptions.default}
            </p>
            {action && <div>{action}</div>}
        </div>
    );
};

// Pre-built empty state components for common use cases
export const EmptyActivities: React.FC<{ onAdd?: () => void }> = ({ onAdd }) => (
    <EmptyState
        type="default"
        icon={<FileText className="w-12 h-12 text-slate-300" />}
        title="No activities yet"
        description="Start by adding your first weekly report to track your progress."
        action={
            onAdd && (
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                >
                    <Plus size={16} />
                    Add Report
                </button>
            )
        }
    />
);

export const EmptyUsers: React.FC = () => (
    <EmptyState
        type="default"
        icon={<Users className="w-12 h-12 text-slate-300" />}
        title="No users found"
        description="Invite team members to join the organization."
    />
);

export const EmptyBusinessUnits: React.FC = () => (
    <EmptyState
        type="default"
        icon={<Building2 className="w-12 h-12 text-slate-300" />}
        title="No business units"
        description="Create business units to organize your teams."
    />
);

export const EmptyKeyResults: React.FC<{ onAdd?: () => void }> = ({ onAdd }) => (
    <EmptyState
        type="default"
        icon={<Target className="w-12 h-12 text-slate-300" />}
        title="No key results"
        description="Define your strategic objectives and key results."
        action={
            onAdd && (
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                >
                    <Plus size={16} />
                    Add Key Result
                </button>
            )
        }
    />
);

export const EmptySearchResults: React.FC<{ searchTerm: string }> = ({ searchTerm }) => (
    <EmptyState
        type="search"
        title={`No results for "${searchTerm}"`}
        description="Try adjusting your search terms or filters."
    />
);

export const EmptyError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
    <EmptyState
        type="error"
        icon={<AlertCircle className="w-12 h-12 text-rose-400" />}
        title="Something went wrong"
        description="We encountered an error loading this data. Please try again."
        action={
            onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
                >
                    Try Again
                </button>
            )
        }
    />
);
