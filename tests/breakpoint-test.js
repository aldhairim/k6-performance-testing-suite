// ===== BREAKPOINT TEST =====
// breakpoint-test.js - Gradually increases load to find system limits
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
const testLatency = new Trend('breakpoint_test_latency');
const concurrentUsers = new Trend('concurrent_users');

export const options = {
    stages: [
        { duration: '2h', target: 10000 }    // Gradual increase to find breakpoint
    ],
    thresholds: {
        'http_req_failed': ['rate<0.02'],         // Low error tolerance initially
        'http_req_duration': ['p(95)<3000'],      // Moderate response time
        'breakpoint_test_latency': ['p(95)<2500'], // Breakpoint-specific threshold
        'concurrent_users': ['p(95)<11000']       // Track concurrent users
    }
};

export default function () {
    group('Breakpoint Test Suite', function() {
        concurrentUsers.add(__VU);
        
        for (const endpoint of ENDPOINTS) {
            group(`Testing ${endpoint.name}`, function() {
                const res = http.get(endpoint.url, {
                    tags: { endpoint: endpoint.name, test_type: 'breakpoint' }
                });

                // Track metrics
                testLatency.add(res.timings.duration);

                // Health checks
                check(res, {
                    'status is 200': (r) => r.status === 200,
                    'response time < 3s': (r) => r.timings.duration < 3000,
                }, { endpoint: endpoint.name });

                // Enhanced error handling
                if (res.status !== 200) {
                    console.error(`[BREAKPOINT TEST] ${endpoint.name} failed: ${res.status}`);
                    console.error(`Response: ${res.body.substring(0, 200)}...`);
                    console.error(`Duration: ${res.timings.duration}ms`);
                    console.error(`Concurrent users: ${__VU}`);
                }

                sleep(1);
            });
        }
    });
}