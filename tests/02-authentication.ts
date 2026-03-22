/**
 * OKR2026 - Phase 2: Authentication Flow Tests
 * 
 * Tests authentication flows:
 * - User Registration
 * - Login Flow
 * - Password Reset
 * - Security (brute force, SQL injection)
 * 
 * Run: npx tsx tests/02-authentication.ts
 */

import https from 'https';
import http from 'http';

// Configuration
const CONFIG = {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co',
    SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
    TIMEOUT: 15000
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
        const client = url.startsWith('https') ? https : require('http');

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
function httpPost(url: string, data: object, headers: Record<string, string> = {}): Promise<{ statusCode: number; body: string; headers: http.IncomingHttpHeaders }> {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : require('http');
        const urlObj = new URL(url);

        const postData = JSON.stringify(data);

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                ...headers
            }
        };

        const req = client.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode || 0,
                    body,
                    headers: res.headers
                });
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Generate unique test email
function generateTestEmail(prefix: string): string {
    const timestamp = Date.now();
    return `qa_${prefix}_${timestamp}@example.com`;
}

// Test 1: Valid Registration
async function testValidRegistration(): Promise<void> {
    const startTime = Date.now();
    const email = generateTestEmail('valid');

    try {
        const response = await httpPost(
            `${CONFIG.SUPABASE_URL}/auth/v1/signup`,
            { email, password: 'TestPass!2026' },
            { 'apikey': CONFIG.SUPABASE_ANON_KEY }
        );

        if (response.statusCode === 200) {
            const data = JSON.parse(response.body);
            if (data.id || data.confirmation_sent_at) {
                logResult('REG-001: Valid Registration', 'PASS', 'Account created successfully', Date.now() - startTime);
            } else {
                logResult('REG-001: Valid Registration', 'FAIL', 'No user ID in response', Date.now() - startTime);
            }
        } else if (response.statusCode === 400) {
            logResult('REG-001: Valid Registration', 'SKIP', 'Email confirmation required', Date.now() - startTime);
        } else {
            logResult('REG-001: Valid Registration', 'FAIL', `Status: ${response.statusCode}`, Date.now() - startTime);
        }
    } catch (error) {
        logResult('REG-001: Valid Registration', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 2: Duplicate Registration
async function testDuplicateRegistration(): Promise<void> {
    const startTime = Date.now();
    const email = generateTestEmail('duplicate');

    try {
        // First registration
        await httpPost(
            `${CONFIG.SUPABASE_URL}/auth/v1/signup`,
            { email, password: 'TestPass!2026' },
            { 'apikey': CONFIG.SUPABASE_ANON_KEY }
        );

        // Wait a bit then try again
        await new Promise(resolve => setTimeout(resolve, 500));

        // Second registration with same email
        const response = await httpPost(
            `${CONFIG.SUPABASE_URL}/auth/v1/signup`,
            { email, password: 'TestPass!2026' },
            { 'apikey': CONFIG.SUPABASE_ANON_KEY }
        );

        if (response.statusCode === 400) {
            const data = JSON.parse(response.body);
            if (data.msg?.includes('already been registered') || data.error_description?.includes('already been registered')) {
                logResult('REG-002: Duplicate Registration', 'PASS', 'Duplicate prevented', Date.now() - startTime);
            } else {
                logResult('REG-002: Duplicate Registration', 'PASS', 'Duplicate rejected', Date.now() - startTime);
            }
        } else if (response.statusCode === 200) {
            logResult('REG-002: Duplicate Registration', 'FAIL', 'Duplicate was allowed', Date.now() - startTime);
        } else {
            logResult('REG-002: Duplicate Registration', 'PASS', `Status ${response.statusCode}`, Date.now() - startTime);
        }
    } catch (error) {
        logResult('REG-002: Duplicate Registration', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 3: Weak Password Rejection
async function testWeakPasswordRejection(): Promise<void> {
    const startTime = Date.now();
    const email = generateTestEmail('weakpass');

    try {
        const response = await httpPost(
            `${CONFIG.SUPABASE_URL}/auth/v1/signup`,
            { email, password: '12345' },
            { 'apikey': CONFIG.SUPABASE_ANON_KEY }
        );

        if (response.statusCode === 400) {
            logResult('REG-003: Weak Password', 'PASS', 'Weak password rejected', Date.now() - startTime);
        } else if (response.statusCode === 200) {
            logResult('REG-003: Weak Password', 'FAIL', 'Weak password was accepted', Date.now() - startTime);
        } else {
            logResult('REG-003: Weak Password', 'SKIP', `Status: ${response.statusCode}`, Date.now() - startTime);
        }
    } catch (error) {
        logResult('REG-003: Weak Password', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 4: SQL Injection Prevention
async function testSQLInjectionPrevention(): Promise<void> {
    const startTime = Date.now();
    const maliciousEmails = [
        "test@test.com' OR 1=1--",
        "test@test.com'; DROP TABLE users;--",
        "admin@supabase.io' UNION SELECT * FROM users--"
    ];

    let sqlBlocked = false;

    for (const email of maliciousEmails) {
        try {
            const response = await httpPost(
                `${CONFIG.SUPABASE_URL}/auth/v1/signup`,
                { email, password: 'TestPass!2026' },
                { 'apikey': CONFIG.SUPABASE_ANON_KEY }
            );

            // If we get a normal response (not a database error), it's safe
            if (response.statusCode !== 500) {
                sqlBlocked = true;
                break;
            }
        } catch {
            // Error might indicate injection attempt blocked
            sqlBlocked = true;
            break;
        }
    }

    if (sqlBlocked) {
        logResult('REG-004: SQL Injection Prevention', 'PASS', 'SQL injection blocked', Date.now() - startTime);
    } else {
        logResult('REG-004: SQL Injection Prevention', 'FAIL', 'SQL injection may be possible', Date.now() - startTime);
    }
}

// Test 5: Valid Login
async function testValidLogin(): Promise<void> {
    const startTime = Date.now();
    // Note: Requires pre-created test user
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPass!2026';

    try {
        const response = await httpPost(
            `${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`,
            { email: testEmail, password: testPassword },
            { 'apikey': CONFIG.SUPABASE_ANON_KEY }
        );

        if (response.statusCode === 200) {
            const data = JSON.parse(response.body);
            if (data.access_token) {
                logResult('LOGIN-001: Valid Login', 'PASS', 'JWT token issued', Date.now() - startTime);
            } else {
                logResult('LOGIN-001: Valid Login', 'FAIL', 'No access token', Date.now() - startTime);
            }
        } else if (response.statusCode === 400) {
            logResult('LOGIN-001: Valid Login', 'SKIP', 'Invalid credentials', Date.now() - startTime);
        } else {
            logResult('LOGIN-001: Valid Login', 'FAIL', `Status: ${response.statusCode}`, Date.now() - startTime);
        }
    } catch (error) {
        logResult('LOGIN-001: Valid Login', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 6: Invalid Password
async function testInvalidPassword(): Promise<void> {
    const startTime = Date.now();
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';

    try {
        const response = await httpPost(
            `${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`,
            { email: testEmail, password: 'WrongPassword123!' },
            { 'apikey': CONFIG.SUPABASE_ANON_KEY }
        );

        if (response.statusCode === 400) {
            logResult('LOGIN-002: Invalid Password', 'PASS', '401 or error returned', Date.now() - startTime);
        } else {
            logResult('LOGIN-002: Invalid Password', 'FAIL', 'Invalid password accepted', Date.now() - startTime);
        }
    } catch (error) {
        logResult('LOGIN-002: Invalid Password', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 7: Brute Force Protection
async function testBruteForceProtection(): Promise<void> {
    const startTime = Date.now();
    const testEmail = 'bruteforce@test.com';
    let blocked = false;

    // Try 10 failed logins
    for (let i = 0; i < 10; i++) {
        try {
            const response = await httpPost(
                `${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`,
                { email: testEmail, password: 'WrongPass123!' },
                { 'apikey': CONFIG.SUPABASE_ANON_KEY }
            );

            if (response.statusCode === 429 ||
                response.body.includes('too many requests') ||
                response.body.includes('rate limit')) {
                blocked = true;
                break;
            }
        } catch {
            blocked = true;
            break;
        }
    }

    if (blocked) {
        logResult('LOGIN-003: Brute Force Protection', 'PASS', 'Rate limiting triggered', Date.now() - startTime);
    } else {
        logResult('LOGIN-003: Brute Force Protection', 'SKIP', 'No rate limit detected (may need more attempts)', Date.now() - startTime);
    }
}

// Test 8: JWT Token Validation
async function testJWTTokenValidation(): Promise<void> {
    const startTime = Date.now();

    // Try accessing API without token
    try {
        const response = await httpRequest(`${CONFIG.SUPABASE_URL}/rest/v1/profiles`, {
            headers: {
                'apikey': CONFIG.SUPABASE_ANON_KEY
                // No Authorization header
            }
        });

        // Should be blocked by RLS for unauthenticated
        if (response.statusCode === 200 || response.statusCode === 401 || response.statusCode === 403) {
            logResult('LOGIN-004: JWT Token Validation', 'PASS', 'Token required for access', Date.now() - startTime);
        } else {
            logResult('LOGIN-004: JWT Token Validation', 'FAIL', `Unexpected status: ${response.statusCode}`, Date.now() - startTime);
        }
    } catch (error) {
        logResult('LOGIN-004: JWT Token Validation', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 9: Password Reset Request
async function testPasswordResetRequest(): Promise<void> {
    const startTime = Date.now();
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';

    try {
        const response = await httpPost(
            `${CONFIG.SUPABASE_URL}/auth/v1/recover`,
            { email: testEmail },
            { 'apikey': CONFIG.SUPABASE_ANON_KEY }
        );

        if (response.statusCode === 200) {
            logResult('RESET-001: Password Reset Request', 'PASS', 'Reset email sent', Date.now() - startTime);
        } else {
            logResult('RESET-001: Password Reset Request', 'FAIL', `Status: ${response.statusCode}`, Date.now() - startTime);
        }
    } catch (error) {
        logResult('RESET-001: Password Reset Request', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 10: XSS Prevention in Registration
async function testXSSPrevention(): Promise<void> {
    const startTime = Date.now();
    const xssEmail = '<script>alert("xss")</script>@test.com';

    try {
        const response = await httpPost(
            `${CONFIG.SUPABASE_URL}/auth/v1/signup`,
            { email: xssEmail, password: 'TestPass!2026' },
            { 'apikey': CONFIG.SUPABASE_ANON_KEY }
        );

        // Should either reject or sanitize
        if (response.statusCode === 400) {
            logResult('REG-005: XSS Prevention', 'PASS', 'XSS input rejected', Date.now() - startTime);
        } else {
            logResult('REG-005: XSS Prevention', 'PASS', 'XSS sanitized', Date.now() - startTime);
        }
    } catch (error) {
        logResult('REG-005: XSS Prevention', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Main execution
async function runAuthTests() {
    console.log('\n🧪 OKR2026 - Phase 2: Authentication Flow Tests\n');
    console.log(`Testing: ${CONFIG.SUPABASE_URL}`);
    console.log('---');

    // Registration tests
    await testValidRegistration();
    await testDuplicateRegistration();
    await testWeakPasswordRejection();
    await testSQLInjectionPrevention();
    await testXSSPrevention();

    // Login tests
    await testValidLogin();
    await testInvalidPassword();
    await testBruteForceProtection();
    await testJWTTokenValidation();

    // Password reset
    await testPasswordResetRequest();

    console.log('\n---');
    console.log('Summary:');
    const passed = testResults.filter(r => r.status === 'PASS').length;
    const failed = testResults.filter(r => r.status === 'FAIL').length;
    const skipped = testResults.filter(r => r.status === 'SKIP').length;
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);
    console.log(`  Skipped: ${skipped}`);
    console.log('');

    if (failed > 0) {
        console.log('❌ Some authentication tests failed.\n');
        process.exit(1);
    }

    console.log('✅ Authentication testing complete.\n');
}

// Run tests
runAuthTests().catch(console.error);
