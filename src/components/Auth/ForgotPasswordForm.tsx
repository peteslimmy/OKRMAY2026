import React from 'react';
import { AlertCircle, LoaderCircle, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  email: string;
  loading: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onSwitchToSignUp: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  email,
  loading,
  error,
  onEmailChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="input"
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="text-red-500 shrink-0" size={15} />
          <p className="text-red-600 text-xs font-medium">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-lg text-white text-sm font-bold tracking-wide shadow-sm transition-all disabled:opacity-60 flex items-center justify-center bg-primary-600 hover:bg-primary-700"
      >
        {loading ? <LoaderCircle className="animate-spin" size={18} /> : 'Send Reset Link'}
      </button>
    </form>
  );
};

export const AuthFooter: React.FC<{ onBack?: () => void; onSignUp?: () => void; showBack?: boolean; showSignUp?: boolean }> = ({ onBack, onSignUp, showBack = true, showSignUp = false }) => (
  <p className="text-center text-sm mt-6">
    {showBack && onBack && (
      <button
        type="button"
        onClick={onBack}
        className="font-bold flex items-center justify-center gap-1 mx-auto hover:opacity-70 transition-opacity text-primary-600"
      >
        <ArrowLeft size={13} /> Back to Sign In
      </button>
    )}
    {showSignUp && onSignUp && (
      <button
        type="button"
        onClick={onSignUp}
        className="font-bold flex items-center justify-center gap-1 mx-auto hover:opacity-70 transition-opacity mt-2 text-primary-600"
      >
        Or sign up
      </button>
    )}
  </p>
);