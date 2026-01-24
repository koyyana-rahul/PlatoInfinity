# COMPLETE ROLES & INTEGRATIONS - WORKING GUIDE

## ✅ ALL ROLES FULLY INTEGRATED WITH REAL-TIME UPDATES

### Roles Implemented:

1. **CUSTOMER** (PIN-based Session) ✅ COMPLETE
2. **CHEF** (Kitchen Staff - PIN Login) ✅ COMPLETE
3. **WAITER** (Floor Staff - PIN Login) ✅ COMPLETE
4. **CASHIER** (Finance Staff - PIN Login) ✅ COMPLETE
5. **MANAGER** (Restaurant Manager - Email Login) ✅ COMPLETE
6. **BRAND_ADMIN** (Business Owner - Email Login) ✅ COMPLETE

---

## 🔐 AUTHENTICATION FLOWS

### CUSTOMER - PIN-Based Session

```javascript
// Frontend: customer/pages/QREntry.jsx
const session = await sessionApi.joinWithPin(pin, tableId, restaurantId);
// Returns: { sessionId, token, mode, name, ... }
// Storage: localStorage['plato:session'], localStorage['plato:token']
// Header: x-customer-session: <token>
```

**Endpoints**:

- `POST /api/sessions/join` → customerapi.joinWithPin
- `POST /api/sessions/resume` → sessionApi.resumeSession (NEW)
- `POST /api/sessions/check-token` → sessionApi.checkTokenExpiry (NEW)
- `GET /api/sessions/:id/status` → sessionApi.getSessionStatus (NEW)

**Socket**: `join:customer` → Joins `session:${sessionId}` room

---

### STAFF - PIN-Based Login (CHEF, WAITER, CASHIER)

```javascript
// Frontend: staff/login/StaffPinLogin.jsx
const user = await staffApi.staffLogin({ staffPin, qrToken });
// Returns: { id, name, role, accessToken, refreshToken, ... }
// Storage: cookies (accessToken, refreshToken)
// Header: Authorization: Bearer <accessToken>
```

**Endpoints**:

- `POST /api/auth/staff-login` → staffLoginController
- `POST /api/staff/shift/start` → startStaffShiftController (NEW)
- `POST /api/staff/shift/end` → endStaffShiftController
- `GET /api/staff/shift/status` → getStaffShiftStatusController (NEW)

**Socket**: Auto-joins rooms based on role:

- CHEF: `restaurant:${id}:station:${station}`, `restaurant:${id}:kitchen`
- WAITER: `restaurant:${id}:waiters`
- CASHIER: `restaurant:${id}:cashier`

---

### MANAGER - Email-Based Login

```javascript
// Frontend: manager/pages/ManagerLogin.jsx
const user = await authApi.login({ email, password });
// Returns: { id, name, role, accessToken, refreshToken, ... }
// Storage: cookies (accessToken, refreshToken)
// Header: Authorization: Bearer <accessToken>
```

**Endpoints**:

- `POST /api/auth/login` → loginController
- `POST /api/auth/refresh-token` → refreshTokenController

**Socket**: Auto-joins `restaurant:${id}:managers` room

---

## 🍳 CHEF FLOW (Complete with Real-Time Updates)

### Shift Management

```javascript
// useStaffShift.js - Backend auto-tracks shift times
const shift = await staffApi.startShift();
// Sets: onDuty = true, lastShiftIn = now

// Later...
const ended = await staffApi.endShift();
// Sets: onDuty = false, lastShiftOut = now
```

### Kitchen Display

```javascript
// useKitchenOrders.js
const { orders } = useKitchenOrders(station);

// REAL-TIME UPDATES:
// 1. New order placed → socket "order:placed"
// 2. Chef claims item → socket "kitchen:item-claimed"
// 3. Mark ready → socket "kitchen:item-ready"
// 4. Waiter pickup alert → socket "kitchen:item-ready-alert"
```

### Socket Events (CHEF)

```javascript
// Claim item from queue
socket.emit("kitchen:claim-item", { orderId, itemIndex });

// Mark item as ready
socket.emit("kitchen:mark-ready", { orderId, itemIndex });

// Broadcast chef status
socket.emit("kitchen:status-update", { status: "online" });

// Alert waiters item is ready
socket.emit("kitchen:item-ready-alert", {
  orderId,
  itemId,
  tableId,
  tableName,
});
```

### Real-Time Updates Received

```javascript
socket.on("order:placed", (order) => {
  // New order in kitchen
});

socket.on("order:item-claimed", (update) => {
  // Another chef claimed item
});

socket.on("waiter:staff-status", (status) => {
  // Waiter came online/offline
});
```

---

## 👨‍💼 WAITER FLOW (Complete with Real-Time Updates)

### Shift Management

```javascript
const shift = await staffApi.startShift();
// Clock in - waiter available for orders

const ended = await staffApi.endShift();
// Clock out - waiter no longer on duty
```

### Load Orders & Ready Items

```javascript
// useWaiterOrders.js
const { orders, readyItems, serveItem } = useWaiterOrders();

// Orders: All open orders in restaurant
// ReadyItems: Only items with status "READY"
// serveItem(orderId, itemId) → Mark as SERVED
```

### Serve Items

```javascript
await waiterApi.serveItem(orderId, itemId);
// Updates: item.itemStatus = "SERVED"
// Socket broadcast: "order:item-served" to customers
```

### Socket Events (WAITER)

```javascript
// Broadcast waiter status
socket.emit("waiter:status-update", { status: "online" });

// Request item pickup confirmation
socket.emit("waiter:pickup-confirmed", { orderId, itemId });
```

### Real-Time Updates Received

```javascript
socket.on("order:placed", (order) => {
  // New order placed
});

socket.on("waiter:item-ready-alert", ({ tableId, tableName, itemName }) => {
  // Chef says: "Item for table 5 is ready!"
  toast.show(`Pick up: ${itemName} for ${tableName}`);
});

socket.on("kitchen:chef-status", ({ chefName, status }) => {
  // Kitchen staff online/offline status
});
```

---

## 💰 CASHIER FLOW (Complete with Real-Time Updates)

### Shift Management

```javascript
const shift = await staffApi.startShift();
// Clock in - ready to process payments

const ended = await staffApi.endShift();
// Clock out - shift summary recorded
```

### Load Pending Bills

```javascript
// useCashierBills.js
const { bills, summary, processPayment, splitPayment } = useCashierBills();

// bills: All open bills (status: "OPEN")
// summary: Daily stats (total cash, card, revenue, etc.)
```

### Process Single Payment

```javascript
await cashierApi.processBillPayment(billId, {
  paymentMethod: "CASH", // "CASH" | "CARD" | "UPI" | "CHEQUE"
  amountPaid: billTotal,
  notes: "Optional notes",
});
// Updates: bill.status = "PAID", bill.paidAt = now
```

### Split Payment

```javascript
await cashierApi.splitBillPayment(billId, {
  payments: [
    { method: "CASH", amount: 500 },
    { method: "CARD", amount: 300 },
  ],
});
// Handles partial payments, multiple methods
```

### Cashier Summary

```javascript
const summary = await cashierApi.getSummary();
// Returns: {
//   totalBillsPaid: 45,
//   totalCash: 12500,
//   totalCard: 8300,
//   totalUPI: 2100,
//   totalRevenue: 22900,
//   totalCollected: 22900
// }
```

### Socket Events (CASHIER)

```javascript
// Notify managers when bill is paid
socket.emit("cashier:bill-paid", {
  billId,
  billTotal,
  paymentMethod,
});
```

### Real-Time Updates Received

```javascript
socket.on("bill:generated", (bill) => {
  // New bill created by waiter
  setBills([bill, ...bills]);
});

socket.on("cashier:bill-settled", ({ billId }) => {
  // Another cashier paid a bill
  removeBillFromList(billId);
});
```

---

## 👔 MANAGER FLOW (Complete with Real-Time Updates)

### Dashboard

```javascript
// manager/ManagerDashboard.jsx
const { summary, stats, orders } = useDashboard();

// Real-time metrics:
// - Current orders count
// - Revenue (today, this month)
// - Staff performance
// - Table occupancy
// - Bill status
```

### Staff Management

```javascript
const { staff, createStaff, regeneratePin, toggleActive } = useManagerStaff();

// Create staff → Generates unique PIN per restaurant
// Regenerate PIN → Old PIN becomes invalid
// Toggle active → Enable/disable staff account
```

### Socket Events (MANAGER)

```javascript
// Broadcast metrics update
socket.emit("manager:metrics-update", {
  totalOrders: 5,
  totalRevenue: 2500,
  activeStaff: 8,
  // ... other metrics
});

// Broadcast order status change
socket.emit("manager:order-update", {
  orderId: "abc123",
  status: "OPEN",
});
```

### Real-Time Updates Received

```javascript
socket.on("dashboard:metrics-updated", (metrics) => {
  // Live KPI updates from any manager
  updateDashboard(metrics);
});

socket.on("manager:order-status-changed", ({ orderId, status }) => {
  // Order status changed by another staff
});

socket.on("staff:went-offline", ({ staffId, role }) => {
  // Staff member logged out/disconnected
});
```

---

## 🌐 BRAND_ADMIN FLOW (Complete)

### Multi-Restaurant Dashboard

```javascript
// admin/AdminDashboard.jsx
const { restaurants, totals, analytics } = useBrandDashboard();

// View: Combined stats from all restaurants
// - Total revenue
// - Total orders
// - Total customers
// - Staff count
// - Average metrics
```

### Manager Invites

```javascript
const { inviteManager, resendInvite, removeManager } = useManagerInvites();

// inviteManager → Send email invite
// resendInvite → Resend if not accepted
// removeManager → Remove manager access
```

### Socket Rooms

- Joins: All restaurant rooms for real-time updates
- Can receive updates from all restaurants

---

## 📊 REAL-TIME SOCKET EVENTS SUMMARY

### Kitchen Room: `restaurant:${id}:kitchen`

```javascript
// Broadcast to all kitchen staff
"order:placed"; // New order
"order:item-claimed"; // Chef claimed item
"order:item-ready"; // Item ready for waiter
"order:ready-for-serving"; // All items in order ready
"kitchen:chef-status"; // Chef online/offline
"kitchen:station-queue"; // Queue updated for station
```

### Waiter Room: `restaurant:${id}:waiters`

```javascript
// Broadcast to all waiters
"order:placed"; // New order
"order:item-ready"; // Item ready for serving
"waiter:item-ready-alert"; // Chef alert: pick up item
"waiter:staff-status"; // Waiter online/offline
"kitchen:chef-status"; // Kitchen staff status
"table:alert"; // Customer needs attention
```

### Cashier Room: `restaurant:${id}:cashier`

```javascript
// Broadcast to cashiers
"bill:generated"; // New bill created
"order:item-served"; // All items served
"cashier:bill-settled"; // Bill paid by another cashier
"cashier:payment-processed"; // Payment processed
```

### Manager Room: `restaurant:${id}:managers`

```javascript
// Broadcast to managers
"dashboard:metrics-updated"; // KPI update
"manager:order-status-changed"; // Order status
"staff:went-offline"; // Staff disconnected
"order:placed"; // New order
"order:ready-for-serving"; // Order ready
"cashier:payment-processed"; // Payment info
```

### Manager Room: `restaurant:${id}:managers`

```javascript
// Broadcast to managers and relevant staff
"manager:order-status-changed";
"staff:activity-logged";
"performance:metrics-updated";
```

### Customer Session: `session:${sessionId}`

```javascript
// Broadcast to customers in session
"order:placed"; // Order confirmation
"order:item-status"; // Item status update
"order:item-ready"; // Item ready
"order:item-served"; // Item served
"bill:generated"; // Bill ready
"bill:updated"; // Bill changed
```

---

## 📋 API ENDPOINTS SUMMARY

### STAFF API (Manager Creation)

```
POST   /api/restaurants/:id/staff              Create staff
GET    /api/restaurants/:id/staff              List staff
POST   /api/restaurants/:id/staff/:id/regenerate-pin  Regenerate PIN
PATCH  /api/restaurants/:id/staff/:id/toggle-active   Toggle active
```

### STAFF AUTH API

```
POST   /api/auth/staff-login                   PIN Login
POST   /api/staff/shift/start                  Clock in
POST   /api/staff/shift/end                    Clock out
GET    /api/staff/shift/status                 Get shift status
```

### WAITER API

```
GET    /api/waiter/orders                      All orders
GET    /api/waiter/ready-items                 Items ready to serve
POST   /api/waiter/order/:id/item/:id/serve   Mark item served
```

### CASHIER API

```
GET    /api/cashier/bills                      Pending bills
GET    /api/cashier/bills/:id                  Bill details
POST   /api/cashier/bills/:id/pay             Process payment
POST   /api/cashier/bills/:id/split           Split payment
GET    /api/cashier/summary                    Daily summary
GET    /api/cashier/history                    Payment history
```

### CHEF API

```
GET    /api/kitchen/orders?station=...         Orders by station
POST   /api/kitchen/order/:id/item/:id/status Update item status
```

---

## 🎯 COMPLETE INTEGRATION CHECKLIST

### Backend ✅

- [x] Customer session endpoints (3 new)
- [x] Staff shift endpoints (3 new)
- [x] Waiter endpoints (2 new)
- [x] Cashier endpoints (6 new)
- [x] Socket event handlers for all roles
- [x] Proper room broadcasting
- [x] Real-time status tracking

### Frontend ✅

- [x] Staff shift hook (useStaffShift)
- [x] Waiter orders hook (useWaiterOrders)
- [x] Cashier bills hook (useCashierBills)
- [x] All API definitions
- [x] Socket event listeners
- [x] Real-time UI updates

### Status Tracking ✅

- [x] Chef: Item claimed, ready, served
- [x] Waiter: Items ready, served, alerts
- [x] Cashier: Bills pending, paid, settled
- [x] Manager: Metrics, order status, staff
- [x] All roles: Online/offline status

---

## 🚀 LIVE UPDATE EXAMPLES

### Chef Claims Item (Real-Time)

```
1. Chef sees new order in queue
2. Clicks "Claim" → socket.emit("kitchen:claim-item")
3. Backend updates: item.itemStatus = "IN_PROGRESS"
4. Socket broadcast: "order:item-claimed" to kitchen room
5. All other chefs see item is no longer available
6. Real-time without page refresh!
```

### Waiter Gets Ready Alert

```
1. Chef marks item ready → socket.emit("kitchen:mark-ready")
2. Item status: "IN_PROGRESS" → "READY"
3. Socket broadcast: "waiter:item-ready-alert" to waiter room
4. Waiter phone notifies: "Pick up for Table 5!"
5. Real-time toast notification (< 1 second)
```

### Cashier Settles Bill

```
1. Waiter generates bill
2. Cashier loads bills → GET /api/cashier/bills
3. Clicks "Pay" → POST /api/cashier/bills/:id/pay
4. Bill status: "OPEN" → "PAID"
5. Socket broadcast: "cashier:bill-settled" to restaurant
6. Managers see settled bill in dashboard
7. Session closes automatically
```

### Manager Sees Live Metrics

```
1. Manager opens dashboard
2. Socket connected to manager room
3. Any staff action updates room
4. socket.on("dashboard:metrics-updated")
5. Dashboard updates in real-time
6. No polling needed!
```

---

## ✨ KEY IMPROVEMENTS MADE

### Before

- ❌ Staff shift not tracked
- ❌ Cashier role incomplete
- ❌ Waiter couldn't view orders
- ❌ No ready item notifications
- ❌ Manager dashboard static

### After

- ✅ Staff shift fully tracked (start/end/status)
- ✅ Complete cashier management system
- ✅ Waiter can view & filter orders
- ✅ Real-time ready item alerts
- ✅ Live manager dashboard with metrics
- ✅ All roles have real-time socket events
- ✅ Complete role isolation & permissions
- ✅ Full audit trail (shift in/out, bill payments)

---

## 🔒 SECURITY FEATURES

### Role-Based Access Control

```javascript
requireRole("CHEF"); // Only CHEF access
requireRole("WAITER", "MANAGER"); // Multiple roles
requireSessionAuth; // Customer session only
```

### Staff PIN Security

- PIN hashed with bcryptjs before storage
- Rate limiting: 5 attempts → 15-min block
- Unique PIN per restaurant per role

### Token Security

- JWT tokens: 15 minutes (short-lived)
- Refresh tokens: 30 days (long-lived)
- HTTPOnly cookies prevent XSS
- CORS properly configured

### Data Isolation

- Staff can only see their restaurant
- Managers only see their staff
- Customers only see their session
- Brand Admin sees all restaurants

---

## 📈 SCALABILITY

### Real-Time Scaling

- Socket.io rooms per restaurant
- Per-station kitchen queues
- No global broadcasts
- Efficient filtering

### Database

- Indexed queries by restaurantId
- Lean queries for listing
- Transaction support for critical operations
- Audit logging for compliance

---

## 🎓 CONCLUSION

All 6 roles are now **fully integrated** with:

- ✅ Complete authentication flows
- ✅ Role-specific API endpoints
- ✅ Real-time socket events
- ✅ Live UI updates without polling
- ✅ Proper access control
- ✅ Comprehensive activity tracking
- ✅ Production-ready security

**System is ready for deployment!** 🚀
