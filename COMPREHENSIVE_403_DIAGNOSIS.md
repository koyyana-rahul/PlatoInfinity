# Complete 403 Forbidden Diagnosis Guide

## Problem

Still getting 403 Forbidden on `/api/dashboard/stats` despite:

- ✅ Setting `withCredentials: true` on AuthAxios
- ✅ Configuring proper cookie options
- ✅ Setting up requireAuth middleware correctly

## What I've Added for Diagnosis

### 1. Server-Side Logging

**In `server/middleware/requireAuth.js`:**

```javascript
console.log("--- requireAuth Middleware ---");
console.log("Timestamp:", new Date().toISOString());
console.log("Request Path:", req.originalUrl);
console.log("Request Origin:", req.headers.origin);
console.log("Raw Cookie Header:", req.headers.cookie || "Not present");
console.log("Parsed Cookies:", req.cookies);
```

**In `server/route/dashboard.route.js`:**

```javascript
dashboardRouter.use((req, res, next) => {
  console.log(
    "📍 Dashboard router middleware hit:",
    req.method,
    req.originalUrl,
  );
  next();
});
```

**In `server/controller/dashboard.controller.js`:**

```javascript
console.log("🚀 dashboardStatsController called!");
console.log("   req.user:", req.user);
console.log("   req.cookies:", req.cookies);
```

**In `server/controller/auth.controller.js` (loginController):**

```javascript
console.log("✅ Login successful - Cookies set:");
console.log("   - Cookie options:", cookieOptions());
console.log("   - NODE_ENV:", process.env.NODE_ENV);
console.log("   - isDev:", process.env.NODE_ENV !== "production");
```

### 2. Client-Side Logging

**In `client/src/modules/admin/AdminDashboard.jsx`:**

```javascript
catch (error) {
  console.error("❌ Error fetching stats:", error.message);
  console.error("   Full error:", error);
  console.error("   Response status:", error.response?.status);
  console.error("   Response data:", error.response?.data);
}
```

## Testing Steps

### Step 1: Start the Server

```bash
cd server
npm start
# Watch for logs
```

### Step 2: Login

1. Go to `http://localhost:5173/login`
2. Enter your credentials
3. **Check server console** for:

   ```
   ✅ Login successful - Cookies set:
      - accessToken cookie: ...
      - refreshToken cookie: ...
      - Cookie options: { httpOnly: true, secure: false, sameSite: 'lax', path: '/' }
      - NODE_ENV: development (or whatever you set)
   ```

4. **If NODE_ENV shows `undefined`**, that's the problem!

### Step 3: Navigate to Admin Dashboard

1. After successful login, click Admin Dashboard
2. **Check server console** for:

   ```
   📍 Dashboard router middleware hit: GET /api/dashboard/stats?range=today
   --- requireAuth Middleware ---
   Timestamp: 2026-01-23T...
   Request Path: /api/dashboard/stats?range=today
   Request Origin: http://localhost:5173
   Raw Cookie Header: accessToken=...; refreshToken=...
   Parsed Cookies: { accessToken: '...', refreshToken: '...' }
   🚀 dashboardStatsController called!
      req.user: { _id: '...', name: '...', role: 'BRAND_ADMIN', ... }
   ```

3. **If you see "Raw Cookie Header: Not present"**, the browser isn't sending cookies
4. **If you see "Parsed Cookies: {}"**, the cookies are empty

### Step 4: Check Browser Network Tab

1. Open DevTools → Network tab
2. Click on the dashboard stats request
3. Check **Request Headers**:
   - Should see: `Cookie: accessToken=...; refreshToken=...`
4. Check **Response Headers**:
   - Should NOT have `Set-Cookie` (already set during login)
5. Check **Response Status**: Should show what error is returned

## Likely Issues & Solutions

### Issue 1: NODE_ENV Not Set

**Symptom:** Cookie options logging shows `sameSite: undefined` or wrong settings

**Solution:**

```bash
# In terminal before starting server:
export NODE_ENV=development
npm start

# OR on Windows:
set NODE_ENV=development
npm start
```

### Issue 2: Cookies Not Sent by Browser

**Symptom:** "Raw Cookie Header: Not present"

**Causes:**

- Cookies not actually set during login
- Domain/path mismatch
- SameSite policy blocking them
- Cross-origin issue

**Solution:**

```javascript
// In DevTools console after login:
console.log(document.cookie);
// Should be empty (httpOnly) but check Network tab for Set-Cookie headers
```

### Issue 3: Cookies Present but Dashboard Still Returns 403

**Symptom:** Cookies shown in logging but still get 403

**Means:** requireAuth is passing (cookies found), so 403 comes from controller or requireRole middleware

**Solution:**
Check `/api/dashboard/summary` route (has requireRole check):

```javascript
dashboardRouter.get(
  "/summary",
  requireAuth,
  requireRole("MANAGER", "OWNER"), // ❌ Might return 403 if user isn't MANAGER or OWNER
  dashboardSummaryController,
);
```

But `/api/dashboard/stats` doesn't have requireRole, so if cookies are found, 403 shouldn't happen.

### Issue 4: 403 from Different Source

**Symptom:** Server logs don't show Dashboard router being hit

**Means:** 403 is returned BEFORE reaching the dashboard route

**Solution:**

- Check if another router is catching the request
- Look at route mounting order in index.js
- Check CORS middleware

## Running the Complete Test

```bash
# Terminal 1: Start backend
cd server
NODE_ENV=development npm start

# Terminal 2: Start frontend
cd client
npm run dev

# Browser:
# 1. Login at http://localhost:5173/login
# 2. Open DevTools → Console and Network tabs
# 3. Navigate to Admin Dashboard
# 4. Watch server console for all logging
# 5. Check browser console for error logs
# 6. Check Network tab for request/response details
```

## What to Report If Still Broken

1. **Exact server console output** when you login (cookie options)
2. **Exact server console output** when accessing dashboard (did it hit requireAuth?)
3. **Browser console error** showing full error object including response.data
4. **Network tab** showing:
   - Request headers (does it have Cookie?)
   - Response headers (is it 403 or 401?)
   - Response body (what's the error message?)

## Next Steps if Logs Still Show 403

If requireAuth middleware is being hit but still returning 403:

1. It's NOT from requireAuth (it returns 401)
2. It's NOT from requireRole (not on /stats route)
3. It's coming from the controller itself or another middleware

**Then we'll:**

- Check if the actual controller is returning 403
- Check if there's a global middleware returning 403
- Check if it's a CORS preflight issue
