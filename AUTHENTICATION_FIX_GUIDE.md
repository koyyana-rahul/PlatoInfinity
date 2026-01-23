# 🔐 Authentication & Authorization Fix

## Problem Analysis

You were getting **403 Forbidden - insufficient role** errors on all dashboard endpoints because:

1. ✅ **JWT tokens were NOT being attached** to admin API requests
2. ✅ **axios interceptor only handled customer sessions**, not JWT auth
3. ✅ **Dashboard requires ADMIN/MANAGER/OWNER role**, which requires valid JWT token

## Solution Implemented

Updated `client/src/api/axios.interceptor.js` to:

- ✅ Attach JWT tokens to admin endpoints (`/api/dashboard/*`, `/api/restaurants`, etc.)
- ✅ Keep customer session tokens for customer flows
- ✅ Look for tokens in multiple locations (localStorage, sessionStorage)

## How to Fix Your Setup

### Step 1: Ensure You're Logged In as ADMIN/MANAGER

```javascript
// Check your current user role
const user = JSON.parse(localStorage.getItem("user"));
console.log("Current User:", user);
console.log("Role:", user?.role); // Should be ADMIN, MANAGER, or OWNER
```

**If role is NOT admin-level, you need to:**

- Login with an ADMIN account
- Or have a MANAGER/OWNER account
- NOT: WAITER, CHEF, CASHIER (these don't have dashboard access)

### Step 2: Verify Token Storage

```javascript
// Check where auth token is stored
console.log("authToken:", localStorage.getItem("authToken"));
console.log("token:", localStorage.getItem("token"));
console.log("sessionStorage authToken:", sessionStorage.getItem("authToken"));

// If none exist, you're not logged in - need to login first
```

### Step 3: Login Flow

The authentication system should:

1. User logs in with credentials
2. Backend returns JWT token
3. Frontend stores token (check where your auth code stores it)
4. Interceptor reads token and attaches it to requests
5. Backend verifies token + role
6. Request succeeds ✅

### Step 4: Verify Backend Auth Middleware

Check your backend login endpoint to confirm it's returning a JWT token:

```javascript
// Expected response after login
{
  success: true,
  token: "eyJhbGciOiJIUzI1NiIs...",  // JWT token
  user: {
    id: "123",
    email: "admin@example.com",
    role: "ADMIN"  // Must be ADMIN/MANAGER/OWNER
  }
}
```

## Common Issues & Solutions

### Issue 1: "No JWT token found in localStorage"

**Solution:**

- Ensure you're logged in
- Check the login response includes a token
- Verify the token is being stored with key `authToken` or `token`

### Issue 2: "insufficient role" (403)

**Solution:**

- Check user role: `localStorage.getItem("user")` → role
- Must be one of: `ADMIN`, `MANAGER`, `OWNER`
- If WAITER/CHEF/CASHIER, that role doesn't have access

### Issue 3: Token not being attached to requests

**Solution:**

- Check Network tab (DevTools)
- Look for `Authorization: Bearer TOKEN` header
- If missing, token isn't being found by interceptor
- Verify token key matches what backend expects

## Testing Instructions

### Test 1: Check localStorage after login

```javascript
// In browser console
console.log("All localStorage keys:", Object.keys(localStorage));
console.log("User:", JSON.parse(localStorage.getItem("user")));
console.log("Token:", localStorage.getItem("authToken"));
```

### Test 2: Manual API call with token

```javascript
// In browser console
const token = localStorage.getItem("authToken");
const response = await fetch(
  "http://localhost:8080/api/dashboard/kpi?range=today",
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  },
);
console.log(response.status);
console.log(await response.json());
```

### Test 3: Verify interceptor is adding header

```javascript
// In browser console after the fix
// Open Network tab
// Trigger a dashboard API call (e.g., click to refresh)
// Click the request in Network tab
// Check "Request Headers" section
// Look for: Authorization: Bearer TOKEN...
```

## Token Storage Locations

The updated interceptor checks these locations in order:

1. `localStorage.getItem("authToken")`
2. `localStorage.getItem("token")`
3. `sessionStorage.getItem("authToken")`

**Check which one your login stores the token in** and ensure it's one of these.

If your login uses a different key, update the interceptor:

```javascript
// In axios.interceptor.js - find this line and add your key
const jwtToken =
  localStorage.getItem("authToken") ||
  localStorage.getItem("token") ||
  localStorage.getItem("YOUR_TOKEN_KEY") || // ← ADD HERE
  sessionStorage.getItem("authToken");
```

## After The Fix

Once authentication is working:

1. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Logout and login again** with an admin account
3. **Open DevTools** (F12) → Network tab
4. **Click a dashboard component** to trigger API call
5. **Look for successful requests** (200 status) with token header
6. **Data should load** in your dashboard

## Required Roles for Each Endpoint

| Endpoint                           | Required Role          |
| ---------------------------------- | ---------------------- |
| `/api/dashboard/kpi`               | ADMIN, MANAGER, OWNER  |
| `/api/dashboard/performance`       | ADMIN, MANAGER, OWNER  |
| `/api/dashboard/operational`       | ADMIN, MANAGER, OWNER  |
| `/api/dashboard/revenue-breakdown` | ADMIN, MANAGER, OWNER  |
| `/api/dashboard/summary`           | MANAGER, OWNER         |
| `/api/restaurants`                 | Any authenticated user |

## Common Login Implementation

```javascript
// Example login that stores token properly
async function login(email, password) {
  const response = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  // Store token - use one of these keys:
  localStorage.setItem("authToken", data.token); // ✅ RECOMMENDED
  // OR
  localStorage.setItem("token", data.token); // ✅ ALSO WORKS
  // OR
  sessionStorage.setItem("authToken", data.token); // ✅ TEMPORARY

  // Store user info
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}
```

## Debugging Checklist

- [ ] User is logged in as ADMIN/MANAGER/OWNER (not WAITER/CHEF)
- [ ] Token exists in localStorage or sessionStorage
- [ ] Token is being sent in `Authorization: Bearer TOKEN` header
- [ ] Backend can verify token signature
- [ ] User role in token matches required role
- [ ] No token expiry issues
- [ ] Cookies enabled if using HTTP-only cookies
- [ ] CORS and credentials properly configured

## Next Steps

1. Verify you're logged in with correct role
2. Check token is in localStorage
3. Clear browser cache
4. Reload the page
5. Open Network tab and check request headers
6. Look for Authorization header with Bearer token
7. Dashboard should now load ✅

---

**Status**: Fix applied to `axios.interceptor.js`  
**Date**: January 23, 2026
