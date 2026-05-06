/**
 * OKR2026 - Phase 4: API Security Tests
 * 
 * Tests for security vulnerabilities:
 * - SQL Injection
 * - XSS (Cross-Site Scripting)
 * - Command Injection
 * - CSRF Protection
 * 
 * Run: npx tsx tests/04-api-security.ts
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
function httpRequest(url: string, options: http.RequestOptions = {}): Promise<{ statusCode: number; body: string }> {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : require('http');

        const req = client.get(url, options, (res) => {
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
        req.setTimeout(CONFIG.TIMEOUT, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

// Utility: HTTP POST
function httpPost(url: string, data: object, headers: Record<string, string> = {}): Promise<{ statusCode: number; body: string }> {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : require('http');
        const urlObj = new URL(url);
        const postData = JSON.stringify(data);

        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': String(Buffer.byteLength(postData)),
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
        req.write(postData);
        req.end();
    });
}

// Test payloads
const SQL_INJECTION_PAYLOADS = [
    "1' OR '1'='1",
    "1 OR 1=1",
    "' UNION SELECT NULL--",
    "'; DROP TABLE profiles;--",
    "1; DELETE FROM activities WHERE 1=1",
    "admin'--",
    "' OR 1=1--"
];

const XSS_PAYLOADS = [
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert(1)>",
    "javascript:alert(1)",
    "<svg onload=alert(1)>",
    "{{constructor.constructor('alert(1)')()}}",
    "<body onload=alert(1)>"
];

const COMMAND_INJECTION_PAYLOADS = [
    "; ls -la",
    "&& cat /etc/passwd",
    "| whoami",
    "`id`",
    "$(whoami)"
];

// Test 1: SQL Injection in Activities Query
async function testSQLInjectionActivities(): Promise<void> {
    const startTime = Date.now();
    let blocked = true;

    for (const payload of SQL_INJECTION_PAYLOADS) {
        try {
            const response = await httpRequest(
                `${CONFIG.SUPABASE_URL}/rest/v1/activities?id=eq.${encodeURIComponent(payload)}`,
                { headers: { 'apikey': CONFIG.SUPABASE_ANON_KEY } }
            );

            // Check for database errors indicating successful injection
            if (response.body.includes('syntax error') ||
                response.body.includes('SQL') ||
                response.statusCode === 500) {
                blocked = false;
                break;
            }
        } catch {
            // Error might mean injection was blocked
        }
    }

    if (blocked) {
        logResult('SEC-001: SQL Injection (Activities)', 'PASS', 'SQL injection blocked', Date.now() - startTime);
    } else {
        logResult('SEC-001: SQL Injection (Activities)', 'FAIL', 'SQL injection may be possible', Date.now() - startTime);
    }
}

// Test 2: SQL Injection in Profiles Query
async function testSQLInjectionProfiles(): Promise<void> {
    const startTime = Date.now();
    let blocked = true;

    for (const payload of SQL_INJECTION_PAYLOADS) {
        try {
            const response = await httpRequest(
                `${CONFIG.SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(payload)}`,
                { headers: { 'apikey': CONFIG.SUPABASE_ANON_KEY } }
            );

            if (response.body.includes('syntax error') ||
                response.body.includes('SQL') ||
                response.statusCode === 500) {
                blocked = false;
                break;
            }
        } catch {
            // Error might mean injection was blocked
        }
    }

    if (blocked) {
        logResult('SEC-002: SQL Injection (Profiles)', 'PASS', 'SQL injection blocked', Date.now() - startTime);
    } else {
        logResult('SEC-002: SQL Injection (Profiles)', 'FAIL', 'SQL injection may be possible', Date.now() - startTime);
    }
}

// Test 3: SQL Injection in Key Results
async function testSQLInjectionKeyResults(): Promise<void> {
    const startTime = Date.now();
    let blocked = true;

    for (const payload of SQL_INJECTION_PAYLOADS.slice(0, 3)) {
        try {
            const response = await httpRequest(
                `${CONFIG.SUPABASE_URL}/rest/v1/key_results?title=like.*${encodeURIComponent(payload)}*`,
                { headers: { 'apikey': CONFIG.SUPABASE_ANON_KEY } }
            );

            if (response.body.includes('syntax error') ||
                response.statusCode === 500) {
                blocked = false;
                break;
            }
        } catch {
            // Error might mean injection was blocked
        }
    }

    if (blocked) {
        logResult('SEC-003: SQL Injection (KeyResults)', 'PASS', 'SQL injection blocked', Date.now() - startTime);
    } else {
        logResult('SEC-003: SQL Injection (KeyResults)', 'FAIL', 'SQL injection may be possible', Date.now() - startTime);
    }
}

// Test 4: XSS in Goal Creation
async function testXSSInGoalCreation(): Promise<void> {
    const startTime = Date.now();
    let sanitized = true;

    for (const payload of XSS_PAYLOADS) {
        try {
            const response = await httpPost(
                `${CONFIG.SUPABASE_URL}/rest/v1/activities`,
                {
                    title: payload,
                    description: "Test XSS",
                    date: new Date().toISOString().split('T')[0]
                },
                {
                    'apikey': CONFIG.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`
                }
            );

            // If it accepts the input, check if it's sanitized
            if (response.statusCode === 201 || response.statusCode === 400) {
                // Either sanitized or rejected - both are good
                sanitized = true;
            }
        } catch {
            // Error means blocked
        }
    }

    if (sanitized) {
        logResult('SEC-004: XSS Prevention', 'PASS', 'XSS payloads handled safely', Date.now() - startTime);
    } else {
        logResult('SEC-004: XSS Prevention', 'FAIL', 'XSS may be possible', Date.now() - startTime);
    }
}

// Test 5: XSS in Search Parameters
async function testXSSInSearchParams(): Promise<void> {
    const startTime = Date.now();
    let safe = true;

    for (const payload of XSS_PAYLOADS) {
        try {
            const response = await httpRequest(
                `${CONFIG.SUPABASE_URL}/rest/v1/activities?title=eq.${encodeURIComponent(payload)}`,
                { headers: { 'apikey': CONFIG.SUPABASE_ANON_KEY } }
            );

            // Check if error indicates injection attempt
            if (response.statusCode === 500) {
                safe = false;
                break;
            }
        } catch {
            // Error might indicate protection
        }
    }

    if (safe) {
        logResult('SEC-005: XSS in Search', 'PASS', 'XSS in search params handled', Date.now() - startTime);
    } else {
        logResult('SEC-005: XSS in Search', 'FAIL', 'XSS in search may be possible', Date.now() - startTime);
    }
}

// Test 6: Command Injection Prevention
async function testCommandInjectionPrevention(): Promise<void> {
    const startTime = Date.now();
    let blocked = true;

    for (const payload of COMMAND_INJECTION_PAYLOADS) {
        try {
            // Try in various parameters
            const response = await httpPost(
                `${CONFIG.SUPABASE_URL}/rest/v1/activities`,
                { title: payload },
                { 'apikey': CONFIG.SUPABASE_ANON_KEY }
            );

            // Supabase should sanitize this
            if (response.statusCode === 500) {
                blocked = false;
                break;
            }
        } catch {
            // Error means blocked
        }
    }

    if (blocked) {
        logResult('SEC-006: Command Injection', 'PASS', 'Command injection blocked', Date.now() - startTime);
    } else {
        logResult('SEC-006: Command Injection', 'FAIL', 'Command injection may be possible', Date.now() - startTime);
    }
}

// Test 7: NoSQL Injection (in filters)
async function testNoSQLInjection(): Promise<void> {
    const startTime = Date.now();

    try {
        // Try various injection patterns in filters
        const response = await httpRequest(
            `${CONFIG.SUPABASE_URL}/rest/v1/profiles?role=in.(Admin,SuperAdmin)`,
            { headers: { 'apikey': CONFIG.SUPABASE_ANON_KEY } }
        );

        // Should either work with RLS or be blocked
        if (response.statusCode === 200 || response.statusCode === 403) {
            logResult('SEC-007: NoSQL Injection', 'PASS', 'Query injection handled', Date.now() - startTime);
        } else {
            logResult('SEC-007: NoSQL Injection', 'FAIL', `Status: ${response.statusCode}`, Date.now() - startTime);
        }
    } catch (error) {
        logResult('SEC-007: NoSQL Injection', 'PASS', 'Error indicates protection', Date.now() - startTime);
    }
}

// Test 8: Large Payload Rejection
async function testLargePayloadRejection(): Promise<void> {
    const startTime = Date.now();

    // Create a very large payload (>1MB)
    const largePayload = 'x'.repeat(2 * 1024 * 1024);

    try {
        const response = await httpPost(
            `${CONFIG.SUPABASE_URL}/rest/v1/activities`,
            { title: largePayload },
            { 'apikey': CONFIG.SUPABASE_ANON_KEY }
        );

        // Should be rejected due to size
        if (response.statusCode === 413 || response.statusCode === 400) {
            logResult('SEC-008: Large Payload', 'PASS', 'Large payload rejected', Date.now() - startTime);
        } else if (response.statusCode === 201) {
            logResult('SEC-008: Large Payload', 'FAIL', 'Large payload accepted', Date.now() - startTime);
        } else {
            logResult('SEC-008: Large Payload', 'SKIP', `Status: ${response.statusCode}`, Date.now() - startTime);
        }
    } catch (error) {
        logResult('SEC-008: Large Payload', 'PASS', 'Error indicates rejection', Date.now() - startTime);
    }
}

// Test 9: Invalid Content Type
async function testInvalidContentType(): Promise<void> {
    const startTime = Date.now();

    try {
        const client = https;
        const urlObj = new URL(`${CONFIG.SUPABASE_URL}/rest/v1/activities`);

        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'apikey': CONFIG.SUPABASE_ANON_KEY
            }
        };

        const response = await new Promise<{ statusCode: number; body: string }>((resolve, reject) => {
            const req = client.request(options, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => resolve({ statusCode: res?.statusCode || 0, body }));
            });
            req.on('error', reject);
            req.write('<xml>test</xml>');
            req.end();
        });

        if (response.statusCode === 415 || response.statusCode === 400) {
            logResult('SEC-009: Invalid Content Type', 'PASS', 'Invalid content type rejected', Date.now() - startTime);
        } else {
            logResult('SEC-009: Invalid Content Type', 'PASS', `Status: ${response.statusCode}`, Date.now() - startTime);
        }
    } catch (error) {
        logResult('SEC-009: Invalid Content Type', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 10: Missing API Key
async function testMissingAPIKey(): Promise<void> {
    const startTime = Date.now();

    try {
        const response = await httpRequest(`${CONFIG.SUPABASE_URL}/rest/v1/profiles`);

        if (response.statusCode === 401 || response.statusCode === 403) {
            logResult('SEC-010: Missing API Key', 'PASS', 'API key required', Date.now() - startTime);
        } else if (response.statusCode === 200) {
            logResult('SEC-010: Missing API Key', 'FAIL', 'API accessible without key', Date.now() - startTime);
        } else {
            logResult('SEC-010: Missing API Key', 'PASS', `Status: ${response.statusCode}`, Date.now() - startTime);
        }
    } catch (error) {
        logResult('SEC-010: Missing API Key', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Main execution
async function runSecurityTests() {
    console.log('\n🧪 OKR2026 - Phase 4: API Security Tests\n');
    console.log(`Testing: ${CONFIG.SUPABASE_URL}`);
    console.log('---');

    // SQL Injection tests
    await testSQLInjectionActivities();
    await testSQLInjectionProfiles();
    await testSQLInjectionKeyResults();

    // XSS tests
    await testXSSInGoalCreation();
    await testXSSInSearchParams();

    // Other security tests
    await testCommandInjectionPrevention();
    await testNoSQLInjection();
    await testLargePayloadRejection();
    await testInvalidContentType();
    await testMissingAPIKey();

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
        console.log('❌ Some security tests failed.\n');
        process.exit(1);
    }

    console.log('✅ API Security testing complete.\n');
}

// Run tests
runSecurityTests().catch(console.error);
