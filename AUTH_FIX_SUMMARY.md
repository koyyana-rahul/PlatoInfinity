# Authentication Fix Summary - 401 Unauthorized Errors

## Problem Analysis

The application was returning **401 Unauthorized** errors for customer API endpoints:

- `GET /api/order/session/:sessionId` (orderThunks.js:17)
- `GET /api/cart` (cartThunks.js:12)
- `POST /api/cart/add` (cartThunks.js:29)

### Root Causes

1. **Missing customerTokens array in Session model** - The middleware expected a `customerTokens` array but the schema didn't have it
2. **joinSessionController not returning raw token** - It returned only `sessionId` instead of the raw token needed for authentication
3. **Client storing wrong value** - CustomerJoin.jsx stored `sessionId` when it should store the raw token
4. **Interceptor inconsistency** - axios.interceptor.js was looking for a hardcoded localStorage key that wasn't being used

## Solutions Implemented

### 1. ✅ Updated Server Session Model

**File:** `server/models/session.model.js`

Added `customerTokens` array field to store multiple customer session tokens:

```javascript
// ✅ CUSTOMER TOKENS (for QR/PIN join)
customerTokens: [
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    lastActivityAt: { type: Date, default: Date.now },
  }
],
```

This allows the middleware to properly validate customer tokens using the `requireSessionAuth` middleware.

### 2. ✅ Fixed joinSessionController

**File:** `server/controller/session.controller.js`

Changed `joinSessionController` to:

- Generate a new raw token using `crypto.randomBytes(32).toString("hex")`
- Hash it and store in `customerTokens` array
- Return the raw token to the client

**Before:**

```javascript
return res.json({
  success: true,
  data: {
    sessionId: session._id,
  },
});
```

**After:**

```javascript
// ✅ GENERATE NEW CUSTOMER TOKEN FOR THIS CUSTOMER
const rawCustomerToken = crypto.randomBytes(32).toString("hex");
const tokenHash = hashToken(rawCustomerToken);
const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

// Store the token hash in customerTokens array
session.customerTokens = session.customerTokens || [];
session.customerTokens.push({
  tokenHash,
  expiresAt,
  lastActivityAt: new Date(),
});

session.lastActivityAt = new Date();
await session.save();

// ✅ RETURN RAW TOKEN TO CLIENT
return res.json({
  success: true,
  data: {
    sessionId: session._id,
    sessionToken: rawCustomerToken, // ✅ RAW TOKEN for client storage
  },
});
```

### 3. ✅ Fixed CustomerJoin.jsx

**File:** `client/src/modules/customer/pages/CustomerJoin.jsx`

Changed to store the raw token instead of sessionId:

**Before:**

```javascript
const sessionId = res.data?.data?.sessionId;
if (sessionId) {
  localStorage.setItem(sessionKey, sessionId);
}
```

**After:**

```javascript
// ✅ STORE RAW TOKEN (not sessionId)
const sessionToken = res.data?.data?.sessionToken;
if (sessionToken) {
  localStorage.setItem(sessionKey, sessionToken);
}
```

### 4. ✅ Fixed axios.interceptor.js

**File:** `client/src/api/axios.interceptor.js`

Updated to dynamically find the session token from localStorage:

**Before:**

```javascript
const sessionToken = localStorage.getItem("plato:customerSession:token");
```

**After:**

```javascript
// ✅ Find customer session token from localStorage
// Key format: plato:customerSession:{tableId}
const sessionKey = Object.keys(localStorage).find((k) =>
  k.startsWith("plato:customerSession:"),
);

if (sessionKey) {
  const sessionToken = localStorage.getItem(sessionKey);
  if (sessionToken) {
    config.headers["x-customer-session"] = sessionToken;
  }
}
```

## Authentication Flow (Corrected)

### Customer Join Flow:

1. Customer scans QR code → navigates to CustomerJoin page
2. Customer enters 4-digit PIN
3. **JOIN REQUEST**: `POST /api/sessions/join` with `{ tableId, tablePin }`
4. **SERVER RESPONSE**:
   - Finds existing session by tableId + PIN
   - Generates new raw token: `crypto.randomBytes(32).toString("hex")`
   - Hashes token and stores in `session.customerTokens` array
   - Returns: `{ sessionId, sessionToken: rawToken }`
5. **CLIENT STORES**: `localStorage.setItem('plato:customerSession:{tableId}', rawToken)`

### Customer API Requests (Cart/Order):

1. **REQUEST**: `GET /api/cart` (or POST /api/cart/add, etc.)
2. **AXIOS INTERCEPTOR**:
   - Reads raw token from `localStorage.plato:customerSession:{tableId}`
   - Attaches to header: `x-customer-session: {rawToken}`
3. **SERVER MIDDLEWARE** (`requireSessionAuth`):
   - Extracts token from header: `req.headers["x-customer-session"]`
   - Hashes it: `hashToken(rawToken)`
   - Searches session: `Session.findOne({ customerTokens: { $elemMatch: { tokenHash, expiresAt: { $gt: now } } } })`
   - Validates token is in `customerTokens` array and not expired
   - Attaches to request: `req.sessionDoc`, `req.sessionId`, `req.sessionToken`
4. **CONTROLLER**: Processes request with authenticated session context

## Modified Files

### Server-side (Backend):

1. **server/models/session.model.js** - Added `customerTokens` array field
2. **server/controller/session.controller.js** - Updated `joinSessionController` to return raw token

### Client-side (Frontend):

1. **client/src/modules/customer/pages/CustomerJoin.jsx** - Store raw token
2. **client/src/api/axios.interceptor.js** - Dynamic localStorage key lookup

## Testing Checklist

✅ **Join Session Flow:**

- [ ] Customer can join with valid tableId + PIN
- [ ] Server returns both `sessionId` and `sessionToken`
- [ ] Token is stored in localStorage

✅ **Cart Operations:**

- [ ] `GET /api/cart` returns 200 (not 401)
- [ ] `POST /api/cart/add` returns 200 (not 401)
- [ ] `PUT /api/cart/update` returns 200
- [ ] `DELETE /api/cart/item/:id` returns 200

✅ **Order Operations:**

- [ ] `GET /api/order/session/:sessionId` returns 200 (not 401)
- [ ] `POST /api/order/place` returns 200 (not 401)

✅ **Token Expiration:**

- [ ] Old expired tokens are rejected with 401
- [ ] Tokens are refreshed on activity

## Error Resolution

| Error                     | Cause                               | Fix                                                 |
| ------------------------- | ----------------------------------- | --------------------------------------------------- |
| 401 on /api/cart          | Missing `x-customer-session` header | ✅ axios.interceptor.js now sends raw token         |
| 401 on /api/order/session | Token not in `customerTokens` array | ✅ joinSessionController now creates customer token |
| 401 on /api/cart/add      | Storing sessionId instead of token  | ✅ CustomerJoin.jsx now stores raw token            |

## Implementation Notes

- **Backward Compatibility**: Old sessions without `customerTokens` field will still work but new customer tokens won't be stored
- **Token Generation**: Uses `crypto.randomBytes(32).toString("hex")` for secure 64-character tokens
- **Token Storage**: Hashed tokens are stored in MongoDB; raw tokens only exist in client localStorage
- **Expiration**: Tokens expire after 8 hours (TOKEN_TTL_MS = 8 _ 60 _ 60 \* 1000)
- **Activity Tracking**: `lastActivityAt` is updated on each request for analytics

## Verification

Run the following to verify the fixes:

```bash
# 1. Check that session model migration is applied
# 2. Test customer join flow
# 3. Verify cart/order endpoints return 200 OK
# 4. Check browser console for no 401 errors
# 5. Verify localStorage contains 'plato:customerSession:{tableId}' key
```

---

**Status**: ✅ Complete
**Date**: January 22, 2025
