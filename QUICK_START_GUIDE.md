## ⚡ QUICK START - Getting Everything Running

This guide gets your full application running with real-time updates in 5 minutes.

---

## 📦 Prerequisites

- Node.js v16+
- MongoDB connection
- Redis (optional, for socket.io scaling)
- npm or yarn

---

## 🚀 Installation

### 1. Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Environment Setup

**server/.env**

```env
PORT=8080
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173

# Socket.io
SOCKET_CORS=http://localhost:5173

# Rate Limiting
PIN_RATE_LIMIT_WINDOW=900000  # 15 minutes
PIN_MAX_ATTEMPTS=5
PIN_BLOCK_DURATION=15         # minutes
```

**client/.env**

```env
VITE_API_URL=http://localhost:8080
```

### 3. Start Services

```bash
# Terminal 1: Start Server
cd server
npm run dev
# Should see: "✅ Server running on port 8080"
#            "✅ Socket.io initialized"
#            "✅ MongoDB connected"

# Terminal 2: Start Client
cd client
npm run dev
# Should see: "Local: http://localhost:5173"
```

### 4. Verify Everything Works

Open http://localhost:5173 in browser

```
✅ Network tab shows:
   - WebSocket connected (Socket.io)
   - API calls returning 200

✅ Console shows:
   - "🔌 Socket connected: ..."
   - "✅ Session loaded from storage"

✅ No errors in red
```

---

## 🧪 Test the Full Flow

### Test 1: PIN Entry & Session Creation

```bash
# 1. Get a table ID from your database
mongosh platomenu_db
> db.tables.findOne()
# Copy the _id

# 2. Navigate to PIN entry page
http://localhost:5173/brand-slug/restaurant-slug/table/[TABLE_ID]

# 3. Waiter gives you the PIN (from DB)
# Check: db.sessions.findOne({tableId: "..."}).tablePin

# 4. Enter PIN in browser
# Expected: Redirects to /menu within 2 seconds
```

### Test 2: Real-Time Cart Sync

```bash
# 1. Open 2 browser tabs with same table
Tab 1: http://localhost:5173/.../menu
Tab 2: http://localhost:5173/.../menu

# 2. In Tab 1: Add item to cart
# Expected: Item appears in Tab 2 within 1 second

# 3. In Tab 2: Increase quantity
# Expected: Quantity updates in Tab 1 instantly

# Console should show:
# Tab 1: "📡 Cart updated"
# Tab 2: "📡 Cart synced from another device"
```

### Test 3: Order Placement with Idempotency

```bash
# 1. Add items to cart
# 2. Click "Place Order"
# Expected: Order ID returned, cart cleared

# 3. Simulate network failure
#    - Open DevTools → Network → Slow 3G
#    - Click "Place Order" again
#    - Wait for timeout
#    - Refresh page

# Expected: Order appears in history (no duplicate)
# Server has same idempotencyKey in cache
```

### Test 4: Kitchen Display

```bash
# 1. Navigate to http://localhost:5173/kitchen/[RESTAURANT_ID]
# 2. Place an order from customer side
# Expected: Order appears on kitchen display within 1 second

# 3. Click "Cooking" button
# Expected: Order status changes, customer sees "Order being prepared"

# 4. Click "Ready" button
# Expected: Customer sees "Your order is ready!"

# Console should show:
# Kitchen: "🆕 New order received"
# Customer: "📡 Order status changed"
```

### Test 5: PIN Rate Limiting

```bash
# 1. Try to join with WRONG PIN 5 times
curl -X POST http://localhost:8080/api/sessions/join \
  -H "Content-Type: application/json" \
  -d '{"tableId":"123","tablePin":"0000"}'

# After attempt 5:
# Expected: 429 status
# Message: "Too many attempts. Try again in 15 minutes"

# 6. Try correct PIN
# Still blocked
# Expected: Error message with time remaining

# After 15 minutes (or in test):
# Should be able to retry
```

---

## 🔍 Debugging

### Socket.io Not Connecting

```bash
# Check server logs
npm run dev
# Should see: "🔌 Socket.io listening"

# Check browser console
# Should see: "🔌 Socket connected: ..."

# If not:
# 1. Check CORS: server/.env SOCKET_CORS
# 2. Check WebSocket enabled: client is connecting
# 3. Check firewall: port 8080 accessible
```

### Cart Not Syncing

```bash
# 1. Check socket connection
# Browser console: socketService.isConnected()
# Should return: true

# 2. Check room joined
# Server logs should show:
# "join:session" event received

# 3. Verify mode is FAMILY
# Session object should have: mode: "FAMILY"
```

### Order Not Appearing in Kitchen

```bash
# 1. Check order was created
# Browser console: orders[0]
# Should show order object

# 2. Check kitchen is listening
# Navigation: /kitchen/[RESTAURANT_ID]
# Server logs: "join:kitchen" event

# 3. Broadcast failing?
# Server logs: "socketService.emit('order:new')"
# Should be there within 1 second
```

### PIN Verification Failing

```bash
# 1. Check PIN format
curl -X POST http://localhost:8080/api/sessions/join \
  -H "Content-Type: application/json" \
  -d '{"tableId":"507f1f77bcf86cd799439011","tablePin":"1234"}'

# Should return: { sessionId, sessionToken }

# 2. If fails: Check session exists
mongosh platomenu_db
> db.sessions.findOne({status: "OPEN"})
# Make sure tablePin matches

# 3. Check rate limiting
# Try immediately after wrong PIN
# Should get: attemptsLeft: 4 (or similar)
```

---

## 📊 Monitoring

### Check Real-Time Activity

```bash
# Terminal: Watch for all events
tail -f server.log | grep -E "(cart:|order:|kitchen:)"

# Or use MongoDB compass
# Watch collections: orders, sessions, cartItems

# Check Socket.io
# Server logs: "socketService.on('cart:update')"
# Shows all real-time events
```

### Performance Metrics

```bash
# API Response Time
# DevTools → Network tab
# Should see: <100ms for most requests

# Socket.io Latency
# Browser console:
# Time between broadcast and receipt
# Should be: <500ms

# Memory Usage
# Server logs every 30 seconds
# Should stay stable around 100-150 MB
```

---

## 🐛 Common Issues & Fixes

### Issue: "sessionId is not defined"

```
Fix: Ensure localStorage has token before making API calls
useCustomerSession hook handles this automatically
```

### Issue: "Cannot read property '\_id' of null"

```
Fix: Check session loaded before accessing
useEffect(() => { if (!session) return; ... }, [session])
```

### Issue: "WebSocket is already in CONNECTING state"

```
Fix: Socket.io tries to reconnect automatically
Check: socketService.isConnected() before calling methods
```

### Issue: "idempotencyKey required"

```
Fix: Order API now requires idempotency key
Generate with: generateIdempotencyKey()
Pass in request headers: "idempotency-key": key
```

### Issue: "Cart not visible on other device"

```
Fix 1: Check mode is FAMILY
      session.mode should be "FAMILY"
Fix 2: Check devices in same socket room
      Browser console: socketService.sessionId
      Should be same on both devices
Fix 3: Check socket connected
      socketService.isConnected() === true
```

---

## ✅ Verification Checklist

Run through this checklist to ensure everything is working:

```
[ ] Server starts without errors
    npm run dev (in server/)
    Logs show: ✅ Connected to MongoDB

[ ] Client starts without errors
    npm run dev (in client/)
    Logs show: ✅ Vite dev server running

[ ] Socket connection works
    Open DevTools → Console
    See: "🔌 Socket connected"

[ ] PIN verification works
    Enter PIN on customer page
    See: Redirects to menu within 2s

[ ] Cart appears
    Navigate to /menu
    Menu items visible
    Can add to cart

[ ] Cart syncs in real-time
    Open 2 tabs
    Add item in Tab 1
    See it in Tab 2 within 1s

[ ] Order placement works
    Click "Place Order"
    See: Order ID confirmation
    Cart clears

[ ] Kitchen receives order
    Navigate to /kitchen/[RESTAURANT_ID]
    See order appears <1s after placement

[ ] Real-time kitchen updates
    Click status buttons
    See customer gets updates
    All in sync

[ ] PIN rate limiting works
    Wrong PIN 5 times
    Get blocked message
    See countdown timer

[ ] Database logging works
    Check db.auditlogs
    See pin attempts logged
    See order placements logged
```

---

## 🚀 Production Deployment

### Before Going Live

```bash
# 1. Build client
cd client
npm run build
# Creates: dist/

# 2. Update server to serve client
# In server/index.js:
import express from 'express';
const app = express();
app.use(express.static('../client/dist'));

# 3. Environment variables
# Use production MongoDB URI
# Use production frontend URL
# Enable HTTPS

# 4. Test load
# Simulate 100 concurrent customers
# Monitor: CPU, Memory, Socket connections

# 5. Set up monitoring
# Error tracking: Sentry
# Performance: DataDog or equivalent
# Logs: ELK or CloudWatch
```

### Scaling Considerations

```
Single Server:
  - ~500 concurrent customers
  - ~5000 orders/day

Scale Horizontally:
  - Use Redis for Socket.io adapter
  - Use MongoDB replica set
  - Use load balancer (Nginx)
  - Each server: ~500 customers
  - 3 servers: ~1500 customers

Global Scale:
  - Use CDN for static files
  - Deploy in multiple regions
  - Use managed database (Atlas)
  - Auto-scaling groups
```

---

## 📞 Support

If something isn't working:

1. **Check logs**

   ```bash
   # Server logs
   npm run dev

   # Client logs
   DevTools → Console (F12)
   ```

2. **Check database**

   ```bash
   mongosh platomenu_db
   > db.sessions.findOne()
   > db.orders.findOne()
   > db.auditlogs.findOne()
   ```

3. **Check network**

   ```bash
   # DevTools → Network tab
   # Check all API calls return 200
   # Check WebSocket shows "101 Switching Protocols"
   ```

4. **Verify configurations**
   ```bash
   # server/.env has correct values
   # client/.env has correct API_URL
   # CORS enabled for frontend URL
   ```

---

## 🎉 Done!

Your full production-grade restaurant ordering system is now running!

Next steps:

- Customize UI/colors for your brand
- Set up payment integration
- Configure SMS/WhatsApp notifications
- Train staff on kitchen display system
- Test with real customers
- Monitor and optimize

Good luck! 🚀
