import React from 'react';
import { Lock, CheckCircle } from 'lucide-react';

interface AuthHeaderProps {
  mode: 'signin' | 'signup' | 'forgot' | 'reset' | 'success' | 'reset-sent';
  title: string;
  subtitle?: string;
  icon?: 'lock' | 'user' | 'check';
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ mode, icon = 'lock' }) => {
  const iconBg = mode === 'success' || mode === 'reset-sent' ? 'bg-emerald-100' : 'bg-primary-100';
  const iconColor = mode === 'success' || mode === 'reset-sent' ? 'text-emerald-600' : 'text-primary-600';

  return (
    <div className="flex justify-center mb-6">
      <div className={`w-16 h-16 ${iconBg} rounded-full flex items-center justify-center`}>
        {icon === 'lock' && <Lock size={26} className={iconColor} />}
        {icon === 'user' && (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        )}
        {icon === 'check' && <CheckCircle size={30} className={iconColor} />}
      </div>
    </div>
  );
};

export const AuthTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="text-center mb-6">
    <h1 className="text-2xl font-bold text-slate-900 mb-1">{title}</h1>
    {subtitle && <p className="text-sm text-primary-600">{subtitle}</p>}
  </div>
);