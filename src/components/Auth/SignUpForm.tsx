import React from 'react';
import { Eye, EyeOff, AlertCircle, LoaderCircle } from 'lucide-react';

interface SignUpFormProps {
  email: string;
  signUpFirstName: string;
  signUpLastName: string;
  signUpConfirmEmail: string;
  signUpPassword: string;
  signUpConfirmPassword: string;
  loading: boolean;
  error: string | null;
  showPassword: boolean;
  isCheckingBreach: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onConfirmEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToSignIn: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  email,
  signUpFirstName,
  signUpLastName,
  signUpConfirmEmail,
  signUpPassword,
  signUpConfirmPassword,
  loading,
  error,
  showPassword,
  isCheckingBreach,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onConfirmEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onSubmit,
  onSwitchToSignIn,
}) => {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name</label>
          <input
            type="text"
            value={signUpFirstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            required
            autoComplete="given-name"
            placeholder="John"
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name</label>
          <input
            type="text"
            value={signUpLastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            required
            autoComplete="family-name"
            placeholder="Doe"
            className="input"
          />
        </div>

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

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Email</label>
          <input
            type="email"
            value={signUpConfirmEmail}
            onChange={(e) => onConfirmEmailChange(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@email.com"
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={signUpPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className="input pr-11"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {signUpPassword && (
            <div className="flex flex-wrap gap-1 mt-2">
              {['8+ chars', 'uppercase', 'lowercase', 'number', 'special'].map((req, i) => {
                const checks = [signUpPassword.length >= 8, /[A-Z]/.test(signUpPassword), /[a-z]/.test(signUpPassword), /[0-9]/.test(signUpPassword), /[^A-Za-z0-9]/.test(signUpPassword)];
                return <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${checks[i] ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{req}</span>;
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={signUpConfirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            required
            autoComplete="new-password"
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
          className="w-full h-12 rounded-lg text-white text-sm font-bold tracking-wide shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2 bg-primary-600 hover:bg-primary-700"
        >
          {loading || isCheckingBreach ? <LoaderCircle className="animate-spin" size={18} /> : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm mt-6 text-slate-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="font-bold hover:underline transition-colors text-primary-600"
        >
          Sign in
        </button>
      </p>
    </>
  );
};