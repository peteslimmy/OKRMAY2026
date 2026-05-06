import React, { useState, useRef } from 'react';
import { Eye, EyeOff, AlertCircle, LoaderCircle, CheckCircle, Mail, Lock } from 'lucide-react';

interface SignInFormProps {
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  showPassword: boolean;
  rememberMe: boolean;
  rateLimited: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onRememberMeChange: (checked: boolean) => void;
  onForgotPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  email,
  password,
  loading,
  error,
  showPassword,
  rememberMe,
  rateLimited,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onRememberMeChange,
  onForgotPassword,
  onSubmit,
}) => {
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const emailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    if (!loading && rateLimited) {
      onSubmit(e);
    }
  };

  const getEmailBorderClass = () => {
    if (!email) return '';
    return emailValid ? 'input-valid' : 'input-invalid';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div className="relative">
          <label 
            htmlFor="email"
            className={`block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 transition-colors duration-200 ${
              emailFocused || email ? 'text-primary-600' : 'text-slate-500'
            }`}
          >
            Email Address
          </label>
          <div className="relative">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              emailFocused ? 'text-primary-500' : 'text-slate-400'
            }`}>
              <Mail size={18} />
            </div>
            <input
              ref={emailRef}
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              required
              autoComplete="email"
              placeholder="you@company.com"
              className={`input pl-12 pr-4 py-3 text-base ${
                emailFocused ? 'input-focused' : getEmailBorderClass()
              }`}
            />
            {email && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-200">
                {emailValid ? (
                  <CheckCircle size={18} className="text-emerald-500" />
                ) : (
                  <AlertCircle size={18} className="text-red-400" />
                )}
              </div>
            )}
          </div>
          {email && !emailValid && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <AlertCircle size={12} />
              Please enter a valid email address
            </p>
          )}
        </div>

        <div className="relative">
          <label 
            htmlFor="password"
            className={`block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 transition-colors duration-200 ${
              passwordFocused || password ? 'text-primary-600' : 'text-slate-500'
            }`}
          >
            Password
          </label>
          <div className="relative">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              passwordFocused ? 'text-primary-500' : 'text-slate-400'
            }`}>
              <Lock size={18} />
            </div>
            <input
              ref={passwordRef}
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className={`input pl-12 pr-12 py-3 text-base ${
                passwordFocused ? 'input-focused' : ''
              }`}
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors duration-200 p-1"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
          <div className="relative">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => onRememberMeChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-5 h-5 border-2 border-slate-300 rounded-md transition-all duration-200 peer-checked:bg-primary-600 peer-checked:border-primary-600 peer-focus:ring-2 peer-focus:ring-primary-500/30 group-hover:border-primary-400" />
            {rememberMe && (
              <CheckCircle size={14} className="absolute top-0.5 left-0.5 text-white" />
            )}
          </div>
          <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors duration-200">Remember me</span>
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors duration-200"
        >
          Forgot password?
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-100 rounded-lg animate-scale-in">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !rateLimited}
        className="w-full h-12 rounded-lg text-white text-base font-semibold tracking-wide shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 bg-primary-600 hover:bg-primary-700 btn-hover-lift"
      >
        {loading ? (
          <>
            <LoaderCircle className="animate-spin" size={20} />
            <span>Signing in...</span>
          </>
        ) : (
          'Sign in'
        )}
      </button>

      <p className="text-center text-sm text-slate-400 pt-2">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200"
        >
          Create one
        </button>
      </p>
    </form>
  );
};