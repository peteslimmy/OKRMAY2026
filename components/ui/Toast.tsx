import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string, duration?: number) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
    loading: (message: string) => string | undefined;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, message: string, duration = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, type, message, duration }]);

        if (duration > 0 && type !== 'loading') {
            setTimeout(() => dismissToast(id), duration);
        }
    }, [dismissToast]);

    const success = useCallback((message: string) => showToast('success', message), [showToast]);
    const error = useCallback((message: string) => showToast('error', message), [showToast]);
    const warning = useCallback((message: string) => showToast('warning', message), [showToast]);
    const info = useCallback((message: string) => showToast('info', message), [showToast]);

    const loading = useCallback((message: string): string | undefined => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, type: 'loading', message, duration: 0 }]);
        return id;
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info, loading, dismissToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer: React.FC<{ toasts: Toast[]; onDismiss: (id: string) => void }> = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
    const icons = {
        success: <CheckCircle className="text-emerald-500 w-5 h-5" />,
        error: <AlertCircle className="text-rose-500 w-5 h-5" />,
        warning: <AlertTriangle className="text-amber-500 w-5 h-5" />,
        info: <Info className="text-blue-500 w-5 h-5" />,
        loading: <Loader2 className="text-primary-500 w-5 h-5 animate-spin" />,
    };

    const bgColors = {
        success: 'bg-emerald-50 border-emerald-200',
        error: 'bg-rose-50 border-rose-200',
        warning: 'bg-amber-50 border-amber-200',
        info: 'bg-blue-50 border-blue-200',
        loading: 'bg-slate-50 border-slate-200',
    };

    const textColors = {
        success: 'text-emerald-800',
        error: 'text-rose-800',
        warning: 'text-amber-800',
        info: 'text-blue-800',
        loading: 'text-slate-700',
    };

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-up ${bgColors[toast.type]}`}
            role="alert"
        >
            {icons[toast.type]}
            <p className={`flex-1 text-sm font-medium ${textColors[toast.type]}`}>
                {toast.message}
            </p>
            {toast.type !== 'loading' && (
                <button
                    onClick={() => onDismiss(toast.id)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};
