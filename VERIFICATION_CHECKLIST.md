# Quick Verification Checklist

## ✅ What Has Been Fixed

### Server-Side Changes

- [x] **Session Model** - `customerTokens` array field added
  - File: `server/models/session.model.js` (lines 25-31)
  - Field: Array of {tokenHash, expiresAt, lastActivityAt}

- [x] **Join Controller** - Returns raw token to client
  - File: `server/controller/session.controller.js` (lines 174-245)
  - Returns: {sessionId, sessionToken} where sessionToken is 64-char hex

- [x] **Middleware** - Supports BOTH old and new token formats ⭐ CRITICAL FIX
  - File: `server/middleware/requireSessionAuth.js` (lines 40-75)
  - Logic: Try NEW customerTokens first, fallback to OLD sessionTokenHash
  - Handles activity tracking for both formats

### Client-Side Changes

- [x] **Axios Config** - Removed duplicate interceptor
  - File: `client/src/api/axios.js`
  - Removed: Duplicate request interceptor (was creating conflicts)

- [x] **Axios Interceptor** - Dynamic token insertion
  - File: `client/src/api/axios.interceptor.js` (lines 30-54)
  - Logic: Find `plato:customerSession:*` in localStorage, attach as header

- [x] **Join Page** - Smart token storage with fallback
  - File: `client/src/modules/customer/pages/CustomerJoin.jsx` (lines 47-83)
  - Logic: Store sessionToken (64-char) OR fallback to sessionId (24-char)
  - Includes diagnostic logging

---

## 🧪 Testing Procedure

### Step 1: Verify Middleware is Backward Compatible

```javascript
// On server - check middleware logs show both paths
console.log("✅ Session found (NEW customerTokens format)"); // New sessions
console.log("✅ Session found (OLD sessionTokenHash format)"); // Old sessions
```

### Step 2: Test Customer Join

1. Navigate to customer join page
2. Enter table PIN
3. Check browser console logs:
   ```
   ✅ CORRECT: Storing session token (length: 64): ...
   ```
4. Verify localStorage:
   ```javascript
   // In DevTools console
   localStorage.getItem("plato:customerSession:[tableId]");
   // Should show 64-character hex string OR 24-char sessionId
   ```

### Step 3: Test Cart Operations

1. After joining, click menu
2. Add item to cart
3. Check Network tab:
   - No 401 errors ✅
   - Request has `x-customer-session` header
4. Verify console shows:
   ```
   ✅ Attached session token to /api/cart | Token: ...
   ```

### Step 4: Test Order Operations

1. Place an order
2. View order history
3. No 401 errors ✅
4. Orders load successfully ✅

---

## 🔍 Diagnostic Queries

### Check Database Sessions

```javascript
// MongoDB
// Count sessions by format
db.sessions.aggregate([
  {
    $group: {
      _id: null,
      total: { $sum: 1 },
      withCustomerTokens: {
        $sum: { $cond: [{ $gt: [{ $size: "$customerTokens" }, 0] }, 1, 0] },
      },
      withSessionTokenHash: {
        $sum: { $cond: ["$sessionTokenHash", 1, 0] },
      },
    },
  },
]);
```

### Check Specific Session

```javascript
// MongoDB
db.sessions.findOne({ _id: ObjectId("...") }).pretty();
// Look for:
// - customerTokens: [{tokenHash: "...", expiresAt: Date, ...}]
// - sessionTokenHash: "..."
// - tokenExpiresAt: Date
```

---

## 🐛 Troubleshooting

### Problem: Still Getting 401

**Check 1**: Is server running new code?

```bash
# Check server console for logs like:
✅ Session found (NEW customerTokens format)
```

**Check 2**: Is token stored correctly?

```javascript
// Browser console
Object.keys(localStorage).find((k) => k.includes("customerSession"));
localStorage.getItem(result); // Should show token
```

**Check 3**: Is interceptor attaching header?

```javascript
// DevTools Network tab
// Click any /api/ request → Headers
// Look for: x-customer-session: [token_value]
```

**Check 4**: What sessions exist?

```bash
# Server console will show:
📋 Available sessions: 5 | With NEW customerTokens: 3 | With OLD sessionTokenHash: 2
```

### Problem: Token is 24 chars (sessionId) instead of 64

**Likely cause**: Server not restarted yet with new code

**Solution**:

1. Kill Node.js: `taskkill /F /IM node.exe` (Windows) or `Ctrl+C`
2. Wait 2 seconds
3. Restart: `npm run dev` in server directory
4. Wait for "listening on port 8080" message
5. Refresh browser and retry

### Problem: Old sessions stopped working

**Verify**: Middleware has fallback logic for `sessionTokenHash`

**Check**: `requireSessionAuth.js` lines 55-63 should have:

```javascript
session = await SessionModel.findOne({
  status: "OPEN",
  sessionTokenHash: tokenHash,
  tokenExpiresAt: { $gt: new Date() },
});
```

If missing, the fallback wasn't applied correctly.

---

## 📋 Code Review Checklist

### Middleware (requireSessionAuth.js)

- [x] Imports crypto module
- [x] Has hashToken() helper function
- [x] Checks x-customer-session header
- [x] Tries customerTokens.$elemMatch first (lines 42-49)
- [x] Falls back to sessionTokenHash (lines 52-63)
- [x] Updates activity for both formats (lines 65-121)
- [x] Has debug logging showing which path succeeded
- [x] Shows available sessions when both fail

### Session Model (session.model.js)

- [x] Has customerTokens array field
- [x] customerTokens has: tokenHash, expiresAt, lastActivityAt
- [x] Still has original sessionTokenHash field
- [x] Still has original tokenExpiresAt field

### Join Controller (session.controller.js)

- [x] Generates crypto.randomBytes(32) token
- [x] Hashes token with SHA256
- [x] Stores hash in customerTokens array with 8-hour expiry
- [x] Returns response with BOTH sessionId AND sessionToken
- [x] Has console.log debugging

### Join Page (CustomerJoin.jsx)

- [x] Extracts sessionToken from response
- [x] Extracts sessionId from response
- [x] Stores sessionToken if length > 40
- [x] Falls back to sessionId if no token
- [x] Logs diagnostic info to console
- [x] Handles edge case where neither is available

### Axios Interceptor (axios.interceptor.js)

- [x] Finds localStorage key matching pattern
- [x] Gets token value from localStorage
- [x] Attaches x-customer-session header
- [x] Has console logging

---

## ✨ Expected Behavior Timeline

### 1. Customer Joins Table

- Server generates 64-char token ✅
- Server returns {sessionId, sessionToken} ✅
- Client stores sessionToken in localStorage ✅
- Console shows: "✅ CORRECT: Storing session token (length: 64)"

### 2. Customer Navigates to Menu

- Axios interceptor finds token in localStorage ✅
- Attaches x-customer-session header ✅
- Server middleware validates token ✅
- Console shows: "✅ Session found (NEW customerTokens format)"

### 3. Customer Adds to Cart

- Cart thunk sends GET /api/cart with token ✅
- Middleware validates token ✅
- Cart controller processes request ✅
- Response 200 OK with cart items ✅

---

## 📞 Support Scenarios

### Scenario A: Everything Works

- No 401 errors ✅
- Cart loads ✅
- Orders display ✅
- Console shows new format tokens ✅
- **Action**: Celebrate! Everything is fixed.

### Scenario B: Still Getting 401

- Check if server has new code loaded (restart if needed)
- Check token is being sent in headers
- Verify middleware has fallback logic
- Check database has sessions with customerTokens

### Scenario C: 24-char Token (Old Format)

- Server likely not restarted
- Fallback logic will still work IF session was created by staff
- New joins will fail until server restarted
- **Action**: Restart server, retry join

### Scenario D: Mixed Old/New Sessions

- ✅ Old sessions work (sessionTokenHash)
- ✅ New sessions work (customerTokens)
- ✅ Both work simultaneously without conflict
- No action needed - system handles both

---

**Last Updated**: January 22, 2025
**Status**: ✅ All fixes implemented and documented
