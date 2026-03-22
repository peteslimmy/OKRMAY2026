/**
 * OKR2026 - Phase 6: k6 Performance Tests
 * 
 * Load testing configuration:
 * - Normal load simulation
 * - Stress testing
 * - Spike testing
 * 
 * Install k6: https://k6.io/docs/getting-started/installation/
 * Run: k6 run tests/load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const authFailures = new Counter('auth_failures');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'https://pvzecbcpuhmfytfdonfc.supabase.co';
const ANON_KEY = __ENV.ANON_KEY || '';
const TEST_EMAIL = __ENV.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = __ENV.TEST_PASSWORD || 'TestPass!2026';

// Test options
export const options = {
    scenarios: {
        // Normal load test
        normal_load: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 50 },   // Ramp up to 50 users
                { duration: '1m', target: 50 },     // Steady at 50
                { duration: '30s', target: 100 },  // Increase to 100
                { duration: '1m', target: 100 },   // Steady at 100
                { duration: '30s', target: 0 },    // Ramp down
            ],
            gracefulRampDown: '30s',
        },

        // Stress test
        stress_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 200 },   // Ramp up to 200
                { duration: '2m', target: 200 },  // Stay at 200
                { duration: '1m', target: 500 },   // Increase to 500
                { duration: '2m', target: 500 },   // Stay at 500
                { duration: '30s', target: 0 },    // Ramp down
            ],
            gracefulRampDown: '30s',
        },

        // Spike test
        spike_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 10 },   // Baseline
                { duration: '30s', target: 500 },  // Spike to 500
                { duration: '1m', target: 500 },   // Stay at 500
                { duration: '10s', target: 10 },   // Back to baseline
                { duration: '10s', target: 0 },    // End
            ],
        },
    },

    // Thresholds for pass/fail
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'],  // 95% under 500ms
        http_req_failed: ['rate<0.01'],                    // Error rate < 1%
        http_req_duration: ['avg<200'],                   // Average < 200ms
        errors: ['rate<0.1'],                             // Error rate < 10%
    },
};

// Default function (used for single scenario)
export default function () {
    group('API Health Checks', () => {
        // Test 1: Root endpoint
        const rootRes = http.get(`${BASE_URL}/rest/v1/`, {
            headers: {
                'apikey': ANON_KEY,
            },
        });
        check(rootRes, {
            'root status is 200': (r) => r.status === 200,
        });
        apiLatency.add(rootRes.timings.duration);
        errorRate.add(rootRes.status !== 200);

        sleep(0.5);
    });

    group('Data Operations', () => {
        // Test 2: Fetch profiles
        const profilesRes = http.get(`${BASE_URL}/rest/v1/profiles?limit=10`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
            },
        });
        check(profilesRes, {
            'profiles status is 200': (r) => r.status === 200,
        });
        apiLatency.add(profilesRes.timings.duration);
        errorRate.add(profilesRes.status !== 200);

        sleep(0.3);

        // Test 3: Fetch activities
        const activitiesRes = http.get(`${BASE_URL}/rest/v1/activities?limit=10`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
            },
        });
        check(activitiesRes, {
            'activities status is 200': (r) => r.status === 200,
        });
        apiLatency.add(activitiesRes.timings.duration);
        errorRate.add(activitiesRes.status !== 200);

        sleep(0.3);

        // Test 4: Fetch business units
        const buRes = http.get(`${BASE_URL}/rest/v1/business_units?limit=10`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
            },
        });
        check(buRes, {
            'business units status is 200': (r) => r.status === 200,
        });
        apiLatency.add(buRes.timings.duration);
        errorRate.add(buRes.status !== 200);

        sleep(0.3);

        // Test 5: Fetch key results
        const krRes = http.get(`${BASE_URL}/rest/v1/key_results?limit=10`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`,
            },
        });
        check(krRes, {
            'key results status is 200': (r) => r.status === 200,
        });
        apiLatency.add(krRes.timings.duration);
        errorRate.add(krRes.status !== 200);
    });

    group('Authentication', () => {
        // Test 6: Auth settings
        const settingsRes = http.get(`${BASE_URL}/auth/v1/settings`, {
            headers: {
                'apikey': ANON_KEY,
            },
        });
        check(settingsRes, {
            'auth settings status is 200': (r) => r.status === 200,
        });
        apiLatency.add(settingsRes.timings.duration);

        sleep(0.5);
    });

    group('Edge Functions', () => {
        // Test 7: Send email function health
        const emailRes = http.post(
            `${BASE_URL}/functions/v1/send-email`,
            JSON.stringify({ healthCheck: true }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': ANON_KEY,
                    'Authorization': `Bearer ${ANON_KEY}`,
                },
            }
        );
        check(emailRes, {
            'edge function status is 200': (r) => r.status === 200 || r.status === 201,
        });
        apiLatency.add(emailRes.timings.duration);
        errorRate.add(emailRes.status !== 200 && emailRes.status !== 201);
    });

    sleep(1);
}

// Specific test scenarios
export function testApiLatency() {
    const res = http.get(`${BASE_URL}/rest/v1/activities?limit=1`, {
        headers: {
            'apikey': ANON_KEY,
        },
    });

    check(res, {
        'response time < 300ms': (r) => r.timings.duration < 300,
        'status is 200': (r) => r.status === 200,
    });

    apiLatency.add(res.timings.duration);
    errorRate.add(res.status !== 200);
}

export function testAuthEndpoint() {
    const res = http.post(
        `${BASE_URL}/auth/v1/token?grant_type=password`,
        JSON.stringify({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                'apikey': ANON_KEY,
            },
        }
    );

    if (res.status === 400) {
        authFailures.add(1);
    }

    check(res, {
        'auth responds': (r) => r.status === 200 || r.status === 400,
    });

    errorRate.add(res.status !== 200 && res.status !== 400);
}

export function testBulkReads() {
    // Simulate concurrent reads
    const urls = [
        `${BASE_URL}/rest/v1/profiles?limit=20`,
        `${BASE_URL}/rest/v1/activities?limit=20`,
        `${BASE_URL}/rest/v1/business_units?limit=20`,
        `${BASE_URL}/rest/v1/key_results?limit=20`,
    ];

    const results = http.batch(urls, {
        headers: {
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${ANON_KEY}`,
        },
    });

    results.forEach((res) => {
        check(res, {
            'bulk read success': (r) => r.status === 200,
        });
        errorRate.add(res.status !== 200);
    });
}

// Summary handler
export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'tests/summary.json': JSON.stringify(data),
    };
}

// Text summary formatter
function textSummary(data, options) {
    const indent = options.indent || '';
    let output = '\n' + indent + '=== k6 Load Test Summary ===\n\n';

    // Metrics
    output += indent + 'Metrics:\n';
    output += indent + `  HTTP Request Duration (avg): ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
    output += indent + `  HTTP Request Duration (p95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
    output += indent + `  HTTP Request Duration (p99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
    output += indent + `  Error Rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
    output += indent + `  Requests/sec: ${data.metrics.http_reqs.values.rate.toFixed(2)}\n`;

    // Checks
    output += '\n' + indent + 'Checks:\n';
    if (data.metrics.checks) {
        const checkPass = data.metrics.checks.values.passes;
        const checkFail = data.metrics.checks.values.failed;
        const total = checkPass + checkFail;
        const rate = total > 0 ? ((checkPass / total) * 100).toFixed(2) : '0.00';
        output += indent + `  Pass Rate: ${rate}%\n`;
    }

    return output;
}
