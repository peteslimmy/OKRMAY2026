/**
 * Startup Health Check
 * Validates app environment before rendering to prevent error cascades
 */

import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { safeNavigate } from '../config/urls';

interface HealthCheckResult {
  ok: boolean;
  message: string;
}

const runHealthChecks = (): HealthCheckResult[] => {
  const results: HealthCheckResult[] = [];
  
  // Check 1: Valid browser context
  if (typeof window === 'undefined') {
    results.push({ ok: false, message: 'Not running in browser context' });
  }
  
  // Check 2: Valid origin
  const { protocol, hostname, port, href } = window.location;
  if (protocol !== 'http:' && protocol !== 'https:') {
    results.push({ ok: false, message: `Invalid protocol: ${protocol}` });
  }
  
  // Check 3: Valid hostname
  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname.match(/^192\.168\./) || hostname.match(/^10\./)) {
    // Valid - local or LAN access
  } else if (hostname.includes('.') === false) {
    results.push({ ok: false, message: `Invalid hostname: ${hostname}` });
  }
  
  // Check 4: No chrome-error context
  if (href.includes('chrome-error://')) {
    results.push({ ok: false, message: 'Running in error context (chrome-error://)' });
  }
  
  // Check 5: React mounted properly
  const root = document.getElementById('root');
  if (!root) {
    results.push({ ok: false, message: 'Root element not found' });
  }
  
  return results;
};

export const StartupHealthCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [healthResults, setHealthResults] = useState<HealthCheckResult[]>([]);
  
  useEffect(() => {
    // Run health checks after a minimal delay to ensure React is mounted
    const timer = setTimeout(() => {
      const results = runHealthChecks();
      setHealthResults(results);
      
      const allHealthy = results.every(r => r.ok);
      setHealthStatus(allHealthy ? 'healthy' : 'unhealthy');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading while checking
  if (healthStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Starting 4CORE OKR...</p>
        </div>
      </div>
    );
  }
  
  // Show error if unhealthy
  if (healthStatus === 'unhealthy') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full border border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <h2 className="text-lg font-semibold text-slate-900">Startup Failed</h2>
          </div>
          <ul className="space-y-2 mb-4">
            {healthResults.filter(r => !r.ok).map((result, i) => (
              <li key={i} className="text-sm text-red-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {result.message}
              </li>
            ))}
          </ul>
          <button
            onClick={() => safeNavigate('/')}
            className="w-full py-2 px-4 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default StartupHealthCheck;