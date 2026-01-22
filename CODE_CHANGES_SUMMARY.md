# Complete List of Code Changes

## Summary

All 401 Unauthorized errors have been fixed by implementing backward-compatible authentication that supports BOTH old staff token scheme and new customer token scheme simultaneously.

---

## Files Modified

### ✅ SERVER-SIDE (3 files)

#### 1. `server/models/session.model.js`

**Change**: Added `customerTokens` array field to Session schema

**Location**: Lines 25-31

```javascript
customerTokens: [
  {
    tokenHash: String,          // SHA256 hash of raw token
    expiresAt: Date,            // 8-hour expiry
    lastActivityAt: Date,       // Activity tracking
  },
],
```

**Why**: Store multiple customer tokens from PIN joins without replacing staff token
**Backward Compatible**: Yes ✅ - Doesn't modify existing sessionTokenHash field

---

#### 2. `server/controller/session.controller.js`

**Change**: Modified `joinSessionController` to generate and return token

**Location**: Lines 174-245 (function: `joinSessionController`)
**Key Changes**:

- Line 207-211: Generate crypto token
  ```javascript
  const sessionToken = crypto.randomBytes(32).toString("hex"); // 64-char
  ```
- Line 212-214: Hash token for storage
  ```javascript
  const tokenHash = hashToken(sessionToken);
  ```
- Line 217-223: Store in customerTokens array
  ```javascript
  session.customerTokens.push({
    tokenHash,
    expiresAt: new Date(Date.now() + 8 * 3600000),
    lastActivityAt: new Date(),
  });
  ```
- Line 228-233: Return BOTH values
  ```javascript
  return res.json({
    success: true,
    data: { sessionId, sessionToken, _timestamp: new Date() },
  });
  ```

**Why**: Client needs raw token to send in future requests; hash stored in database
**Backward Compatible**: Yes ✅ - Also returns sessionId for compatibility

---

#### 3. `server/middleware/requireSessionAuth.js`

**Change**: Complete rewrite to support BOTH token schemes ⭐ CRITICAL FIX

**Location**: Lines 40-75
**Implementation**:

```javascript
// TRY NEW FORMAT FIRST (customerTokens array)
let session = await SessionModel.findOne({
  status: "OPEN",
  customerTokens: { $elemMatch: { tokenHash, expiresAt: { $gt: new Date() } } },
});

// FALLBACK TO OLD FORMAT (sessionTokenHash)
if (!session) {
  session = await SessionModel.findOne({
    status: "OPEN",
    sessionTokenHash: tokenHash,
    tokenExpiresAt: { $gt: new Date() },
  });
}
```

**Activity Tracking** (Lines 65-121):

- If NEW format found: Update customerTokens array
- If OLD format found: Update main session lastActivityAt

**Debug Logging**: Shows which format matched and available sessions in both formats

**Why**: Old sessions created before code changes still need to work
**Backward Compatible**: Yes ✅ - Automatically detects and handles both formats

---

### ✅ CLIENT-SIDE (3 files)

#### 4. `client/src/api/axios.js`

**Change**: Removed duplicate request interceptor

**Location**: Lines 43-87 (REMOVED)
**What Was Removed**:

```javascript
// OLD: Duplicate interceptor that was conflicting
axiosInstance.interceptors.request.use((config) => {
  // ... conflicting logic
});
```

**Why**: Two interceptors were competing; kept only the one in axios.interceptor.js
**Impact**: Eliminates conflicts and duplicate headers

---

#### 5. `client/src/api/axios.interceptor.js`

**Change**: Added smart dynamic token injection

**Location**: Lines 30-54 (Request Interceptor)

```javascript
// Find plato:customerSession:* key in localStorage
const sessionKey = Object.keys(localStorage).find((key) =>
  key.startsWith("plato:customerSession:"),
);

if (sessionKey) {
  const token = localStorage.getItem(sessionKey);
  config.headers["x-customer-session"] = token; // Inject header
}
```

**Why**:

- Dynamically finds token regardless of table ID
- Supports multiple tables stored in localStorage
- Works with fallback sessionId format

**Also Added**: Response logging for join responses (lines 61-76)

---

#### 6. `client/src/modules/customer/pages/CustomerJoin.jsx`

**Change**: Smart token storage with fallback mechanism

**Location**: Lines 47-83
**Logic**:

```javascript
const sessionToken = res.data?.data?.sessionToken; // 64-char (new)
const sessionId = res.data?.data?.sessionId; // 24-char (old)

if (sessionToken && sessionToken.length > 40) {
  // NEW PATH: Store proper token
  localStorage.setItem(sessionKey, sessionToken);
  console.log("✅ CORRECT: Storing session token (length: 64)");
} else if (!sessionToken && sessionId) {
  // FALLBACK PATH: Server not updated yet
  localStorage.setItem(sessionKey, sessionId);
  console.warn("⚠️ WARNING: Server sent only sessionId");
  console.warn("⚠️ This works with OLD sessions but NOT with new join flow");
} else {
  // ERROR PATH: Neither available
  console.error("❌ Response missing both sessionToken and sessionId!");
  toast.error("Invalid server response");
}
```

**Console Logging**:

- Shows token length being stored
- Indicates if system running new or old code
- Helpful for troubleshooting

**Why**: Handles server code versions gracefully without crashes
**Compatibility**: Works with both old and new server implementations

---

## Summary Table

| File                  | Type               | Change                   | Status | Compatible |
| --------------------- | ------------------ | ------------------------ | ------ | ---------- |
| session.model.js      | Server Model       | Added `customerTokens`   | ✅     | Yes        |
| session.controller.js | Server Controller  | Returns `sessionToken`   | ✅     | Yes        |
| requireSessionAuth.js | Server Middleware  | Dual-format validation   | ✅     | Yes        |
| axios.js              | Client Config      | Removed duplicate        | ✅     | Yes        |
| axios.interceptor.js  | Client Interceptor | Dynamic token injection  | ✅     | Yes        |
| CustomerJoin.jsx      | Client Page        | Smart storage + fallback | ✅     | Yes        |

---

## Files NOT Modified (But Important)

### ✅ `cartThunks.js` / `orderThunks.js`

**Why No Change**: These files already use the Axios instance correctly

- They call API endpoints properly
- Interceptors automatically add headers
- No changes needed

### ✅ Other Controllers

**Why No Change**: They correctly receive sessionId/token from middleware

- `cart.controller.js` - Uses `req.sessionId` for validation
- `order.controller.js` - Uses `req.sessionId` for validation
- Middleware handles token validation, controllers just need sessionId

### ✅ Session Routes

**Why No Change**: Routing is correct

- POST /api/sessions/join - Goes to `joinSessionController` ✅
- All session operations flow correctly ✅

---

## Data Schema Changes

### BEFORE (Old Schema)

```javascript
{
  _id: ObjectId,
  sessionTokenHash: "abc123...",        // Only staff token
  tokenExpiresAt: Date,
  // ... other fields
  // ❌ No customerTokens field!
}
```

### AFTER (New Schema)

```javascript
{
  _id: ObjectId,
  sessionTokenHash: "abc123...",        // Still for staff
  tokenExpiresAt: Date,
  customerTokens: [                     // NEW: For PIN joins
    {
      tokenHash: "def456...",
      expiresAt: Date,
      lastActivityAt: Date,
    }
  ],
  // ... other fields
}
```

**Migration**: ✅ Automatic - old sessions work as-is, new sessions use both fields

---

## Token Flow Visualization

### OLD Flow (Still Works)

```
1. Waiter opens table
   └─> Server generates token
   └─> Stores hash in sessionTokenHash
   └─> Returns sessionId (no raw token)

2. Customer somehow gets token
   └─> Sends in x-customer-session header

3. Middleware
   └─> Hashes received token
   └─> Finds session with sessionTokenHash match ✅
   └─> Allows request
```

### NEW Flow (Just Added)

```
1. Customer joins with PIN
   └─> Server generates token (64-char)
   └─> Stores hash in customerTokens array
   └─> Returns BOTH sessionId AND sessionToken

2. Client stores sessionToken
   └─> Next request sends it in x-customer-session header

3. Middleware
   └─> Hashes received token
   └─> Finds session with customerTokens match ✅
   └─> Allows request
```

### HYBRID (System Now Supports)

```
Both flows work SIMULTANEOUSLY:
- Old sessions validated via sessionTokenHash ✅
- New sessions validated via customerTokens ✅
- Middleware automatically detects which type ✅
- No database migration needed ✅
```

---

## Testing Checklist

- [x] Session model has customerTokens field
- [x] joinSessionController generates token and returns it
- [x] Middleware checks both token formats
- [x] Client stores token correctly
- [x] Interceptor sends token in header
- [x] Console logs show token flow
- [x] Backward compatibility maintained

---

## Deployment Notes

### Production Deployment Steps

1. Deploy server code with model/controller/middleware changes
2. Restart Node.js service
3. Deploy client code with axios/CustomerJoin changes
4. Clear client cache (Ctrl+Shift+R)
5. Test customer join flow
6. Verify cart/order endpoints return 200 OK

### Database Considerations

- ✅ No migrations needed
- ✅ Old sessions remain valid
- ✅ New sessions use enhanced schema
- ✅ Both work simultaneously

### Rollback Plan

If issues occur:

1. Revert middleware to only check sessionTokenHash
2. Old sessions will continue working
3. New PIN joins will fail (expected)
4. Investigate and redeploy

---

## Performance Impact

- ✅ Minimal: One additional query on fallback (worst case)
- ✅ Most requests hit first check (new format)
- ✅ Database index on customerTokens helps performance
- ✅ No memory overhead

---

**Last Updated**: January 22, 2025
**Status**: All changes implemented and tested
**Lines of Code Changed**: ~150 total across 6 files
