# Dashboard Integration - Quick Reference

## 🚀 Quick Start

### Using Dashboard Hooks in Components

```jsx
import { useKPIMetrics, usePerformanceMetrics } from "./hooks";

export function MyDashboard() {
  // Fetch KPI metrics with auto-refresh every 30s
  const { metrics, loading, error, refetch } = useKPIMetrics("today");

  // Fetch staff performance
  const { topStaff, loading: perfLoading } = usePerformanceMetrics();

  return (
    <div>
      {error && <p>Error: {error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Sales: ${metrics.totalSales}</p>
          <p>Orders: {metrics.ordersToday}</p>
          <button onClick={refetch}>Refresh</button>
        </>
      )}
    </div>
  );
}
```

---

## 📡 Available Endpoints

| Endpoint                           | Method | Params                           | Controller                     |
| ---------------------------------- | ------ | -------------------------------- | ------------------------------ |
| `/api/dashboard/kpi`               | GET    | `range`, `restaurantId`          | `kpiMetricsController`         |
| `/api/dashboard/performance`       | GET    | `restaurantId`                   | `performanceMetricsController` |
| `/api/dashboard/operational`       | GET    | `range`, `restaurantId`          | `operationalMetricsController` |
| `/api/dashboard/revenue-breakdown` | GET    | `range`, `restaurantId`          | `revenueBreakdownController`   |
| `/api/dashboard/summary`           | GET    | `restaurantId`                   | `dashboardSummaryController`   |
| `/api/order/recent`                | GET    | `limit`, `range`, `restaurantId` | order.controller               |
| `/api/restaurants`                 | GET    | -                                | restaurant.controller          |

---

## 🎣 Available Hooks

### useKPIMetrics(timeRange, restaurantId)

```javascript
const { metrics, loading, error, refetch } = useKPIMetrics('today', null);

// metrics object:
{
  totalSales: 45000,
  revenueTrend: 12,           // percentage
  ordersToday: 128,
  ordersTrend: 8,
  averageOrderValue: 350,
  avgTrend: 5,
  completionRate: 95,
  completionTrend: 2,
  activeTables: 24,
  activeUsers: 15
}
```

### usePerformanceMetrics(restaurantId)

```javascript
const { topStaff, loading, error, refetch } = usePerformanceMetrics(null);

// topStaff array with staff performance data
```

### useOperationalMetrics(timeRange, restaurantId)

```javascript
const { operationalData, loading, error, refetch } = useOperationalMetrics('today');

// operationalData object:
{
  avgPreparationTime: "18 min",
  avgDeliveryTime: "22 min",
  customerSatisfaction: "4.5/5",
  foodWastePercentage: "3%"
}
```

### useRevenueBreakdown(timeRange, restaurantId)

```javascript
const { breakdown, loading, error, refetch } = useRevenueBreakdown("today");

// breakdown array with revenue by category
```

### useDashboardStats(timeRange)

```javascript
const { stats, loading, error, setStats, refetch } = useDashboardStats("today");

// stats: { totalSales, ordersToday, activeTables, ... }
```

### useRecentOrders(timeRange, restaurantId)

```javascript
const { recentOrders, loading, error, addRecentOrder } =
  useRecentOrders("today");

// recentOrders array with recent orders
// addRecentOrder() adds new order to list (socket integration)
```

### useBranches()

```javascript
const { branches, loading, error } = useBranches();

// branches array with all restaurants
```

---

## 🔄 Data Refresh Intervals

| Hook                  | Interval     | Reason                        |
| --------------------- | ------------ | ----------------------------- |
| useKPIMetrics         | 30s          | High-priority metrics         |
| useDashboardStats     | 30s          | Quick overview                |
| usePerformanceMetrics | 60s          | Staff changes less frequent   |
| useOperationalMetrics | 60s          | Operational data changes less |
| useRevenueBreakdown   | 60s          | Category breakdown stable     |
| useRecentOrders       | Socket + 30s | Real-time via socket          |

---

## 🔐 Role Requirements

All dashboard endpoints require authentication and specific roles:

```
/api/dashboard/kpi              → ADMIN, MANAGER, OWNER
/api/dashboard/performance      → ADMIN, MANAGER, OWNER
/api/dashboard/operational      → ADMIN, MANAGER, OWNER
/api/dashboard/revenue-breakdown → ADMIN, MANAGER, OWNER
/api/dashboard/summary          → MANAGER, OWNER
/api/restaurants               → Authenticated users
```

---

## ❌ Error Handling

### In Hooks

```javascript
const { metrics, error } = useKPIMetrics();

if (error) {
  // error is a string message
  console.log(error); // "Failed to fetch KPI metrics"
}
```

### In Service Methods

```javascript
try {
  const response = await dashboardService.getKPIMetrics("today");
} catch (error) {
  // error.response?.data?.message - backend error message
  // error.message - network error message
}
```

---

## 🎯 Time Range Values

```javascript
// Valid time range values:
"today"; // Current day (00:00 - 23:59)
"week"; // Current week (Mon - Sun)
"month"; // Current month (1st - last day)
```

---

## 🌍 Multi-Restaurant Filtering

```javascript
// Fetch for all restaurants (current user's)
const { metrics } = useKPIMetrics("today", null);

// Fetch for specific restaurant
const { metrics } = useKPIMetrics("today", "restaurantId123");

// In component with branch selector
const [selectedBranch, setSelectedBranch] = useState(null);
const { metrics } = useKPIMetrics("today", selectedBranch);
```

---

## 📝 Database Performance Tips

1. **Use lean queries** - No unnecessary fields
2. **Parallel queries** - Promise.all() for multiple queries
3. **Indexed fields** - restaurantId, createdAt, status
4. **Date filtering** - Use $gte, $lte operators
5. **Counting** - countDocuments() is faster than find()

---

## 🐛 Debugging

### Check API Response

```javascript
// In browser console
const response = await fetch("http://localhost:8080/api/dashboard/kpi");
const data = await response.json();
console.log(data);
```

### Monitor Hooks

```javascript
const { metrics, loading, error } = useKPIMetrics();
console.log({ metrics, loading, error });
```

### Backend Logs

```
📍 Dashboard router middleware hit: GET /api/dashboard/kpi
✅ KPI Metrics Controller: Fetching...
Query results: [...]
Response sent: { success: true, data: {...} }
```

---

## 🔄 Manual Refresh

```jsx
const { metrics, refetch } = useKPIMetrics("today");

// Manual refresh after user action
const handleSave = async () => {
  await saveChanges();
  await refetch(); // Fetch latest data
};

<button onClick={refetch}>Refresh Now</button>;
```

---

## 🎨 Recommended Component Structure

```jsx
// DashboardContainer.jsx
import {
  useKPIMetrics,
  usePerformanceMetrics,
  useRevenueBreakdown,
} from "./hooks";

export function DashboardContainer() {
  const [timeRange, setTimeRange] = useState("today");
  const [selectedBranch, setSelectedBranch] = useState(null);

  const { metrics, loading: kpiLoading } = useKPIMetrics(
    timeRange,
    selectedBranch,
  );
  const { topStaff, loading: perfLoading } =
    usePerformanceMetrics(selectedBranch);
  const { breakdown, loading: revLoading } = useRevenueBreakdown(timeRange);

  return (
    <>
      <Header timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      <BranchSelector onSelect={setSelectedBranch} />

      <KPIDashboard metrics={metrics} loading={kpiLoading} />
      <PerformanceMetrics staff={topStaff} loading={perfLoading} />
      <RevenueBreakdown data={breakdown} loading={revLoading} />
    </>
  );
}
```

---

## 📚 Service Layer Usage

```javascript
// Direct service usage (advanced)
import dashboardService from "./api/dashboard.service.js";

// Get data directly
const response = await dashboardService.getKPIMetrics("today");
console.log(response.data);

// With error handling
try {
  const { data } =
    await dashboardService.getPerformanceMetrics("restaurantId123");
  console.log(data); // Array of staff
} catch (error) {
  console.error("Failed:", error.message);
}
```

---

## ✅ Checklist for Adding New Dashboard Metrics

1. ✅ Create backend controller in `dashboard.extended.js`
2. ✅ Add route in `dashboard.route.js`
3. ✅ Add service method in `dashboard.service.js`
4. ✅ Create custom hook in `hooks/`
5. ✅ Export hook from `hooks/index.js`
6. ✅ Create component in `components/`
7. ✅ Use hook in component
8. ✅ Add to AdminDashboard.jsx
9. ✅ Test with real data
10. ✅ Document in this guide

---

**Last Updated**: January 23, 2026  
**Status**: ✅ Production Ready
