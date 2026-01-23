# Quick Commands - Copy & Paste Ready

## 1️⃣ Restart Server (Windows)

Kill existing process and start fresh:

```bash
cd server
taskkill /F /IM node.exe
timeout /t 3
NODE_ENV=development npm start
```

**Watch for this in logs:**

```
✅ Server listening on port 8080
✅ MongoDB connected
```

---

## 2️⃣ Check Cookies in Browser

Open DevTools Console (F12) and run:

```javascript
console.log("=== COOKIES ===");
console.log(document.cookie);
```

**Expected Output:**

```
=== COOKIES ===
accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....; refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 3️⃣ Test Authentication

Run in DevTools Console:

```javascript
console.log("=== TESTING AUTHENTICATION ===");
fetch("http://localhost:8080/api/test/debug", {
  credentials: "include",
})
  .then((r) => {
    console.log("Status:", r.status);
    return r.json();
  })
  .then((d) => {
    console.log("Response:", d);
    if (d.success) {
      console.log("✅ AUTHENTICATED");
      console.log("Name:", d.user.name);
      console.log("Email:", d.user.email);
      console.log("Role:", d.user.role);
    } else {
      console.log("❌ AUTHENTICATION FAILED");
      console.log("Error:", d.error);
    }
  })
  .catch((e) => console.error("Network Error:", e));
```

**Expected Output (Success):**

```
Status: 200
Response: {
  success: true,
  message: "Auth is working!",
  user: {
    _id: "...",
    name: "Your Name",
    email: "your@email.com",
    role: "MANAGER"
  },
  timestamp: "2024-01-15T10:30:00.000Z"
}
✅ AUTHENTICATED
Name: Your Name
Email: your@email.com
Role: MANAGER
```

**If Status is 401:**

```
Status: 401
Response: { success: false, error: "Unauthorized" }
❌ AUTHENTICATION FAILED
Error: Unauthorized
→ ACTION: Log in again
```

**If Status is 403:**

```
Status: 403
Response: { success: false, error: "Forbidden - insufficient role" }
❌ AUTHENTICATION FAILED
Error: Forbidden - insufficient role
→ ACTION: Check user role in MongoDB
```

---

## 4️⃣ Test Dashboard Stats

Run in DevTools Console:

```javascript
console.log("=== TESTING DASHBOARD STATS ===");
fetch("http://localhost:8080/api/dashboard/stats?range=today", {
  credentials: "include",
})
  .then((r) => {
    console.log("Status:", r.status);
    return r.json();
  })
  .then((d) => {
    console.log("Response:", d);
    if (d.success) {
      console.log("✅ STATS LOADED");
      console.log("Total Sales:", "$" + d.data.totalSales);
      console.log("Orders Today:", d.data.ordersToday);
      console.log("Active Tables:", d.data.activeTables);
      console.log("Active Users:", d.data.activeUsers);
      console.log("Avg Order:", "$" + d.data.averageOrderValue);
      console.log("Completion Rate:", d.data.completionRate + "%");
    } else {
      console.log("❌ STATS FAILED");
      console.log("Error:", d.error);
    }
  })
  .catch((e) => console.error("Network Error:", e));
```

**Expected Output (Success):**

```
Status: 200
Response: {
  success: true,
  error: false,
  data: {
    totalSales: 5000,
    ordersToday: 12,
    activeTables: 3,
    activeUsers: 5,
    averageOrderValue: 416.67,
    completionRate: 92
  }
}
✅ STATS LOADED
Total Sales: $5000
Orders Today: 12
Active Tables: 3
Active Users: 5
Avg Order: $416.67
Completion Rate: 92%
```

**If Status is 403:**

```
Status: 403
Response: { success: false, error: "Forbidden - insufficient role" }
❌ STATS FAILED
Error: Forbidden - insufficient role
→ ACTION: Check requireAuth in server/middleware/requireAuth.js
→ ACTION: Check server logs for "STATS CONTROLLER REACHED"
```

---

## 5️⃣ Test Reports - Sales Report

Run in DevTools Console:

```javascript
console.log("=== TESTING SALES REPORT ===");
const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const to = new Date().toISOString();
console.log("Date Range:", from, "to", to);

fetch(`http://localhost:8080/api/reports/sales?from=${from}&to=${to}`, {
  credentials: "include",
})
  .then((r) => {
    console.log("Status:", r.status);
    return r.json();
  })
  .then((d) => {
    console.log("Response:", d);
    if (d.success) {
      console.log("✅ SALES REPORT LOADED");
      console.log("Total Sales:", "$" + d.data.totalSales);
      console.log("Items Sold:", d.data.itemsSold);
      console.log("Avg Order:", "$" + d.data.averageOrderValue);
    } else {
      console.log("❌ SALES REPORT FAILED");
      console.log("Error:", d.error);
    }
  })
  .catch((e) => console.error("Network Error:", e));
```

**Expected Output (Success):**

```
Status: 200
Response: {
  success: true,
  error: false,
  data: {
    totalSales: 5000,
    averageOrderValue: 416.67,
    itemsSold: 24,
    totalDiscount: 500,
    totalTax: 750
  }
}
✅ SALES REPORT LOADED
Total Sales: $5000
Items Sold: 24
Avg Order: $416.67
```

---

## 6️⃣ Test All Report Endpoints

Run in DevTools Console:

```javascript
console.log("=== TESTING ALL REPORT ENDPOINTS ===");

const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const to = new Date().toISOString();

const endpoints = [
  "/api/reports/sales",
  "/api/reports/daily-sales",
  "/api/reports/hourly-sales",
  "/api/reports/items",
  "/api/reports/top-items",
  "/api/reports/waiters",
  "/api/reports/gst",
  "/api/reports/tax-breakup",
];

const promises = endpoints.map((endpoint) =>
  fetch(`http://localhost:8080${endpoint}?from=${from}&to=${to}`, {
    credentials: "include",
  })
    .then((r) => r.json())
    .then((d) => ({
      endpoint,
      status: d.success ? "✅" : "❌",
      data: d,
    }))
    .catch((e) => ({
      endpoint,
      status: "❌",
      error: e.message,
    })),
);

Promise.all(promises).then((results) => {
  console.table(
    results.map((r) => ({
      endpoint: r.endpoint,
      status: r.status,
      success: r.data?.success || false,
    })),
  );
  results.forEach((r) => console.log(r));
});
```

**Expected Output:**

```
All 8 endpoints should show ✅ and success: true
```

---

## 7️⃣ Monthly P&L Report (OWNER Only)

Run in DevTools Console:

```javascript
console.log("=== TESTING MONTHLY P&L REPORT (OWNER ONLY) ===");

fetch("http://localhost:8080/api/reports/monthly-pl?month=01&year=2024", {
  credentials: "include",
})
  .then((r) => {
    console.log("Status:", r.status);
    return r.json();
  })
  .then((d) => {
    console.log("Response:", d);
    if (d.success) {
      console.log("✅ P&L REPORT LOADED");
      console.log("Data:", d.data);
    } else {
      console.log("Note:", d.error);
      if (r.status === 403) {
        console.log("ℹ️  This endpoint requires OWNER role");
      }
    }
  })
  .catch((e) => console.error("Network Error:", e));
```

---

## 8️⃣ Check MongoDB User Role

Run in MongoDB Atlas or MongoDB CLI:

```javascript
db.users.findOne({ email: "your-email@example.com" });
```

**Expected Output:**

```json
{
  "_id": ObjectId("..."),
  "name": "Your Name",
  "email": "your-email@example.com",
  "role": "MANAGER",  // or OWNER, BRAND_ADMIN
  "password": "$2b$...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**If role is missing:**

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "MANAGER" } },
);
```

---

## 9️⃣ Monitor Server Logs

Keep server terminal open and watch for:

```
✅ Request to /api/dashboard/stats
✅ requireAuth: Token extracted
✅ requireAuth: JWT verified
✅ STATS CONTROLLER REACHED
✅ Response sent: 200 OK
```

**Or if error:**

```
❌ requireAuth: No token found
❌ requireAuth: JWT verification failed
❌ Response sent: 401 Unauthorized
```

---

## 🔟 Monitor Network Requests

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by: XHR/Fetch
4. Look for these requests:

| Request                     | Expected Status  |
| --------------------------- | ---------------- |
| `/api/test/debug`           | 200 ✅           |
| `/api/dashboard/stats`      | 200 ✅           |
| `/api/dashboard/summary`    | 200 ✅           |
| `/api/reports/sales`        | 200 ✅           |
| `/api/reports/daily-sales`  | 200 ✅           |
| `/api/reports/items`        | 200 ✅           |
| `/api/reports/hourly-sales` | 200 ✅           |
| `/api/reports/top-items`    | 200 ✅           |
| `/api/reports/waiters`      | 200 ✅           |
| `/api/reports/gst`          | 200 ✅           |
| `/api/reports/tax-breakup`  | 200 ✅           |
| `/api/reports/monthly-pl`   | 200 ✅ or 403 ⚠️ |

**Click each request to see:**

- **Headers:** Look for `Cookie: accessToken=...`
- **Response:** Should be JSON with `success: true, data: {...}`

---

## ⚠️ Common Issues & Fixes

### Issue: 403 Forbidden on /api/dashboard/stats

```bash
# FIX 1: Restart server
taskkill /F /IM node.exe && timeout /t 2 && cd server && NODE_ENV=development npm start

# FIX 2: Check token is valid (Step 3 above)

# FIX 3: Check user role exists
# In MongoDB: db.users.findOne({ email: "your@email.com" })
# Should have: "role": "MANAGER" (or similar)

# FIX 4: Log out and log back in
# This refreshes your tokens
```

### Issue: 401 Unauthorized

```bash
# Token is expired
# FIX: Log out and log back in

# Or manually refresh token:
# Open DevTools Console and run Step 3 test
# This will trigger auto-refresh
```

### Issue: Connection Error (ERR_CONNECTION_REFUSED)

```bash
# Backend is not running
# FIX 1: Check if Node process exists
netstat -ano | findstr 8080

# FIX 2: Start server
cd server
NODE_ENV=development npm start

# FIX 3: Check port not blocked
# If 8080 is busy, kill it:
taskkill /F /IM node.exe
# Then start server again
```

### Issue: Stats Show $0 (No Data)

```bash
# Database is empty
# FIX: Add test data to MongoDB bills and orders collections
# Or manually create bills/orders in database

# Or check query range:
# If using range=today and no bills created today
# Try range=month instead
```

### Issue: Dashboard Spinner Keeps Loading

```bash
# API call failed
# FIX 1: Open Network tab, look for failed requests
# FIX 2: Check response status (401, 403, 500?)
# FIX 3: Go to Step 4 to test the endpoint directly
# FIX 4: Check server logs for error messages
```

---

## ✅ Success Checklist

Copy and paste each command, verify it works:

- [ ] Step 2: Cookies present
- [ ] Step 3: Auth test shows ✅ AUTHENTICATED
- [ ] Step 4: Stats test shows ✅ STATS LOADED
- [ ] Step 5: Sales report shows ✅ SALES REPORT LOADED
- [ ] Step 6: All 8 reports show ✅
- [ ] Step 9: Server logs show success messages
- [ ] Step 10: Network tab shows 200 status for all requests

**When all above are ✅, your Dashboard & Reports are fully integrated!** 🎉

---

## Need Help?

Check these files in order:

1. **TESTING_CHECKLIST.md** - Full step-by-step guide
2. **QUICK_REFERENCE.md** - Lookup tables
3. **INTEGRATION_COMPLETE_FINAL.md** - Technical deep dive
4. **ARCHITECTURE_DIAGRAM.md** - System flow diagrams
5. **DASHBOARD_REPORTS_INTEGRATION.md** - Comprehensive testing guide
