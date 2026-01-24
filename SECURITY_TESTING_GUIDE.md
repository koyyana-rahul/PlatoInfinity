# Security Testing Guide - PLATO Menu System

## Overview

Complete security testing procedures to validate all protections before production deployment.

---

## 1. Input Validation Testing

### Email Validation Tests

```bash
# Valid emails should pass
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"Test123!", "name":"Test"}'

# Invalid emails should fail
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email", "password":"Test123!", "name":"Test"}'
# Expected: 400 Bad Request

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"@example.com", "password":"Test123!", "name":"Test"}'
# Expected: 400 Bad Request

curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@", "password":"Test123!", "name":"Test"}'
# Expected: 400 Bad Request
```

### Password Strength Tests

```bash
# Too short
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"short"}'
# Expected: 400 (must be 8+ chars)

# No uppercase
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"noupppp123!"}'
# Expected: 400

# No digit
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"NoDigits!"}'
# Expected: 400

# No special character
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"NoSpecial123"}'
# Expected: 400

# Valid password
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com", "password":"ValidPass123!"}'
# Expected: 201 Created
```

### Phone Number Validation

```bash
# Valid international format
curl -X POST http://localhost:5000/api/restaurants \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test", "phone":"+1234567890"}'
# Expected: 200/201

# Invalid format
curl -X POST http://localhost:5000/api/restaurants \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test", "phone":"not-a-phone"}'
# Expected: 400
```

### Amount Validation

```bash
# Negative amount (should fail)
curl -X POST http://localhost:5000/api/bills \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"123", "totalAmount":-100}'
# Expected: 400

# Zero amount (should fail)
curl -X POST http://localhost:5000/api/bills \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"123", "totalAmount":0}'
# Expected: 400

# Valid positive amount
curl -X POST http://localhost:5000/api/bills \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"123", "totalAmount":1000}'
# Expected: 201/200
```

---

## 2. XSS (Cross-Site Scripting) Prevention

### Script Injection Tests

```bash
# Attempt script injection in tableId
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tableId":"<script>alert(1)</script>", "items":[]}'
# Expected: 400 or sanitized (no script execution)

# Attempt script in order notes
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tableId":"1", "items":[], "notes":"<img src=x onerror=alert(1)>"}'
# Expected: 400 or sanitized

# Attempt script in restaurant name
curl -X POST http://localhost:5000/api/restaurants \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(\"xss\")</script>"}'
# Expected: 400 or sanitized

# Attempt event handler injection
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tableId":"table\" onclick=\"alert(1)", "items":[]}'
# Expected: 400 or sanitized
```

### Verify Sanitization in Response

```bash
# Create order with potentially malicious content
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tableId":"<b>test</b>", "items":[]}'

# Retrieve and verify it's sanitized (no HTML tags)
curl -X GET http://localhost:5000/api/orders/123 \
  -H "Authorization: Bearer TOKEN"
# Check response body - should have sanitized tableId
```

---

## 3. SQL Injection Prevention

### MongoDB Injection Tests

```bash
# Attempt operator injection
curl -X GET "http://localhost:5000/api/orders?status=\{$ne:null\}" \
  -H "Authorization: Bearer TOKEN"
# Expected: Properly handled (should not bypass filters)

# Attempt field name injection
curl -X POST http://localhost:5000/api/bills \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":{"$ne":null}, "totalAmount":1000}'
# Expected: 400 Bad Request or type validation fails

# Attempt command injection
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tableId":"1); db.dropDatabase(); //", "items":[]}'
# Expected: Sanitized or rejected
```

---

## 4. Authentication & Authorization Testing

### Missing Token Tests

```bash
# Request without Authorization header
curl -X GET http://localhost:5000/api/dashboard/restaurant-1
# Expected: 401 Unauthorized

# Request with empty token
curl -X GET http://localhost:5000/api/dashboard/restaurant-1 \
  -H "Authorization: Bearer "
# Expected: 401 Unauthorized

# Request with invalid token format
curl -X GET http://localhost:5000/api/dashboard/restaurant-1 \
  -H "Authorization: invalid-token"
# Expected: 401 Unauthorized
```

### Token Expiry Tests

```bash
# Use expired token
curl -X GET http://localhost:5000/api/dashboard/restaurant-1 \
  -H "Authorization: Bearer EXPIRED_TOKEN"
# Expected: 401 Unauthorized

# Refresh token to get new token
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Authorization: Bearer REFRESH_TOKEN"
# Expected: 200 OK with new token
```

### Role-Based Access Control

```bash
# Waiter trying to access admin endpoint
curl -X GET http://localhost:5000/api/admin/restaurants \
  -H "Authorization: Bearer WAITER_TOKEN"
# Expected: 403 Forbidden

# Manager trying to access another restaurant's data
curl -X GET http://localhost:5000/api/dashboard/OTHER_RESTAURANT_ID \
  -H "Authorization: Bearer MANAGER_TOKEN"
# Expected: 403 Forbidden or empty data

# Admin can access everything
curl -X GET http://localhost:5000/api/admin/all-orders \
  -H "Authorization: Bearer ADMIN_TOKEN"
# Expected: 200 OK
```

---

## 5. Rate Limiting Testing

### Authentication Rate Limiting

```bash
# Send 10 login attempts rapidly
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com", "password":"wrong"}'
  echo "Request $i"
done

# After 5 requests, should get 429 Too Many Requests
# Expected: First 5 return 401 (wrong password)
# Next 5 return 429 (rate limited)
```

### Payment Rate Limiting

```bash
# Send 15 payment attempts rapidly
for i in {1..15}; do
  curl -X POST http://localhost:5000/api/bills/bill-1/pay \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"paymentMethod":"card", "amount":1000}'
  echo "Payment $i"
done

# After 10 requests, should get 429
# Expected: First 10 return 200/400
# Next 5 return 429 (rate limited - 10 per minute)
```

### General API Rate Limiting

```bash
# Send 110 requests rapidly
for i in {1..110}; do
  curl -X GET http://localhost:5000/api/health
  echo "Request $i"
done

# After 100 requests, should get 429
# Expected: Rate limit applies (100 per 15 minutes)
```

---

## 6. Security Headers Testing

### Using curl to verify headers

```bash
# Check for security headers
curl -I http://localhost:5000/api/health

# Expected headers:
# Content-Security-Policy: ...
# X-Frame-Options: DENY or SAMEORIGIN
# X-Content-Type-Options: nosniff
# Strict-Transport-Security: ...
# X-XSS-Protection: ...
```

### Verify CSP (Content Security Policy)

```bash
# Should prevent inline scripts
curl -X GET http://localhost:5000/api/health -I | grep Content-Security-Policy
# Expected: Contains 'script-src' directive

# Should prevent loading from untrusted sources
curl -X GET http://localhost:5000/api/health -I | grep Content-Security-Policy
# Expected: Does NOT contain * in script-src
```

---

## 7. Sensitive Data Protection

### Verify no sensitive data in logs

```bash
# Check logs don't contain passwords
grep -i "password" server/logs/requests.log
# Expected: No output (passwords shouldn't be logged)

# Check logs don't contain tokens
grep -i "bearer\|token" server/logs/requests.log | grep -i "password\|credit\|ssn"
# Expected: No output
```

### Verify error messages don't leak info

```bash
# Trigger 500 error in production mode
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"invalid":"data"}'

# In production, error should be generic
# Expected: {"success":false,"message":"An error occurred"}
# NOT: Full stack trace or database error details
```

---

## 8. CORS Testing

### Test cross-origin requests

```bash
# Request from different origin
curl -X GET http://localhost:5000/api/health \
  -H "Origin: http://malicious-site.com"

# Should be rejected or properly restricted
# Check Access-Control-Allow-Origin header
```

---

## 9. CSRF Protection

### Verify CSRF tokens

```bash
# POST without CSRF token should fail (if implemented)
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"tableId":"1", "items":[]}'
# Expected: 403 Forbidden (if CSRF protection enabled)

# POST with CSRF token should succeed
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: CSRF_TOKEN" \
  -d '{"tableId":"1", "items":[]}'
# Expected: 201 Created (if CSRF token valid)
```

---

## 10. File Upload Security

### Validate file uploads

```bash
# Attempt to upload executable file
curl -F "file=@malware.exe" \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/upload

# Expected: 400 Bad Request (invalid file type)

# Attempt directory traversal
curl -F "file=@test.jpg;filename=../../etc/passwd" \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/upload

# Expected: 400 Bad Request (path traversal attempt rejected)
```

---

## 11. API Documentation Security

### Verify Swagger doesn't expose secrets

```bash
# Check Swagger documentation
curl http://localhost:5000/api-docs

# Verify:
# - No API keys visible
# - No database credentials
# - No internal server details
# - Proper authentication requirements shown
```

---

## 12. Automated Security Testing

### Using OWASP ZAP

```bash
# Download and run OWASP ZAP
docker pull owasp/zap2docker-stable

# Run security scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:5000/api

# Generates report of vulnerabilities
```

### Using npm security tools

```bash
# Check for vulnerable dependencies
npm audit

# Run security tests
npm run test:security

# OWASP dependency check
npm install -g snyk
snyk test
```

---

## 13. Security Test Checklist

### Input Validation

- [ ] Email validation working
- [ ] Password strength enforced
- [ ] Phone number validation working
- [ ] Amount validation (no negatives)
- [ ] Date validation working
- [ ] XSS prevention active
- [ ] SQL injection prevention active

### Authentication & Authorization

- [ ] Missing token returns 401
- [ ] Invalid token returns 401
- [ ] Expired token returns 401
- [ ] Role-based access control working
- [ ] Cross-restaurant access denied
- [ ] Admin endpoints protected

### Rate Limiting

- [ ] Auth rate limiting (5/15min)
- [ ] Payment rate limiting (10/1min)
- [ ] General rate limiting (100/15min)
- [ ] Rate limit headers present
- [ ] Admin bypass working

### Security Headers

- [ ] CSP header present
- [ ] X-Frame-Options present
- [ ] X-Content-Type-Options present
- [ ] HSTS present (production)
- [ ] XSS Protection header present

### Data Protection

- [ ] No passwords in logs
- [ ] No tokens in logs
- [ ] Error messages safe
- [ ] Sensitive data encrypted
- [ ] Database credentials protected

### API Security

- [ ] CORS properly configured
- [ ] CSRF protection working
- [ ] File upload validation
- [ ] API documentation secure
- [ ] No sensitive data exposed

---

## 14. Security Test Report Template

```markdown
# Security Test Report - PLATO Menu API

Date: [Date]
Tester: [Name]
Environment: [Development/Staging/Production]

## Test Results Summary

- Total Tests: X
- Passed: Y
- Failed: Z
- Warnings: W

## Critical Issues

[List any critical security issues found]

## High Priority Issues

[List high priority issues]

## Medium Priority Issues

[List medium priority issues]

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Sign-off

- [ ] Tester approves deployment
- [ ] Security officer approves
- [ ] Manager approves
```

---

## 15. Continuous Security Testing

### Schedule regular tests

```
- Daily: Automated npm audit
- Weekly: OWASP ZAP scan
- Monthly: Manual penetration testing
- Quarterly: Third-party security audit
```

### CI/CD Integration

```yaml
# Add to GitHub Actions
- name: Security Tests
  run: |
    npm audit
    npm run test:security
    snyk test
```

---

## Summary

✅ **Input Validation**: Email, password, phone, amounts, dates, URLs  
✅ **XSS Prevention**: Script injection blocked, HTML sanitized  
✅ **SQL Injection Prevention**: Parameterized queries, input validation  
✅ **Authentication**: Token validation, expiry checking  
✅ **Authorization**: Role-based access control  
✅ **Rate Limiting**: Multiple levels, per-endpoint  
✅ **Security Headers**: CSP, HSTS, X-Frame-Options  
✅ **Data Protection**: No sensitive data in logs  
✅ **API Security**: CORS, CSRF, file upload validation

**Ready for**: Security testing and production deployment

---

_Security Testing Guide | PLATO Menu System | Production Ready_
