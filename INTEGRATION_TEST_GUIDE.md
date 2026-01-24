# Complete Integration Test Guide

## ✅ Full End-to-End Testing

This guide walks through testing the complete flow with real-world scenarios.

---

## 📋 Pre-Flight Checklist

### Backend Requirements

```bash
# 1. Check MongoDB is running
mongosh

# 2. Check all services installed
cd server && npm install

# 3. Check .env file has:
PORT=8080
MONGODB_URI=mongodb://localhost:27017/platomenu_db
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

### Frontend Requirements

```bash
# 1. Install dependencies
cd client && npm install

# 2. Check .env has:
VITE_API_URL=http://localhost:8080
VITE_API_BASE_URL=http://localhost:8080
```

---

## 🚀 Start Both Services

**Terminal 1: Backend**

```bash
cd server
npm run dev
```

Expected output:

```
✅ Server running on port 8080
✅ MongoDB connected
✅ Socket.io initialized
```

**Terminal 2: Frontend**

```bash
cd client
npm run dev
```

Expected output:

```
Local: http://localhost:5173
```

---

## 🧪 Test 1: PIN Entry & Session Creation

### Setup

```bash
# Get a table from database
mongosh
> use platomenu_db
> db.tables.findOne()
# Copy _id (e.g., 507f1f77bcf86cd799439011)
```

### Steps

1. **Open browser**: http://localhost:5173
2. **Navigate to PIN entry**: `/[brand-slug]/[restaurant-slug]/table/[TABLE_ID]`
3. **Get the PIN**:
   ```bash
   mongosh
   > use platomenu_db
   > db.sessions.findOne({tableId: "[TABLE_ID]"})
   # Copy tablePin (4 digits)
   ```
4. **Enter PIN in browser**
5. **Expected result**:
   - Redirected to `/menu` within 2 seconds
   - Console shows: `✅ PIN verified, session started`

### Verify in Database

```bash
mongosh
> use platomenu_db
> db.sessions.findOne({status: "OPEN"})
# Should show:
# {
#   _id: ObjectId(...),
#   tableId: ObjectId(...),
#   mode: "FAMILY" or "INDIVIDUAL",
#   customerTokens: [{ tokenHash: "...", expiresAt: ... }],
#   status: "OPEN"
# }
```

---

## 🧪 Test 2: Real-Time Cart Synchronization (FAMILY Mode)

### Setup

```bash
# Ensure session mode is FAMILY
mongosh
> use platomenu_db
> db.sessions.updateOne(
    {tableId: "[TABLE_ID]"},
    {$set: {mode: "FAMILY"}}
  )
```

### Steps

1. **Open 2 browser tabs** with same table URL
   - Tab 1: http://localhost:5173/.../menu
   - Tab 2: http://localhost:5173/.../menu

2. **Both should load with same session**
   - Console shows: `✅ Session loaded from storage`
   - Socket shows: `🔌 Socket connected`

3. **In Tab 1**: Add item to cart
   - Console should show: `📡 Cart update broadcasted`

4. **In Tab 2**:
   - Item appears within 1 second
   - Console shows: `📡 Cart synced from another device`

5. **In Tab 2**: Change quantity
   - Tab 1 updates instantly
   - Both tabs show same total

### Verify Socket Connection

```javascript
// In browser console:
socketService.isConnected(); // Should return: true
socketService.sessionId; // Should return: sessionId
```

---

## 🧪 Test 3: Order Placement with Idempotency

### Steps

1. **Add items to cart** (Test 2)
2. **Click "Place Order"**
   - Console shows: `🆔 Idempotency key: ...`
   - Order ID appears
   - Cart clears
   - Toast: "Order placed! Total: ₹XXX"

3. **Simulate network failure**:
   - Open DevTools → Network tab
   - Throttle to "Slow 3G"
   - Click "Place Order" again
   - Wait for timeout (you'll see pending request)
   - Network returns to normal

4. **Refresh page**
   - Order appears in "My Orders"
   - No duplicate order created
   - Database shows single order

### Verify in Database

```bash
mongosh
> use platomenu_db
> db.orders.findOne({status: {$ne: "CANCELLED"}})
# Should show:
# {
#   _id: ObjectId(...),
#   sessionId: ObjectId(...),
#   items: [{name, quantity, ...}],
#   orderStatus: "NEW",
#   totalAmount: XXX
# }
```

### Verify Idempotency

```bash
mongosh
> use platomenu_db
> db.idempotencyCache.findOne({})
# Should show cached result with 24-hour TTL
```

---

## 🧪 Test 4: Kitchen Display Real-Time Updates

### Setup

1. **Get restaurant ID**:

   ```bash
   mongosh
   > use platomenu_db
   > db.restaurants.findOne()
   # Copy _id
   ```

2. **Create a user with CHEF role** (if not exists):
   ```bash
   mongosh
   > db.users.insertOne({
       name: "Chef John",
       role: "CHEF",
       restaurantId: ObjectId("[RESTAURANT_ID]"),
       kitchenStation: "GRILL"
     })
   ```

### Steps

1. **Open Kitchen Display** in new tab: `/kitchen/[RESTAURANT_ID]`
   - Should show: "No orders yet" or existing orders
   - Console shows: `🔌 Socket connected`

2. **In customer tab**: Place an order
   - Kitchen Display updates within 1 second
   - Shows new order card
   - Console shows: `🆕 New order received`
   - No pricing visible (PCI compliance)

3. **Click "Cooking" button**
   - Status changes to "Cooking"
   - In customer app: "Your order is being prepared"
   - Console shows: `📋 Order updated`

4. **Click "Ready" button**
   - Status changes to "Ready"
   - In customer app: "Your order is ready!"
   - Kitchen order highlighted/moved

5. **Click "Served" button**
   - Order moves to completed
   - In customer app: "Order completed"

### Verify Kitchen Orders (No Pricing)

```bash
# In browser console on kitchen display:
// Should NOT show prices, only:
// - Item names
// - Quantity
// - Special instructions
// - Table number
// - Order age
```

---

## 🧪 Test 5: PIN Rate Limiting

### Steps

1. **Navigate to PIN entry page**
2. **Enter WRONG PIN 5 times**:

   ```bash
   # Each attempt
   curl -X POST http://localhost:8080/api/sessions/join \
     -H "Content-Type: application/json" \
     -d '{"tableId":"[TABLE_ID]","tablePin":"0000"}'
   ```

3. **After 5th attempt**:
   - Response: `429 Too Many Attempts`
   - Message: "Too many attempts. Try again in 15 minutes"
   - Browser: Toast error with countdown

4. **Try correct PIN**:
   - Still blocked
   - Error: "Blocked. Try again in X minutes"

5. **Wait (or modify time in DB)**:

   ```bash
   mongosh
   > db.sessions.updateOne(
       {tableId: "[TABLE_ID]"},
       {$set: {pinBlockedUntil: new Date(Date.now() - 1000)}}
     )
   ```

6. **Try PIN again**:
   - Now succeeds
   - Session created

### Verify Rate Limiting

```bash
mongosh
> db.sessions.findOne({tableId: "[TABLE_ID]"})
# Should show:
# {
#   pinAttempts: [{pin: "0000", timestamp: ...}, ...],
#   pinFailedCount: 5,
#   pinBlockedUntil: Date(...),
# }
```

---

## 🧪 Test 6: Session Recovery After Cookie Loss

### Steps

1. **Enter PIN and join session** (Test 1)
2. **Clear browser storage**:

   ```javascript
   // In browser console:
   sessionStorage.clear();
   localStorage.clear();
   ```

3. **Refresh page**
   - Should show PIN entry again
   - Previous session lost

4. **Enter same PIN again**:
   - Response shows: `resumeSession` endpoint called
   - New session token generated
   - Cart restored
   - Can continue ordering

### Verify Session Recovery

```javascript
// Before clearing:
sessionStorage.getItem("plato:session"); // Has session
localStorage.getItem("plato:token"); // Has token

// After clearing + re-entering PIN:
sessionStorage.getItem("plato:session"); // New session
localStorage.getItem("plato:token"); // New token
```

---

## 🧪 Test 7: Bill Split (Multi-Customer FAMILY Mode)

### Setup

```bash
mongosh
> db.sessions.updateOne(
    {tableId: "[TABLE_ID]"},
    {$set: {mode: "FAMILY", customerCount: 3}}
  )
```

### Steps

1. **Open 3 tabs** (simulating 3 customers at same table)
2. **Tab 1 adds items**: Biryani, Chai
3. **Tab 2 adds items**: Butter Chicken, Naan
4. **Tab 3 adds items**: Dessert, Lassi

5. **Tab 1 clicks "Split Bill"**:
   - Shows split options: Equal, By item, Custom
   - Choose "Equal" (3-way split)

6. **Each tab shows**:
   - Tab 1: Chai, 1/3 of shared items
   - Tab 2: Butter Chicken, Naan, 1/3 of shared
   - Tab 3: Dessert, Lassi, 1/3 of shared

7. **Each places order separately**:
   - 3 different orders created
   - But linked to same session
   - Kitchen sees all items together (grouped by table)

### Verify Bill Split

```bash
mongosh
> db.orders.find({sessionId: "[SESSION_ID]"})
# Should show 3 orders:
# Order 1: items for customer 1
# Order 2: items for customer 2
# Order 3: items for customer 3
```

---

## 🧪 Test 8: Audit Logging

### Steps

1. **Perform several actions**:
   - Enter PIN
   - Add to cart
   - Place order
   - Update kitchen item status

2. **Check audit logs**:

   ```bash
   mongosh
   > use platomenu_db
   > db.auditlogs.find().sort({createdAt: -1}).limit(10)
   ```

3. **Expected logs**:
   ```javascript
   {
     userId: "customer",
     action: "PIN_VERIFICATION",
     tableId: ObjectId(...),
     status: "SUCCESS",
     ipAddress: "127.0.0.1",
     userAgent: "Mozilla/5.0...",
     timestamp: ISODate(...)
   },
   {
     userId: "customer",
     action: "ORDER_PLACED",
     orderId: ObjectId(...),
     amount: 500,
     timestamp: ISODate(...)
   },
   {
     userId: ObjectId(...),
     action: "KITCHEN_ITEM_STATUS_UPDATED",
     orderId: ObjectId(...),
     status: "READY",
     timestamp: ISODate(...)
   }
   ```

---

## 🧪 Test 9: Error Handling & Recovery

### Scenario 1: Network Error During Order Placement

**Setup**: Enable slow network

```javascript
// DevTools → Network → Slow 3G
```

**Steps**:

1. Add items to cart
2. Click "Place Order"
3. Wait for timeout
4. Refresh page
5. Order still shows up (idempotency prevented duplicate)

---

### Scenario 2: Socket Disconnection

**Setup**: In browser console

```javascript
socketService.socket.disconnect();
```

**Expected**:

- Connection shows as disconnected
- App shows: "Real-time updates paused"
- Socket auto-reconnects in 5 seconds
- When order updates come, they arrive

---

### Scenario 3: Token Expiry

**Setup**: Force token expiry

```bash
mongosh
> db.sessions.updateOne(
    {tableId: "[TABLE_ID]"},
    {$set: {"customerTokens.0.expiresAt": new Date(Date.now() - 1000)}}
  )
```

**Steps**:

1. Click "Add to Cart"
2. Error: "Token expired"
3. App shows: "Session expired, please re-enter PIN"
4. Enter PIN again
5. Continue shopping

---

## 📊 Monitoring Dashboard

### Server Logs

```bash
# Terminal with server running:
# Watch for these patterns:

# PIN verification
"✅ PIN verified, session started"

# Socket connections
"🔌 Socket connected"
"🔌 Customer joined: session:..."

# Cart updates
"📡 Cart update broadcasted"

# Order placement
"🆔 Idempotency key:"
"✅ Order placed successfully"

# Kitchen updates
"🆕 New order received"
"📋 Order status changed"
```

### Client Logs (Browser Console)

```
✅ Session loaded from storage
🔌 Socket connected: [socket-id]
📡 Cart updated
📡 Cart synced from another device
📋 Order updated
🆕 New order received
📡 Order status updated
```

### Database Queries

```bash
# Monitor sessions
mongosh
> db.sessions.find({status: "OPEN"}).count()

# Monitor orders
> db.orders.find({orderStatus: "NEW"}).count()

# Monitor audit logs
> db.auditlogs.find({}).sort({createdAt: -1}).limit(5)

# Monitor idempotency cache (should auto-clean after 24h)
> db.idempotencyCache.find({})
```

---

## ✅ Complete Test Checklist

```
[ ] Test 1: PIN entry creates session
    [ ] Session appears in DB
    [ ] Token generated and stored
    [ ] Redirects to menu page

[ ] Test 2: Real-time cart sync (FAMILY mode)
    [ ] Two tabs see same cart
    [ ] Updates broadcast within 1s
    [ ] Totals calculate correctly

[ ] Test 3: Order placement with idempotency
    [ ] Order created in DB
    [ ] Cart clears after order
    [ ] No duplicates on network failure
    [ ] Idempotency key cached

[ ] Test 4: Kitchen display real-time
    [ ] New orders appear immediately
    [ ] Status changes broadcast
    [ ] No pricing visible (PCI compliance)
    [ ] Orders sorted by age/priority

[ ] Test 5: PIN rate limiting
    [ ] 429 after 5 attempts
    [ ] 15-minute block enforced
    [ ] Block expires after timeout

[ ] Test 6: Session recovery
    [ ] PIN re-entry works
    [ ] New token generated
    [ ] Cart preserved

[ ] Test 7: Bill splitting (multi-customer)
    [ ] 3 orders created
    [ ] Each has correct items
    [ ] Kitchen sees all items

[ ] Test 8: Audit logging
    [ ] PIN attempts logged
    [ ] Orders logged
    [ ] Kitchen updates logged
    [ ] IP and user-agent captured

[ ] Test 9: Error handling
    [ ] Network errors don't create duplicates
    [ ] Socket auto-reconnects
    [ ] Token expiry triggers re-auth
```

---

## 🎯 Integration Points to Verify

### Backend Socket Handlers (server/socket/index.js)

- ✅ `join:customer` - Customer joins session room
- ✅ `join:kitchen` - Kitchen staff joins kitchen room
- ✅ `cart:update` - Cart broadcast from customer
- ✅ `order:new` - New order notification
- ✅ `order:itemStatus` - Kitchen item status change
- ⚠️ Need to verify all are properly implemented

### Frontend Initialization (client/src/main.jsx or App.jsx)

- ✅ `initAxiosInterceptors()` called on app start
- ✅ Session loaded from storage
- ✅ Socket connected after PIN verification
- ⚠️ Need to verify App.jsx calls initialization

### API Endpoints

- ✅ `/api/sessions/join` - Customer PIN verification
- ✅ `/api/sessions/resume` - Resume after cookie loss
- ✅ `/api/sessions/check-token` - Token validity check
- ✅ `/api/sessions/:sessionId/status` - Get session status
- ✅ `/api/order/place` - Place order with idempotency
- ✅ `/api/order/session/:sessionId` - List session orders

---

## 🚀 Next Steps

After all tests pass:

1. **Performance Testing**
   - Load test with 100 concurrent customers
   - Monitor CPU, memory, socket connections
   - Test kitchen with 50+ orders

2. **UI Refinement**
   - Custom styling per restaurant brand
   - Mobile responsiveness
   - Accessibility (WCAG)

3. **Production Deployment**
   - Use production MongoDB URI
   - Enable HTTPS
   - Set up error tracking (Sentry)
   - Configure CDN for static files
   - Set up monitoring (DataDog/NewRelic)

4. **User Training**
   - Waiter training on opening sessions
   - Chef training on kitchen display
   - Cashier training on bill splitting

---

## 📞 Troubleshooting

### "Session not found" error

```bash
mongosh
> db.sessions.findOne({tableId: "[TABLE_ID]"})
# Should exist and have status: "OPEN"
```

### Cart not syncing in FAMILY mode

```javascript
// Check:
// 1. Session mode is FAMILY
// 2. Socket is connected
// 3. Both tabs have same sessionId
socketService.isConnected();
sessionStorage.getItem("plato:session");
```

### Kitchen orders not appearing

```bash
# Check:
# 1. Chef is logged in (CHEF role)
# 2. Chef joined kitchen room
# 3. Order was created with correct restaurantId

# In server logs:
# "🔌 Customer joined: session:..."
# "🆕 New order received"
```

### PIN rate limiting not working

```bash
mongosh
> db.sessions.updateOne(
    {tableId: "[TABLE_ID]"},
    {$set: {pinFailedCount: 0, pinBlockedUntil: null}}
  )
```

---

Good luck! 🎉
