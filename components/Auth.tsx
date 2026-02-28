
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff, AlertCircle, LoaderCircle, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import { logAudit, getGovernanceConfig } from '../utils';

const generateCSRFToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const getOrCreateCSRFToken = (): string => {
  const stored = sessionStorage.getItem('csrf_token');
  if (stored) return stored;
  const token = generateCSRFToken();
  sessionStorage.setItem('csrf_token', token);
  return token;
};

const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `**@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
};

const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('One special character');
  return { valid: errors.length === 0, errors };
};

const checkPasswordBreach = async (password: string): Promise<boolean> => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) return false;

    const text = await response.text();
    const lines = text.split('\n');
    return lines.some(line => line.startsWith(suffix));
  } catch {
    return false;
  }
};



interface RateLimitState {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordUpdateMode, setIsPasswordUpdateMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [rateLimit, setRateLimit] = useState<RateLimitState>({ attempts: 0, lockedUntil: null, lastAttempt: 0 });
  const [rememberMe, setRememberMe] = useState(false);
  const [csrfToken, setCsrfToken] = useState(getOrCreateCSRFToken());

  const rateLimitRef = useRef<RateLimitState>({ attempts: 0, lockedUntil: null, lastAttempt: 0 });

  useEffect(() => {
    // Method 1: Listen for Supabase's PASSWORD_RECOVERY auth event
    // This fires when the user clicks the email reset link and Supabase
    // establishes a temporary recovery session automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordUpdateMode(true);
        setIsForgotPasswordMode(false);
        setResetEmailSent(false);
      }
    });

    // Method 2: Fallback — check URL hash directly (for custom/legacy tokens)
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('type%3Drecovery')) {
      setIsPasswordUpdateMode(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const state = rateLimitRef.current;

    if (state.lockedUntil && now < state.lockedUntil) {
      return false;
    }

    if (now - state.lastAttempt > 60000) {
      state.attempts = 0;
      state.lockedUntil = null;
    }

    return true;
  }, []);

  const recordFailedAttempt = useCallback(() => {
    const now = Date.now();
    const state = rateLimitRef.current;
    state.attempts += 1;
    state.lastAttempt = now;

    if (state.attempts >= 5) {
      state.lockedUntil = now + (Math.min(state.attempts - 4, 5) * 60000);
    }

    setRateLimit({ ...state });
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkRateLimit()) {
      const waitTime = Math.ceil(((rateLimitRef.current.lockedUntil || 0) - Date.now()) / 1000);
      setError(`Too many attempts. Please wait ${waitTime} seconds.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        recordFailedAttempt();
        await logAudit('SYSTEM', `Failed authentication attempt (masked: ${maskEmail(email)})`);
        throw new Error('Invalid credentials');
      }

      await logAudit('LOGIN', `Identity node authenticated: ${maskEmail(email)}`);
    } catch (err: any) {
      setError('Invalid credentials. Please verify your email and security key.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Security keys do not match.');
      setLoading(false);
      return;
    }

    const strength = validatePassword(newPassword);
    if (!strength.valid) {
      setError(`Security key requirements: ${strength.errors.join(', ')}`);
      setLoading(false);
      return;
    }

    setIsCheckingBreach(true);
    const isBreached = await checkPasswordBreach(newPassword);
    setIsCheckingBreach(false);

    if (isBreached) {
      setError('This security key has been exposed in data breaches. Please choose a different one.');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setPasswordUpdateSuccess(true);
      await logAudit('SYSTEM', 'Password updated successfully');
    } catch (err: any) {
      setError('Failed to update security key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);
    if (value.length > 0) {
      setPasswordStrength(validatePassword(value));
    } else {
      setPasswordStrength(null);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use Supabase's built-in password reset
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        {
          redirectTo: `${window.location.origin}${window.location.pathname}`
        }
      );

      if (resetError) {
        console.error('Reset error:', resetError.message);
      }

      // Always show sent screen to prevent email enumeration attacks
      setResetEmailSent(true);

      // Try to log (may fail due to RLS, that's OK)
      try {
        await logAudit('SYSTEM', `Password reset requested for: ${maskEmail(trimmedEmail)}`);
      } catch (auditErr) {
        console.log('Audit log skipped:', auditErr);
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError('Unable to process request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (passwordUpdateSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #dde1f5 0%, #c8ccee 40%, #d4c9f0 100%)' }}>
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-200/60 px-8 pt-10 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <CheckCircle size={30} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Password Updated!</h1>
            <p className="text-sm text-slate-500 mb-8">Your security key has been updated. You may now sign in with your new credentials.</p>
            <button
              onClick={() => { setIsPasswordUpdateMode(false); setPasswordUpdateSuccess(false); setNewPassword(''); setConfirmPassword(''); window.location.hash = ''; }}
              className="w-full h-12 rounded-2xl text-white text-sm font-bold tracking-wide shadow-lg transition-opacity flex items-center justify-center"
              style={{ background: 'linear-gradient(90deg, #5b8dee 0%, #7c5cbf 100%)' }}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isPasswordUpdateMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #dde1f5 0%, #c8ccee 40%, #d4c9f0 100%)' }}>
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-200/60 px-8 pt-10 pb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <Lock size={26} className="text-white" />
              </div>
            </div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Set New Password</h1>
              <p className="text-sm" style={{ color: '#6366f1' }}>Create a secure key to continue</p>
            </div>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => handleNewPasswordChange(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-12 bg-white border-2 border-indigo-100 rounded-2xl px-4 pr-11 text-sm text-slate-700 font-medium outline-none focus:border-indigo-400 transition-colors placeholder:text-indigo-200"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-indigo-500 transition-colors">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {passwordStrength && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {['8+ chars', 'uppercase', 'lowercase', 'number', 'special'].map((req, i) => {
                      const checks = [newPassword.length >= 8, /[A-Z]/.test(newPassword), /[a-z]/.test(newPassword), /[0-9]/.test(newPassword), /[^A-Za-z0-9]/.test(newPassword)];
                      return <span key={i} className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${checks[i] ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{req}</span>;
                    })}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 bg-white border-2 border-indigo-100 rounded-2xl px-4 text-sm text-slate-700 font-medium outline-none focus:border-indigo-400 transition-colors placeholder:text-indigo-200"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="text-red-500 shrink-0" size={15} />
                  <p className="text-red-600 text-xs font-medium">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading || isCheckingBreach}
                className="w-full h-12 rounded-2xl text-white text-sm font-bold tracking-wide shadow-lg transition-opacity disabled:opacity-60 flex items-center justify-center"
                style={{ background: 'linear-gradient(90deg, #5b8dee 0%, #7c5cbf 100%)' }}
              >
                {loading || isCheckingBreach ? <LoaderCircle className="animate-spin" size={18} /> : 'Update Password'}
              </button>
            </form>
            <p className="text-center text-sm mt-6">
              <button type="button" onClick={() => { setIsPasswordUpdateMode(false); window.location.hash = ''; }} className="font-bold flex items-center justify-center gap-1 mx-auto hover:opacity-70 transition-opacity" style={{ color: '#6366f1' }}>
                <ArrowLeft size={13} /> Back to Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (resetEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #dde1f5 0%, #c8ccee 40%, #d4c9f0 100%)' }}>
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-200/60 px-8 pt-10 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <CheckCircle size={30} className="text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Reset Link Sent</h1>
            <p className="text-sm text-slate-500 mb-8">If an account exists with this email, you will receive a reset link shortly.</p>
            <button
              onClick={() => { setIsForgotPasswordMode(false); setResetEmailSent(false); setEmail(''); }}
              className="w-full h-12 rounded-2xl text-white text-sm font-bold tracking-wide shadow-lg transition-opacity flex items-center justify-center"
              style={{ background: 'linear-gradient(90deg, #5b8dee 0%, #7c5cbf 100%)' }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isForgotPasswordMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #dde1f5 0%, #c8ccee 40%, #d4c9f0 100%)' }}>
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-200/60 px-8 pt-10 pb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <Lock size={26} className="text-white" />
              </div>
            </div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-800 mb-1">Forgot password?</h1>
              <p className="text-sm" style={{ color: '#6366f1' }}>We'll send you a reset link</p>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@email.com"
                  className="w-full h-12 bg-white border-2 border-indigo-100 rounded-2xl px-4 text-sm text-slate-700 font-medium outline-none focus:border-indigo-400 transition-colors placeholder:text-indigo-200"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="text-red-500 shrink-0" size={15} />
                  <p className="text-red-600 text-xs font-medium">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl text-white text-sm font-bold tracking-wide shadow-lg transition-opacity disabled:opacity-60 flex items-center justify-center"
                style={{ background: 'linear-gradient(90deg, #5b8dee 0%, #7c5cbf 100%)' }}
              >
                {loading ? <LoaderCircle className="animate-spin" size={18} /> : 'Send Reset Link'}
              </button>
            </form>
            <p className="text-center text-sm mt-6">
              <button
                type="button"
                onClick={() => { setIsForgotPasswordMode(false); setEmail(''); setError(null); }}
                className="font-bold flex items-center justify-center gap-1 mx-auto hover:opacity-70 transition-opacity"
                style={{ color: '#6366f1' }}
              >
                <ArrowLeft size={13} /> Back to Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #dde1f5 0%, #c8ccee 40%, #d4c9f0 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-200/60 px-8 pt-10 pb-8">

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h1>
            <p className="text-sm" style={{ color: '#6366f1' }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@email.com"
                className="w-full h-12 bg-white border-2 border-indigo-100 rounded-2xl px-4 text-sm text-slate-700 font-medium outline-none focus:border-indigo-400 focus:ring-0 transition-colors placeholder:text-indigo-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full h-12 bg-white border-2 border-indigo-100 rounded-2xl px-4 pr-11 text-sm text-indigo-400 font-medium outline-none focus:border-indigo-400 focus:ring-0 transition-colors placeholder:text-indigo-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-indigo-500 cursor-pointer"
                />
                <span className="text-sm text-slate-500">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => { setIsForgotPasswordMode(true); }}
                className="text-sm font-medium hover:underline transition-colors"
                style={{ color: '#6366f1' }}
              >
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="text-red-500 shrink-0" size={15} />
                <p className="text-red-600 text-xs font-medium">{error}</p>
              </div>
            )}

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading || !checkRateLimit()}
              className="w-full h-12 rounded-2xl text-white text-sm font-bold tracking-wide shadow-lg transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              style={{ background: 'linear-gradient(90deg, #5b8dee 0%, #7c5cbf 100%)' }}
            >
              {loading ? <LoaderCircle className="animate-spin" size={18} /> : 'Sign in'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm mt-6" style={{ color: '#94a3b8' }}>
            Don't have an account?{' '}
            <span className="font-bold" style={{ color: '#6366f1' }}>Contact Admin</span>
          </p>
        </div>
      </div>
    </div>
  );
};
