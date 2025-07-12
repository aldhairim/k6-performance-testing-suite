// ===== STRESS TEST =====
// stress-test.js - Tests beyond normal capacity to find breaking point
import http from 'k6/http';
import { sleep } from 'k6';
import { check, group } from 'k6';
import { Trend } from 'k6/metrics';

// Common configuration
const ENDPOINTS = [
    { url: 'https://test.k6.io', name: 'homepage' },
    { url: 'https://quickpizza.grafana.com/', name: 'contact' },
    { url: 'https://test.k6.io/news.php', name: 'news' }
];

// Create custom metrics
const testLatency = new Trend('stress_test_latency');
const concurrentUsers = new Trend('concurrent_users');

export const options = {
    stages: [
        { duration: '5m', target: 100 },     // Ramp up to normal
        { duration: '10m', target: 400 },    // Ramp up to stress level
        { duration: '10m', target: 400 },    // Stay at stress level
        { duration: '5m', target: 100 },     // Ramp down to normal
        { duration: '5m', target: 0 }        // Ramp down to zero
    ],
    thresholds: {
        'http_req_failed': ['rate<0.05'],         // More lenient error rate
        'http_req_duration': ['p(95)<5000'],      // Higher response time tolerance
        'stress_test_latency': ['p(95)<4000'],    // Stress-specific threshold
        'concurrent_users': ['p(95)<450']         // Track concurrent users
    }
};

export default function () {
    group('Stress Test Suite', function() {
        concurrentUsers.add(__VU);
        
        for (const endpoint of ENDPOINTS) {
            group(`Testing ${endpoint.name}`, function() {
                const res = http.get(endpoint.url, {
                    tags: { endpoint: endpoint.name, test_type: 'stress' }
                });

                // Track metrics
                testLatency.add(res.timings.duration);

                // Health checks
                check(res, {
                    'status is 200': (r) => r.status === 200,
                    'response time < 5s': (r) => r.timings.duration < 5000,
                }, { endpoint: endpoint.name });

                // Enhanced error handling
                if (res.status !== 200) {
                    console.error(`[STRESS TEST] ${endpoint.name} failed: ${res.status}`);
                    console.error(`Response: ${res.body.substring(0, 200)}...`);
                    console.error(`Duration: ${res.timings.duration}ms`);
                    console.error(`Concurrent users: ${__VU}`);
                }

                sleep(0.5); // Reduced sleep for stress testing
            });
        }
    });
}