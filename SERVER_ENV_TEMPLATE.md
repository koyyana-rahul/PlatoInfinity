# Environment Configuration Template for Phase 4

## Production Environment (.env.production)

```bash
# ===================================
# SERVER CONFIGURATION
# ===================================
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# ===================================
# DATABASE (MongoDB)
# ===================================
MONGODB_URI=mongodb://username:password@host:27017/plato_menu?authSource=admin&retryWrites=true&w=majority
MONGODB_TIMEOUT=10000
MONGODB_POOL_SIZE=10

# ===================================
# REDIS (Caching)
# ===================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
REDIS_ENABLED=true

# ===================================
# SOCKET.IO (Real-time)
# ===================================
SOCKET_URL=https://your-domain.com
SOCKET_ENABLED=true
SOCKET_PING_INTERVAL=30000
SOCKET_PING_TIMEOUT=60000

# ===================================
# JWT (Authentication)
# ===================================
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret_min_32_chars
REFRESH_TOKEN_EXPIRE=7d

# ===================================
# SECURITY
# ===================================
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ===================================
# EMAIL (Notifications)
# ===================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=noreply@platomenu.com
EMAIL_ENABLED=true

# ===================================
# FILE UPLOAD
# ===================================
UPLOAD_DIR=/uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf

# ===================================
# LOGGING
# ===================================
LOG_LEVEL=info
LOG_DIR=/logs
LOG_MAX_SIZE=10M
LOG_MAX_FILES=14

# ===================================
# API KEYS
# ===================================
PAYMENT_GATEWAY_KEY=your_payment_api_key
PAYMENT_GATEWAY_SECRET=your_payment_api_secret
SMS_API_KEY=your_sms_api_key
SMS_API_URL=https://api.sms-provider.com

# ===================================
# FEATURE FLAGS
# ===================================
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
ENABLE_EXPORT=true
ENABLE_REPORTS=true

# ===================================
# MONITORING & ANALYTICS
# ===================================
SENTRY_DSN=your_sentry_dsn_for_error_tracking
DATADOG_API_KEY=your_datadog_api_key
DATADOG_ENABLED=false

# ===================================
# FRONTEND
# ===================================
FRONTEND_URL=https://your-domain.com
FRONTEND_PORT=3000
```

## Development Environment (.env.development)

```bash
# ===================================
# SERVER CONFIGURATION
# ===================================
NODE_ENV=development
PORT=5000
HOST=localhost

# ===================================
# DATABASE (MongoDB)
# ===================================
MONGODB_URI=mongodb://localhost:27017/plato_menu_dev
MONGODB_TIMEOUT=10000
MONGODB_POOL_SIZE=5

# ===================================
# REDIS (Caching)
# ===================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_ENABLED=true

# ===================================
# SOCKET.IO (Real-time)
# ===================================
SOCKET_URL=http://localhost:5000
SOCKET_ENABLED=true
SOCKET_PING_INTERVAL=30000
SOCKET_PING_TIMEOUT=60000

# ===================================
# JWT (Authentication)
# ===================================
JWT_SECRET=dev_secret_key_min_32_characters_long
JWT_EXPIRE=24h
REFRESH_TOKEN_SECRET=dev_refresh_secret_key_min_32_chars
REFRESH_TOKEN_EXPIRE=7d

# ===================================
# SECURITY
# ===================================
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_ENABLED=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# ===================================
# EMAIL (Notifications)
# ===================================
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=465
EMAIL_USER=your_mailtrap_user
EMAIL_PASSWORD=your_mailtrap_password
EMAIL_FROM=dev@platomenu.local
EMAIL_ENABLED=false

# ===================================
# FILE UPLOAD
# ===================================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf

# ===================================
# LOGGING
# ===================================
LOG_LEVEL=debug
LOG_DIR=./logs
LOG_MAX_SIZE=50M
LOG_MAX_FILES=7

# ===================================
# API KEYS (Mock/Test Keys)
# ===================================
PAYMENT_GATEWAY_KEY=pk_test_mock_key
PAYMENT_GATEWAY_SECRET=sk_test_mock_secret
SMS_API_KEY=test_sms_key
SMS_API_URL=http://localhost:9000/sms

# ===================================
# FEATURE FLAGS
# ===================================
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
ENABLE_EXPORT=true
ENABLE_REPORTS=true

# ===================================
# MONITORING & ANALYTICS
# ===================================
SENTRY_DSN=
DATADOG_API_KEY=
DATADOG_ENABLED=false

# ===================================
# FRONTEND
# ===================================
FRONTEND_URL=http://localhost:3000
FRONTEND_PORT=3000
```

## Testing Environment (.env.test)

```bash
# ===================================
# SERVER CONFIGURATION
# ===================================
NODE_ENV=test
PORT=5001
HOST=localhost

# ===================================
# DATABASE (MongoDB - Test DB)
# ===================================
MONGODB_URI=mongodb://localhost:27017/plato_menu_test
MONGODB_TIMEOUT=5000
MONGODB_POOL_SIZE=2

# ===================================
# REDIS (Caching - Test Instance)
# ===================================
REDIS_HOST=localhost
REDIS_PORT=6380
REDIS_PASSWORD=
REDIS_DB=1
REDIS_ENABLED=true

# ===================================
# SOCKET.IO
# ===================================
SOCKET_URL=http://localhost:5001
SOCKET_ENABLED=true

# ===================================
# JWT
# ===================================
JWT_SECRET=test_secret_key_min_32_characters_long
JWT_EXPIRE=1h
REFRESH_TOKEN_SECRET=test_refresh_secret_min_32_chars
REFRESH_TOKEN_EXPIRE=1d

# ===================================
# SECURITY
# ===================================
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3001
RATE_LIMIT_ENABLED=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10000

# ===================================
# EMAIL
# ===================================
EMAIL_ENABLED=false

# ===================================
# FILE UPLOAD
# ===================================
UPLOAD_DIR=./test-uploads
MAX_FILE_SIZE=10485760

# ===================================
# LOGGING
# ===================================
LOG_LEVEL=error
LOG_DIR=./test-logs

# ===================================
# FEATURE FLAGS
# ===================================
ENABLE_ANALYTICS=false
ENABLE_NOTIFICATIONS=false
ENABLE_EXPORT=false
ENABLE_REPORTS=false
```

## Setup Instructions

### 1. Create Environment Files

```bash
cd server

# Copy templates
cp .env.example.production .env.production
cp .env.example.development .env.development
cp .env.example.test .env.test
```

### 2. Update Configuration

Edit the files with your actual values:

```bash
# Production
nano .env.production

# Development
nano .env.development

# Testing
nano .env.test
```

### 3. Gitignore

Make sure `.env*` files are in `.gitignore`:

```bash
# .gitignore
.env
.env.local
.env.*.local
.env.production
.env.development
.env.test
```

### 4. Load Environment Variables

```javascript
// server.js
import dotenv from "dotenv";

// Load environment-specific config
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

console.log(`Loaded environment: ${process.env.NODE_ENV}`);
```

### 5. Access in Code

```javascript
// Access environment variables
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const redisHost = process.env.REDIS_HOST;
const socketUrl = process.env.SOCKET_URL;
```

## Security Best Practices

### Production Secrets

1. ✅ Use strong random values for JWT secrets
2. ✅ Never commit `.env` files to git
3. ✅ Use environment variable management tools (Vault, AWS Secrets Manager)
4. ✅ Rotate secrets regularly
5. ✅ Use different secrets for each environment
6. ✅ Use HTTPS only
7. ✅ Enable CORS only for trusted domains

### Database Security

1. ✅ Use strong database passwords
2. ✅ Enable MongoDB authentication
3. ✅ Use encrypted connections
4. ✅ Restrict database access by IP

### Redis Security

1. ✅ Use Redis password protection
2. ✅ Disable dangerous commands in production
3. ✅ Use Redis with AUTH enabled
4. ✅ Consider Redis in private VPC

### Email Configuration

1. ✅ Use app-specific passwords (not main password)
2. ✅ Enable 2FA on email account
3. ✅ Use verified sender address
4. ✅ Consider email service provider

## Verification

### Test Configuration

```bash
# Test MongoDB connection
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('MongoDB OK')).catch(e => console.log('Error:', e.message))"

# Test Redis connection
node -e "require('dotenv').config(); const redis = require('redis'); const client = redis.createClient({host: process.env.REDIS_HOST, port: process.env.REDIS_PORT}); client.on('ready', () => console.log('Redis OK')); client.on('error', (e) => console.log('Error:', e.message))"

# Test environment loading
node -e "require('dotenv').config(); console.log('NODE_ENV:', process.env.NODE_ENV); console.log('Port:', process.env.PORT)"
```

---

**Configuration Template** | **Phase 4** | **Production Ready** ✅
