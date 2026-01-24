# 🧪 TESTING & VERIFICATION GUIDE

## Quick Test Commands

### 1. Test PIN Rate Limiting

```bash
# Test: Submit wrong PIN 5 times, then verify blocking

curl -X POST http://localhost:8080/api/sessions/join \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "YOUR_TABLE_ID",
    "tablePin": "0000"
  }'

# Repeat 5 times with wrong PIN
# On 5th attempt: should return 429 with blockTimeLeft
# Expected response:
# {
#   "success": false,
#   "message": "Too many attempts. Try again in 15 minutes",
#   "minutesLeft": 15,
#   "retryAfter": 900
# }
```

### 2. Test Idempotency

```bash
# First request - should create order
curl -X POST http://localhost:8080/api/orders/place \
  -H "Content-Type: application/json" \
  -H "idempotency-key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "sessionId": "SESSION_ID",
    "restaurantId": "RESTAURANT_ID",
    "tableId": "TABLE_ID",
    "tableName": "Table 5",
    "paymentMethod": "CASH"
  }'

# Response 1: { "success": true, "orderId": "ORDER_123" }

# Same request again - should return same order
# Response 2: { "success": true, "orderId": "ORDER_123" }

# Verify: Both responses have same orderId (no duplicate created)
```

### 3. Test Order Transaction Rollback

```bash
# Stop the server after order starts but before completion
# Then restart - verify cart state

# 1. Add items to cart
curl -X POST http://localhost:8080/api/cart/add \
  -H "x-session-token: YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "branchMenuItemId": "ITEM_ID", "quantity": 1 }'

# 2. Start order placement (kill server mid-request)
# 3. Restart server
# 4. Check cart still exists
curl http://localhost:8080/api/cart \
  -H "x-session-token: YOUR_TOKEN"

# Should show items still in cart (transaction rolled back)
```

### 4. Test Session Resume (Cookie Loss)

```bash
# 1. Get session with PIN
SESSION_ID="some_session_id"
SESSION_TOKEN=$(curl -s -X POST http://localhost:8080/api/sessions/join \
  -H "Content-Type: application/json" \
  -d '{"tableId":"TABLE_ID","tablePin":"1234"}' \
  | jq -r '.data.sessionToken')

# 2. Add items to cart
curl -X POST http://localhost:8080/api/cart/add \
  -H "x-session-token: $SESSION_TOKEN" \
  -d '{"branchMenuItemId":"ITEM_ID","quantity":1}'

# 3. Simulate cookie loss - delete token
unset SESSION_TOKEN

# 4. Resume session with PIN
RESUMED=$(curl -s -X POST http://localhost:8080/api/sessions/resume \
  -H "Content-Type: application/json" \
  -d '{
    "tableId":"TABLE_ID",
    "tablePin":"1234",
    "restaurantId":"RESTAURANT_ID"
  }' | jq -r '.data.sessionToken')

# 5. Verify cart still exists
curl http://localhost:8080/api/cart \
  -H "x-session-token: $RESUMED"

# Should show items previously added (cart survived cookie loss)
```

### 5. Test Kitchen Display (No Pricing)

```bash
# As CHEF user - should see NO pricing
curl http://localhost:8080/api/kitchen/orders \
  -H "Authorization: Bearer CHEF_JWT_TOKEN"

# Expected response (notice: no totalAmount, no prices):
# {
#   "success": true,
#   "orders": [
#     {
#       "orderId": "ORDER_123",
#       "tableNumber": "5",
#       "items": [
#         {
#           "name": "Grilled Chicken",
#           "quantity": 2,
#           "modifiers": [{"name": "Extra Spicy"}],
#           "status": "NEW"
#         }
#       ]
#     }
#   ]
# }

# Update item status
curl -X PATCH http://localhost:8080/api/kitchen/orders/ORDER_123/items/0/status \
  -H "Authorization: Bearer CHEF_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newStatus": "IN_PROGRESS"}'

# Verify: NO pricing visible in response
```

### 6. Test FAMILY Mode Cart Sync

```javascript
// In browser console (Device 1)
const socket1 = io("http://localhost:8080");
socket1.emit("join-family-cart", {
  sessionId: "SESSION_ID",
  restaurantId: "RESTAURANT_ID",
});

// Add item on device 1
socket1.emit("add-to-cart", {
  sessionId: "SESSION_ID",
  restaurantId: "RESTAURANT_ID",
  item: { branchMenuItemId: "ITEM_ID", quantity: 1 },
});

// Listen for sync
socket1.on("item-added", (data) => {
  console.log("✅ Item added and synced:", data);
});

// In browser console on Device 2
const socket2 = io("http://localhost:8080");
socket2.emit("join-family-cart", {
  sessionId: "SESSION_ID",
  restaurantId: "RESTAURANT_ID",
});

// Should see item from device 1
socket2.on("item-added", (data) => {
  console.log("✅ Device 2 sees item:", data);
});
```

---

## Unit Test Examples

### Test: PIN Rate Limiting

```javascript
// tests/pinRateLimit.test.js
import { checkSessionPinBlocking } from "../services/rateLimitPin.js";
import SessionModel from "../models/session.model.js";

describe("PIN Rate Limiting", () => {
  it("should block PIN after 5 failed attempts", async () => {
    const session = new SessionModel({
      tableId: "table1",
      restaurantId: "rest1",
      tablePin: "1234",
      pinFailedCount: 5,
      pinBlockedUntil: new Date(Date.now() + 15 * 60 * 1000),
    });

    const result = await checkSessionPinBlocking(session._id);

    expect(result.blocked).toBe(true);
    expect(result.minutesLeft).toBeGreaterThan(0);
  });

  it("should allow PIN after timeout expires", async () => {
    const session = new SessionModel({
      tableId: "table1",
      restaurantId: "rest1",
      tablePin: "1234",
      pinFailedCount: 5,
      pinBlockedUntil: new Date(Date.now() - 1000), // Expired
    });

    const result = await checkSessionPinBlocking(session._id);

    expect(result.blocked).toBe(false);
  });
});
```

### Test: Idempotency

```javascript
// tests/idempotency.test.js
import {
  checkIdempotency,
  storeIdempotencyResult,
} from "../services/idempotency.service.js";

describe("Idempotency", () => {
  it("should return same orderId for duplicate request", async () => {
    const key = "550e8400-e29b-41d4-a716-446655440000";

    // Store first order
    await storeIdempotencyResult(key, "order123", { amount: 100 });

    // Check duplicate
    const result = await checkIdempotency(key);

    expect(result.isNew).toBe(false);
    expect(result.orderId).toBe("order123");
  });

  it("should treat different keys as new requests", async () => {
    const key1 = "550e8400-e29b-41d4-a716-446655440000";
    const key2 = "550e8400-e29b-41d4-a716-446655440001";

    await storeIdempotencyResult(key1, "order123", {});

    const result = await checkIdempotency(key2);

    expect(result.isNew).toBe(true);
  });
});
```

### Test: Order Transactions

```javascript
// tests/orderTransaction.test.js
import { createOrderFromCartTransaction } from "../services/order.transaction.service.js";
import CartItemModel from "../models/cartItem.model.js";
import OrderModel from "../models/order.model.js";

describe("Order Transactions", () => {
  it("should create order and clear cart atomically", async () => {
    const sessionId = "session123";

    // Create cart items
    await CartItemModel.create([
      { sessionId, branchMenuItemId: "item1", quantity: 2 },
      { sessionId, branchMenuItemId: "item2", quantity: 1 },
    ]);

    // Place order
    const result = await createOrderFromCartTransaction({
      sessionId,
      restaurantId: "rest1",
      tableId: "table1",
      tableName: "Table 1",
    });

    // Verify
    const order = await OrderModel.findById(result.orderId);
    expect(order).toBeDefined();
    expect(order.items.length).toBe(2);

    const cartCount = await CartItemModel.countDocuments({ sessionId });
    expect(cartCount).toBe(0); // Cart cleared
  });

  it("should rollback on failure", async () => {
    const sessionId = "invalid_session";

    expect(async () => {
      await createOrderFromCartTransaction({
        sessionId,
        restaurantId: "rest1",
        tableId: "table1",
        tableName: "Table 1",
      });
    }).rejects.toThrow();
  });
});
```

---

## Integration Test Scenarios

### Scenario 1: Network Failure During Order

```javascript
// Simulate network interruption
const placeOrderWithNetworkFailure = async () => {
  const idempotencyKey = generateUUID();

  try {
    // Simulate timeout
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 100); // 100ms timeout

    await fetch("/api/orders/place", {
      method: "POST",
      signal: controller.signal,
      body: JSON.stringify({
        sessionId,
        restaurantId,
        idempotencyKey,
      }),
    });
  } catch (err) {
    console.log("Request failed (simulated network)");
  }

  // User retries with same key
  const result = await fetch("/api/orders/place", {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      restaurantId,
      idempotencyKey,
    }),
  });

  // Should succeed without duplicate order
  return result.json();
};
```

### Scenario 2: Concurrent Checkout (FAMILY Mode)

```javascript
// Device 1 and Device 2 attempt checkout simultaneously
const device1Checkout = placeOrder(sessionId, idempotencyKey1);
const device2Checkout = placeOrder(sessionId, idempotencyKey2);

const [result1, result2] = await Promise.all([
  device1Checkout,
  device2Checkout,
]);

// One should succeed, one should be blocked
expect(result1.success || result2.success).toBe(true);
expect(result1.blocked || result2.blocked).toBe(true);
```

---

## Monitoring Queries

### Check PIN Blocking Events

```javascript
// MongoDB query to see PIN blocking patterns
db.auditlogs
  .find({
    action: "PIN_BLOCKED",
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })
  .count();

// Should be very low (< 0.1% of PIN attempts)
```

### Check Duplicate Order Attempts

```javascript
// Find cases where idempotency saved us from duplicates
db.idempotencykeys
  .find({
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })
  .count();

// Compare to successful orders - difference = prevented duplicates
```

### Monitor Transaction Rollbacks

```javascript
// Check for transaction failures (should be 0 in production)
db.auditlogs
  .find({
    action: "ORDER_TRANSACTION_FAILED",
  })
  .count();
```

---

## Performance Testing

### Load Test PIN Verification

```bash
# Using Apache Bench
ab -n 1000 -c 10 \
  -p pin_data.json \
  -T application/json \
  http://localhost:8080/api/sessions/join

# Should handle 100+ requests/second
# <100ms latency (p95)
# <1% error rate
```

### Load Test Order Placement

```bash
# Using wrk
wrk -t4 -c100 -d30s \
  -s order_placement.lua \
  http://localhost:8080/api/orders/place

# Should handle 50+ orders/second
# <200ms latency (p95)
# 0% duplicate orders (idempotency working)
```

---

## Debugging Checklist

- [ ] Enable debug logs: `DEBUG=plato:* npm run dev`
- [ ] Check MongoDB indexes: `db.sessions.getIndexes()`
- [ ] Verify rate limiting middleware is in routes
- [ ] Confirm audit logging calls in controllers
- [ ] Test WebSocket connection: `socket.on("connect", () => {...})`
- [ ] Verify kitchen routes are registered
- [ ] Check idempotency headers in requests
- [ ] Monitor database transaction logs

---

**Last Updated**: January 2026  
**Status**: Ready for Testing ✅
