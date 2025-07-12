// ===== SOAK TEST =====
// soak-test.js - Tests system stability over extended periods
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
const testLatency = new Trend('soak_test_latency');
const concurrentUsers = new Trend('concurrent_users');

export const options = {
    stages: [
        { duration: '5m', target: 400 },     // Ramp up to soak level
        { duration: '6h', target: 400 },     // Soak for 6 hours
        { duration: '5m', target: 0 }        // Ramp down
    ],
    thresholds: {
        'http_req_failed': ['rate<0.05'],         // Allow some failures over time
        'http_req_duration': ['p(95)<4000'],      // More lenient response times
        'soak_test_latency': ['p(95)<3500'],      // Soak-specific threshold
        'concurrent_users': ['p(95)<450']         // Track concurrent users
    }
};

export default function () {
    group('Soak Test Suite', function() {
        concurrentUsers.add(__VU);
        
        for (const endpoint of ENDPOINTS) {
            group(`Testing ${endpoint.name}`, function() {
                const res = http.get(endpoint.url, {
                    tags: { endpoint: endpoint.name, test_type: 'soak' }
                });

                // Track metrics
                testLatency.add(res.timings.duration);

                // Health checks
                check(res, {
                    'status is 200': (r) => r.status === 200,
                    'response time < 4s': (r) => r.timings.duration < 4000,
                }, { endpoint: endpoint.name });

                // Enhanced error handling
                if (res.status !== 200) {
                    console.error(`[SOAK TEST] ${endpoint.name} failed: ${res.status}`);
                    console.error(`Response: ${res.body.substring(0, 200)}...`);
                    console.error(`Duration: ${res.timings.duration}ms`);
                    console.error(`Concurrent users: ${__VU}`);
                }

                sleep(1);
            });
        }
    });
}