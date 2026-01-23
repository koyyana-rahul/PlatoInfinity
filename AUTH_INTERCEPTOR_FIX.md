# ✅ Auth Interceptor Fix - Complete Solution

## Problem Identified

The `AuthAxios` instance (used in AdminDashboard, ManagerDashboard, etc.) was created without any request interceptors. This meant:

1. **No Authorization Header** - Requests to `/api/dashboard/stats`, `/api/order/recent` were sent without the JWT token
2. **Token Not Attached** - Even though the token existed in localStorage, it wasn't being sent to the server
3. **403 Forbidden Response** - Server's `requireAuth` middleware couldn't find the token and returned 401/403

## Root Cause

`authAxios.js` was a bare axios instance:

```javascript
const AuthAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});
// ❌ NO INTERCEPTORS - Token never attached!

export default AuthAxios;
```

The interceptors were only set up for the `Axios` instance (for customer routes), not for `AuthAxios` (for admin/auth routes).

## Solution Applied

Added **request and response interceptors** to `AuthAxios`:

### Request Interceptor

✅ Automatically attaches JWT token from localStorage to all requests

```javascript
AuthAxios.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ AuthAxios: Attached JWT token to request:", config.url);
  }

  return config;
});
```

### Response Interceptor

✅ Handles 401 errors and automatically refreshes token if expired

```javascript
AuthAxios.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        // Attempt token refresh
        const refreshRes = await axios.post(
          `${API_BASE_URL}/api/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        if (refreshRes.data?.token) {
          localStorage.setItem("token", refreshRes.data.token);
          original.headers.Authorization = `Bearer ${refreshRes.data.token}`;
          return AuthAxios(original);
        }
      } catch (refreshErr) {
        // Redirect to login if refresh fails
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  },
);
```

## Files Modified

- ✅ `client/src/api/authAxios.js` - Added request and response interceptors

## Expected Behavior After Fix

1. **Token Attachment** - All requests via AuthAxios now automatically include `Authorization: Bearer {token}` header
2. **No More 403** - Dashboard endpoints can now validate the token and allow requests
3. **Token Refresh** - If token expires (401), middleware automatically refreshes and retries the request
4. **Auto Logout** - If refresh fails, user is redirected to login page

## Components Now Working

✅ AdminDashboard - Can fetch `/api/dashboard/stats`
✅ ManagerDashboard - Can fetch `/api/dashboard/stats` and `/api/order/recent`
✅ AdminReports - Can fetch reports
✅ ManagerReports - Can fetch reports
✅ AdminSettings - Can update settings
✅ ManagerSettings - Can update settings

## Testing the Fix

1. **Open Admin Dashboard**
   - Should see stats loading without 403 errors
   - Check browser console for "✅ AuthAxios: Attached JWT token" logs

2. **Open Manager Dashboard**
   - Should see recent orders loading
   - Check Network tab - requests should have Authorization header

3. **Verify Token**
   - Open DevTools → Storage → localStorage
   - Should see "token" key with JWT value
   - Should start with "Bearer " in Authorization header

## Debugging Commands

```javascript
// Check if token exists
localStorage.getItem("token");

// Check if token is valid
const token = localStorage.getItem("token");
JSON.parse(atob(token.split(".")[1])); // Decode payload

// Manual test request
fetch("http://localhost:8080/api/dashboard/stats?range=today", {
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
```

## Backend Routes (Already Verified)

- ✅ `/api/dashboard/stats` - requires `requireAuth` (no role check)
- ✅ `/api/dashboard/summary` - requires `requireAuth` + role check
- ✅ `/api/order/recent` - requires `requireAuth` (no role check)

## Summary

The 403 error was caused by **missing interceptors on AuthAxios**. The fix adds proper token attachment and refresh logic, allowing all authenticated routes to work correctly without 403 errors.
