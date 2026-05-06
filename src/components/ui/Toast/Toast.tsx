import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Lock, Scale } from 'lucide-react';
import { cn } from '../../../lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'lock' | 'penalty';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

const toastConfig: Record<ToastType, { icon: React.ReactNode; className: string }> = {
  success: { icon: <CheckCircle2 size={20} />, className: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  error: { icon: <XCircle size={20} />, className: 'bg-red-50 border-red-200 text-red-800' },
  warning: { icon: <AlertTriangle size={20} />, className: 'bg-amber-50 border-amber-200 text-amber-800' },
  info: { icon: <Info size={20} />, className: 'bg-blue-50 border-blue-200 text-blue-800' },
  lock: { icon: <Lock size={20} />, className: 'bg-slate-50 border-slate-200 text-slate-800' },
  penalty: { icon: <Scale size={20} />, className: 'bg-red-50 border-red-200 text-red-800' },
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  const config = toastConfig[toast.type];

  React.useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(onRemove, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onRemove]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-up',
        'min-w-[320px] max-w-[420px]',
        config.className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.message && <p className="text-sm opacity-80 mt-0.5">{toast.message}</p>}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-semibold underline underline-offset-2 mt-2 hover:opacity-80"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearAll = useCallback(() => setToasts([]), []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" aria-label="Notifications">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};