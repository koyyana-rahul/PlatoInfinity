# Complete Integration & Debugging Guide

## Current Status

- ✅ AuthAxios configured with `withCredentials: true`
- ✅ Interceptors for request/response handling
- ✅ Backend requireAuth middleware with logging
- ✅ Backend requireRole middleware with logging
- ✅ Dashboard routes configured
- ✅ Diagnostic endpoints created
- ❌ Still getting 403 "insufficient role" on /api/dashboard/stats

## Root Cause Analysis

The error "Forbidden - insufficient role" **only** comes from `requireRole` middleware. But `/stats` doesn't use `requireRole`.

**This means ONE of these is happening:**

1. **The `/stats` endpoint HAS requireRole that shouldn't be there** ← Check dashboard.route.js
2. **Another endpoint is being called instead of /stats** ← Check what endpoint is actually being hit
3. **User role is undefined/null** ← Check MongoDB user record
4. **A different error handler is returning 403** ← Search codebase for "403" or "Forbidden"

## Step 1: Verify Correct Route is Loaded

Run this to check the EXACT dashboard route file:

```bash
cat server/route/dashboard.route.js
```

Look for this EXACT line:

```javascript
dashboardRouter.get("/stats", requireAuth, dashboardStatsController);
```

If you see `requireRole` in the `/stats` route, that's the problem!

## Step 2: Search for Hardcoded 403 Responses

Search codebase for any 403 responses:

```bash
grep -r "403" server/ --include="*.js" | grep -v node_modules
```

If you find other 403 responses with "insufficient role", something else is being called.

## Step 3: Enable Request Logging & Restart Server

The diagnostic logs show WHICH route is being hit:

```
🔍 DASHBOARD REQUEST INTERCEPTED
   URL: /api/dashboard/stats
   Method: GET
```

If you see a DIFFERENT URL or route, that's your problem!

## Step 4: Complete Server Restart (Critical!)

**Windows:**

```bash
taskkill /F /IM node.exe
timeout /t 3
cd server
NODE_ENV=development npm start
```

**Then in browser:**

1. Open DevTools → Network tab
2. Clear cookies if needed
3. Log out and log back in
4. Go to Admin Dashboard
5. Check server logs for diagnostic output
6. Share the server logs here

## Step 5: Check User Role in Database

If diagnostics show `/stats` is being hit but still 403, check MongoDB:

```
db.users.findOne({ email: "your-email" })
```

Look for `role` field. It should be one of:

- `BRAND_ADMIN`
- `MANAGER`
- `CHEF`
- `WAITER`
- `CASHIER`

If role is missing or empty, that's the problem!

## What I'll Check Next

Once you share the complete server logs, I'll look for:

1. **Is "DASHBOARD REQUEST INTERCEPTED" appearing?**
   - If NO: Request isn't reaching backend at all
   - If YES: Request is reaching backend

2. **Is "requireAuth DIAGNOSTICS" appearing?**
   - If NO: Dashboard interceptor is working but hitting wrong route
   - If YES: requireAuth middleware is processing request

3. **Is "STATS CONTROLLER REACHED" appearing?**
   - If NO: requireAuth is rejecting the request
   - If YES: Auth passed but controller might have error

4. **What logs appear between diagnostics?**
   - Shows exact flow and where it fails

## Quick Integration Checklist

✅ authAxios.js

- [ ] Has `withCredentials: true`?
- [ ] Has request interceptor?
- [ ] Has response interceptor with 401 handling?

✅ server/middleware/requireAuth.js

- [ ] Reads token from cookies?
- [ ] Verifies JWT?
- [ ] Loads user from DB?
- [ ] Has diagnostic logging?

✅ server/route/dashboard.route.js

- [ ] `/stats` route has ONLY `requireAuth` (NO `requireRole`)?
- [ ] `/summary` route has both `requireAuth` AND `requireRole`?

✅ server/index.js

- [ ] Imports `requireAuth`?
- [ ] Has `/api/test/debug` endpoint?
- [ ] Dashboard diagnostic middleware present?
- [ ] Dashboard router mounted at `/api/dashboard`?

✅ server/.env

- [ ] `NODE_ENV=development`?
- [ ] `JWT_SECRET=Rahul8620`?
- [ ] `PORT=8080`?

## To Get the Server Logs

1. Kill server: `Ctrl+C` in terminal
2. Restart: `NODE_ENV=development npm start`
3. Load admin dashboard in browser
4. Copy ALL terminal output that appears
5. Paste it here with this format:

```
=== SERVER LOG START ===
[paste here]
=== SERVER LOG END ===
```

The diagnostic output will tell us EXACTLY what's happening!
