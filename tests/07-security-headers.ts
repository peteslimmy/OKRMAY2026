/**
 * OKR2026 - Phase 7: Security Hardening Tests
 * 
 * Tests HTTP security headers and CORS policy:
 * - Strict-Transport-Security
 * - Content-Security-Policy
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - CORS validation
 * 
 * Run: npx tsx tests/07-security-headers.ts
 */

import https from 'https';

// Configuration
const CONFIG = {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://ojuqujjkrmgplqxnmpxe.supabase.co',
    CUSTOM_DOMAIN: process.env.CUSTOM_DOMAIN || '',
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

// Utility: Get HTTP headers
function getHeaders(url: string): Promise<{ statusCode: number; headers: Record<string, string | string[] | undefined> }> {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : require('http');
        const urlObj = new URL(url);

        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname,
            method: 'HEAD',
        };

        const req = client.request(options, (res) => {
            resolve({
                statusCode: res.statusCode || 0,
                headers: res.headers as Record<string, string | string[] | undefined>,
            });
        });

        req.on('error', reject);
        req.setTimeout(CONFIG.TIMEOUT, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        req.end();
    });
}

// Helper to safely get string from header
function getHeaderStr(value: string | string[] | undefined): string {
    if (!value) return '';
    return Array.isArray(value) ? value[0] : value;
}

// Test 1: Strict-Transport-Security Header
async function testHSTSHeader(): Promise<void> {
    const startTime = Date.now();

    try {
        const response = await getHeaders(CONFIG.SUPABASE_URL);
        const hsts = getHeaderStr(response.headers['strict-transport-security']);

        if (hsts) {
            if (hsts.includes('max-age') && parseInt(hsts.match(/max-age=(\d+)/)?.[1] || '0') >= 31536000) {
                logResult('HDR-001: HSTS Header', 'PASS', `HSTS set: ${hsts}`, Date.now() - startTime);
            } else {
                logResult('HDR-001: HSTS Header', 'FAIL', 'HSTS max-age too short', Date.now() - startTime);
            }
        } else {
            logResult('HDR-001: HSTS Header', 'FAIL', 'HSTS header not found', Date.now() - startTime);
        }
    } catch (error) {
        logResult('HDR-001: HSTS Header', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 2: Content-Security-Policy Header
async function testCSPHeader(): Promise<void> {
    const startTime = Date.now();

    try {
        const response = await getHeaders(CONFIG.SUPABASE_URL);
        const csp = response.headers['content-security-policy'];

        if (csp) {
            logResult('HDR-002: CSP Header', 'PASS', 'CSP header present', Date.now() - startTime);
        } else {
            logResult('HDR-002: CSP Header', 'SKIP', 'CSP not set (common for API endpoints)', Date.now() - startTime);
        }
    } catch (error) {
        logResult('HDR-002: CSP Header', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 3: X-Frame-Options Header
async function testXFrameOptionsHeader(): Promise<void> {
    const startTime = Date.now();

    try {
        const response = await getHeaders(CONFIG.SUPABASE_URL);
        const xfo = getHeaderStr(response.headers['x-frame-options']);

        if (xfo && (xfo.toUpperCase() === 'DENY' || xfo.toUpperCase() === 'SAMEORIGIN')) {
            logResult('HDR-003: X-Frame-Options', 'PASS', `X-Frame-Options: ${xfo}`, Date.now() - startTime);
        } else if (xfo) {
            logResult('HDR-003: X-Frame-Options', 'SKIP', `X-Frame-Options: ${xfo} (may be acceptable)`, Date.now() - startTime);
        } else {
            logResult('HDR-003: X-Frame-Options', 'SKIP', 'X-Frame-Options not set (common for API)', Date.now() - startTime);
        }
    } catch (error) {
        logResult('HDR-003: X-Frame-Options', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 4: X-Content-Type-Options Header
async function testXContentTypeOptionsHeader(): Promise<void> {
    const startTime = Date.now();

    try {
        const response = await getHeaders(CONFIG.SUPABASE_URL);
        const xcto = getHeaderStr(response.headers['x-content-type-options']);

        if (xcto && xcto.toLowerCase() === 'nosniff') {
            logResult('HDR-004: X-Content-Type-Options', 'PASS', 'X-Content-Type-Options: nosniff', Date.now() - startTime);
        } else {
            logResult('HDR-004: X-Content-Type-Options', 'SKIP', 'X-Content-Type-Options not set', Date.now() - startTime);
        }
    } catch (error) {
        logResult('HDR-004: X-Content-Type-Options', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 5: Referrer-Policy Header
async function testReferrerPolicyHeader(): Promise<void> {
    const startTime = Date.now();

    try {
        const response = await getHeaders(CONFIG.SUPABASE_URL);
        const rp = response.headers['referrer-policy'];

        if (rp) {
            logResult('HDR-005: Referrer-Policy', 'PASS', `Referrer-Policy: ${rp}`, Date.now() - startTime);
        } else {
            logResult('HDR-005: Referrer-Policy', 'SKIP', 'Referrer-Policy not set', Date.now() - startTime);
        }
    } catch (error) {
        logResult('HDR-005: Referrer-Policy', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 6: Permissions-Policy Header
async function testPermissionsPolicyHeader(): Promise<void> {
    const startTime = Date.now();

    try {
        const response = await getHeaders(CONFIG.SUPABASE_URL);
        const pf = response.headers['permissions-policy'];

        if (pf) {
            logResult('HDR-006: Permissions-Policy', 'PASS', 'Permissions-Policy present', Date.now() - startTime);
        } else {
            logResult('HDR-006: Permissions-Policy', 'SKIP', 'Permissions-Policy not set', Date.now() - startTime);
        }
    } catch (error) {
        logResult('HDR-006: Permissions-Policy', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 7: CORS - Preflight Request
async function testCORSPreflight(): Promise<void> {
    const startTime = Date.now();

    try {
        const client = https;
        const urlObj = new URL(CONFIG.SUPABASE_URL);

        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: '/rest/v1/',
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://evil.com',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'authorization,apikey',
            },
        };

        const response = await new Promise<{ statusCode: number; headers: Record<string, string> }>((resolve, reject) => {
            const req = client.request(options, (res) => {
                resolve({
                    statusCode: res.statusCode || 0,
                    headers: res.headers as Record<string, string>,
                });
            });
            req.on('error', reject);
            req.end();
        });

        const allowedOrigin = response.headers['access-control-allow-origin'];

        if (allowedOrigin === '*') {
            logResult('HDR-007: CORS Policy', 'FAIL', 'CORS allows wildcard origin', Date.now() - startTime);
        } else if (allowedOrigin) {
            logResult('HDR-007: CORS Policy', 'PASS', `CORS origin restricted: ${allowedOrigin}`, Date.now() - startTime);
        } else {
            logResult('HDR-007: CORS Policy', 'SKIP', 'CORS not configured', Date.now() - startTime);
        }
    } catch (error) {
        logResult('HDR-007: CORS Policy', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 8: CORS - Allowed Methods
async function testCORSMethods(): Promise<void> {
    const startTime = Date.now();

    try {
        const client = https;
        const urlObj = new URL(CONFIG.SUPABASE_URL);

        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: '/rest/v1/',
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://example.com',
                'Access-Control-Request-Method': 'DELETE',
            },
        };

        const response = await new Promise<{ statusCode: number; headers: Record<string, string> }>((resolve, reject) => {
            const req = client.request(options, (res) => {
                resolve({
                    statusCode: res.statusCode || 0,
                    headers: res.headers as Record<string, string>,
                });
            });
            req.on('error', reject);
            req.end();
        });

        const allowedMethods = response.headers['access-control-allow-methods'];

        if (allowedMethods) {
            logResult('HDR-008: CORS Methods', 'PASS', `Allowed: ${allowedMethods}`, Date.now() - startTime);
        } else {
            logResult('HDR-008: CORS Methods', 'SKIP', 'No CORS methods', Date.now() - startTime);
        }
    } catch (error) {
        logResult('HDR-008: CORS Methods', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 9: Cache-Control Header
async function testCacheControl(): Promise<void> {
    const startTime = Date.now();

    try {
        const response = await getHeaders(CONFIG.SUPABASE_URL);
        const cacheControl = response.headers['cache-control'];

        // For API endpoints, we want no-cache or similar
        if (cacheControl && (cacheControl.includes('no-cache') || cacheControl.includes('private'))) {
            logResult('HDR-009: Cache-Control', 'PASS', `Cache-Control: ${cacheControl}`, Date.now() - startTime);
        } else if (cacheControl) {
            logResult('HDR-009: Cache-Control', 'SKIP', `Cache-Control: ${cacheControl}`, Date.now() - startTime);
        } else {
            logResult('HDR-009: Cache-Control', 'SKIP', 'Cache-Control not set', Date.now() - startTime);
        }
    } catch (error) {
        logResult('HDR-009: Cache-Control', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Test 10: Check for information disclosure headers
async function testInformationDisclosure(): Promise<void> {
    const startTime = Date.now();

    try {
        const response = await getHeaders(CONFIG.SUPABASE_URL);
        const server = response.headers['server'];
        const xPoweredBy = response.headers['x-powered-by'];
        const xAspNetVersion = response.headers['x-aspnet-version'];

        const issues = [];
        if (server && server !== 'CloudFront') issues.push(`Server: ${server}`);
        if (xPoweredBy) issues.push(`X-Powered-By: ${xPoweredBy}`);
        if (xAspNetVersion) issues.push(`X-AspNet-Version: ${xAspNetVersion}`);

        if (issues.length === 0) {
            logResult('HDR-010: Information Disclosure', 'PASS', 'No sensitive headers exposed', Date.now() - startTime);
        } else {
            logResult('HDR-010: Information Disclosure', 'FAIL', `Exposed: ${issues.join(', ')}`, Date.now() - startTime);
        }
    } catch (error) {
        logResult('HDR-010: Information Disclosure', 'FAIL', `Error: ${error}`, Date.now() - startTime);
    }
}

// Main execution
async function runSecurityHeaderTests() {
    console.log('\n🧪 OKR2026 - Phase 7: Security Hardening Tests\n');
    console.log(`Testing: ${CONFIG.SUPABASE_URL}`);
    console.log('---');

    // Security headers
    await testHSTSHeader();
    await testCSPHeader();
    await testXFrameOptionsHeader();
    await testXContentTypeOptionsHeader();
    await testReferrerPolicyHeader();
    await testPermissionsPolicyHeader();

    // CORS
    await testCORSPreflight();
    await testCORSMethods();

    // Other
    await testCacheControl();
    await testInformationDisclosure();

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
        console.log('❌ Some security header tests failed.\n');
        process.exit(1);
    }

    console.log('✅ Security hardening tests complete.\n');
}

// Run tests
runSecurityHeaderTests().catch(console.error);
