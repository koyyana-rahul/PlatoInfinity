# Testing Guide - Authentication Fixes

## Quick Summary of Changes

Fixed 401 Unauthorized errors in customer cart and order operations by:

1. Adding `customerTokens` array to Session model
2. Making joinSessionController generate and return raw tokens
3. Updating client to store raw tokens
4. Fixing axios interceptor to send tokens correctly

## Step-by-Step Testing

### Step 1: Verify Database Schema

Open MongoDB and check that sessions have the new `customerTokens` field:

```javascript
db.sessions.findOne({ status: "OPEN" });
// Should show:
// {
//   ...
//   customerTokens: [
//     { tokenHash: "...", expiresAt: ISODate(...), lastActivityAt: ISODate(...) }
//   ]
// }
```

### Step 2: Test Join Session Flow

1. Open browser DevTools → Application → Local Storage
2. Scan a table QR code
3. Join with valid PIN
4. Verify localStorage has key: `plato:customerSession:{tableId}` with a long hex string value
   - Should look like: `5c7a8d2f3e6b9c1a4d7e2f5a8b1c4d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c`

### Step 3: Test Cart Operations (FIX #1)

1. From the customer menu, open DevTools → Network tab
2. Click "Add to Cart" button
3. Verify the request:
   - **URL**: `POST http://localhost:8080/api/cart/add`
   - **Headers**: Should include `x-customer-session: {token}` ✅
   - **Status**: Should be `200 OK` (NOT 401) ✅
   - **Response**: Should contain cart item data

### Step 4: Test Get Cart (FIX #2)

1. The cart should auto-load when CustomerMenu mounts
2. DevTools → Network → Filter "cart"
3. Verify the request:
   - **URL**: `GET http://localhost:8080/api/cart`
   - **Headers**: Should include `x-customer-session: {token}` ✅
   - **Status**: Should be `200 OK` (NOT 401) ✅
   - **Response**: Should contain cart items array

### Step 5: Test Order Operations (FIX #3)

1. Navigate to Orders/Bill section
2. DevTools → Network tab
3. Verify the request:
   - **URL**: `GET http://localhost:8080/api/order/session/{sessionId}`
   - **Headers**: Should include `x-customer-session: {token}` ✅
   - **Status**: Should be `200 OK` (NOT 401) ✅
   - **Response**: Should contain orders array

### Step 6: Test Remove Cart Item

1. In cart, click remove button on an item
2. DevTools → Network → Filter "cart"
3. Verify:
   - **URL**: `DELETE http://localhost:8080/api/cart/item/{itemId}`
   - **Headers**: Should include `x-customer-session: {token}` ✅
   - **Status**: Should be `200 OK` ✅

### Step 7: Test Update Cart Item Quantity

1. In cart, change quantity
2. DevTools → Network → Filter "cart"
3. Verify:
   - **URL**: `PUT http://localhost:8080/api/cart/update`
   - **Headers**: Should include `x-customer-session: {token}` ✅
   - **Status**: Should be `200 OK` ✅

### Step 8: Test Place Order

1. From cart, click "Place Order"
2. DevTools → Network
3. Verify:
   - **URL**: `POST http://localhost:8080/api/order/place`
   - **Headers**: Should include `x-customer-session: {token}` ✅
   - **Status**: Should be `200 OK` ✅
   - **Response**: Should contain created order data

### Step 9: Test Token Expiration (Optional)

1. Wait for token to expire (8 hours) or manually expire in MongoDB
2. Try making a cart request
3. Should get 401 error with message: "Invalid or expired session"

### Step 10: Test Multiple Sessions

1. Open another browser tab/incognito with different table
2. Join different table
3. Verify both tables have separate localStorage keys:
   - Tab 1: `plato:customerSession:table-id-1`
   - Tab 2: `plato:customerSession:table-id-2`
4. Verify each session uses correct token for its requests

## Common Issues & Solutions

### Issue: Still Getting 401 Errors

**Check:**

1. Browser cache - Clear cache or use Incognito mode
2. Verify token in localStorage: `localStorage.getItem('plato:customerSession:...')`
3. Check Network tab - is header being sent?
4. Server logs - any errors in middleware?

**Solutions:**

```javascript
// In browser console, debug:
console.log("localStorage keys:", Object.keys(localStorage));
const sessionKey = Object.keys(localStorage).find((k) =>
  k.startsWith("plato:customerSession:"),
);
console.log("Session token:", sessionKey, localStorage.getItem(sessionKey));
```

### Issue: Token Not Being Stored

**Check:**

1. Is the join response returning `sessionToken` field?
2. Open DevTools → Network → Click join request
3. Look in Response tab - should show: `{ success: true, data: { sessionId: "...", sessionToken: "..." } }`

**Solution:**
If sessionToken is missing, verify server changes were applied correctly.

### Issue: Network Requests Missing Header

**Check:**

1. DevTools → Network → Click on request
2. Go to "Headers" tab
3. Scroll down to find `x-customer-session` header

**Debug:**

```javascript
// In axios.interceptor.js, add this to verify:
console.log("Session Key Found:", sessionKey);
console.log("Session Token:", sessionToken?.substring(0, 10) + "...");
console.log(
  "Header Set:",
  config.headers["x-customer-session"]?.substring(0, 10) + "...",
);
```

## Verification Checklist

- [ ] Session model has `customerTokens` array field
- [ ] joinSessionController returns both `sessionId` and `sessionToken`
- [ ] CustomerJoin stores `sessionToken` (not sessionId) in localStorage
- [ ] axios.interceptor finds and uses token from localStorage
- [ ] Cart GET returns 200 OK (not 401)
- [ ] Cart POST (add) returns 200 OK (not 401)
- [ ] Cart PUT (update) returns 200 OK (not 401)
- [ ] Cart DELETE (remove) returns 200 OK (not 401)
- [ ] Order GET returns 200 OK (not 401)
- [ ] Order POST (place) returns 200 OK (not 401)
- [ ] Network requests include `x-customer-session` header
- [ ] Multiple tables have separate tokens in localStorage
- [ ] No console errors about missing headers

## Performance Impact

- ✅ No additional DB queries (token verification uses single find)
- ✅ No additional API calls
- ✅ localStorage operations are instantaneous
- ✅ Backward compatible with existing sessions

## Rollback Instructions

If needed to revert changes:

```bash
git log --oneline  # Find the commit before changes
git revert <commit-hash>  # Revert specific commit
# OR
git checkout <original-commit> -- file-name.js  # Revert specific file
```

---

**Last Updated**: January 22, 2025
