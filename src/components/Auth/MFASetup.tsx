import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, CheckCircle, Copy, LoaderCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logAudit } from '../../utils';
import { useToast } from '../ui/Toast';

export const MFASetup: React.FC = () => {
  const [step, setStep] = useState<'start' | 'verify' | 'done'>('start');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const { data } = await supabase.auth.mfa.listFactors();
        const totp = data?.all || [];
        const hasTOTP = totp.some((f: any) => f.factor_type === 'totp');
        if (hasTOTP) setEnrolled(true);
      } catch { /* ignore */ }
    };
    checkEnrollment();
  }, []);

  const initiateEnrollment = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        friendlyName: `4CORE ${new Date().toLocaleDateString()}`,
        factorType: 'totp'
      });

      if (error) throw error;

      setQrCode(data?.totp?.qr_chart_data || null);
      setSecret(data?.totp?.secret || null);
      setStep('verify');
    } catch (e: any) {
      setError(e.message || 'Failed to initiate MFA enrollment');
    } finally {
      setLoading(false);
    }
  };

  const verifyEnrollment = async () => {
    if (verifyCode.length !== 6 || !/^\d+$/.test(verifyCode)) {
      setError('Please enter a 6-digit code');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: '' });
      const { error } = await supabase.auth.mfa.verify({
        factorId: '',
        code: verifyCode,
        challengeId: challenge.data?.id || ''
      });
      
      if (error) throw error;
      
      await logAudit('SYSTEM', 'MFA/TOTP enabled');
      addToast({ type: 'success', title: 'MFA Enabled', message: 'Two-factor authentication is now active.' });
      setStep('done');
    } catch (e: any) {
      setError(e.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      addToast({ type: 'info', title: 'Copied', message: 'Secret copied to clipboard' });
    }
  };

  if (enrolled || step === 'done') {
    return (
      <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-emerald-900">Two-Factor Enabled</h3>
            <p className="text-xs text-emerald-700">Your account is protected with TOTP authentication.</p>
          </div>
        </div>
        <p className="text-sm text-emerald-800 font-medium">You will be prompted for a 6-digit code each time you log in.</p>
      </div>
    );
  }

  if (step === 'start') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Smartphone size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Enable Two-Factor Authentication</h3>
            <p className="text-xs text-slate-500">Add an extra layer of security using an authenticator app.</p>
          </div>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <h4 className="text-sm font-bold text-slate-700">Setup Steps:</h4>
          <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
            <li>Download an authenticator app (Google Authenticator, Authy, or 1Password)</li>
            <li>Click "Enable MFA" to generate a QR code</li>
            <li>Scan the QR code with your authenticator app</li>
            <li>Enter the 6-digit code to verify</li>
          </ol>
        </div>
        
        {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        
        <button
          onClick={initiateEnrollment}
          disabled={loading}
          className="w-full py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Shield size={16} />}
          {loading ? 'Generating...' : 'Enable MFA'}
        </button>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Scan QR Code</h3>
        
        {qrCode && (
          <div className="flex justify-center p-4 bg-white rounded-xl border border-slate-100">
            <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
          </div>
        )}
        
        {secret && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <code className="flex-1 text-xs font-mono text-slate-600 break-all">{secret}</code>
            <button onClick={copySecret} className="text-slate-400 hover:text-slate-600 shrink-0">
              <Copy size={14} />
            </button>
          </div>
        )}
        
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Verification Code</label>
          <input
            type="text"
            maxLength={6}
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-2xl font-mono font-bold outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>
        
        {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        
        <div className="flex gap-3">
          <button onClick={() => setStep('start')} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">
            Back
          </button>
          <button
            onClick={verifyEnrollment}
            disabled={loading || verifyCode.length !== 6}
            className="flex-1 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? <LoaderCircle size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {loading ? 'Verifying...' : 'Verify & Enable'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};