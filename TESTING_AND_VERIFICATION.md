# Complete 403 Fix - Testing Protocol

## Changes Made

### 1. Fixed Cookie Settings (`server/controller/auth.controller.js`)

```javascript
function cookieOptions() {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    // Development: localhost:5173 → localhost:8080
    return {
      httpOnly: true,
      secure: false, // ✅ HTTP (not HTTPS)
      sameSite: "lax", // ✅ Allow same-domain requests
      path: "/",
    };
  }

  // Production: Full security
  return {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
  };
}
```

### 2. Enhanced Logging

- ✅ `server/middleware/requireAuth.js` - Logs cookies received
- ✅ `server/route/dashboard.route.js` - Logs middleware hit
- ✅ `server/controller/dashboard.controller.js` - Logs controller execution
- ✅ `server/controller/auth.controller.js` - Logs cookie options on login
- ✅ `client/src/modules/admin/AdminDashboard.jsx` - Logs full error response
- ✅ `server/index.js` - Added `/api/test/debug` endpoint for testing

### 3. Node.js Environment

- ✅ `.env` file has `NODE_ENV=development` (last occurrence wins)
- ✅ Cookie settings will use development config (sameSite: lax, secure: false)

## Testing the Fix

### Phase 1: Verify Cookies Are Set

1. Start server: `npm start` (from server directory)
2. Login at http://localhost:5173
3. **Check server console output:**
   ```
   ✅ Login successful - Cookies set:
      - accessToken cookie: eyJhbGc...
      - refreshToken cookie: eyJhbGc...
      - Cookie options: { httpOnly: true, secure: false, sameSite: 'lax', path: '/' }
      - NODE_ENV: development
      - isDev: true
   ```
4. **Expected:** All cookie options should show `secure: false` and `sameSite: 'lax'`

### Phase 2: Verify Cookies Are Sent in Requests

1. After login, open DevTools → Network tab
2. Look for the login request response
3. **Check Response Headers** for:
   ```
   Set-Cookie: accessToken=...; Path=/; HttpOnly
   Set-Cookie: refreshToken=...; Path=/; HttpOnly
   ```
4. **Verify domain/port compatibility:**
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:8080`
   - Same domain (localhost), different ports - should work with sameSite: lax

### Phase 3: Test Auth Middleware

1. Open browser DevTools → Console
2. Run this test:
   ```javascript
   const response = await fetch("http://localhost:8080/api/test/debug", {
     credentials: "include",
     method: "GET",
   });
   console.log("Status:", response.status);
   const data = await response.json();
   console.log("Data:", data);
   ```
3. **Check server console** for:
   ```
   --- requireAuth Middleware ---
   Timestamp: 2026-01-23T...
   Request Path: /api/test/debug
   Request Origin: http://localhost:5173
   Raw Cookie Header: accessToken=...; refreshToken=...
   Parsed Cookies: { accessToken: '...', refreshToken: '...' }
   ```
4. **Expected:**
   - Response status: 200
   - Response shows your user data
   - Server logs show cookies being received

### Phase 4: Test Dashboard Endpoint

1. Click Admin Dashboard in app
2. **Check server console** for:
   ```
   📍 Dashboard router middleware hit: GET /api/dashboard/stats?range=today
   --- requireAuth Middleware ---
   ...
   Raw Cookie Header: accessToken=...; refreshToken=...
   Parsed Cookies: { accessToken: '...', refreshToken: '...' }
   🚀 dashboardStatsController called!
      req.user: { _id: '...', name: '...', role: 'BRAND_ADMIN', ... }
   ```
3. **Expected:**
   - No 403 error
   - Dashboard loads stats successfully
   - Logs show all middlewares executed

### Phase 5: Full Integration Test

1. Complete fresh login
2. Navigate through admin dashboard
3. Check all endpoints:
   - `/api/dashboard/stats` ✅
   - `/api/order/recent` ✅
   - `/api/dashboard/summary` ✅ (has role check)

## Troubleshooting

### Symptom: Still getting 403

**Action:**

1. Check server console - does it show "Raw Cookie Header: Not present"?
   - **YES:** Cookies not being sent → Check Phase 2
   - **NO:** Cookies present → Check if controller returns 403

2. Check if requireAuth logs appear
   - **NO:** Route not being hit → Check route mounting order
   - **YES:** Cookies found but still 403 → Check controller logic

### Symptom: LOGIN shows cookie options but DASHBOARD doesn't show cookies

**Action:**

1. Maybe different requests or tabs
2. Maybe cookies expired (15 min timeout)
3. Check if refresh token endpoint works

### Symptom: Logs show correct cookies but still 403

**Action:**

1. Check if user.isActive is false
2. Check if role check is somewhere else
3. Check if admin user exists in database

## Files to Check

1. `server/.env` → Verify NODE_ENV=development
2. `server/index.js` → Check route order (dashboard after general /api routes)
3. `server/controller/auth.controller.js` → Cookie options logic
4. `server/middleware/requireAuth.js` → No role checks
5. `server/route/dashboard.route.js` → No requireRole on /stats
6. `client/src/api/authAxios.js` → withCredentials: true

## Quick Reference

```bash
# Start server with explicit env
NODE_ENV=development npm start

# Or on Windows CMD:
set NODE_ENV=development && npm start

# Or on Windows PowerShell:
$env:NODE_ENV="development"; npm start
```

## Success Indicators

✅ Admin Dashboard loads without 403
✅ Stats display with data
✅ Recent orders show up
✅ Server console shows full auth flow
✅ Network tab shows cookies in requests
✅ All 200 status responses

---

**If still failing:** Run all 5 phases and collect:

1. Full server console output
2. Browser console error (copy entire error object)
3. Network request details (headers & response)
4. .env file NODE_ENV value
