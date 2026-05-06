import React from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, LoaderCircle, ArrowLeft } from 'lucide-react';

interface PasswordUpdateFormProps {
  newPassword: string;
  confirmPassword: string;
  passwordStrength: { valid: boolean; errors: string[] } | null;
  loading: boolean;
  error: string | null;
  showPassword: boolean;
  isCheckingBreach: boolean;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onSwitchToSignUp: () => void;
}

export const PasswordUpdateForm: React.FC<PasswordUpdateFormProps> = ({
  newPassword,
  confirmPassword,
  passwordStrength,
  loading,
  error,
  showPassword,
  isCheckingBreach,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-amber-600 text-sm font-bold">1</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-800 mb-1">First Login Security</h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              This is your first time logging in. For security, you&apos;ll need to create a new password to access your account.
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-3">
          <div className="shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-amber-600 text-sm font-bold">2</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-800 mb-1">Why is this required?</h3>
            <p className="text-xs text-amber-700 leading-relaxed">
              Our system requires a secure password update on first login to protect your account from unauthorized access.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            required
            placeholder="••••••••"
            className="input pr-11"
          />
          <button type="button" onClick={onTogglePassword} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {passwordStrength && (
          <div className="flex flex-wrap gap-1 mt-2">
            {passwordStrength.valid ? (
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                <CheckCircle size={14} /> Password meets all requirements
              </div>
            ) : (
              passwordStrength.errors.map((err, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600 flex items-center gap-1">
                  <AlertCircle size={10} /> {err}
                </span>
              ))
            )}
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          required
          placeholder="••••••••"
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
        disabled={loading || isCheckingBreach}
        className="w-full h-12 rounded-lg text-white text-sm font-bold tracking-wide shadow-sm transition-all disabled:opacity-60 flex items-center justify-center bg-primary-600 hover:bg-primary-700"
      >
        {loading || isCheckingBreach ? <LoaderCircle className="animate-spin" size={18} /> : 'Update Password'}
      </button>
    </form>
  );
};

export const PasswordUpdateFooter: React.FC<{ onBack: () => void; onSignUp: () => void }> = ({ onBack, onSignUp }) => (
  <p className="text-center text-sm mt-6">
    <button type="button" onClick={onBack} className="font-bold flex items-center justify-center gap-1 mx-auto hover:opacity-70 transition-opacity text-primary-600">
      <ArrowLeft size={13} /> Back to Sign In
    </button>
    <button
      type="button"
      onClick={onSignUp}
      className="font-bold flex items-center justify-center gap-1 mx-auto hover:opacity-70 transition-opacity mt-2 text-primary-600"
    >
      Or sign up
    </button>
  </p>
);