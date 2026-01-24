# Load Testing Guide - PLATO Menu System

## Overview

Complete guide for load testing the PLATO Menu API to ensure it can handle production traffic volumes (1000+ concurrent users).

---

## 1. Setup & Prerequisites

### Install Load Testing Tools

```bash
# Using Apache JMeter (GUI)
# Download from: https://jmeter.apache.org/download_jmeter.html

# Using Artillery (CLI - recommended)
npm install -g artillery

# Using k6 (Modern, JavaScript-based)
npm install -g k6

# Using Locust (Python-based)
pip install locust
```

### System Requirements for Load Test

- **Test Client Machine**: 4+ cores, 8GB+ RAM
- **Target Server**: Production or staging environment
- **Network**: Stable, high-bandwidth connection
- **Monitoring**: Enable server monitoring (CPU, memory, disk)
- **Quiet Period**: Run during low-traffic times

---

## 2. Artillery Load Testing

### Installation

```bash
npm install -g artillery
artillery --version
```

### Test Configuration File

```yaml
# load-test.yml
config:
  target: "http://localhost:5000/api"
  phases:
    # Warm up (1 minute)
    - duration: 60
      arrivalRate: 10
      name: "Warmup"

    # Ramp up (5 minutes)
    - duration: 300
      arrivalRate: 50
      rampTo: 100
      name: "Ramp up"

    # Sustained load (10 minutes)
    - duration: 600
      arrivalRate: 100
      name: "Sustained load"

    # Spike test (2 minutes)
    - duration: 120
      arrivalRate: 200
      name: "Spike"

    # Ramp down (5 minutes)
    - duration: 300
      arrivalRate: 100
      rampTo: 10
      name: "Ramp down"

  processor: "./load-test-processor.js"
  variables:
    auth_token: ""
    restaurant_id: ""
  plugins:
    expect: {}

scenarios:
  - name: "Dashboard"
    weight: 20
    flow:
      - get:
          url: "/dashboard/{{ restaurant_id }}"
          expect:
            - statusCode: 200
          capture:
            - json: "$.data"
              as: "dashboard_data"

  - name: "Menu Operations"
    weight: 30
    flow:
      - get:
          url: "/menu/{{ restaurant_id }}"
          expect:
            - statusCode: 200
      - think: 2
      - get:
          url: "/menu/{{ restaurant_id }}/{{ item_id }}"
          expect:
            - statusCode: 200

  - name: "Order Operations"
    weight: 25
    flow:
      - post:
          url: "/orders"
          json:
            restaurantId: "{{ restaurant_id }}"
            tableId: "table-1"
            items:
              - itemId: "item-1"
                quantity: 2
                price: 500
          expect:
            - statusCode: 201
          capture:
            - json: "$.data._id"
              as: "order_id"
      - think: 1
      - get:
          url: "/orders/{{ order_id }}"
          expect:
            - statusCode: 200
      - put:
          url: "/orders/{{ order_id }}"
          json:
            status: "confirmed"
          expect:
            - statusCode: 200

  - name: "Bill Operations"
    weight: 15
    flow:
      - post:
          url: "/bills"
          json:
            orderId: "{{ order_id }}"
            totalAmount: 1000
          expect:
            - statusCode: 201
          capture:
            - json: "$.data._id"
              as: "bill_id"
      - think: 1
      - post:
          url: "/bills/{{ bill_id }}/pay"
          json:
            paymentMethod: "card"
            amount: 1000
          expect:
            - statusCode: 200

  - name: "Table Management"
    weight: 10
    flow:
      - get:
          url: "/tables/{{ restaurant_id }}"
          expect:
            - statusCode: 200
      - put:
          url: "/tables/{{ table_id }}"
          json:
            status: "occupied"
          expect:
            - statusCode: 200
```

### Processor File

```javascript
// load-test-processor.js
module.exports = {
  setup: function (context, ee, next) {
    console.log("🚀 Load test setup starting...");
    context.vars.restaurant_id = "default-restaurant-id";
    context.vars.item_id = "default-item-id";
    context.vars.table_id = "table-1";
    next();
  },

  beforeRequest: function (requestParams, context, ee, next) {
    // Add auth token to all requests
    if (context.vars.auth_token) {
      requestParams.headers = requestParams.headers || {};
      requestParams.headers["Authorization"] =
        `Bearer ${context.vars.auth_token}`;
    }
    next();
  },

  afterResponse: function (requestParams, responseData, context, ee, next) {
    // Track response times
    ee.emit("customStat", {
      stat: "response_time",
      value: responseData.elapsed,
    });

    if (responseData.statusCode >= 400) {
      ee.emit("customStat", {
        stat: "errors",
        value: 1,
      });
    }

    next();
  },
};
```

### Running Artillery Tests

```bash
# Run load test
artillery run load-test.yml

# Run with custom output
artillery run load-test.yml -o results.json

# Run with HTML report
artillery run load-test.yml -o results.json
artillery report results.json

# Run specific scenario only
artillery run load-test.yml -s "Order Operations"

# Ramp up gradually to target load
artillery quick --count 100 --num 1000 http://localhost:5000/api/health
```

### Artillery Output Example

```
Report @ 12:45:33(UTC) 2026-01-24

Scenarios launched:  2456
Scenarios completed: 2456
Requests launched:   12280
Requests completed:  12108
Mean response time:  245.3ms
Median response time: 189ms
p95: 450ms
p99: 850ms

Scenario counts:
  Dashboard: 491
  Menu Operations: 738
  Order Operations: 612
  Bill Operations: 369
  Table Management: 246

HTTP codes:
  200: 11956
  201: 152
  400: 0
  500: 0

Errors: 172 (1.4%)
```

---

## 3. k6 Load Testing (Modern Alternative)

### k6 Test Script

```javascript
// load-test.js
import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const apiDuration = new Trend("api_duration");

export const options = {
  stages: [
    { duration: "1m", target: 50 }, // Warm up
    { duration: "5m", target: 100 }, // Ramp up
    { duration: "10m", target: 100 }, // Sustained
    { duration: "2m", target: 200 }, // Spike
    { duration: "5m", target: 10 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    errors: ["rate<0.1"],
  },
};

const BASE_URL = "http://localhost:5000/api";

export default function () {
  // Test 1: Dashboard
  group("Dashboard", () => {
    const res = http.get(`${BASE_URL}/dashboard/restaurant-1`);
    check(res, {
      "status 200": (r) => r.status === 200,
      "response time < 500ms": (r) => r.timings.duration < 500,
    });
    apiDuration.add(res.timings.duration);
    if (res.status !== 200) {
      errorRate.add(1);
    }
  });

  sleep(2);

  // Test 2: Menu
  group("Menu", () => {
    const res = http.get(`${BASE_URL}/menu/restaurant-1`);
    check(res, {
      "status 200": (r) => r.status === 200,
    });
    apiDuration.add(res.timings.duration);
  });

  sleep(1);

  // Test 3: Orders
  group("Orders", () => {
    const payload = JSON.stringify({
      restaurantId: "restaurant-1",
      tableId: "table-1",
      items: [{ itemId: "item-1", quantity: 2, price: 500 }],
    });

    const res = http.post(`${BASE_URL}/orders`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    check(res, {
      "status 201": (r) => r.status === 201,
    });
    apiDuration.add(res.timings.duration);
  });

  sleep(3);
}
```

### Running k6 Tests

```bash
# Run test
k6 run load-test.js

# Run with output to JSON
k6 run -o json=results.json load-test.js

# Run with cloud integration
k6 cloud load-test.js

# Monitor in real-time
k6 run --vus 100 --duration 30s load-test.js
```

---

## 4. Apache JMeter Testing (GUI)

### JMeter Test Plan Structure

```
Test Plan
├── Thread Group (100 users, 5 sec ramp-up)
│
├── HTTP Request Sampler
│   ├── GET /api/health
│   ├── GET /api/menu/{id}
│   ├── POST /api/orders
│   └── POST /api/bills/{id}/pay
│
├── Assertions
│   ├── Response Assertion (status == 200)
│   ├── Response Time Assertion (<500ms)
│   └── Size Assertion
│
└── Listeners
    ├── View Results Tree
    ├── Summary Report
    ├── Response Time Graph
    └── Aggregate Report
```

### JMeter Setup Steps

1. **Create Thread Group**
   - Number of threads: 100
   - Ramp-up time: 60 seconds
   - Loop count: 10

2. **Add HTTP Request Sampler**
   - Server name: localhost
   - Port: 5000
   - Path: /api/endpoint

3. **Add Assertions**
   - Response Assertion: ${status} == 200
   - Response Time: < 500

4. **Add Listeners**
   - View Results Tree (for debugging)
   - Summary Report (for overview)
   - Aggregate Report (for statistics)

5. **Run Test**
   - Click "Start" button
   - Monitor live results
   - Export results as CSV/JSON

---

## 5. Load Test Scenarios

### Scenario 1: Normal Load (Business Hours)

```
Users: 200 concurrent
Duration: 1 hour
Request mix: 60% read, 40% write
Expected p95: <300ms
```

### Scenario 2: Peak Load (Lunch Time)

```
Users: 500 concurrent
Duration: 2 hours
Request mix: 50% read, 50% write
Expected p95: <500ms
```

### Scenario 3: Spike Test (Flash Sale)

```
Users: 0 → 1000 in 1 minute
Sustain: 30 minutes
Request mix: 30% read, 70% write
Expected p95: <1000ms
```

### Scenario 4: Endurance Test

```
Users: 100 constant
Duration: 12 hours
Request mix: 70% read, 30% write
Monitor for memory leaks
```

### Scenario 5: Stress Test (Find Breaking Point)

```
Users: 0 → 5000 gradually
Duration: Until system fails
Track when p95 > 5 seconds
Track when error rate > 5%
```

---

## 6. Performance Analysis

### Metrics to Monitor

```
1. Response Time Metrics:
   - Mean: < 200ms (target)
   - p50 (median): < 150ms
   - p95: < 500ms
   - p99: < 1000ms
   - Max: < 2000ms

2. Throughput:
   - Requests/second: > 500 req/s
   - Data throughput: > 100 MB/s
   - Transactions/second: > 100 txn/s

3. Error Metrics:
   - Error rate: < 0.1%
   - Failed requests: 0
   - HTTP 5xx: 0
   - Timeouts: 0

4. Resource Metrics:
   - CPU usage: < 80%
   - Memory usage: < 85%
   - Disk I/O: < 80%
   - Network: < 90%

5. Availability:
   - Uptime: 100%
   - Concurrent users supported: 1000+
   - Recovery time: < 5 minutes
```

### Performance Optimization Steps

```
If p95 > 500ms:
1. Check database query performance
2. Review cache hit rates
3. Analyze slow queries
4. Implement pagination
5. Add database indexes
6. Enable query caching

If error rate > 0.1%:
1. Check server logs
2. Review rate limiting
3. Check validation errors
4. Monitor database connections
5. Review error patterns
6. Check for resource exhaustion

If CPU > 80%:
1. Profile code for bottlenecks
2. Implement caching
3. Optimize algorithms
4. Reduce database queries
5. Increase server resources
6. Load balance across servers
```

---

## 7. Load Test Report Template

```markdown
# Load Test Report - PLATO Menu API

Date: January 24, 2026
Duration: 30 minutes
Scenarios Tested: 5

## Executive Summary

- ✅ System handled 500 concurrent users
- ✅ p95 response time: 285ms (target: <500ms)
- ✅ Error rate: 0.05% (target: <0.1%)
- ✅ No errors or failures
- ✅ System stable throughout test

## Test Configuration

- Threads: 500
- Ramp-up: 5 minutes
- Sustained load: 20 minutes
- Ramp-down: 5 minutes

## Results

Total Requests: 25,000
Successful: 24,987 (99.95%)
Failed: 13 (0.05%)

Response Times:

- Mean: 156ms
- Median: 142ms
- p95: 285ms
- p99: 450ms

Throughput:

- Requests/sec: 833
- Transactions/sec: 83

## Bottlenecks Identified

1. Dashboard endpoint slow at high load (needs caching)
2. Database connection pool may be saturated at >1000 users
3. Menu search query needs optimization

## Recommendations

1. Implement Redis caching for dashboard (expect 3x improvement)
2. Increase DB connection pool from 10 to 25
3. Add indexes to menu search queries
4. Consider load balancing for >500 users
5. Monitor memory usage over longer periods

## Conclusion

System is production-ready for expected traffic (200-500 concurrent users).
Recommended enhancements for scaling to 1000+ concurrent users.
```

---

## 8. Continuous Load Testing

### GitHub Actions CI/CD Integration

```yaml
# .github/workflows/load-test.yml
name: Load Testing

on:
  schedule:
    - cron: "0 2 * * 0" # Weekly on Sunday 2 AM

jobs:
  load-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Install Artillery
        run: npm install -g artillery

      - name: Start test server
        run: npm start &

      - name: Wait for server
        run: sleep 10

      - name: Run load test
        run: artillery run load-test.yml -o results.json

      - name: Generate report
        run: artillery report results.json -o report.html

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: load-test-results
          path: |
            results.json
            report.html

      - name: Comment on results
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('results.json'));
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `Load Test Results:
              - Response time p95: ${results.aggregate.latency.p95}ms
              - Error rate: ${results.aggregate.codes['500'] || 0}
              - Throughput: ${results.aggregate.rps} req/s`
            });
```

---

## 9. Quick Load Test Commands

```bash
# Test single endpoint
artillery quick --count 100 --num 1000 http://localhost:5000/api/health

# Run load test with custom target
artillery run load-test.yml --target http://staging.platomenu.com

# Run test and save detailed results
artillery run load-test.yml -o results.json --statsd

# Generate comparison report
artillery report results1.json results2.json

# Run in Docker
docker run --rm -v $(pwd):/tests artilleryio/artillery:latest run /tests/load-test.yml
```

---

## 10. Success Criteria Checklist

- [ ] p95 response time < 500ms
- [ ] Error rate < 0.1%
- [ ] No failed requests
- [ ] System stable throughout test
- [ ] CPU usage < 80%
- [ ] Memory usage stable
- [ ] Can handle 500+ concurrent users
- [ ] Recovery time < 5 minutes after spike
- [ ] Database queries optimized
- [ ] Cache hit rates > 80%
- [ ] All endpoints passing
- [ ] Load balancing working

---

## Summary

**Load Testing Status**: ✅ Ready

**Tools Configured**:

- ✅ Artillery (recommended for CLI)
- ✅ k6 (modern JavaScript)
- ✅ JMeter (GUI option)

**Test Scenarios**:

- ✅ Normal load (200 users)
- ✅ Peak load (500 users)
- ✅ Spike test (1000 users)
- ✅ Endurance (12 hour)
- ✅ Stress test (breaking point)

**Next Steps**:

1. Run initial load tests
2. Identify bottlenecks
3. Optimize slow endpoints
4. Repeat until passing
5. Schedule weekly tests
6. Monitor in production

---

_Load Testing Guide | PLATO Menu System | Production Ready_
