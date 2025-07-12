// ===== LOAD TEST =====
// load-test.js - Tests normal expected load conditions
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
const testLatency = new Trend('load_test_latency');
const concurrentUsers = new Trend('concurrent_users');

export const options = {
    stages: [
        { duration: '5m', target: 100 },    // Ramp up to normal load
        { duration: '10m', target: 100 },   // Stay at normal load
        { duration: '5m', target: 0 }       // Ramp down
    ],
    thresholds: {
        'http_req_failed': ['rate<0.01'],         // Strict error rate
        'http_req_duration': ['p(95)<2000'],      // Standard response time
        'load_test_latency': ['p(95)<1500'],      // Load-specific threshold
        'concurrent_users': ['p(95)<110']         // Track concurrent users
    }
};

export default function () {
    group('Load Test Suite', function() {
        concurrentUsers.add(__VU);
        
        for (const endpoint of ENDPOINTS) {
            group(`Testing ${endpoint.name}`, function() {
                const res = http.get(endpoint.url, {
                    tags: { endpoint: endpoint.name, test_type: 'load' }
                });

                // Track metrics
                testLatency.add(res.timings.duration);

                // Health checks
                check(res, {
                    'status is 200': (r) => r.status === 200,
                    'response time < 2s': (r) => r.timings.duration < 2000,
                }, { endpoint: endpoint.name });

                // Enhanced error handling
                if (res.status !== 200) {
                    console.error(`[LOAD TEST] ${endpoint.name} failed: ${res.status}`);
                    console.error(`Response: ${res.body.substring(0, 200)}...`);
                    console.error(`Duration: ${res.timings.duration}ms`);
                    console.error(`Concurrent users: ${__VU}`);
                }

                sleep(1);
            });
        }
    });
}
