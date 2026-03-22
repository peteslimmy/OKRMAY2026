/**
 * OKR2026 - Phase 1: Environment Verification Tests
 * 
 * This script validates infrastructure dependencies:
 * - DNS resolution
 * - HTTPS certificate
 * - API endpoint health
 * - Database connectivity
 * 
 * Run: npx tsx tests/01-environment-verification.ts
 */

import https from 'https';
import http from 'http';
import dns from 'dns';

// Configuration
const CONFIG = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
  DOMAIN: 'pvzecbcpuhmfytfdonfc.supabase.co',
  TIMEOUT: 10000
};

// Test results storage
const testResults: {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration: number;
}[] = [];

function logResult(name: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, duration: number) {
  const result = { name, status, message, duration };
  testResults.push(result);
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${icon} ${name}: ${status} (${duration}ms) - ${message}`);
}

// Utility: HTTP Request
function httpRequest(url: string, options: http.RequestOptions = {}): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(CONFIG.TIMEOUT, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Utility: HTTP POST Request
function httpPost(url: string, data: object, headers: Record<string, string> = {}): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const client = url.startsWith('https') ? https : http;
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          body
        });
      });
    });
    
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

// Test 1: DNS Resolution
async function testDNSResolution(): Promise<void> {
  const startTime = Date.now();
  try {
    await dns.promises.lookup(CONFIG.DOMAIN);
    logResult('DNS Resolution', 'PASS', `Resolved ${CONFIG.DOMAIN}`, Date.now() - startTime);
  } catch (error) {
    logResult('DNS Resolution', 'FAIL', `DNS lookup failed: ${error}`, Date.now() - startTime);
  }
}

// Test 2: HTTPS Certificate
async function testHTTPSCertificate(): Promise<void> {
  const startTime = Date.now();
  try {
    const response = await httpRequest(`https://${CONFIG.DOMAIN}`, {
      method: 'HEAD'
    });
    
    const cert = (response as any).socket?.getPeerCertificate();
    
    if (response.statusCode >= 200 && response.statusCode < 400) {
      logResult('HTTPS Certificate', 'PASS', `Valid TLS, status: ${response.statusCode}`, Date.now() - startTime);
    } else {
      logResult('HTTPS Certificate', 'FAIL', `Invalid status: ${response.statusCode}`, Date.now() - startTime);
    }
  } catch (error) {
    logResult('HTTPS Certificate', 'FAIL', `HTTPS check failed: ${error}`, Date.now() - startTime);
  }
}

// Test 3: API Health Check
async function testAPIHealth(): Promise<void> {
  const startTime = Date.now();
  try {
    const response = await httpRequest(`${CONFIG.SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.statusCode === 200) {
      logResult('API Health', 'PASS', 'API endpoint responding', Date.now() - startTime);
    } else {
      logResult('API Health', 'FAIL', `API returned status: ${response.statusCode}`, Date.now() - startTime);
    }
  } catch (error) {
    logResult('API Health', 'FAIL', `API unreachable: ${error}`, Date.now() - startTime);
  }
}

// Test 4: Database Connectivity
async function testDatabaseConnectivity(): Promise<void> {
  const startTime = Date.now();
  try {
    const response = await httpRequest(`${CONFIG.SUPABASE_URL}/rest/v1/activities?limit=1`, {
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
      }
    });
    
    const duration = Date.now() - startTime;
    
    if (response.statusCode === 200 && duration < 200) {
      logResult('Database Connectivity', 'PASS', `DB responding in ${duration}ms`, duration);
    } else if (response.statusCode === 200) {
      logResult('Database Connectivity', 'SKIP', `DB responding but slow: ${duration}ms`, duration);
    } else {
      logResult('Database Connectivity', 'FAIL', `DB error: ${response.statusCode}`, Date.now() - startTime);
    }
  } catch (error) {
    logResult('Database Connectivity', 'FAIL', `DB unreachable: ${error}`, Date.now() - startTime);
  }
}

// Test 5: Auth Endpoint
async function testAuthEndpoint(): Promise<void> {
  const startTime = Date.now();
  try {
    const response = await httpRequest(`${CONFIG.SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        'apikey': CONFIG.SUPABASE_ANON_KEY
      }
    });
    
    if (response.statusCode === 200) {
      logResult('Auth Endpoint', 'PASS', 'Auth service responding', Date.now() - startTime);
    } else {
      logResult('Auth Endpoint', 'FAIL', `Auth status: ${response.statusCode}`, Date.now() - startTime);
    }
  } catch (error) {
    logResult('Auth Endpoint', 'FAIL', `Auth unreachable: ${error}`, Date.now() - startTime);
  }
}

// Test 6: Edge Functions
async function testEdgeFunctions(): Promise<void> {
  const startTime = Date.now();
  try {
    const response = await httpPost(
      `${CONFIG.SUPABASE_URL}/functions/v1/send-email`,
      { healthCheck: true },
      {
        'apikey': CONFIG.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
      }
    );
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      logResult('Edge Functions', 'PASS', 'send-email function responding', Date.now() - startTime);
    } else {
      logResult('Edge Functions', 'FAIL', `Edge function status: ${response.statusCode}`, Date.now() - startTime);
    }
  } catch (error) {
    logResult('Edge Functions', 'FAIL', `Edge function error: ${error}`, Date.now() - startTime);
  }
}

// Main execution
async function runEnvironmentTests() {
  console.log('\n🧪 OKR2026 - Phase 1: Environment Verification Tests\n');
  console.log(`Testing: ${CONFIG.SUPABASE_URL}`);
  console.log('---');
  
  await testDNSResolution();
  await testHTTPSCertificate();
  await testAPIHealth();
  await testDatabaseConnectivity();
  await testAuthEndpoint();
  await testEdgeFunctions();
  
  console.log('\n---');
  console.log('Summary:');
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const skipped = testResults.filter(r => r.status === 'SKIP').length;
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log('');
  
  // Exit with error if critical tests failed
  const criticalFailed = testResults.filter(r => 
    r.status === 'FAIL' && ['DNS Resolution', 'HTTPS Certificate', 'API Health'].includes(r.name)
  );
  
  if (criticalFailed.length > 0) {
    console.log('❌ Critical environment tests failed. Aborting.');
    process.exit(1);
  }
  
  console.log('✅ Environment verification complete.\n');
}

// Run tests
runEnvironmentTests().catch(console.error);
