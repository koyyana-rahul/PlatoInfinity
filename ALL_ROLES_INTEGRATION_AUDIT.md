# COMPLETE ROLES & INTEGRATION AUDIT

## 📋 SYSTEM ROLES OVERVIEW

### 1. **CUSTOMER** (Guest - Pin-Based Session)

- **Auth**: PIN verification (4 digits) + Session Token
- **Access**: QR code table entry, menu browsing, cart operations, order placement
- **Real-time**: Order status updates, bill notifications

### 2. **CHEF** (Kitchen Staff - Pin-Based)

- **Auth**: Staff PIN + JWT Token
- **Access**: Kitchen display, item claiming, status updates (IN_PROGRESS → READY)
- **Real-time**: New order notifications, waiter serve confirmations

### 3. **WAITER** (Floor Staff - Pin-Based)

- **Auth**: Staff PIN + JWT Token
- **Access**: Order generation, item serving, bill payment, table management
- **Real-time**: New orders, item ready notifications, bill confirmations

### 4. **CASHIER** (Finance Staff - Pin-Based)

- **Auth**: Staff PIN + JWT Token
- **Access**: Bill management, payment processing, cash/card settlements
- **Real-time**: Bill updates, payment confirmations

### 5. **MANAGER** (Restaurant Manager - Email-Based)

- **Auth**: Email + Password + JWT Token
- **Access**: Staff management, dashboard, reports, settings
- **Real-time**: Business metrics, order analytics, staff performance

### 6. **BRAND_ADMIN** (Business Owner - Email-Based)

- **Auth**: Email + Password + JWT Token
- **Access**: Multi-restaurant management, manager invites, system configuration
- **Real-time**: Cross-restaurant analytics, expansion dashboards

---

## 🔄 INTEGRATION AUDIT BY ROLE

### ✅ CUSTOMER FLOW (COMPLETE)

```
QR Code → PIN Entry (session.verifyPin)
    ↓
Session Token Generated (x-customer-session header)
    ↓
Socket Connection (join:customer event)
    ↓
Browse Menu → Add to Cart → Place Order
    ↓
Socket Events: order:placed, order:item-status, order:ready
    ↓
View Bill → Bill Payment
```

**Status**: ✅ WORKING - All endpoints functional

- `POST /api/sessions/join` → sessionApi.joinWithPin
- `POST /api/sessions/resume` → sessionApi.resumeSession
- `POST /sessions/check-token` → sessionApi.checkTokenExpiry
- `GET /sessions/:id/status` → sessionApi.getSessionStatus
- Socket: `join:customer` ✅

---

### 🟡 CHEF FLOW (PARTIALLY WORKING)

```
QR Code + PIN → staffLoginController
    ↓
JWT Token Generated (access_token + refresh_token)
    ↓
Socket Connection (auto-join kitchen rooms)
    ↓
Load Kitchen Orders → Claim Item → Mark IN_PROGRESS
    ↓
Mark READY → Socket broadcast to waiter + customer
    ↓
View Completed Items
```

**Issues Found**:

1. ⚠️ `startShift` endpoint **MISSING** - Chef doesn't start shift/clock in
2. ⚠️ Kitchen socket events fire but NO REAL-TIME confirmation to kitchen room
3. ⚠️ No kitchen station queue management (multiple chefs at same station)
4. ⚠️ No kitchen activity logging

**Missing Endpoints**:

- `POST /api/staff/shift/start` → NOT IMPLEMENTED
- Need controller: `startStaffShiftController`

**Missing Socket Events**:

- `kitchen:chef-online` → Chef joins kitchen room
- `kitchen:queue-updated` → Update kitchen queue display
- `kitchen:chef-status` → Chef status changes

---

### 🟡 WAITER FLOW (PARTIALLY WORKING)

```
QR Code + PIN → staffLoginController
    ↓
JWT Token Generated
    ↓
Socket Connection (auto-join waiter rooms)
    ↓
View Orders Ready for Serving
    ↓
Serve Item → Mark SERVED
    ↓
Generate Bill → Process Payment
```

**Issues Found**:

1. ⚠️ `startShift` endpoint **MISSING**
2. ⚠️ No "orders ready" socket notification to waiter
3. ⚠️ Waiter socket events incomplete (only `waiter:serve-item` exists)
4. ⚠️ No waiter activity/performance tracking

**Missing Endpoints**:

- `POST /api/staff/shift/start` → NOT IMPLEMENTED
- `GET /api/waiter/orders` → List orders for waiter
- `GET /api/waiter/ready-items` → Items ready to serve

**Missing Socket Events**:

- `waiter:item-ready` → Notify waiter items are ready
- `waiter:table-alert` → Customer needs waiter attention
- `waiter:online-status` → Waiter status changes

---

### 🟡 CASHIER FLOW (PARTIALLY WORKING)

```
QR Code + PIN → staffLoginController
    ↓
JWT Token Generated
    ↓
View Pending Bills
    ↓
Process Payment (Cash/Card/Split)
    ↓
Mark Paid → Settle Bill
```

**Issues Found**:

1. ⚠️ `startShift` endpoint **MISSING**
2. ⚠️ No dedicated cashier socket events
3. ⚠️ No real-time bill settlement confirmation
4. ⚠️ No cashier dashboard/summary
5. ⚠️ No payment method tracking

**Missing Endpoints**:

- `POST /api/staff/shift/start` → NOT IMPLEMENTED
- `GET /api/cashier/bills` → List bills for cashier
- `GET /api/cashier/summary` → Daily cashier summary
- Socket events for payment confirmations

**Missing Routes**:

- No `/api/cashier/*` routes defined
- Cashier uses general bill routes (not role-specific)

---

### 🟡 MANAGER FLOW (MOSTLY WORKING)

```
Email + Password → authController.loginController
    ↓
JWT Token Generated + Refresh Token
    ↓
Socket Connection (auto-join manager rooms)
    ↓
Dashboard: Overview, Orders, Revenue, Staff Performance
    ↓
Management: Create Staff, Manage Menus, Settings
```

**Issues Found**:

1. ⚠️ No real-time dashboard socket events
2. ⚠️ Manager updates don't broadcast to other managers
3. ⚠️ No live order metrics (order/min, avg table time, etc.)
4. ⚠️ No staff performance tracking in real-time

**Missing Socket Events**:

- `manager:dashboard-update` → Real-time KPI updates
- `manager:order-metrics` → Live order statistics
- `manager:staff-activity` → Staff performance streams
- `manager:table-status` → Table occupancy changes

---

### 🟡 BRAND_ADMIN FLOW (MOSTLY WORKING)

```
Email + Password → authController.loginController
    ↓
JWT Token Generated
    ↓
Socket Connection (multi-restaurant rooms)
    ↓
Multi-Restaurant Dashboard
    ↓
Invite Managers, View Cross-Restaurant Analytics
```

**Issues Found**:

1. ⚠️ No cross-restaurant socket broadcasting
2. ⚠️ No real-time multi-restaurant dashboard updates
3. ⚠️ No brand-level KPI tracking

---

## 🎯 CRITICAL MISSING INTEGRATIONS

### 1. **Staff Shift Management** (BLOCKING)

- `startStaffShiftController` - NOT IMPLEMENTED
- Must be added to: `session.controller.js` or new `shift.controller.js`
- Needed for: CHEF, WAITER, CASHIER accountability

### 2. **Cashier Role API** (BLOCKING)

- Missing `/api/cashier/*` routes
- Missing cashier-specific controllers
- Waiter & Manager can process bills, but no cashier isolation

### 3. **Kitchen Station Management** (HIGH PRIORITY)

- Multiple chefs can't coordinate at same station
- No queue management in socket events
- Station assignment incomplete

### 4. **Real-Time Dashboards** (HIGH PRIORITY)

- Manager dashboard is static (polls only)
- No socket broadcasts for metrics
- Staff can't see live activity

### 5. **Waiter Order Notifications** (MEDIUM PRIORITY)

- Waiter doesn't get notified when items are ready
- Must add socket event broadcast
- Frontend hook incomplete

### 6. **Activity & Performance Tracking** (MEDIUM PRIORITY)

- No audit logging for staff actions
- No performance metrics calculation
- No shift duration tracking

---

## 📊 INTEGRATION MATRIX

| Role        | Auth | Routes | Controllers | Socket Events | Frontend Hooks | Real-Time |
| ----------- | ---- | ------ | ----------- | ------------- | -------------- | --------- |
| Customer    | ✅   | ✅     | ✅          | ✅            | ✅             | ✅        |
| Chef        | ✅   | ✅     | ⚠️          | ⚠️            | ✅             | ⚠️        |
| Waiter      | ✅   | ⚠️     | ⚠️          | ⚠️            | ⚠️             | ⚠️        |
| Cashier     | ✅   | ❌     | ❌          | ❌            | ❌             | ❌        |
| Manager     | ✅   | ✅     | ✅          | ⚠️            | ✅             | ⚠️        |
| Brand Admin | ✅   | ✅     | ✅          | ⚠️            | ✅             | ⚠️        |

---

## 🛠️ REQUIRED FIXES

### TIER 1 - CRITICAL (Must Fix)

1. **Implement `startStaffShiftController`** → All staff roles need shift tracking
2. **Create Cashier API routes** → `/api/cashier/bills`, `/api/cashier/summary`
3. **Add Waiter order endpoints** → `/api/waiter/orders`, `/api/waiter/ready-items`

### TIER 2 - HIGH PRIORITY

4. **Enable shift tracking socket events** → Real-time staff presence
5. **Add kitchen station broadcasts** → Queue management & coordination
6. **Add waiter ready notifications** → Item ready → waiter socket event
7. **Add manager dashboard socket events** → Real-time KPI updates

### TIER 3 - MEDIUM PRIORITY

8. **Activity logging** → Audit trail for all staff actions
9. **Performance metrics** → Service time, order accuracy tracking
10. **Cashier settlement workflows** → Payment reconciliation

---

## 📝 NEXT STEPS

1. ✅ Create shift management endpoints
2. ✅ Create cashier role API
3. ✅ Add missing socket event broadcasters
4. ✅ Create real-time hooks for each role
5. ✅ Test complete end-to-end flows with live updates
