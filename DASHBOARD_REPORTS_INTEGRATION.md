# Dashboard & Reports - Full Integration Guide

## ✅ What's Been Fixed

### Backend Routes

- **Dashboard Routes** (`/api/dashboard`)
  - `GET /stats` - Admin dashboard stats (requireAuth only)
  - `GET /summary` - Manager dashboard summary (requireAuth + requireRole)

- **Report Routes** (`/api/reports`)
  - `GET /sales` - Sales summary report
  - `GET /items` - Item sales report
  - `GET /waiters` - Waiter performance report
  - `GET /daily-sales` - Daily sales breakdown
  - `GET /hourly-sales` - Hourly sales breakdown
  - `GET /gst` - GST report
  - `GET /top-items` - Top selling items
  - `GET /tax-breakup` - Tax breakup report
  - `GET /monthly-pl` - Monthly P&L report

### Frontend API Configuration

- **Dashboard API** (`client/src/api/dashboard.api.js`)
  - `getStats(range)` - Calls `/api/dashboard/stats`
  - `getRecentOrders(limit, range)` - Calls `/api/order/recent`
  - `summary` - Calls `/api/dashboard/summary`

- **Reports API** (`client/src/api/reports.api.js`)
  - `getSalesReport(from, to)` - Sales report
  - `getDailySalesReport(from, to)` - Daily sales
  - `getHourlySalesReport(from, to)` - Hourly sales
  - `getItemSalesReport(from, to)` - Items report
  - `getTopItemsReport(limit, from, to)` - Top items
  - `getWaiterReport(from, to)` - Waiter stats
  - `getGSTReport(from, to)` - GST report
  - `getTaxBreakupReport(from, to)` - Tax breakup
  - `getMonthlyPLReport(month, year)` - P&L report

### Frontend Components

- **AdminDashboard.jsx**
  - Uses `dashboardApi.getStats()`
  - Uses `dashboardApi.getRecentOrders()`
  - Displays stats and recent orders with error handling

## 🧪 Testing the Integration

### Test 1: Check Dashboard Stats

```bash
# In browser console
const res = await fetch('http://localhost:8080/api/dashboard/stats', {
  credentials: 'include'
});
const data = await res.json();
console.log(data);
```

Expected Response:

```json
{
  "success": true,
  "error": false,
  "data": {
    "totalSales": 5000,
    "ordersToday": 12,
    "activeTables": 3,
    "activeUsers": 5,
    "averageOrderValue": 416,
    "completionRate": 92
  }
}
```

### Test 2: Check Dashboard Summary

```bash
# In browser console
const res = await fetch('http://localhost:8080/api/dashboard/summary', {
  credentials: 'include'
});
const data = await res.json();
console.log(data);
```

Required: User must have MANAGER or OWNER role

### Test 3: Check Sales Report

```bash
# In browser console
const res = await fetch('http://localhost:8080/api/reports/sales?from=2024-01-01&to=2024-01-31', {
  credentials: 'include'
});
const data = await res.json();
console.log(data);
```

### Test 4: Load Admin Dashboard in Browser

1. Navigate to http://localhost:5173
2. Log in with your account
3. Go to Admin Dashboard
4. Check browser console for errors
5. Verify stats appear on screen

## 🔍 Troubleshooting

### Issue: Dashboard shows blank/error

**Check 1: Are cookies being sent?**

```javascript
// In browser console
document.cookie;
```

Should show: `accessToken=...;` and `refreshToken=...;`

**Check 2: Does user have correct role?**

```bash
# In MongoDB
db.users.findOne({ email: "your-email" })
# Look for role: "BRAND_ADMIN", "MANAGER", "OWNER", etc.
```

**Check 3: Check server logs**
Look for:

```
🔍 DASHBOARD REQUEST INTERCEPTED
========== 🔐 requireAuth DIAGNOSTICS ==========
✅ ============ 📊 STATS CONTROLLER REACHED ============
```

If not present, the request isn't reaching the backend.

### Issue: Getting 403 "insufficient role"

- User doesn't have required role
- Check: `db.users.findOne({ email: "your-email" }).role`
- Must be: `MANAGER`, `OWNER`, `BRAND_ADMIN`, etc.

### Issue: Getting 401 "Unauthorized"

- Token is missing or expired
- Clear cookies: `document.cookie = ""; location.reload()`
- Log out and log back in

## 📋 File Map

**Backend:**

```
server/
├── route/
│   ├── dashboard.route.js     ✅ Fixed - routes now match
│   └── report.route.js         ✅ Fixed - all paths corrected
├── controller/
│   ├── dashboard.controller.js ✅ Working - returns stats
│   └── report.controller.js    ✅ Working - 9 report types
└── middleware/
    ├── requireAuth.js          ✅ Working - validates tokens
    └── requireRole.js          ✅ Working - checks roles
```

**Frontend:**

```
client/src/
├── api/
│   ├── dashboard.api.js        ✅ Fixed - correct endpoints
│   ├── reports.api.js          ✅ Fixed - correct endpoints
│   └── authAxios.js            ✅ Working - withCredentials: true
└── modules/
    ├── admin/
    │   └── AdminDashboard.jsx  ✅ Working - using correct APIs
    └── manager/
        └── ManagerDashboard.jsx (optional - not implemented yet)
```

## 🚀 How to Run

### Start Backend

```bash
cd server
NODE_ENV=development npm start
```

Expected output:

```
✅ MongoDB connected
🚀 Plato API running on port 8080
```

### Start Frontend

```bash
cd client
npm run dev
```

Expected output:

```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### Test Flow

1. Browser loads: http://localhost:5173
2. Login with credentials
3. Navigate to Admin Dashboard
4. Stats load automatically
5. Check server logs for diagnostic output

## 📊 Expected Dashboard Display

Admin Dashboard should show:

- Total Sales (sum of PAID bills)
- Orders Today (count of orders)
- Active Tables (count of OCCUPIED tables)
- Active Users (count of OPEN sessions)
- Average Order Value (total / count)
- Order Completion Rate (SERVED / total)
- Recent Orders List (last 10 orders)

## ✅ Integration Checklist

- [x] Dashboard routes defined correctly
- [x] Report routes defined correctly
- [x] Dashboard controller working
- [x] Report controllers working
- [x] Frontend API configs match backend routes
- [x] AuthAxios configured with credentials
- [x] AdminDashboard component using correct APIs
- [x] Error handling in place
- [x] Logging for debugging

## 🔗 Related Files to Check

If issues persist, verify:

1. `server/.env` - NODE_ENV=development
2. `server/index.js` - Dashboard router mounted at `/api/dashboard`
3. `server/index.js` - Report router mounted at `/api/reports`
4. `client/.env` - API base URL correct
5. `client/vite.config.js` - Proxy config if needed
6. `server/config/connectDB.js` - MongoDB connection working

## 💡 Pro Tips

1. **Use DevTools Network Tab** to see actual requests and responses
2. **Check server logs** - they show exactly what's happening
3. **Test endpoints manually** using browser fetch API
4. **Use MongoDB Compass** to verify user roles
5. **Clear cookies** if auth state gets stuck
