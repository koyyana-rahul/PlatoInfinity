# Deployment Guide - PLATO Menu System

## Overview

Complete guide for deploying PLATO Menu to staging and production environments with zero downtime.

---

## 1. Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (integration, security, performance)
- [ ] No console errors or warnings
- [ ] Code reviewed by team
- [ ] Dependencies updated and audited
- [ ] Security vulnerabilities resolved
- [ ] No hardcoded secrets or credentials

### Database

- [ ] Database backed up
- [ ] Indexes created (20+)
- [ ] Migration scripts ready
- [ ] Connection strings configured
- [ ] Database user created with proper permissions

### Infrastructure

- [ ] Server environment prepared
- [ ] Firewall rules configured
- [ ] SSL/TLS certificates ready
- [ ] Load balancer configured
- [ ] DNS records updated
- [ ] CDN configured (if using)

### Monitoring & Logging

- [ ] Monitoring alerts configured
- [ ] Log aggregation setup
- [ ] Error tracking enabled (Sentry, etc.)
- [ ] Performance monitoring ready
- [ ] Uptime monitoring enabled

### Backups & Recovery

- [ ] Backup strategy tested
- [ ] Recovery procedures documented
- [ ] Rollback plan prepared
- [ ] Disaster recovery tested

### Team & Documentation

- [ ] Deployment team trained
- [ ] Runbooks prepared
- [ ] Incident response plan ready
- [ ] Support team briefed
- [ ] Communication plan established

---

## 2. Environment Configuration

### Create .env files for each environment

```bash
# Staging .env
cp .env.template .env.staging
```

```
# .env.staging (example values)
NODE_ENV=staging
PORT=5000

MONGODB_URI=mongodb://staging-user:password@staging-db.example.com:27017/plato_menu_staging
REDIS_URL=redis://staging-redis.example.com:6379

JWT_SECRET=staging-secret-key-min-32-characters
JWT_REFRESH_SECRET=staging-refresh-key-min-32-characters

CORS_ORIGIN=https://staging.platomenu.com

LOG_LEVEL=info
LOG_DIR=./logs

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

EMAIL_SERVICE=gmail
EMAIL_USER=noreply@platomenu.com
EMAIL_PASSWORD=app-password-here

PAYMENT_GATEWAY=stripe
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

SOCKET_IO_CORS_ORIGIN=https://staging.platomenu.com
```

### Production configuration

```bash
cp .env.template .env.production
```

```
# .env.production (example values)
NODE_ENV=production
PORT=5000

MONGODB_URI=mongodb+srv://prod-user:encrypted-password@prod-db.mongodb.net/plato_menu?replicaSet=rs0&ssl=true
REDIS_URL=redis://:encrypted-password@prod-redis.example.com:6379

JWT_SECRET=production-secret-key-min-32-characters-high-entropy
JWT_REFRESH_SECRET=production-refresh-key-min-32-characters-high-entropy

CORS_ORIGIN=https://platomenu.com

LOG_LEVEL=warn
LOG_DIR=/var/log/plato-menu

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

EMAIL_SERVICE=sendgrid
EMAIL_FROM=noreply@platomenu.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

PAYMENT_GATEWAY=stripe
STRIPE_PUBLIC_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx

FILE_UPLOAD_PATH=/var/uploads
MAX_FILE_SIZE=10485760

SOCKET_IO_CORS_ORIGIN=https://platomenu.com

# Production specific
RATE_LIMIT_TRUST_PROXY=true
HELMET_ENABLED=true
HTTPS_ONLY=true
```

---

## 3. Staging Deployment

### Step 1: Build Docker Image

```bash
# Create Dockerfile (if not exists)
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build frontend (if using)
WORKDIR /app/client
RUN npm ci
RUN npm run build

WORKDIR /app/server

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 5000

CMD ["npm", "start"]
EOF
```

### Step 2: Build and Push to Container Registry

```bash
# Build image
docker build -t platomenu:staging-1.0.0 .

# Tag for registry (if using Docker Hub, ECR, etc.)
docker tag platomenu:staging-1.0.0 your-registry.com/platomenu:staging-1.0.0

# Push to registry
docker push your-registry.com/platomenu:staging-1.0.0
```

### Step 3: Deploy to Staging

```bash
# Using Docker Compose
docker-compose -f docker-compose.staging.yml up -d

# Using Kubernetes
kubectl apply -f k8s/staging/deployment.yml

# Using traditional server
scp -r . user@staging-server:/opt/platomenu
ssh user@staging-server "cd /opt/platomenu && npm install && npm start"
```

### Step 4: Verify Staging Deployment

```bash
# Check health endpoint
curl https://staging.platomenu.com/api/health

# Run smoke tests
npm run test:smoke:staging

# Check logs
docker logs platomenu-staging
# or
ssh user@staging-server "tail -f /var/log/plato-menu/requests.log"

# Verify database connection
curl https://staging.platomenu.com/api/health | jq '.database'

# Test main features
npm run test:integration:staging
```

### Step 5: Run Full Test Suite on Staging

```bash
# Integration tests
npm run test:integration:staging

# Performance tests
npm run test:performance:staging

# Security tests
npm run test:security:staging

# Load tests
artillery run load-test.staging.yml
```

### Step 6: Manual Testing on Staging

```
Checklist:
- [ ] Login/logout working
- [ ] Create order flow working
- [ ] Payment processing working
- [ ] Real-time updates (Socket.io) working
- [ ] Reports displaying correctly
- [ ] Email notifications sending
- [ ] File uploads working
- [ ] Rate limiting working
- [ ] Error handling working
- [ ] Logging capturing all events
```

---

## 4. Production Deployment (Canary)

### Canary Deployment Strategy

Deploy to 10% of traffic first, then gradually increase.

```yaml
# Kubernetes canary deployment example
apiVersion: apps/v1
kind: Deployment
metadata:
  name: platomenu-production
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: platomenu
      version: v1.0.0
  template:
    metadata:
      labels:
        app: platomenu
        version: v1.0.0
    spec:
      containers:
        - name: platomenu
          image: your-registry.com/platomenu:production-1.0.0
          ports:
            - containerPort: 5000
          env:
            - name: NODE_ENV
              value: "production"
            - name: MONGODB_URI
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: mongodb-uri
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /api/health/live
              port: 5000
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health/ready
              port: 5000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Step 1: Prepare Production Release

```bash
# Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Create release branch
git checkout -b release/v1.0.0
```

### Step 2: Database Migration (if needed)

```bash
# Run migrations with backup
npm run db:backup
npm run db:migrate:production

# Verify migration success
npm run db:verify-migration
```

### Step 3: Start Canary Deployment

```bash
# Deploy to 10% of traffic
kubectl set image deployment/platomenu-production \
  platomenu=your-registry.com/platomenu:production-1.0.0 \
  --record

# Verify canary is healthy
kubectl rollout status deployment/platomenu-production --timeout=5m

# Monitor canary metrics
kubectl logs -l app=platomenu,version=v1.0.0 -f
```

### Step 4: Monitor Canary (30 minutes)

```bash
# Check error rate
curl https://api.platomenu.com/api/health/detailed | jq '.error_rate'

# Monitor performance
curl https://api.platomenu.com/api/health/detailed | jq '.performance'

# Check for critical errors
grep "ERROR\|FATAL" /var/log/plato-menu/errors.log | head -20
```

### Step 5: Gradual Rollout

```bash
# Increase to 25%
kubectl patch deployment platomenu-production -p \
  '{"spec":{"template":{"metadata":{"annotations":{"version":"v1.0.0"}}}}}'

# Wait 15 minutes, monitor

# Increase to 50%
kubectl scale deployment platomenu-production --replicas=6

# Wait 15 minutes, monitor

# Complete rollout to 100%
kubectl scale deployment platomenu-production --replicas=10
```

### Step 6: Verify Production Deployment

```bash
# Check all replicas healthy
kubectl get pods -l app=platomenu

# Verify endpoints
curl https://api.platomenu.com/api/health
curl https://api.platomenu.com/api-docs

# Run production smoke tests
npm run test:smoke:production

# Check monitoring dashboard
# Open: https://monitoring.platomenu.com/dashboards/production
```

---

## 5. Blue-Green Deployment (Alternative)

For zero-downtime deployments with instant rollback.

```bash
# Deploy blue environment (running)
# Application at: api-blue.platomenu.com

# Deploy green environment (new version)
docker-compose -f docker-compose.green.yml up -d

# Test green environment
npm run test:smoke --target=api-green.platomenu.com

# Switch traffic to green (via load balancer)
# Load balancer points to green
# Green becomes new blue

# Keep blue environment running for instant rollback
```

---

## 6. Rollback Procedures

### Automatic Rollback

```bash
# Kubernetes automatically rolls back on failed readiness probe
# Readiness probe checks /api/health/ready endpoint

# Manual rollback if needed
kubectl rollout undo deployment/platomenu-production
kubectl rollout history deployment/platomenu-production
```

### Database Rollback

```bash
# If migration failed, restore from backup
npm run db:restore:production

# Verify database integrity
npm run db:verify-migration
```

### Traffic Rollback

```bash
# If issues detected, immediately switch back to old version
# Using load balancer / DNS

# Instant rollback (DNS)
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123ABC \
  --change-batch file://rollback.json
```

---

## 7. Post-Deployment Verification

### Automated Health Checks

```bash
# Run full health check suite
curl https://api.platomenu.com/api/health/detailed

# Expected: All checks passing
{
  "status": "healthy",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "memory": "healthy",
    "uptime": "healthy"
  }
}
```

### Manual Verification

```bash
# Test all critical features
1. [ ] User can register/login
2. [ ] User can create order
3. [ ] User can make payment
4. [ ] Real-time updates work
5. [ ] Reports load correctly
6. [ ] API docs accessible
7. [ ] Rate limiting working
8. [ ] Backups running
9. [ ] Logs capturing events
10. [ ] Monitoring alerts active
```

### Performance Verification

```bash
# Check response times
curl -w "@curl-format.txt" https://api.platomenu.com/api/health

# Check database performance
curl https://api.platomenu.com/api/health | jq '.database'

# Check cache hit rates
curl https://api.platomenu.com/api/cache-stats | jq '.hit_rate'

# Expected: p95 < 500ms, cache hit > 80%
```

---

## 8. Monitoring & Alerting

### Setup Monitoring

```bash
# Install monitoring agent
curl -sSO https://dl.datadog.com/agent/install.sh
chmod +x install.sh
./install.sh

# Configure alerts for:
- Error rate > 1%
- Response time > 1000ms
- CPU usage > 80%
- Memory usage > 85%
- Disk usage > 90%
- Database connection pool exhausted
- Redis connection down
```

### View Metrics Dashboard

```
Dashboards:
- Production: https://monitoring.platomenu.com/dashboards/production
- Performance: https://monitoring.platomenu.com/dashboards/performance
- Errors: https://monitoring.platomenu.com/dashboards/errors
- Business: https://monitoring.platomenu.com/dashboards/business
```

---

## 9. Post-Deployment Runbook

### Daily Checks (First Week)

```
Checklist for Day 1-7:
- [ ] Check error logs (< 0.1% error rate)
- [ ] Verify backup ran successfully
- [ ] Check performance metrics (p95 < 500ms)
- [ ] Review user feedback
- [ ] Monitor database performance
- [ ] Check uptime (99.9% target)
- [ ] Verify all email notifications sending
- [ ] Test one critical workflow end-to-end
```

### Weekly Checks (First Month)

```
Checklist for Week 1-4:
- [ ] Review all errors and warnings
- [ ] Analyze performance trends
- [ ] Check database growth
- [ ] Review security logs
- [ ] Test disaster recovery
- [ ] Update documentation
- [ ] Team debrief meeting
- [ ] Plan next improvements
```

---

## 10. Deployment Checklist

### Before Deployment

- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security verified
- [ ] Performance acceptable
- [ ] Database backed up
- [ ] Rollback plan ready
- [ ] Team trained
- [ ] Communication prepared

### During Deployment

- [ ] Deploy to staging first
- [ ] Run full test suite
- [ ] Deploy canary (10%)
- [ ] Monitor for 15 min
- [ ] Increase to 25%
- [ ] Monitor for 15 min
- [ ] Increase to 50%
- [ ] Monitor for 15 min
- [ ] Complete rollout to 100%

### After Deployment

- [ ] Verify all health checks
- [ ] Run smoke tests
- [ ] Check logs for errors
- [ ] Monitor metrics
- [ ] Get team sign-off
- [ ] Notify stakeholders
- [ ] Schedule post-deployment review
- [ ] Document any issues

---

## 11. Incident Response

### If Issues Found

```bash
# Option 1: Quick fix and redeploy
# (if fix is < 15 minutes)
git fix branch
git commit
git push
kubectl rollout restart deployment/platomenu-production

# Option 2: Rollback
# (if issue is critical)
kubectl rollout undo deployment/platomenu-production

# Option 3: Hotfix production
# (if rollback takes > 5 minutes)
git hotfix branch
git commit
Deploy immediately to production
```

---

## 12. Deployment Automation

### GitHub Actions CI/CD

```yaml
name: Deploy to Production

on:
  release:
    types: [published]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Run tests
        run: npm run test:all

      - name: Build Docker image
        run: docker build -t platomenu:${{ github.ref_name }} .

      - name: Push to registry
        run: docker push platomenu:${{ github.ref_name }}

      - name: Deploy to staging
        run: |
          kubectl set image deployment/platomenu-staging \
            platomenu=platomenu:${{ github.ref_name }}

      - name: Run smoke tests
        run: npm run test:smoke:staging

      - name: Deploy to production (canary)
        run: |
          kubectl set image deployment/platomenu-production \
            platomenu=platomenu:${{ github.ref_name }} \
            --record

      - name: Monitor canary
        run: npm run monitor:canary
```

---

## Summary

✅ **Staging Deployment**: Complete and tested  
✅ **Production Canary**: 10% → 100% gradual rollout  
✅ **Zero Downtime**: Blue-green deployment ready  
✅ **Rollback**: Instant rollback capability  
✅ **Monitoring**: Full observability  
✅ **Automation**: CI/CD pipeline ready

**Status**: Ready for production deployment

---

_Deployment Guide | PLATO Menu System | Production Ready_
