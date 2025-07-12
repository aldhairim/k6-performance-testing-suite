// ===== SPIKE TEST =====
// spike-test.js - Tests sudden load increases
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
const testLatency = new Trend('spike_test_latency');
const concurrentUsers = new Trend('concurrent_users');

export const options = {
    stages: [
        { duration: '2m', target: 100 },     // Normal load
        { duration: '1m', target: 1000 },    // Spike up quickly
        { duration: '3m', target: 1000 },    // Stay at spike
        { duration: '2m', target: 100 },     // Spike down
        { duration: '2m', target: 0 }        // Ramp down
    ],
    thresholds: {
        'http_req_failed': ['rate<0.1'],          // More lenient during spike
        'http_req_duration': ['p(95)<3000'],      // Moderate response time tolerance
        'spike_test_latency': ['p(95)<2500'],     // Spike-specific threshold
        'concurrent_users': ['p(95)<1100']        // Track concurrent users
    }
};

export default function () {
    group('Spike Test Suite', function() {
        concurrentUsers.add(__VU);
        
        for (const endpoint of ENDPOINTS) {
            group(`Testing ${endpoint.name}`, function() {
                const res = http.get(endpoint.url, {
                    tags: { endpoint: endpoint.name, test_type: 'spike' }
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
                    console.error(`[SPIKE TEST] ${endpoint.name} failed: ${res.status}`);
                    console.error(`Response: ${res.body.substring(0, 200)}...`);
                    console.error(`Duration: ${res.timings.duration}ms`);
                    console.error(`Concurrent users: ${__VU}`);
                }

                sleep(0.2); // Minimal sleep for spike testing
            });
        }
    });
}
