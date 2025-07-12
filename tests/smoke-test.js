// ===== SMOKE TEST =====
// smoke-test.js - Validates basic functionality with minimal load
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
const testLatency = new Trend('smoke_test_latency');
const concurrentUsers = new Trend('concurrent_users');

export const options = {
    vus: 1,
    duration: '30s',
    thresholds: {
        'http_req_failed': ['rate<0.01'],         // Very strict error rate
        'http_req_duration': ['p(95)<2000'],      // Standard response time
        'smoke_test_latency': ['p(95)<1000'],     // Smoke-specific threshold
        'concurrent_users': ['p(95)<2']           // Track concurrent users
    }
};

export default function () {
    group('Smoke Test Suite', function() {
        concurrentUsers.add(__VU);
        
        for (const endpoint of ENDPOINTS) {
            group(`Testing ${endpoint.name}`, function() {
                const res = http.get(endpoint.url, {
                    tags: { endpoint: endpoint.name, test_type: 'smoke' }
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
                    console.error(`[SMOKE TEST] ${endpoint.name} failed: ${res.status}`);
                    console.error(`Response: ${res.body.substring(0, 200)}...`);
                    console.error(`Duration: ${res.timings.duration}ms`);
                }

                sleep(1);
            });
        }
    });
}