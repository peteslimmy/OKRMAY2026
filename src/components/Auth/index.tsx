import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { logAudit } from '../../utils';
import { logger } from '../../utils/logging';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { PasswordUpdateForm } from './PasswordUpdateForm';
import { SuccessScreen } from './SuccessScreen';
import { maskEmail, validatePassword, checkPasswordBreach } from './utils';

interface RateLimitState {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}
// NOTE: AuthProps defined once here — do NOT redeclare below

interface AuthProps {
  requirePasswordChange?: boolean;
  onPasswordChanged?: () => void;
}

const AuthBranding = () => (
  <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-12 relative overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
    </div>
    <div className="relative z-10 text-center">
      <div className="w-24 h-24 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center mb-8 mx-auto animate-float">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h2 className="heading-2 text-white mb-4">4CORE Governance</h2>
      <p className="text-primary-50 text-lg max-w-md leading-relaxed">
        Streamline your organization&apos;s objective tracking and strategic alignment with enterprise-grade OKR management.
      </p>
      <div className="mt-12 flex gap-8 text-primary-100/80 text-sm">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Secure Auth</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Real-time Sync</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Analytics</span>
        </div>
      </div>
    </div>
  </div>
);

const AuthTitle = () => (
  <div className="text-center mb-8">
    <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-5">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    </div>
    <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h1>
    <p className="text-slate-500">Sign in to your account to continue</p>
  </div>
);

// [Duplicate interfaces removed — declared at top of file]

export const Auth: React.FC<AuthProps> = ({ requirePasswordChange, onPasswordChanged }) => {
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

  useEffect(() => {
    if (requirePasswordChange) {
      setIsPasswordUpdateMode(true);
    }
  }, [requirePasswordChange]);

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName] = useState('');
  const [signUpConfirmEmail, setSignUpConfirmEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const rateLimitRef = useRef<RateLimitState>({ attempts: 0, lockedUntil: null, lastAttempt: 0 });

  const recordFailedAttempt = useCallback(() => {
    const justCompleted = sessionStorage.getItem('password_update_completed');
    if (justCompleted) {
      sessionStorage.removeItem('password_update_completed');
      window.location.hash = '';
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        if (!sessionStorage.getItem('password_update_completed')) {
          setIsPasswordUpdateMode(true);
          setIsForgotPasswordMode(false);
          setResetEmailSent(false);
        }
      }
    });

    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('type%3Drecovery')) {
      setIsPasswordUpdateMode(true);

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        }).then(({ error }) => {
          if (error) {
            logger.error('Error setting session:', { error });
          }
        });
      }
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
      logger.debug('[AUTH] Attempting login for:', { email: email.trim().toLowerCase() });
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      logger.debug('[AUTH] Auth response:', { authError });

      if (authError) {
        logger.warn('[AUTH] Login failed:', { error: authError.message });
        recordFailedAttempt();
        await logAudit('SYSTEM', `Failed authentication attempt (masked: ${maskEmail(email)})`);
        throw new Error('Invalid credentials');
      }

      logger.debug('[AUTH] Login successful');
      
      if (authData.user) {
        logger.debug('[AUTH] Checking profile for auth_id:', { id: authData.user.id });
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_id', authData.user.id)
          .single();
        
        logger.debug('[AUTH] Profile query result:', { profileError });
        
        if (profileError && profileError.code !== 'PGRST116') {
          logger.error('[AUTH] Profile fetch error:', { error: profileError });
        }
        
        if (!profile) {
          logger.debug('[AUTH] No profile found for user - will be created on session load');
        }
      }

      await logAudit('LOGIN', `Identity node authenticated: ${maskEmail(email)}`);
    } catch (err: any) {
      logger.error('[AUTH] Login error:', { error: err });
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        logger.error('Session error:', { error: sessionError });
      }

      if (!session) {
        logger.error('No session found for password update');
        setError('Password reset session expired. Please request a new reset link.');
        setLoading(false);
        return;
      }

      logger.debug('Updating password for user');

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        logger.error('Password update error:', { error: updateError });
        throw updateError;
      }

      logger.info('Password updated successfully');

      await supabase.auth.signOut();

      sessionStorage.clear();
      if (__SIMULATION_ENABLED__) {
        localStorage.removeItem('4CORE_simulated_user');
      }
      localStorage.removeItem('4CORE_user_cache');

      sessionStorage.setItem('password_update_completed', 'true');

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      window.location.hash = '';

      setPasswordUpdateSuccess(true);

      if (onPasswordChanged) {
        onPasswordChanged();
      }

      setTimeout(() => {
        window.history.replaceState(null, '', window.location.pathname);
      }, 1500);

      await logAudit('SYSTEM', 'Password updated successfully');
    } catch (err: any) {
      logger.error('Password update failed:', { error: err });
      if (err.message?.includes('session') || err.message?.includes('token')) {
        setError('Password reset session expired. Please request a new reset link.');
      } else if (err.message?.includes('same password')) {
        setError('New password must be different from your current password.');
      } else {
        setError('Failed to update security key. Please try again.');
      }
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    const showGenericSuccess = () => {
      setResetEmailSent(true);
      setLoading(false);
    };

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      await supabase.auth.resetPasswordForEmail(
        trimmedEmail,
        {
          redirectTo: `${window.location.origin}${window.location.pathname}`
        }
      );

      try {
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: trimmedEmail,
            generateResetLink: true,
            redirectTo: `${window.location.origin}${window.location.pathname}`
          }),
        });
      } catch (edgeError) {
        logger.debug('Edge function fallback attempted');
      }

      showGenericSuccess();

      try {
        await logAudit('SYSTEM', `Password reset requested for: ${maskEmail(trimmedEmail)}`);
      } catch (auditErr) {
        logger.debug('Audit log skipped:', { error: auditErr });
      }
    } catch (err: any) {
      logger.error('Forgot password error:', { error: err });
      showGenericSuccess();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedConfirmEmail = signUpConfirmEmail.trim().toLowerCase();

    if (!signUpFirstName.trim() || !signUpLastName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!trimmedEmail || !trimmedConfirmEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (trimmedEmail !== trimmedConfirmEmail) {
      setError('Email addresses do not match.');
      return;
    }

    if (!signUpPassword || !signUpConfirmPassword) {
      setError('Please enter and confirm your password.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const strength = validatePassword(signUpPassword);
    if (!strength.valid) {
      setError(`Password requirements: ${strength.errors.join(', ')}`);
      return;
    }

    setLoading(true);
    setError(null);

    setIsCheckingBreach(true);
    const isBreached = await checkPasswordBreach(signUpPassword);
    setIsCheckingBreach(false);

    if (isBreached) {
      setError('This password has been exposed in data breaches. Please choose a different one.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: signUpPassword,
        options: {
          data: {
            first_name: signUpFirstName.trim(),
            last_name: signUpLastName.trim(),
            full_name: `${signUpFirstName.trim()} ${signUpLastName.trim()}`
          }
        }
      });

      if (signUpError) {
        logger.error('Sign up error:', { error: signUpError });
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already been used')) {
          setError('An account with this email already exists.');
        } else {
          setError(signUpError.message || 'Failed to create account.');
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        try {
          const newProfile = {
            id: data.user.id,
            firstName: signUpFirstName.trim(),
            lastName: signUpLastName.trim(),
            name: `${signUpFirstName.trim()} ${signUpLastName.trim()}`,
            email: trimmedEmail,
            role: 'Viewer',
            department: 'UNASSIGNED',
            status: 'Active',
            mustChangePassword: false,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(signUpFirstName)}+${encodeURIComponent(signUpLastName)}&background=ea580c&color=fff&size=64&bold=true`
          };

          await supabase.from('profiles').insert([newProfile]);

          try {
            await logAudit('CREATE', `New identity registered: ${maskEmail(trimmedEmail)}`);
          } catch (auditErr) {
            logger.debug('Audit log skipped:', { error: auditErr });
          }
        } catch (profileError) {
          logger.error('Profile creation error:', { error: profileError });
        }

        setSignUpSuccess(true);
        setIsSignUpMode(false);

        setEmail('');
        setSignUpFirstName('');
        setSignUpLastName('');
        setSignUpConfirmEmail('');
        setSignUpPassword('');
        setSignUpConfirmPassword('');
      }
    } catch (err: any) {
      logger.error('Sign up failed:', { error: err });
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAllFields = () => {
    setError(null);
    setEmail('');
    setSignUpFirstName('');
    setSignUpLastName('');
    setSignUpConfirmEmail('');
    setSignUpPassword('');
    setSignUpConfirmPassword('');
  };

  if (signUpSuccess) {
    return (
      <div className="min-h-screen flex bg-white">
        <AuthBranding />
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <SuccessScreen
              title="Account Created!"
              message="Your account has been created successfully. You can now sign in with your credentials."
              buttonText="Go to Sign In"
              onButtonClick={() => { setSignUpSuccess(false); setEmail(''); setPassword(''); }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isSignUpMode) {
    return (
      <div className="min-h-screen flex bg-white">
        <AuthBranding />
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h1>
              <p className="text-slate-500">Join 4CORE Governance</p>
            </div>
            <SignUpForm
              email={email}
              signUpFirstName={signUpFirstName}
              signUpLastName={signUpLastName}
              signUpConfirmEmail={signUpConfirmEmail}
              signUpPassword={signUpPassword}
              signUpConfirmPassword={signUpConfirmPassword}
              loading={loading}
              error={error}
              showPassword={showPassword}
              isCheckingBreach={isCheckingBreach}
              onFirstNameChange={setSignUpFirstName}
              onLastNameChange={setSignUpLastName}
              onEmailChange={setEmail}
              onConfirmEmailChange={setSignUpConfirmEmail}
              onPasswordChange={setSignUpPassword}
              onConfirmPasswordChange={setSignUpConfirmPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onSubmit={handleSignUp}
              onSwitchToSignIn={() => { setIsSignUpMode(false); resetAllFields(); }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (passwordUpdateSuccess) {
    return (
      <div className="min-h-screen flex bg-white">
        <AuthBranding />
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <SuccessScreen
              title="Password Updated!"
              message="Your security key has been updated. Redirecting to login..."
              showSpinner
              buttonText="Go to Sign In Now"
              onButtonClick={() => { setIsPasswordUpdateMode(false); setPasswordUpdateSuccess(false); setNewPassword(''); setConfirmPassword(''); window.location.hash = ''; }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isPasswordUpdateMode) {
    return (
      <div className="min-h-screen flex bg-white">
        <AuthBranding />
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Password Required</h1>
              <p className="text-slate-500">Create a secure key to continue</p>
            </div>
            <PasswordUpdateForm
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              passwordStrength={passwordStrength}
              loading={loading}
              error={error}
              showPassword={showPassword}
              isCheckingBreach={isCheckingBreach}
              onNewPasswordChange={handleNewPasswordChange}
              onConfirmPasswordChange={setConfirmPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onSubmit={handlePasswordUpdate}
              onBack={() => { setIsPasswordUpdateMode(false); window.location.hash = ''; }}
              onSwitchToSignUp={() => { setIsPasswordUpdateMode(false); setIsSignUpMode(true); setError(null); }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (resetEmailSent) {
    return (
      <div className="min-h-screen flex bg-white">
        <AuthBranding />
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <SuccessScreen
              title="Reset Link Sent"
              message="If an account exists with this email, you will receive a reset link shortly."
              buttonText="Back to Login"
              onButtonClick={() => { setIsForgotPasswordMode(false); setResetEmailSent(false); setEmail(''); }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isForgotPasswordMode) {
    return (
      <div className="min-h-screen flex bg-white">
        <AuthBranding />
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot password?</h1>
              <p className="text-slate-500">We&apos;ll send you a reset link</p>
            </div>
            <ForgotPasswordForm
              email={email}
              loading={loading}
              error={error}
              onEmailChange={setEmail}
              onSubmit={handleForgotPassword}
              onBack={() => { setIsForgotPasswordMode(false); setEmail(''); setError(null); }}
              onSwitchToSignUp={() => { setIsForgotPasswordMode(false); setIsSignUpMode(true); setError(null); }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      <AuthBranding />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <AuthTitle />
          <SignInForm
            email={email}
            password={password}
            loading={loading}
            error={error}
            showPassword={showPassword}
            rememberMe={rememberMe}
            rateLimited={checkRateLimit()}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onRememberMeChange={setRememberMe}
            onForgotPassword={() => { setIsForgotPasswordMode(true); }}
            onSubmit={handleSignIn}
          />
          <p className="text-center text-sm mt-8 text-slate-400">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => { setIsSignUpMode(true); setError(null); }}
              className="font-bold hover:underline transition-colors text-primary-600"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};