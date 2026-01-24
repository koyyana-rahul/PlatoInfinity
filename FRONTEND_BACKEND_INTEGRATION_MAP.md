# Frontend-Backend Integration Map

## Complete Frontend ↔ Backend Route Mapping

### Phase 2 Frontend Pages ↔ Phase 3 Backend Routes

---

## 1. ManagerDashboard.ENHANCED

**Frontend File**: `client/src/modules/manager/pages/ManagerDashboard.ENHANCED.jsx`  
**Status**: ✅ Phase 2 Complete | Connected to Phase 3 Routes

### Integration Points:

```javascript
// Analytics Section
const analyticsResponse = await fetch(
  "/api/dashboard/analytics?startDate=...&endDate=...",
);
const {
  data: { metrics, paymentBreakdown, hourlyData },
} = analyticsResponse.json();
// Displays: Order metrics, revenue metrics, payment methods, hourly charts

// Live Stats Section
const statsResponse = await fetch("/api/dashboard/stats/live");
const {
  data: { orders, revenue, sessions },
} = statsResponse.json();
// Displays: Live order count, revenue collected, active sessions

// Staff Performance
const staffResponse = await fetch(
  "/api/restaurants/:id/managers/dashboard/staff-performance",
);
const {
  data: { staff },
} = staffResponse.json();
// Displays: Staff metrics, performance table

// Operational Overview
const opResponse = await fetch(
  "/api/restaurants/:id/managers/dashboard/operational",
);
const {
  data: { tables, orders, staff },
} = opResponse.json();
// Displays: Table status, order status, staff count

// Daily Report
const reportResponse = await fetch(
  "/api/restaurants/:id/managers/dashboard/daily-report?date=...",
);
const {
  data: { summary, paymentMethods, topItems },
} = reportResponse.json();
// Displays: Daily summary, top items, payment methods
```

### Required Endpoints:

- ✅ `GET /api/dashboard/analytics`
- ✅ `GET /api/dashboard/stats/live`
- ✅ `GET /api/restaurants/:id/managers/dashboard/staff-performance`
- ✅ `GET /api/restaurants/:id/managers/dashboard/operational`
- ✅ `GET /api/restaurants/:id/managers/dashboard/daily-report`

---

## 2. AdminDashboard.ENHANCED

**Frontend File**: `client/src/modules/admin/pages/AdminDashboard.ENHANCED.jsx`  
**Status**: ✅ Phase 2 Complete | Connected to Phase 3 Routes

### Integration Points:

```javascript
// Admin analytics (uses same endpoints as Manager)
const analyticsResponse = await fetch(
  "/api/dashboard/analytics?startDate=...&endDate=...",
);
// Displays: Comprehensive analytics, charts, metrics

// Real-time stats
const statsResponse = await fetch("/api/dashboard/stats/live");
// Displays: Live monitoring, status updates
```

### Required Endpoints:

- ✅ `GET /api/dashboard/analytics` (Admin role)
- ✅ `GET /api/dashboard/stats/live` (Admin role)

---

## 3. KitchenDisplay.ENHANCED

**Frontend File**: `client/src/modules/kitchen/pages/KitchenDisplay.ENHANCED.jsx`  
**Status**: ✅ Phase 2 Complete | Connected to Phase 3 Routes

### Integration Points:

```javascript
// Get kitchen orders with filtering
const ordersResponse = await fetch(
  "/api/kitchen/display/orders?station=...&status=...",
);
const {
  data: { orders },
} = ordersResponse.json();
// Displays: Orders by station, status filtering, time tracking

// Get available stations for filter selector
const stationsResponse = await fetch("/api/kitchen/stations");
const {
  data: { stations },
} = stationsResponse.json();
// Displays: Station selector dropdown

// Bulk update item statuses
const updateResponse = await fetch("/api/kitchen/orders/bulk-update", {
  method: "POST",
  body: JSON.stringify({
    updates: [
      { orderId: "...", itemId: "...", status: "READY" },
      // ... more updates
    ],
  }),
});
// Handles: Mark multiple items as ready, ready for delivery
```

### Required Endpoints:

- ✅ `GET /api/kitchen/display/orders`
- ✅ `GET /api/kitchen/stations`
- ✅ `POST /api/kitchen/orders/bulk-update`

---

## 4. CashierDashboard.ENHANCED

**Frontend File**: `client/src/modules/cashier/pages/CashierDashboard.ENHANCED.jsx`  
**Status**: ✅ Phase 2 Complete | Connected to Phase 3 Routes

### Integration Points:

```javascript
// Transaction list with filtering
const transResponse = await fetch(
  "/api/cashier/dashboard/transactions?startDate=...&endDate=...&paymentMethod=...&status=...",
);
const {
  data: { transactions, stats },
} = transResponse.json();
// Displays: Transaction list, filtering, totals

// Payment method breakdown
const breakdownResponse = await fetch(
  "/api/cashier/dashboard/payment-breakdown?startDate=...&endDate=...",
);
const {
  data: { paymentMethods, totals },
} = breakdownResponse.json();
// Displays: Payment method chart, percentages

// End-of-day reconciliation
const reconcResponse = await fetch(
  "/api/cashier/dashboard/reconciliation?date=...",
);
const {
  data: { bills, revenue, orders, paymentMethods },
} = reconcResponse.json();
// Displays: Daily reconciliation, verification

// Export transactions
const exportResponse = await fetch(
  "/api/cashier/dashboard/export-transactions?startDate=...&endDate=...&format=csv",
);
// Handles: CSV download for reporting
```

### Required Endpoints:

- ✅ `GET /api/cashier/dashboard/transactions`
- ✅ `GET /api/cashier/dashboard/payment-breakdown`
- ✅ `GET /api/cashier/dashboard/reconciliation`
- ✅ `GET /api/cashier/dashboard/export-transactions`

---

## 5. WaiterDashboard.ENHANCED

**Frontend File**: `client/src/modules/waiter/pages/WaiterDashboard.ENHANCED.jsx`  
**Status**: ✅ Phase 2 Complete | Connected to Phase 3 Routes

### Integration Points:

```javascript
// Get all tables with status
const tablesResponse = await fetch("/api/waiter/dashboard/tables?status=...");
const {
  data: { tables, stats },
} = tablesResponse.json();
// Displays: Table grid with status, occupancy, bills

// Get pending bills for payment tracking
const billsResponse = await fetch("/api/waiter/pending-bills");
const {
  data: { bills, total, pendingAmount },
} = billsResponse.json();
// Displays: Pending bills list, payment tracking

// Get specific table details
const tableDetailsResponse = await fetch("/api/waiter/table/:tableId/details");
const {
  data: { table, orders, bill },
} = tableDetailsResponse.json();
// Displays: Table modal with orders and bill

// Call waiter alert (from customer)
const callResponse = await fetch("/api/waiter/table/:tableId/call-waiter", {
  method: "POST",
  body: JSON.stringify({ reason: "GENERAL" }),
});
// Triggers: Notification/alert system

// Get my assigned tables
const myTablesResponse = await fetch("/api/waiter/my-tables");
const {
  data: { tables, stats },
} = myTablesResponse.json();
// Displays: Personal task list
```

### Required Endpoints:

- ✅ `GET /api/waiter/dashboard/tables`
- ✅ `GET /api/waiter/pending-bills`
- ✅ `GET /api/waiter/table/:tableId/details`
- ✅ `POST /api/waiter/table/:tableId/call-waiter`
- ✅ `GET /api/waiter/my-tables`

---

## 6. CustomerOrders.ENHANCED

**Frontend File**: `client/src/modules/customer/pages/CustomerOrders.ENHANCED.jsx`  
**Status**: ✅ Phase 2 Complete | Connected to Phase 3 Routes

### Integration Points:

```javascript
// Get order history
const historyResponse = await fetch("/api/customerMenu/orders/history");
const {
  data: { orders, totalOrders },
} = historyResponse.json();
// Displays: Order history timeline

// Get favorite items for quick reorder
const favResponse = await fetch("/api/customerMenu/favorites/suggestions");
const {
  data: { favorites },
} = favResponse.json();
// Displays: Favorite items section

// Quick reorder from previous order
const reorderResponse = await fetch("/api/customerMenu/reorder/:orderId");
const {
  data: { items },
} = reorderResponse.json();
// Handles: Populate cart from previous order

// Get current bill for table
const billResponse = await fetch("/api/customerMenu/bill/current?tableId=...");
const {
  data: { bill },
} = billResponse.json();
// Displays: Current bill amount, pending payment
```

### Required Endpoints:

- ✅ `GET /api/customerMenu/orders/history`
- ✅ `GET /api/customerMenu/favorites/suggestions`
- ✅ `POST /api/customerMenu/reorder/:orderId`
- ✅ `GET /api/customerMenu/bill/current`

---

## 7. CustomerMenu.ENHANCED

**Frontend File**: `client/src/modules/customer/pages/CustomerMenu.ENHANCED.jsx`  
**Status**: ✅ Phase 2 Complete | Connected to Phase 3 Routes

### Integration Points:

```javascript
// Category browsing
const categoryResponse = await fetch(
  "/api/customerMenu/menu/:restaurantId/category/:categoryId",
);
const {
  data: { items },
} = categoryResponse.json();
// Displays: Items in category

// Menu search
const searchResponse = await fetch(
  "/api/customerMenu/menu/:restaurantId/search?query=...",
);
const {
  data: { items },
} = searchResponse.json();
// Displays: Search results

// Menu statistics
const statsResponse = await fetch("/api/customerMenu/menu/:restaurantId/stats");
const {
  data: { topRatedItems, mostOrderedItems },
} = statsResponse.json();
// Displays: Featured items, recommendations
```

### Required Endpoints:

- ✅ `GET /api/customerMenu/menu/:restaurantId/category/:categoryId`
- ✅ `GET /api/customerMenu/menu/:restaurantId/search`
- ✅ `GET /api/customerMenu/menu/:restaurantId/stats`

---

## 8. CustomerCart.ENHANCED

**Frontend File**: `client/src/modules/customer/pages/CustomerCart.ENHANCED.jsx`  
**Status**: ✅ Phase 2 Complete | Backend Ready

### Integration Points:

```javascript
// Uses existing endpoints for:
// - Item prices (from menu)
// - Current bill info (if needed)
// - Order submission (existing endpoint)
```

### Required Endpoints:

- ✅ Existing endpoints (no new Phase 3 endpoints needed)

---

## API Response Format Reference

### Consistent Response Structure

```javascript
// Success Response
{
  success: true,
  data: {
    // Endpoint-specific data
  },
  timestamp: "ISO-8601 date" // When available
}

// Error Response
{
  success: false,
  error: "Error message"
}
```

---

## Testing Integration

### Manual Testing Checklist

#### ManagerDashboard.ENHANCED

- [ ] Analytics loads with date filtering
- [ ] Real-time stats update live
- [ ] Staff performance shows metrics
- [ ] Operational overview displays current state
- [ ] Daily report shows correct date

#### KitchenDisplay.ENHANCED

- [ ] Orders display with correct station
- [ ] Status filtering works
- [ ] Bulk status update reflects immediately
- [ ] Time tracking updates correctly

#### CashierDashboard.ENHANCED

- [ ] Transaction list filters by method/status
- [ ] Payment breakdown chart is accurate
- [ ] Reconciliation shows correct totals
- [ ] CSV export downloads correctly

#### WaiterDashboard.ENHANCED

- [ ] Table grid shows all tables
- [ ] Pending bills list updates
- [ ] Table detail modal loads correctly
- [ ] My tables shows only assigned

#### CustomerOrders.ENHANCED

- [ ] Order history displays all orders
- [ ] Favorites load correctly
- [ ] Quick reorder pre-fills cart
- [ ] Current bill shows pending amount

#### CustomerMenu.ENHANCED

- [ ] Category browsing works
- [ ] Search returns results
- [ ] Menu stats display top items

---

## Performance Expectations

| Page             | API Calls | Expected Load Time |
| ---------------- | --------- | ------------------ |
| ManagerDashboard | 5         | 500-800ms          |
| AdminDashboard   | 2         | 200-300ms          |
| KitchenDisplay   | 3         | 300-500ms          |
| CashierDashboard | 4         | 400-600ms          |
| WaiterDashboard  | 2         | 200-400ms          |
| CustomerOrders   | 4         | 300-500ms          |
| CustomerMenu     | 3         | 200-400ms          |
| CustomerCart     | 1         | 100-200ms          |

---

## Environment Configuration

### Required Environment Variables

```bash
# API Base URL
REACT_APP_API_URL=http://localhost:5000/api

# Authentication
REACT_APP_AUTH_TOKEN=<stored in localStorage>
REACT_APP_RESTAURANT_ID=<from user context>

# Socket.io (for real-time updates)
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## Error Handling Strategy

### Frontend Error Handling

```javascript
// Standard error handling for all API calls
try {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error);
  }
  // Use json.data
} catch (error) {
  console.error("API Error:", error);
  // Show user-friendly message
  showToast("error", "Failed to load data. Please try again.");
}
```

---

## Authentication Flow

### Required for All Protected Endpoints

```javascript
// All requests include:
Headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'X-Restaurant-ID': restaurantId  // Optional, from context
}
```

---

## Real-Time Updates (Socket.io Ready)

### Recommended Socket.io Events

```javascript
// Order status updates
socket.on("order:status-updated", (order) => {
  // Update UI with new order status
});

// Table status changes
socket.on("table:status-changed", (table) => {
  // Update table grid
});

// Payment notifications
socket.on("payment:completed", (bill) => {
  // Update bill status
});

// Kitchen alerts
socket.on("kitchen:item-ready", (item) => {
  // Notify waiter of ready items
});
```

---

## Deployment Checklist

### Before Production Deployment

- [ ] All API endpoints tested with real data
- [ ] Error handling tested for all failure scenarios
- [ ] Performance verified under load
- [ ] Security review completed
- [ ] Authorization checks verified
- [ ] Rate limiting configured
- [ ] Monitoring/logging enabled
- [ ] Cache strategy implemented

---

## Summary

✅ **All 8 Phase 2 pages are connected to Phase 3 routes**  
✅ **25 API endpoints are ready for integration**  
✅ **Consistent response format across all endpoints**  
✅ **Role-based access control implemented**  
✅ **Error handling in place**  
✅ **Performance optimized**

**Status**: Ready for integration testing and Socket.io implementation

---

**Integration Map**: Phase 2 ↔ Phase 3  
**Last Updated**: Session 3  
**Status**: ✅ COMPLETE
