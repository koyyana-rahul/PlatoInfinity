# Quick Setup & Testing Guide - Professional Admin Dashboard

## 🚀 Getting Started

### Step 1: Verify Backend Controllers Are Loaded

The 4 new controller functions are now in `server/controller/dashboard.extended.js` and exported from `dashboard.controller.js`.

**Verify the imports in dashboard.controller.js:**

```javascript
import {
  kpiMetricsController,
  performanceMetricsController,
  operationalMetricsController,
  revenueBreakdownController,
} from "./dashboard.extended.js";
```

✅ Both files are in place!

---

### Step 2: Verify Routes Are Registered

Check that `dashboard.route.js` has all 4 new routes:

```javascript
dashboardRouter.get("/kpi", requireAuth, requireRole(...), kpiMetricsController);
dashboardRouter.get("/performance", requireAuth, requireRole(...), performanceMetricsController);
dashboardRouter.get("/operational", requireAuth, requireRole(...), operationalMetricsController);
dashboardRouter.get("/revenue-breakdown", requireAuth, requireRole(...), revenueBreakdownController);
```

✅ All 4 routes are configured!

---

### Step 3: Verify Frontend Hooks Are Created

Check that all 4 hooks exist in `client/src/modules/admin/hooks/`:

- ✅ useKPIMetrics.js
- ✅ usePerformanceMetrics.js
- ✅ useOperationalMetrics.js
- ✅ useRevenueBreakdown.js

And they're exported in `hooks/index.js` ✅

---

### Step 4: Start Your Servers

**Terminal 1 - Backend:**

```bash
cd server
npm install  # if needed
npm start
# Should see: Server running on port 5000
```

**Terminal 2 - Frontend:**

```bash
cd client
npm install  # if needed
npm run dev
# Should see: Local: http://localhost:5173
```

---

## ✅ Testing Checklist

### Test 1: KPI Metrics Endpoint

```bash
curl -X GET "http://localhost:5000/api/dashboard/kpi?range=today" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "success": true,
  "error": false,
  "data": {
    "totalSales": 45200,
    "revenueTrend": 12,
    "ordersToday": 24,
    "ordersTrend": 8,
    "averageOrderValue": 1883,
    "avgTrend": 5,
    "completionRate": 95,
    "completionTrend": 3,
    "activeTables": 6,
    "activeUsers": 12
  }
}
```

**In Browser:**

- Navigate to Admin Dashboard
- See KPI cards populate with real data
- Values should update every 30 seconds

---

### Test 2: Performance Metrics Endpoint

```bash
curl -X GET "http://localhost:5000/api/dashboard/performance" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "success": true,
  "error": false,
  "data": [
    {
      "id": "staff_id",
      "name": "Staff Name",
      "role": "CHEF",
      "initials": "SN",
      "metric": {
        "label": "Orders Prepared",
        "value": 24,
        "trend": 12
      }
    }
  ]
}
```

**In Browser:**

- See "Top Performance" section with staff cards
- Should show top 4 performers
- Cards should have real names and metrics

---

### Test 3: Operational Metrics Endpoint

```bash
curl -X GET "http://localhost:5000/api/dashboard/operational?range=today" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "success": true,
  "error": false,
  "data": {
    "avgPreparationTime": "18 min",
    "avgDeliveryTime": "12 min",
    "customerSatisfaction": "4.7/5",
    "foodWastePercentage": "2.3%"
  }
}
```

**In Browser:**

- See "Operational Metrics" section in right sidebar
- Should display: Prep Time, Delivery Time, Satisfaction, Food Waste
- Values should update every 60 seconds

---

### Test 4: Revenue Breakdown Endpoint

```bash
curl -X GET "http://localhost:5000/api/dashboard/revenue-breakdown?range=today" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**

```json
{
  "success": true,
  "error": false,
  "data": [
    {
      "label": "Food Orders",
      "amount": "45200",
      "percentage": 62,
      "color": "green"
    },
    {
      "label": "Beverages",
      "amount": "18500",
      "percentage": 25,
      "color": "blue"
    },
    {
      "label": "Add-ons",
      "amount": "7300",
      "percentage": 10,
      "color": "orange"
    },
    {
      "label": "Delivery Charges",
      "amount": "2800",
      "percentage": 3,
      "color": "purple"
    }
  ]
}
```

**In Browser:**

- See "Revenue Breakdown" section in right sidebar
- Should show 4 categories with progress bars
- Percentages should add up to 100%
- Values should update every 60 seconds

---

### Test 5: Branch Filtering

```bash
# Get branch ID from your database or UI
curl -X GET "http://localhost:5000/api/dashboard/kpi?range=today&restaurantId=BRANCH_ID" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**In Browser:**

- Use Branch Selector dropdown at top
- Select a specific branch
- Dashboard should update to show only that branch's data
- All 4 components should update

---

### Test 6: Date Range Selection

**In Browser:**

- Use Time Range selector in Dashboard Header
- Change from "Today" to "This Week" or "This Month"
- KPI data should update
- Operational Metrics should update
- Revenue Breakdown should update

**API Call Example:**

```bash
curl -X GET "http://localhost:5000/api/dashboard/kpi?range=week" \
  -H "Cookie: token=YOUR_JWT_TOKEN"

# OR

curl -X GET "http://localhost:5000/api/dashboard/kpi?range=month" \
  -H "Cookie: token=YOUR_JWT_TOKEN"
```

---

## 🔍 Debugging Tips

### Issue: Empty Data / 0 Values

**Check:** Do you have orders in your database?

```bash
# Check if orders exist
db.orders.findOne()

# Check if bills exist
db.bills.findOne()

# Check if users exist with correct roles
db.users.findOne({ role: "CHEF" })
```

**Solution:** Create test data in database or create test orders through the app

---

### Issue: 401 Unauthorized Error

**Problem:** JWT token is missing or expired

**Solution:**

1. Log in first to get a valid token
2. Check that cookie is being sent (check DevTools → Application → Cookies)
3. Verify token is stored as HTTP-only cookie named "token"

---

### Issue: 403 Forbidden Error

**Problem:** User role doesn't have access

**Solution:**

1. Make sure logged-in user has role: ADMIN, MANAGER, or OWNER
2. Check middleware in dashboard.route.js - requireRole is checking for correct roles

---

### Issue: Data Not Updating / Loading Forever

**Problem:** API call failing silently

**Solution:**

1. Open Browser DevTools → Network tab
2. Trigger a dashboard refresh
3. Check the network request:
   - Should see GET /api/dashboard/kpi
   - Status should be 200 (not 404 or 500)
   - Response should have data

4. Check Console for errors:
   - Look for red error messages
   - Common: "Cannot read property 'reduce' of undefined"

---

### Issue: MongoDB Connection Error

**Problem:** Backend can't connect to database

**Solution:**

1. Check server console for MongoDB error
2. Verify MONGO_URI in .env is correct
3. Check MongoDB is running:
   ```bash
   mongosh  # Should connect successfully
   ```
4. Restart backend: `npm start`

---

## 📊 Sample Test Queries

### Test All Endpoints at Once

```bash
#!/bin/bash

TOKEN="your_jwt_token_here"
BASE_URL="http://localhost:5000"

echo "Testing KPI Metrics..."
curl -X GET "$BASE_URL/api/dashboard/kpi?range=today" \
  -H "Cookie: token=$TOKEN" | jq .

echo "Testing Performance Metrics..."
curl -X GET "$BASE_URL/api/dashboard/performance" \
  -H "Cookie: token=$TOKEN" | jq .

echo "Testing Operational Metrics..."
curl -X GET "$BASE_URL/api/dashboard/operational?range=today" \
  -H "Cookie: token=$TOKEN" | jq .

echo "Testing Revenue Breakdown..."
curl -X GET "$BASE_URL/api/dashboard/revenue-breakdown?range=today" \
  -H "Cookie: token=$TOKEN" | jq .
```

---

## 🎯 What Should You See?

### In Browser (Admin Dashboard Page)

**Top Section:**

- ✅ Dashboard Header with time range selector
- ✅ Branch selector dropdown
- ✅ Notifications bell icon

**Quick Actions Row:**

- ✅ 8 action buttons

**KPI Cards (5 cards):**

- ✅ Total Revenue with trend %
- ✅ Orders Today with trend %
- ✅ Avg Order Value with trend %
- ✅ Completion Rate with trend %
- ✅ Active Tables count

**Main Grid (3 columns):**

**Left Column (2/3 width):**

- ✅ Real Time Order Tracking (top 5 active orders)
- ✅ Recent Orders Table (with branch names)

**Right Column (1/3 width):**

- ✅ Revenue Breakdown (4 categories with progress bars)
- ✅ Operational Metrics (4 metrics: prep time, delivery, satisfaction, waste)

**Bottom Section:**

- ✅ Top Performance (4 staff cards)

**All values should be real numbers from your database!**

---

## ✨ Final Verification

### Backend Checklist:

- [ ] dashboard.extended.js file exists with 4 controllers
- [ ] dashboard.controller.js imports and exports new controllers
- [ ] dashboard.route.js has 4 new routes registered
- [ ] All routes have requireAuth and requireRole middleware
- [ ] No console errors when server starts

### Frontend Checklist:

- [ ] All 4 hook files exist (.js files)
- [ ] hooks/index.js exports all 4 hooks
- [ ] dashboard.api.js has 4 new fetch methods
- [ ] AdminDashboard.jsx imports all 4 hooks
- [ ] AdminDashboard.jsx passes real data to components
- [ ] PerformanceMetrics.jsx updated with new data structure
- [ ] No console errors when page loads

### Data Checklist:

- [ ] API returns real data (not empty objects)
- [ ] Components display data correctly
- [ ] Auto-refresh works (values change every 30-60 seconds)
- [ ] Branch filtering works
- [ ] Date range selection works
- [ ] Loading states show while fetching

---

## 🎉 Success Indicators

✅ **You'll know it's working when:**

1. Dashboard loads without errors
2. KPI cards show real numbers (not 0)
3. Staff names appear in Performance section
4. Revenue breakdown shows real amounts
5. Branch selector filters data
6. Time range selector updates data
7. Values auto-refresh every 30-60 seconds
8. No mock/dummy data appears
9. Network tab shows successful API calls
10. Console has no errors

---

## 🆘 Still Having Issues?

### Check These Files First:

1. **Backend not responding?**
   - Verify `server/controller/dashboard.extended.js` exists
   - Check `server/route/dashboard.route.js` has all routes
   - Check server console for errors

2. **Frontend not showing data?**
   - Verify hooks exist in `client/src/modules/admin/hooks/`
   - Check browser console (F12) for errors
   - Check Network tab for failed API calls

3. **Data not real?**
   - Check MongoDB has orders/bills/users data
   - Verify API responses in Network tab
   - Check database connection

### Quick Test:

```bash
# 1. Is backend running?
curl http://localhost:5000/health

# 2. Are routes registered?
curl http://localhost:5000/api/dashboard/stats

# 3. Is auth working?
curl http://localhost:5000/api/dashboard/kpi \
  -H "Cookie: token=test"
```

---

**Everything is set up and ready to go! Start your servers and test the dashboard.** 🚀
