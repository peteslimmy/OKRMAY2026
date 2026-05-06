/**
 * 4CORE OKR Platform - Authentication
 */

import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Card } from '../../../shared/components/ui/Card';
import { useAuth } from '../../../shared/hooks/useAuth';

interface AuthProps {
  requirePasswordChange?: boolean;
  onPasswordChanged?: () => void;
}

export const Auth: React.FC<AuthProps> = ({
  requirePasswordChange = false,
  onPasswordChanged
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const demoAccounts = [
    { email: 'admin@fcis.com', role: 'Super Admin' },
    { email: 'director@fcis.com', role: 'Director' },
    { email: 'hnb@fcis.com', role: 'Manager' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/20 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">4CORE OKR</h1>
          <p className="text-sm text-slate-500 mt-1">Enterprise Governance Platform</p>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            {requirePasswordChange ? 'Update Password' : 'Sign in to your account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={18} />}
              showPasswordToggle
              required
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight size={18} />}
            >
              Sign in
            </Button>
          </form>

          {/* Demo Accounts */}
          {!import.meta.env.PROD && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-3">Demo accounts (click to fill):</p>
              <div className="flex flex-wrap gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => { setEmail(account.email); setPassword('password'); }}
                    className="text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-600 transition-colors"
                  >
                    {account.role}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
};