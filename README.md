# K6 Performance Testing Suite

A comprehensive K6 load testing suite designed for performance validation across different load scenarios. This suite includes 6 specialized test types, each targeting specific performance characteristics and system behaviors.

## 🎯 Overview

This is a personal project showcasing different types of K6 load testing. I created this while learning about performance testing patterns and wanted to share a complete example suite.

## ⚠️ Important Warnings

**READ BEFORE RUNNING TESTS** - These tests generate significant load and can impact target systems:

- **🚨 HIGH LOAD TESTS**: Stress, Spike, and Breakpoint tests generate substantial traffic
- **⏰ LONG DURATION**: Soak test runs for 6+ hours, Breakpoint test runs for 2+ hours
- **🎯 TARGET SAFELY**: Only test systems you own or have explicit permission to test
- **📊 MONITOR SYSTEMS**: Ensure monitoring is in place before running intensive tests
- **🛡️ START SMALL**: Begin with Smoke and Load tests, then gradually increase

## 🧪 Test Types

| Test Type | Duration | Load Profile | ⚠️ Warning Level | Purpose |
|-----------|----------|--------------|------------------|---------|
| **Smoke** | 30s | 1 user | 🟢 Safe | Basic functionality validation |
| **Load** | 20min | Up to 100 users | 🟡 Moderate | Normal expected load testing |
| **Stress** | 35min | Up to 400 users | 🟠 High Load | Beyond capacity testing |
| **Spike** | 10min | Spike to 1000 users | 🔴 Very High Load | Sudden load change handling |
| **Breakpoint** | 2h | Gradual to 10,000 users | 🔴 Extreme Load | System limit identification |
| **Soak** | 6h+ | Sustained 400 users | 🟠 Long Duration | Long-term stability testing |

## 🚀 Quick Start

### ⚠️ Load Testing Safety Guidelines

### 🚨 BEFORE YOU START

**NEVER run these tests against:**
- Production systems without explicit approval
- Systems you don't own or lack permission to test
- Shared infrastructure without team coordination
- Systems without proper monitoring in place

### 📊 Test Load Levels

| Test | Max Load | Duration | Risk Level | Prerequisites |
|------|----------|----------|------------|---------------|
| Smoke | 1 user | 30s | 🟢 **Safe** | Basic connectivity |
| Load | 100 users | 20min | 🟡 **Moderate** | System monitoring |
| Stress | 400 users | 35min | 🟠 **High** | Resource monitoring + alerts |
| Spike | 1,000 users | 10min | 🔴 **Very High** | Robust infrastructure + incident response |
| Breakpoint | 10,000 users | 2 hours | 🔴 **Extreme** | Production-grade infrastructure only |
| Soak | 400 users | 6+ hours | 🟠 **Long Duration** | Stable system + continuous monitoring |

### 🛡️ Safety Checklist

Before running any test:

- [ ] **Permission verified** - You own the target system or have explicit testing approval
- [ ] **Monitoring active** - System metrics, alerts, and dashboards are ready
- [ ] **Incident response** - Team knows testing is happening and how to contact you
- [ ] **Resource capacity** - Target system can handle the expected load
- [ ] **Dependencies mapped** - Understand what other systems might be affected
- [ ] **Rollback plan** - Know how to quickly stop tests if issues arise

## Prerequisites

- [K6](https://k6.io/docs/get-started/installation/) installed
- Access to target endpoints
- Basic understanding of load testing concepts

### Running Tests

⚠️ **IMPORTANT**: Always start with smoke test and ensure you have permission to test target systems.

```bash
# Clone the repository
git clone https://github.com/aldhairim/k6-performance-testing-suite.git
cd k6-performance-testing-suite

# ALWAYS start with smoke test
k6 run tests/smoke-test.js

# Then run moderate load tests
k6 run tests/load-test.js

# ⚠️ HIGH LOAD - Monitor target systems closely
k6 run tests/stress-test.js
k6 run tests/spike-test.js

# ⚠️ EXTREME LOAD & LONG DURATION - Use with caution
k6 run tests/breakpoint-test.js  # 2 hours, up to 10k users
k6 run tests/soak-test.js        # 6+ hours, sustained load

# Run all tests with built-in safety prompts
chmod +x scripts/run-tests.sh
./scripts/run-tests.sh
📊 Test Configuration
All tests are configured with:

Consistent endpoints for reliable comparison
Standardized metrics for uniform analysis
Appropriate thresholds for each test type
Enhanced error handling with detailed logging

Default Test Endpoints

https://test.k6.io (homepage)
https://quickpizza.grafana.com/ (contact)
https://test.k6.io/news.php (news)

🛡️ Safety Guidelines
Before Running Tests

🎯 Target Verification

Only test systems you own or have explicit permission to test
Verify endpoints are test/staging environments, not production
Confirm with system owners if testing shared infrastructure


📊 Monitoring Setup

Ensure system monitoring is active (CPU, memory, network, database)
Set up alerts for resource thresholds
Have incident response procedures ready


🚦 Load Considerations

Smoke/Load tests: Generally safe for most systems
Stress/Spike tests: Can overwhelm smaller systems - monitor closely
Breakpoint test: EXTREME load - only use on robust infrastructure
Soak test: Long duration - ensure system stability before starting



During Test Execution

Monitor target systems continuously
Be ready to stop tests if systems show distress
Check error rates - high failures may indicate system overload
Watch for cascade failures in dependent systems

Emergency Stop
bash# Stop running K6 test immediately
Ctrl+C (in terminal)

# Or kill all K6 processes
pkill k6
🚨 Default Test Endpoints
IMPORTANT: This suite uses public demo endpoints by default:

https://test.k6.io - K6's official test site (designed for load testing)
https://quickpizza.grafana.com/ - Grafana's demo application
https://test.k6.io/news.php - K6's test endpoint

These are intended for testing and can handle the load. ALWAYS update endpoints to your own test systems before running.

Detailed Test Documentation - Comprehensive guide for each test type
Getting Started Guide - Setup and execution instructions

🛠 Customization
Modifying Test Endpoints
Update the ENDPOINTS array in each test file:
javascriptconst ENDPOINTS = [
    { url: 'https://your-app.com', name: 'homepage' },
    { url: 'https://your-app.com/api', name: 'api' },
    // Add your endpoints here
];
Adjusting Load Profiles
Modify the stages configuration in each test's options object:
javascriptexport const options = {
    stages: [
        { duration: '5m', target: 50 },   // Adjust duration and target users
        { duration: '10m', target: 100 }, // as needed for your system
    ],
    // ... other options
};
📈 Results Analysis
Key Metrics to Monitor

HTTP Request Duration: Response time distribution
HTTP Request Failed: Error rate percentage
Custom Latency: Test-specific performance indicators
Concurrent Users: Load distribution patterns

Integration with Grafana
This suite works well with:

Grafana Cloud K6 for managed testing
Grafana dashboards for visualization

🤝 Contributing
Feel free to contribute! This is a learning project so improvements are welcome:

Fork the repository
Create a feature branch (git checkout -b feature/cool-improvement)
Commit your changes (git commit -m 'Add cool improvement')
Push to the branch (git push origin feature/cool-improvement)
Open a Pull Request

Happy Testing! 🚀