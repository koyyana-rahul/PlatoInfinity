# Dashboard Backend-Frontend Integration Guide

## ✅ Complete Integration Status

All dashboard features are now properly integrated with the backend using Axios. No dummy data is being used.

---

## 📋 Architecture Overview

### Frontend Layer

- **Location**: `client/src/modules/admin/`
- **Service Layer**: `client/src/api/dashboard.service.js`
- **Hooks**: Located in `client/src/modules/admin/hooks/`
- **Components**: Located in `client/src/modules/admin/components/`

### Backend Layer

- **Controllers**: `server/controller/dashboard.controller.js` & `dashboard.extended.js`
- **Routes**: `server/route/dashboard.route.js`
- **Database**: MongoDB with models (Bill, Order, Session, Table, User, etc.)

---

## 🔄 Data Flow

```
React Component
    ↓
Custom Hook (useKPIMetrics, usePerformanceMetrics, etc.)
    ↓
Dashboard Service (dashboardService)
    ↓
Axios Instance (with interceptors & auth)
    ↓
Backend Route (requireAuth, requireRole)
    ↓
Controller (kpiMetricsController, performanceMetricsController, etc.)
    ↓
Database Query (MongoDB)
    ↓
Response → Hook State → Component Render
```

---

## 🎯 Implemented Endpoints

### 1. **KPI Metrics** - Revenue, Orders, Performance

- **Route**: `GET /api/dashboard/kpi`
- **Params**: `range` (today/week/month), `restaurantId` (optional)
- **Controller**: `kpiMetricsController()`
- **Frontend Hook**: `useKPIMetrics(timeRange, restaurantId)`
- **Service Method**: `dashboardService.getKPIMetrics()`
- **Returns**:
  ```javascript
  {
    totalSales: number,
    revenueTrend: percentage,
    ordersToday: number,
    ordersTrend: percentage,
    averageOrderValue: number,
    avgTrend: percentage,
    completionRate: percentage,
    completionTrend: percentage,
    activeTables: number,
    activeUsers: number
  }
  ```

### 2. **Performance Metrics** - Top Staff

- **Route**: `GET /api/dashboard/performance`
- **Params**: `restaurantId` (optional)
- **Controller**: `performanceMetricsController()`
- **Frontend Hook**: `usePerformanceMetrics(restaurantId)`
- **Service Method**: `dashboardService.getPerformanceMetrics()`
- **Returns**: Array of staff with metrics

### 3. **Operational Metrics** - Prep Time, Delivery, Satisfaction

- **Route**: `GET /api/dashboard/operational`
- **Params**: `range` (today/week/month), `restaurantId` (optional)
- **Controller**: `operationalMetricsController()`
- **Frontend Hook**: `useOperationalMetrics(timeRange, restaurantId)`
- **Service Method**: `dashboardService.getOperationalMetrics()`
- **Returns**:
  ```javascript
  {
    avgPreparationTime: string,
    avgDeliveryTime: string,
    customerSatisfaction: string,
    foodWastePercentage: string
  }
  ```

### 4. **Revenue Breakdown** - By Category, Payment Method

- **Route**: `GET /api/dashboard/revenue-breakdown`
- **Params**: `range` (today/week/month), `restaurantId` (optional)
- **Controller**: `revenueBreakdownController()`
- **Frontend Hook**: `useRevenueBreakdown(timeRange, restaurantId)`
- **Service Method**: `dashboardService.getRevenueBreakdown()`
- **Returns**: Array of revenue breakdown items with amounts and percentages

### 5. **Dashboard Summary** - Quick Stats

- **Route**: `GET /api/dashboard/summary`
- **Params**: `restaurantId` (optional)
- **Controller**: `dashboardSummaryController()`
- **Frontend Hook**: Used in `useDashboardStats()`
- **Service Method**: `dashboardService.getDashboardSummary()`
- **Returns**: Today's sales, orders, tables, sessions, kitchen pending items

### 6. **Recent Orders** - Real-time Order Tracking

- **Route**: `GET /api/order/recent`
- **Params**: `limit`, `range`, `restaurantId`
- **Controller**: From order.controller
- **Frontend Hook**: `useRecentOrders(timeRange, restaurantId)`
- **Service Method**: `dashboardService.getRecentOrders()`
- **Returns**: Array of recent orders with full details

### 7. **Branches/Restaurants** - Multi-Location Support

- **Route**: `GET /api/restaurants`
- **Controller**: From restaurant.controller
- **Frontend Hook**: `useBranches()`
- **Service Method**: `dashboardService.getBranches()`
- **Returns**: Array of all restaurants/branches

---

## 🔌 Frontend Hooks

### Common Hook Pattern

All hooks follow the same pattern:

```javascript
const { data, loading, error, refetch } = useHookName(params);
```

### Available Hooks

1. **useKPIMetrics(timeRange, restaurantId)**
   - Auto-refreshes every 30 seconds
   - Returns: { metrics, loading, error, refetch }

2. **usePerformanceMetrics(restaurantId)**
   - Auto-refreshes every 60 seconds
   - Returns: { topStaff, loading, error, refetch }

3. **useOperationalMetrics(timeRange, restaurantId)**
   - Auto-refreshes every 60 seconds
   - Returns: { operationalData, loading, error, refetch }

4. **useRevenueBreakdown(timeRange, restaurantId)**
   - Auto-refreshes every 60 seconds
   - Returns: { breakdown, loading, error, refetch }

5. **useDashboardStats(timeRange)**
   - Auto-refreshes every 30 seconds
   - Returns: { stats, loading, error, setStats, refetch }

6. **useRecentOrders(timeRange, restaurantId)**
   - Socket integrated for real-time updates
   - Returns: { recentOrders, loading, error, setRecentOrders, addRecentOrder, refetch }

7. **useBranches()**
   - Fetches once on mount
   - Returns: { branches, loading, error }

---

## 🔐 Authentication & Authorization

### Axios Interceptors

Located in `client/src/api/axios.interceptor.js`:

- **Request Interceptor**: Adds auth token to headers
- **Response Interceptor**: Handles token refresh on 401 errors
- **Credentials**: Enabled for cookie-based auth

### Backend Middleware

- **requireAuth**: Checks for valid JWT token
- **requireRole**: Checks user role (ADMIN, MANAGER, OWNER, etc.)

### Request Flow

```
Frontend Request
    ↓
Axios Request Interceptor (adds Authorization header)
    ↓
Backend Route Middleware (requireAuth)
    ↓
Role Check Middleware (requireRole)
    ↓
Controller executes
    ↓
Response with data
    ↓
Axios Response Interceptor (handles errors/token refresh)
```

---

## 📊 Real-Time Updates

### Socket.IO Integration

The `AdminDashboard` component uses Socket.IO via `useSocket()` hook:

- **Real-time order tracking**: New orders appear instantly
- **Live notifications**: Kitchen alerts, order status changes
- **Stock updates**: Menu item availability changes

### Auto-Polling

When Socket.IO isn't available or for certain metrics:

- **KPI Metrics**: 30-second intervals
- **Performance Metrics**: 60-second intervals
- **Operational Metrics**: 60-second intervals
- **Revenue Breakdown**: 60-second intervals
- **Dashboard Stats**: 30-second intervals

---

## 🛠️ Error Handling

### Frontend Error Handling

```javascript
const { error } = useKPIMetrics();

if (error) {
  // Show error message to user
  return <ErrorAlert message={error} />;
}
```

### Backend Error Responses

All controllers return standardized error format:

```javascript
{
  success: false,
  error: true,
  message: "Error description",
  status: 400 or 500
}
```

---

## 📝 Database Queries

### MongoDB Collections Used

1. **Bill** - Payment records
   - Fields: `restaurantId`, `status`, `total`, `createdAt`

2. **Order** - Orders placed
   - Fields: `restaurantId`, `orderStatus`, `totalAmount`, `items`, `createdAt`

3. **Session** - Active table sessions
   - Fields: `restaurantId`, `status`

4. **Table** - Restaurant tables
   - Fields: `restaurantId`, `status` (OCCUPIED/FREE)

5. **User** - Staff members
   - Fields: `restaurantId`, `role`, `name`, performance metrics

---

## ✨ Key Features Implemented

### ✅ No Dummy Data

- All data is fetched from MongoDB
- Real calculations based on actual data

### ✅ Multi-Restaurant Support

- Filter by `restaurantId` parameter
- Supports chain restaurants

### ✅ Time Range Filtering

- `today` - Current day
- `week` - Current week
- `month` - Current month
- Automatic date range calculation

### ✅ Real-Time Updates

- Socket.IO for instant updates
- Auto-polling for fallback
- Configurable refresh intervals

### ✅ Performance Optimized

- Parallel database queries (Promise.all)
- Lean queries (no unnecessary fields)
- Caching in component state
- Interval cleanup on unmount

### ✅ Error Handling

- Try-catch blocks in all controllers
- User-friendly error messages
- Detailed console logging for debugging

---

## 🚀 Usage Examples

### In React Components

```jsx
import { useKPIMetrics } from "./hooks";

export function Dashboard() {
  const { metrics, loading, error } = useKPIMetrics("today", restaurantId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div>
      <p>Total Sales: ${metrics.totalSales}</p>
      <p>Orders Today: {metrics.ordersToday}</p>
      <p>Trend: {metrics.revenueTrend}%</p>
    </div>
  );
}
```

### Refreshing Data

```jsx
const { metrics, refetch } = useKPIMetrics();

const handleRefresh = async () => {
  await refetch();
  // Data updated in state
};

<button onClick={handleRefresh}>Refresh</button>;
```

### Filtering by Restaurant

```jsx
const { metrics } = useKPIMetrics("week", restaurantId);
// Only data for that specific restaurant
```

---

## 🔍 Debugging Tips

### Console Logging

All hooks and service methods log to console:

- ✅ Success: `console.log('✅ Success message')`
- ❌ Error: `console.error('❌ Error message')`

### Network Tab

Monitor Network tab in browser DevTools:

1. Check requests to `/api/dashboard/*`
2. Verify status codes (200 = success)
3. Check response payloads match expected format

### Redux DevTools

If using Redux:

1. Monitor state changes from hooks
2. Check if data is properly stored

---

## 📚 File Structure

```
client/
├── src/
│   ├── api/
│   │   ├── dashboard.service.js     ← Service layer (main integration)
│   │   ├── axios.js                  ← Axios instance
│   │   └── axios.interceptor.js       ← Auth interceptors
│   └── modules/admin/
│       ├── AdminDashboard.jsx         ← Main component
│       ├── hooks/
│       │   ├── useKPIMetrics.js
│       │   ├── usePerformanceMetrics.js
│       │   ├── useOperationalMetrics.js
│       │   ├── useRevenueBreakdown.js
│       │   ├── useDashboardStats.js
│       │   ├── useRecentOrders.js
│       │   ├── useBranches.js
│       │   └── index.js
│       └── components/
│           ├── KPIDashboard.jsx
│           ├── PerformanceMetrics.jsx
│           ├── OperationalMetrics.jsx
│           ├── RevenueBreakdown.jsx
│           └── ...

server/
├── controller/
│   ├── dashboard.controller.js       ← Main controllers
│   └── dashboard.extended.js         ← Extended metrics
├── route/
│   └── dashboard.route.js            ← API routes
├── models/
│   ├── bill.model.js
│   ├── order.model.js
│   ├── session.model.js
│   ├── table.model.js
│   └── user.model.js
└── middleware/
    ├── requireAuth.js
    └── requireRole.js
```

---

## 🎯 Next Steps / Enhancements

1. **Export Reports** - Add PDF/Excel export functionality
2. **Advanced Filters** - More time ranges, category filters
3. **Caching** - Redis cache for expensive queries
4. **WebSocket Optimization** - Selective data broadcasting
5. **Analytics** - Track which metrics are viewed most
6. **Mobile Responsiveness** - Optimize for tablet/mobile

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: Data not loading

- ✅ Check Network tab for API calls
- ✅ Verify user is authenticated
- ✅ Check user role permissions
- ✅ Check MongoDB connection

**Issue**: Stale data

- ✅ Click refresh button or wait for auto-poll
- ✅ Check console for errors
- ✅ Verify time range selection

**Issue**: 403 Forbidden errors

- ✅ Check user role matches endpoint requirements
- ✅ Verify token is not expired
- ✅ Check `requireRole` middleware settings

---

**Last Updated**: January 23, 2026
**Status**: ✅ Production Ready
