# 403 Forbidden Error - Diagnostic Guide

## Current Issue

Frontend is getting: `403 Forbidden - insufficient role` when calling `/api/dashboard/stats`

**Key Observations:**

1. AuthAxios is logging: `✅ AuthAxios: Request to /api/dashboard/stats (token via httpOnly cookie)`
2. Response is: `{message: 'Forbidden - insufficient role', error: true, success: false}`
3. The `/stats` route **should NOT** require a role check
4. The error message **only** comes from `requireRole` middleware

## Root Cause Hypothesis

The issue is likely ONE of these:

### Hypothesis 1: Server Code Not Updated

**Symptom:** Changes made aren't taking effect
**Solution:** Completely restart server

### Hypothesis 2: Cookies Not Reaching Backend

**Symptom:** `req.headers.cookie` is empty even though browser has cookies
**Solution:** Check CORS and cookie configuration

### Hypothesis 3: User Doesn't Have Role

**Symptom:** User record in DB has no `role` field set
**Solution:** Check user document in MongoDB

### Hypothesis 4: Wrong Route Being Hit

**Symptom:** A different endpoint with role check is being called
**Solution:** Check server logs for which routes are being hit

## Step-by-Step Diagnostic

### Step 1: Restart Server Completely

```bash
# Kill any node processes
taskkill /F /IM node.exe

# Wait 3 seconds
# Then restart
cd server
NODE_ENV=development npm start
```

### Step 2: Check Server Logs

Look for these logs when you request `/api/dashboard/stats`:

```
🔍 DASHBOARD REQUEST INTERCEPTED
   URL: /api/dashboard/stats
   Method: GET
   Cookies: { accessToken: "...", refreshToken: "..." }
   Auth Header: Present or Missing

========== 🔐 requireAuth DIAGNOSTICS ==========
Timestamp: ...
Request Path: /api/dashboard/stats
Raw Cookie Header: accessToken=...; refreshToken=...
Parsed req.cookies: { accessToken: "...", refreshToken: "..." }
==============================================

✅ ============ 📊 STATS CONTROLLER REACHED ============
   This means requireAuth PASSED!
```

If you DON'T see the STATS CONTROLLER line, it means requireAuth is failing or `requireRole` is being called.

### Step 3: Check for requireRole Logs

If you see this:

```
========== 🚫 requireRole CHECK ==========
Allowed roles: [...]
User object: { _id: ..., name: ..., role: "..." }
User role: WAITER (or whatever role)
=========================================

❌ ROLE REJECTED: User role 'WAITER' not in [...]
```

Then requireRole IS being called when it shouldn't be.

### Step 4: Test the /api/test/debug Endpoint

Open a new browser tab and navigate to:

```
http://localhost:8080/api/test/debug
```

This should return:

```json
{
  "success": true,
  "message": "Debug endpoint - requireAuth passed",
  "user": {
    "_id": "...",
    "name": "Your Name",
    "role": "MANAGER",
    "restaurantId": "...",
    "brandId": "...",
    "isStaff": false
  },
  "cookies": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

If this works, it means `requireAuth` is working correctly!

If this fails with 403, then the issue is in `requireAuth` or cookies aren't reaching the server.

### Step 5: Check User Role in Database

If step 4 works but `/stats` still fails, check the user's role:

```bash
# In MongoDB
db.users.findOne({ email: "your-email@example.com" })
```

Look for the `role` field. It should be one of:

- `"BRAND_ADMIN"`
- `"MANAGER"`
- `"CHEF"`
- `"WAITER"`
- `"CASHIER"`

### Step 6: Check Dashboard Route File

Verify the route is correct:

```javascript
dashboardRouter.get("/stats", requireAuth, dashboardStatsController);
```

NOT:

```javascript
dashboardRouter.get(
  "/stats",
  requireAuth,
  requireRole("MANAGER", "OWNER"),
  dashboardStatsController,
);
```

## Expected Working Flow

```
Browser Request: GET /api/dashboard/stats
                 ↓
            Cookies sent: accessToken, refreshToken
                 ↓
Dashboard Router: Logs "📍 Dashboard router middleware hit"
                 ↓
requireAuth Middleware:
  - Extracts token from cookie
  - Validates JWT
  - Loads user from DB
  - Attaches req.user
  - Logs diagnostic info
  - Calls next()
                 ↓
dashboardStatsController:
  - Logs "✅ STATS CONTROLLER REACHED"
  - Queries database
  - Returns 200 OK with stats data
```

## Common Causes

1. **Server not restarted** - Kill all node.exe and restart
2. **NODE_ENV not set** - Always use `NODE_ENV=development npm start`
3. **Cookies not being sent** - Check CORS `credentials: true`
4. **httpOnly issue** - Cookies must be visible in browser DevTools → Application → Cookies
5. **User role missing** - Check MongoDB for user role field
6. **Route mismatch** - Make sure `/stats` doesn't have `requireRole`

## Manual Browser Test

1. Open Browser DevTools (F12)
2. Go to Application → Cookies
3. Look for `accessToken` and `refreshToken` cookies
4. Go to Network tab
5. Refresh page / navigate to dashboard
6. Find the `/api/dashboard/stats` request
7. Click it and check:
   - Request Headers: Should see `Cookie: accessToken=...; refreshToken=...`
   - Response: Should be 200 OK with JSON data
   - If 403: Check Response tab for error message

## If Still Getting 403

Send me the COMPLETE server logs for the `/stats` request, including:

```
🔍 DASHBOARD REQUEST INTERCEPTED
========== 🔐 requireAuth DIAGNOSTICS ==========
[Either STATS CONTROLLER REACHED or the error]
```

This will tell us exactly where the request is failing!
