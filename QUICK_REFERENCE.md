# Quick Reference - Dashboard & Reports Integration

## 🚀 Start Here

### Backend

```bash
cd server
NODE_ENV=development npm start
```

### Frontend

```bash
cd client
npm run dev
```

## 📋 API Endpoints Summary

### Dashboard

| Method | Endpoint                 | Auth | Role          | Returns      |
| ------ | ------------------------ | ---- | ------------- | ------------ |
| GET    | `/api/dashboard/stats`   | ✅   | Any           | Stats data   |
| GET    | `/api/dashboard/summary` | ✅   | MANAGER/OWNER | Summary data |

### Reports

| Method | Endpoint                    | Auth | Role    | Returns          |
| ------ | --------------------------- | ---- | ------- | ---------------- |
| GET    | `/api/reports/sales`        | ✅   | MANAGER | Sales data       |
| GET    | `/api/reports/items`        | ✅   | MANAGER | Item sales       |
| GET    | `/api/reports/waiters`      | ✅   | MANAGER | Waiter stats     |
| GET    | `/api/reports/daily-sales`  | ✅   | MANAGER | Daily breakdown  |
| GET    | `/api/reports/hourly-sales` | ✅   | MANAGER | Hourly breakdown |
| GET    | `/api/reports/gst`          | ✅   | MANAGER | GST report       |
| GET    | `/api/reports/top-items`    | ✅   | MANAGER | Top items        |
| GET    | `/api/reports/tax-breakup`  | ✅   | MANAGER | Tax details      |
| GET    | `/api/reports/monthly-pl`   | ✅   | OWNER   | P&L report       |

## 🧪 Quick Tests

### Test 1: Check Authentication

```javascript
fetch("http://localhost:8080/api/test/debug", { credentials: "include" })
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### Test 2: Get Dashboard Stats

```javascript
fetch("http://localhost:8080/api/dashboard/stats", { credentials: "include" })
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### Test 3: Get Sales Report

```javascript
fetch("http://localhost:8080/api/reports/sales?from=2024-01-01&to=2024-12-31", {
  credentials: "include",
})
  .then((r) => r.json())
  .then((d) => console.log(d));
```

## 🔧 Troubleshooting

| Problem                 | Solution                                         |
| ----------------------- | ------------------------------------------------ |
| **403 Forbidden**       | Check user role: `db.users.findOne({email:"x"})` |
| **401 Unauthorized**    | Cookies missing - clear and re-login             |
| **Cannot find module**  | Run `npm install` in that directory              |
| **Port already in use** | Kill process: `taskkill /F /IM node.exe`         |
| **Blank dashboard**     | Check browser console for errors                 |
| **Wrong stats**         | Check database has test data                     |

## 📁 Key Files

**Backend:**

- `server/route/dashboard.route.js` - Dashboard routes
- `server/route/report.route.js` - Report routes
- `server/controller/dashboard.controller.js` - Dashboard logic
- `server/controller/report.controller.js` - Report logic

**Frontend:**

- `client/src/api/dashboard.api.js` - Dashboard API calls
- `client/src/api/reports.api.js` - Report API calls
- `client/src/api/authAxios.js` - Authenticated HTTP client
- `client/src/modules/admin/AdminDashboard.jsx` - Dashboard component

## ✅ Integration Status

| Component      | Status     | Notes                       |
| -------------- | ---------- | --------------------------- |
| Backend Routes | ✅ Fixed   | All paths corrected         |
| Frontend APIs  | ✅ Fixed   | All endpoints mapped        |
| Controllers    | ✅ Working | All 9 reports + 2 dashboard |
| Authentication | ✅ Working | Cookies + JWT tokens        |
| Authorization  | ✅ Working | Role-based access           |
| Error Handling | ✅ Working | Console logging             |

## 🎯 Success Criteria

- [ ] Server starts: `NODE_ENV=development npm start`
- [ ] Frontend starts: `npm run dev`
- [ ] Can log in
- [ ] Dashboard loads without 403/401
- [ ] Stats display: totalSales, ordersToday, etc.
- [ ] Browser console has no errors
- [ ] Server logs show "STATS CONTROLLER REACHED"

## 📞 Need Help?

Check these documents:

1. `DASHBOARD_REPORTS_INTEGRATION.md` - Full testing guide
2. `INTEGRATION_COMPLETE_FINAL.md` - Detailed explanation
3. `DIAGNOSTIC_403_FIX.md` - Debugging guide
4. `INTEGRATION_COMPLETE_GUIDE.md` - Step-by-step walkthrough
