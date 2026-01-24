# 🚀 PLATO MENU - PRODUCTION DEPLOYMENT & SETUP GUIDE

**Version**: 2.0 - Startup Edition  
**Date**: January 24, 2026  
**Status**: Ready for Production

---

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [Responsive Design Verification](#responsive-design-verification)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## ✅ PREREQUISITES

### Required Software

- **Node.js** 16.x or higher
- **npm** 8.x or higher
- **MongoDB** 4.4 or higher
- **Git** 2.0 or higher

### Required Knowledge

- JavaScript ES6+
- React & Redux
- Express.js
- MongoDB
- REST APIs
- Socket.io

### System Requirements

- **CPU**: 2 cores minimum, 4 cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB minimum for database
- **Network**: Stable internet connection

---

## 📦 INSTALLATION

### Step 1: Clone Repository

```bash
git clone https://github.com/platomenu/Plato_Startup.git
cd Plato_Startup
```

### Step 2: Install Dependencies

#### Backend Dependencies

```bash
cd server
npm install

# Verify installation
npm list
```

#### Frontend Dependencies

```bash
cd ../client
npm install

# Verify installation
npm list
```

### Step 3: Verify Node Modules

```bash
# Backend required packages
- express
- mongoose
- cors
- dotenv
- jwt
- bcryptjs
- socket.io

# Frontend required packages
- react
- react-router-dom
- redux
- axios
- socket.io-client
- tailwindcss
- recharts (newly added)
```

**Add recharts if missing:**

```bash
cd client
npm install recharts
```

---

## ⚙️ CONFIGURATION

### Step 1: Create .env Files

#### Backend (.env)

```bash
# Database
MONGO_URI=mongodb://localhost:27017/plato_menu

# Server
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_here
JWT_EXPIRE=7d

# Admin
ADMIN_EMAIL=admin@platomenu.com
ADMIN_PASSWORD=AdminPassword123

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload (Optional)
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env)

```bash
# API
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Environment
VITE_ENV=development

# Features (optional)
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### Step 2: Verify Configuration

```bash
# Backend
cd server
npm run check:config

# Frontend
cd ../client
npm run check:config
```

---

## 🗄️ DATABASE SETUP

### Step 1: Start MongoDB

```bash
# On Windows
mongod

# On macOS
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### Step 2: Create Database

```bash
# Connect to MongoDB
mongo

# Create database
use plato_menu

# Create collections with indexes
db.createCollection("users")
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ restaurantId: 1 })

db.createCollection("restaurants")
db.restaurants.createIndex({ slug: 1 }, { unique: true })

db.createCollection("orders")
db.orders.createIndex({ restaurantId: 1, createdAt: -1 })
db.orders.createIndex({ status: 1 })

db.createCollection("deliveryorders")
db.deliveryorders.createIndex({ restaurantId: 1, createdAt: -1 })
db.deliveryorders.createIndex({ platform: 1, platformOrderId: 1 })
```

### Step 3: Seed Initial Data

```bash
cd server
npm run seed
```

---

## 🔧 BACKEND SETUP

### Step 1: Install Dependencies

```bash
cd server
npm install
```

### Step 2: Create Required Directories

```bash
mkdir -p uploads logs config/keys
```

### Step 3: Register New Routes

In `server/index.js`, add delivery routes:

```javascript
import deliveryRoute from "./route/delivery.route.js";
// ... other imports

// Add this line in routes section
app.use("/api/restaurants", deliveryRoute);
```

### Step 4: Create Database Indexes

```bash
cd server
npm run create:indexes
```

### Step 5: Start Backend Server

```bash
# Development
npm run dev

# Production
npm run start
```

**Expected Output:**

```
✅ Database connected successfully
✅ Server running on port 5000
✅ Socket.io initialized
```

### Step 6: Verify Backend

```bash
curl http://localhost:5000/api/health
# Response: {"status":"ok","timestamp":"..."}
```

---

## 🎨 FRONTEND SETUP

### Step 1: Install Dependencies

```bash
cd client
npm install recharts  # Newly added
```

### Step 2: Create Responsive Component Aliases (Optional but Recommended)

In `vite.config.js`:

```javascript
export default defineConfig({
  resolve: {
    alias: {
      "@components": "/src/components",
      "@utils": "/src/utils",
      "@hooks": "/src/hooks",
    },
  },
});
```

### Step 3: Start Frontend Development Server

```bash
npm run dev
```

**Expected Output:**

```
VITE v4.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Step 4: Verify Frontend

Open `http://localhost:5173` in browser and check:

- [ ] Page loads without errors
- [ ] Login page appears
- [ ] No 404 errors in console

---

## 📱 RESPONSIVE DESIGN VERIFICATION

### Step 1: Test Mobile Responsiveness

#### Using Chrome DevTools

1. Open DevTools (F12)
2. Click Device Toggle (Ctrl+Shift+M)
3. Test these screen sizes:
   - **Mobile**: 375x667 (iPhone SE)
   - **Tablet**: 768x1024 (iPad)
   - **Desktop**: 1920x1080 (Laptop)

#### Checklist

- [ ] Text is readable (min 14px)
- [ ] Buttons are clickable (min 44px)
- [ ] Images are responsive
- [ ] Navigation is accessible
- [ ] No horizontal scrolling
- [ ] Layout stacks properly

### Step 2: Test New Components

#### Test ResponsiveGrid

1. Navigate to menu page
2. Verify items display as:
   - 1 column on mobile
   - 2-3 columns on tablet
   - 4+ columns on desktop

#### Test AnalyticsDashboard

1. Navigate to manager dashboard
2. Verify charts display properly on all screens
3. Check stat cards align correctly

#### Test ResponsiveTable

1. Navigate to any listing page
2. Verify:
   - Desktop: Table view
   - Mobile: Card view with expandable sections

#### Test NotificationCenter

1. Check bell icon in corner
2. Verify on mobile and desktop

### Step 3: Test Error Handling

#### Test ErrorBoundary

1. Trigger an error in component
2. Verify fallback UI appears
3. Check "Try Again" button works

#### Test Loading States

1. Open any page with data loading
2. Verify LoadingSpinner shows
3. Verify proper transition to content

#### Test Empty States

1. Navigate to page with no data
2. Verify EmptyState displays
3. Check action button if available

---

## 🧪 TESTING

### Step 1: Backend Testing

#### Test Authentication

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

#### Test API Endpoints

```bash
# Get restaurants
curl http://localhost:5000/api/restaurants \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get analytics
curl "http://localhost:5000/api/dashboard/analytics?restaurantId=ID&range=7d" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 2: Frontend Testing

#### Test Form Submission

1. Navigate to login page
2. Submit login form
3. Verify error messages appear
4. Verify success navigation

#### Test Real-time Updates

1. Open two browser windows (manager + chef)
2. Place order in manager
3. Verify order appears in chef dashboard
4. Mark order as ready
5. Verify update in manager view

#### Test Notifications

1. Open NotificationCenter
2. Trigger notification (table call, order ready)
3. Verify notification appears
4. Verify sound plays
5. Verify notification dismisses

### Step 3: Mobile Testing

#### Using Real Device

1. Get machine IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Connect phone to same WiFi
3. Open `http://MACHINE_IP:5173`
4. Test all pages on phone

#### Using Emulator

1. Open Android/iOS emulator
2. Navigate to app URL
3. Test all pages

---

## 🚀 DEPLOYMENT

### Step 1: Build Frontend

#### Development Build

```bash
cd client
npm run dev
```

#### Production Build

```bash
cd client
npm run build

# Verify build
ls -la dist/
```

### Step 2: Build Backend

#### Production Build

```bash
cd server
npm run build  # if applicable
```

### Step 3: Deploy to Server (Heroku Example)

#### Step 3a: Install Heroku CLI

```bash
npm install -g heroku
heroku login
```

#### Step 3b: Create Heroku Apps

```bash
# Backend
heroku create plato-menu-api

# Frontend
heroku create plato-menu-web
```

#### Step 3c: Set Environment Variables

```bash
# Backend
heroku config:set -a plato-menu-api MONGO_URI=mongodb+srv://...
heroku config:set -a plato-menu-api JWT_SECRET=...

# Frontend
heroku config:set -a plato-menu-web VITE_API_URL=https://plato-menu-api.herokuapp.com/api
```

#### Step 3d: Deploy

```bash
# Backend
cd server
git push heroku main

# Frontend
cd ../client
git push heroku main
```

### Step 4: Configure Domain

#### Update DNS Records

```
A Record: your-domain.com → Heroku IP
CNAME: www.your-domain.com → your-domain.herokuapp.com
```

#### Update CORS

Update `.env` on production:

```
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
SOCKET_CORS_ORIGIN=https://your-domain.com
```

---

## 📊 MONITORING & MAINTENANCE

### Step 1: Setup Monitoring

#### Health Checks

```javascript
// In server/index.js
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});
```

#### Error Logging

```bash
# Setup Sentry
npm install @sentry/node

# In server/index.js
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

### Step 2: Database Maintenance

#### Backup

```bash
# Daily backup
mongodump --uri="mongodb://localhost:27017/plato_menu" --out=./backups/daily/

# Weekly backup
# Setup cron job
0 2 * * 0 /path/to/backup.sh
```

#### Cleanup Old Data

```javascript
// Remove orders older than 90 days (monthly)
db.orders.deleteMany({
  createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
});
```

### Step 3: Performance Optimization

#### Database Optimization

```bash
# Analyze queries
db.orders.aggregate([...]).explain("executionStats")

# Create missing indexes
db.orders.createIndex({ status: 1, restaurantId: 1 })
```

#### Frontend Optimization

```bash
# Bundle analysis
npm run build -- --analyze

# Lighthouse audit
# In Chrome DevTools → Lighthouse
```

### Step 4: Security Checks

#### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

#### SSL Certificate

```bash
# Let's Encrypt (free)
certbot certonly --standalone -d your-domain.com
```

---

## 🆘 TROUBLESHOOTING

### Issue: MongoDB Connection Failed

**Solution:**

```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod  # or as service

# Verify connection
mongo --uri="mongodb://localhost:27017"
```

### Issue: CORS Error

**Solution:**

```javascript
// Update server/index.js
const allowedOrigins = ["http://localhost:5173", "https://your-domain.com"];
```

### Issue: Socket.io Not Connecting

**Solution:**

```javascript
// Update client socket configuration
const socket = io(process.env.VITE_SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});
```

### Issue: Components Not Responsive

**Solution:**

```bash
# Rebuild Tailwind CSS
npm run build:css

# Clear cache
rm -rf .next
npm run dev
```

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] Security scan completed

### Deployment

- [ ] Backend deployed and tested
- [ ] Frontend deployed and tested
- [ ] Database migrations completed
- [ ] DNS updated
- [ ] SSL certificate installed

### Post-Deployment

- [ ] Health check passing
- [ ] Monitoring setup
- [ ] Logs accessible
- [ ] Backup verified
- [ ] Team notified

---

## 📞 SUPPORT RESOURCES

### Documentation

- Backend API: `/docs/api`
- Frontend Components: `/docs/components`
- Deployment Guide: `PRODUCTION_UPGRADE_IMPLEMENTATION_GUIDE.md`
- Responsive Design: `PRODUCTION_UPGRADE_IMPLEMENTATION_GUIDE.md#responsive-design-standards`

### Community

- GitHub Issues: https://github.com/platomenu/Plato_Startup/issues
- Discussions: https://github.com/platomenu/Plato_Startup/discussions

### Contact

- Email: support@platomenu.com
- Support Portal: https://support.platomenu.com

---

## 🎉 NEXT STEPS

1. ✅ **Installation Complete** - Server running at localhost:5000
2. ✅ **Frontend Setup** - App running at localhost:5173
3. ✅ **Testing Complete** - All features verified
4. 📋 **Deploy to Staging** - Test on staging environment
5. 📋 **Deploy to Production** - Go live!

---

**Ready to go live!** 🚀

For support, contact: support@platomenu.com
