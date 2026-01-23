# Dashboard & Reports Testing Checklist

## Pre-Test Setup ✅

- [ ] Server has been restarted with `npm start`
- [ ] Frontend is running at `http://localhost:5173`
- [ ] You're logged in with credentials that have MANAGER or OWNER role
- [ ] Browser DevTools console is open (F12)
- [ ] Network tab is visible to see requests

---

## Step 1: Verify Browser Cookies ✅

**What:** Check that authentication tokens are stored in browser

**How:**

1. Open DevTools (F12)
2. Go to Console tab
3. Run:
   ```javascript
   console.log("Cookies:", document.cookie);
   ```
4. Look for: `accessToken=...` and `refreshToken=...`

**Expected:**

```
Cookies: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**If Not Present:**

- [ ] You are NOT logged in
- [ ] **Action:** Log in again with email/password
- [ ] **Check:** After login, run the command again

**✅ Pass Criteria:** Cookies present and contain token data

---

## Step 2: Check Network Connection ✅

**What:** Verify frontend can communicate with backend

**How:**

1. DevTools → Network tab
2. Refresh page (Ctrl+R)
3. Look for requests to `http://localhost:8080`

**Expected:**

- [ ] See requests like `/api/...`
- [ ] Status codes are 200, 201, 401 (not connection errors)
- [ ] Requests have `Cookie` header with tokens

**If Errors:**

- [ ] Backend is not running on port 8080
- [ ] **Action:** Check server is running: `NODE_ENV=development npm start`
- [ ] **Action:** Check no port conflicts: `netstat -ano | findstr 8080`

**✅ Pass Criteria:** Requests reach backend without connection errors

---

## Step 3: Verify AuthAxios ✅

**What:** Check that HTTP interceptors are working

**How:**

1. Console tab
2. Run:
   ```javascript
   fetch("http://localhost:8080/api/test/debug", {
     credentials: "include",
   })
     .then((r) => r.json())
     .then((d) => console.log("Debug response:", d));
   ```
3. Check Network tab for the request

**Expected Response:**

```json
{
  "success": true,
  "message": "Auth is working!",
  "user": {
    "_id": "...",
    "name": "Your Name",
    "email": "your-email@example.com",
    "role": "MANAGER"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**If Error (401):**

- [ ] Token is expired
- [ ] **Action:** Log out and log in again
- [ ] **Check:** Tokens in cookies again

**If Error (403):**

- [ ] User role is not set
- [ ] **Action:** Check MongoDB: `db.users.findOne({ email: "your-email" })`
- [ ] **Action:** Verify user has `role` field (MANAGER, OWNER, etc.)

**✅ Pass Criteria:** Get success response with your user details

---

## Step 4: Test Dashboard Stats Endpoint ✅

**What:** Verify dashboard statistics are loading

**How:**

1. Console tab
2. Run:
   ```javascript
   fetch("http://localhost:8080/api/dashboard/stats?range=today", {
     credentials: "include",
   })
     .then((r) => r.json())
     .then((d) => console.log("Stats:", d));
   ```
3. Check Network tab for 200 OK response

**Expected Response:**

```json
{
  "success": true,
  "error": false,
  "data": {
    "totalSales": 5000,
    "ordersToday": 12,
    "activeTables": 3,
    "activeUsers": 5,
    "averageOrderValue": 416.67,
    "completionRate": 92
  }
}
```

**If Error (403 Forbidden):**

```json
{
  "success": false,
  "error": "Forbidden - insufficient role"
}
```

- [ ] Check server logs - Should show: `✅ ============ 📊 STATS CONTROLLER REACHED ============`
- [ ] If NOT showing that log:
  - [ ] Request is not reaching controller
  - [ ] Check requireAuth middleware output in logs
  - [ ] **Action:** Check if token is valid: Run Step 3 again
- [ ] If showing that log:
  - [ ] Controller executed but returned error
  - [ ] **Action:** Check MongoDB connection in server logs
  - [ ] **Action:** Check if bills/orders collections exist

**If Error (500 Server Error):**

- [ ] Database query failed
- [ ] **Action:** Check server logs for MongoDB errors
- [ ] **Action:** Verify MongoDB is running and accessible

**✅ Pass Criteria:** Get 200 OK response with stats data (all numbers > 0)

---

## Step 5: Navigate to Admin Dashboard ✅

**What:** Check if dashboard page loads without errors

**How:**

1. Go to http://localhost:5173
2. Log in if not already
3. Navigate to Admin Dashboard (via sidebar menu)
4. Wait 3 seconds for stats to load
5. Open DevTools console
6. Check for error messages (red text)

**Expected:**

- [ ] Page loads without errors
- [ ] Stats cards show numbers:
  - Total Sales: $ amount
  - Orders Today: number
  - Active Tables: number
  - Active Users: number
  - Average Order: $ amount
  - Completion Rate: % number
- [ ] Page refreshes every 30 seconds (auto-update)
- [ ] Console shows no 403/401 errors

**If Dashboard Shows "No data" or Spinner Keeps Loading:**

- [ ] API call failed silently
- [ ] **Action:** Check Network tab → filter by XHR
- [ ] **Action:** Look for /api/dashboard/stats request
- [ ] **Action:** Check response status and data
- [ ] **Action:** If 403: Go to Step 4

**✅ Pass Criteria:** All stats display with real numbers

---

## Step 6: Test Dashboard Summary (Manager Dashboard) ✅

**What:** Verify manager dashboard works

**How:**

1. Console tab
2. Run:
   ```javascript
   fetch("http://localhost:8080/api/dashboard/summary?range=today", {
     credentials: "include",
   })
     .then((r) => r.json())
     .then((d) => console.log("Summary:", d));
   ```

**Expected Response:**

```json
{
  "success": true,
  "error": false,
  "data": {
    "totalRevenue": 5000,
    "totalOrders": 12,
    "totalItems": 24,
    "totalDiscount": 500,
    "totalTax": 750,
    "paymentMethods": {
      "CASH": 3000,
      "CARD": 2000,
      "UPI": 0
    }
  }
}
```

**If Error (403):**

- [ ] Your role is not MANAGER or OWNER
- [ ] **Action:** Check your role in MongoDB
- [ ] **Action:** Ensure you're logged in as correct user

**✅ Pass Criteria:** Get summary data

---

## Step 7: Test Reports - Sales Report ✅

**What:** Verify reports endpoint works

**How:**

1. Console tab
2. Run:
   ```javascript
   const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
   const to = new Date().toISOString(); // today
   fetch(`http://localhost:8080/api/reports/sales?from=${from}&to=${to}`, {
     credentials: "include",
   })
     .then((r) => r.json())
     .then((d) => console.log("Sales Report:", d));
   ```

**Expected Response:**

```json
{
  "success": true,
  "error": false,
  "data": {
    "totalSales": 5000,
    "averageOrderValue": 416.67,
    "itemsSold": 24,
    "totalDiscount": 500,
    "totalTax": 750
  }
}
```

**If Error (403):**

- [ ] You don't have MANAGER/OWNER role
- [ ] **Action:** Check your role

**If Error (Other):**

- [ ] Check server logs for details
- [ ] **Action:** Verify date parameters are valid ISO strings

**✅ Pass Criteria:** Get sales report data

---

## Step 8: Test All Report Endpoints ✅

**Test each report endpoint:**

```javascript
// 1. Daily Sales Report
fetch("http://localhost:8080/api/reports/daily-sales?from=...&to=...", {
  credentials: "include",
});

// 2. Hourly Sales Report
fetch("http://localhost:8080/api/reports/hourly-sales?from=...&to=...", {
  credentials: "include",
});

// 3. Item Sales Report
fetch("http://localhost:8080/api/reports/items?from=...&to=...", {
  credentials: "include",
});

// 4. Top Items Report
fetch("http://localhost:8080/api/reports/top-items?limit=10&from=...&to=...", {
  credentials: "include",
});

// 5. Waiter Report
fetch("http://localhost:8080/api/reports/waiters?from=...&to=...", {
  credentials: "include",
});

// 6. GST Report
fetch("http://localhost:8080/api/reports/gst?from=...&to=...", {
  credentials: "include",
});

// 7. Tax Breakup Report
fetch("http://localhost:8080/api/reports/tax-breakup?from=...&to=...", {
  credentials: "include",
});

// 8. Monthly P&L Report (OWNER only)
fetch("http://localhost:8080/api/reports/monthly-pl?month=01&year=2024", {
  credentials: "include",
});
```

**Expected:**

- [ ] All endpoints return 200 OK with data
- [ ] Monthly P&L returns 403 if you're not OWNER
- [ ] Each report has unique data structure

**✅ Pass Criteria:** 7/8 reports return success (P&L may be 403 based on role)

---

## Step 9: Check Server Logs ✅

**What:** Verify backend is processing requests correctly

**How:**

1. Look at server terminal output
2. Search for these patterns:

**Should See (✅ Success Indicators):**

```
🔍 DASHBOARD REQUEST INTERCEPTED - [Timestamp]
Route: /api/dashboard/stats
Method: GET

========== 🔐 requireAuth DIAGNOSTICS ==========
Token extracted from: httpOnly cookie
JWT verified: ✅
User loaded: ID = ..., Role = MANAGER

============ 📊 STATS CONTROLLER REACHED ============
User: ... | Role: MANAGER | Cookies: accessToken, refreshToken
Calculating stats for range: today
```

**Should NOT See (❌ Error Indicators):**

```
Cannot read property 'email' of undefined  ← User not loaded
JWT Error: invalid token  ← Token verification failed
Forbidden - insufficient role  ← User role check failed
```

**If Seeing Error Indicators:**

- [ ] Go to Step 4 and test again
- [ ] Check if token is expired
- [ ] Check if user role is set in MongoDB

**✅ Pass Criteria:** See success indicators, no error indicators

---

## Step 10: Verify Frontend API Calls ✅

**What:** Check frontend is using correct API functions

**How:**

1. Check this file: `client/src/api/dashboard.api.js`
2. Verify these functions exist:

   ```javascript
   export const getStats = (range = "today") => ({
     url: "/api/dashboard/stats",
     method: "GET",
     params: { range },
   });

   export const summary = {
     url: "/api/dashboard/summary",
     method: "GET",
   };
   ```

3. Check this file: `client/src/api/reports.api.js`
4. Verify these functions exist:

   ```javascript
   export const getSalesReport = (from, to) => ({
     url: '/api/reports/sales',
     ...
   })

   export const getDailySalesReport = (from, to) => ({
     url: '/api/reports/daily-sales',
     ...
   })
   // ... 7 more report functions
   ```

**✅ Pass Criteria:** All functions exist with correct URLs

---

## Integration Status Summary

After completing all 10 steps, you should see:

| Component         | Status     | Evidence                            |
| ----------------- | ---------- | ----------------------------------- |
| Cookies           | ✅ Working | document.cookie shows tokens        |
| AuthAxios         | ✅ Working | /api/test/debug returns user        |
| Dashboard Stats   | ✅ Working | /api/dashboard/stats returns data   |
| Dashboard Summary | ✅ Working | /api/dashboard/summary returns data |
| Reports (Sales)   | ✅ Working | /api/reports/sales returns data     |
| Reports (Others)  | ✅ Working | All 8 report endpoints return data  |
| UI Components     | ✅ Working | Dashboard displays stats            |
| Server Logs       | ✅ Working | Shows success indicators            |
| Frontend APIs     | ✅ Working | Correct functions with right URLs   |

---

## Troubleshooting Quick Reference

| Error                  | Cause                             | Fix                                         |
| ---------------------- | --------------------------------- | ------------------------------------------- |
| 401 Unauthorized       | Token expired or invalid          | Log in again                                |
| 403 Forbidden          | User role not set or insufficient | Check MongoDB user role                     |
| 500 Server Error       | Database error                    | Check MongoDB connection, check server logs |
| Connection Error       | Backend not running               | `npm start` in server folder                |
| No data loading        | API call failed                   | Check Network tab, check status code        |
| Stats show $0          | No bills/orders in DB             | Add test data to MongoDB                    |
| Spinner keeps spinning | Component waiting for response    | Check console for errors                    |

---

## Success Criteria ✅

**You have successfully integrated Dashboard & Reports when:**

1. ✅ You can log in without 403 errors
2. ✅ Dashboard stats load and display correct numbers
3. ✅ All 8 report endpoints return data
4. ✅ Server logs show success indicators
5. ✅ No 403/401 errors in browser console
6. ✅ Network tab shows 200 OK responses
7. ✅ Dashboard refreshes every 30 seconds
8. ✅ All API functions have correct URLs

**Congratulations! Dashboard & Reports are now integrated and working! 🎉**
