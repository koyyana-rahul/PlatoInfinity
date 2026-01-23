# AdminDashboard Component Structure

## 📁 New Directory Structure

```
client/src/modules/admin/
├── AdminDashboard.jsx              ← Main component (refactored & clean)
├── components/                     ← Reusable UI components
│   ├── DashboardHeader.jsx         ← Header with title & time range selector
│   ├── StatsCards.jsx              ← Stats display components
│   ├── RecentOrdersTable.jsx       ← Orders table with status badges
│   └── index.js                    ← Barrel export
├── hooks/                          ← Custom React hooks
│   ├── useDashboardStats.js        ← Fetch & manage dashboard stats
│   ├── useRecentOrders.js          ← Fetch & manage recent orders
│   ├── useSocketUpdates.js         ← Handle real-time socket updates
│   └── index.js                    ← Barrel export
├── AdminReports.jsx                ← Existing reports page
├── AdminSettings.jsx               ← Existing settings page
├── OrderDashboard.jsx              ← Existing order dashboard
├── managers/                       ← Existing managers module
├── master-menu/                    ← Existing menu module
└── restaurants/                    ← Existing restaurants module
```

---

## 📄 File Descriptions

### Components (UI Layer)

#### DashboardHeader.jsx

**Purpose:** Display dashboard header with title, greeting, and controls

**Exports:**

- `DashboardHeader` - Main header component

**Props:**

- `userName` (string) - User's name for greeting
- `timeRange` (string) - Current time range filter
- `onTimeRangeChange` (function) - Callback when time range changes

**Features:**

- Responsive header layout
- Time range selector buttons (today, week, month)
- Live status indicator with pulse animation

**Usage:**

```jsx
<DashboardHeader
  userName={user?.name}
  timeRange={timeRange}
  onTimeRangeChange={setTimeRange}
/>
```

---

#### StatsCards.jsx

**Purpose:** Display statistics in card format

**Exports:**

- `StatsGrid` - Grid layout for all stat cards
- `StatCard` - Individual stat card component

**Props (StatCard):**

- `title` (string) - Card title
- `value` (string/number) - Main value to display
- `icon` (React component) - Icon to display
- `color` (string) - Tailwind color prefix (emerald, blue, etc.)
- `trend` (number, optional) - Trend percentage

**Props (StatsGrid):**

- `stats` (object) - Stats data object
- `loading` (boolean) - Loading state

**Features:**

- Responsive grid (1, 2, or 3 columns)
- Loading skeleton screens
- Trend indicators
- Hover effects

**Usage:**

```jsx
<StatsGrid stats={stats} loading={statsLoading} />
```

---

#### RecentOrdersTable.jsx

**Purpose:** Display recent orders in a table format

**Exports:**

- `RecentOrdersTable` - Main table component
- `OrderStatusBadge` - Internal status badge component

**Props:**

- `orders` (array) - Array of order objects
- `loading` (boolean) - Loading state

**Features:**

- Responsive table layout
- Status-based color coding
- Loading and empty states
- Time formatting
- Currency formatting (₹)

**Usage:**

```jsx
<RecentOrdersTable orders={recentOrders} loading={false} />
```

---

### Hooks (Logic Layer)

#### useDashboardStats.js

**Purpose:** Fetch and manage dashboard statistics

**Exports:**

- `useDashboardStats(timeRange)` - Custom hook

**Parameters:**

- `timeRange` (string) - Time range filter (today, week, month)

**Returns:**

```javascript
{
  stats: {
    totalSales: number,
    ordersToday: number,
    activeTables: number,
    activeUsers: number,
    averageOrderValue: number,
    completionRate: number
  },
  loading: boolean,
  error: string | null,
  setStats: function
}
```

**Features:**

- Auto-refresh every 30 seconds
- Error handling and logging
- Loading state management
- Cleanup on unmount

**Usage:**

```javascript
const { stats, loading, error, setStats } = useDashboardStats(timeRange);
```

---

#### useRecentOrders.js

**Purpose:** Fetch and manage recent orders

**Exports:**

- `useRecentOrders(timeRange)` - Custom hook

**Parameters:**

- `timeRange` (string) - Time range filter

**Returns:**

```javascript
{
  recentOrders: array,
  loading: boolean,
  error: string | null,
  setRecentOrders: function,
  addRecentOrder: function  // For socket updates
}
```

**Features:**

- Fetch recent orders from API
- Error handling
- Update function for real-time changes
- Limit to 10 orders

**Usage:**

```javascript
const { recentOrders, addRecentOrder } = useRecentOrders(timeRange);
```

---

#### useSocketUpdates.js

**Purpose:** Handle real-time socket updates

**Exports:**

- `useSocketUpdates(socket, setStats, addRecentOrder)` - Custom hook

**Parameters:**

- `socket` (Socket instance) - Socket.io connection
- `setStats` (function) - Function to update stats
- `addRecentOrder` (function) - Function to add order to recent list

**Features:**

- Listens for `order:placed` events
- Listens for `table:status-changed` events
- Updates stats in real-time
- Auto cleanup on unmount

**Usage:**

```javascript
useSocketUpdates(socket, setStats, addRecentOrder);
```

---

### Main Component

#### AdminDashboard.jsx

**Purpose:** Main dashboard component orchestrating all sub-components

**Exports:**

- `default` - AdminDashboard component

**State:**

- `timeRange` - Selected time range filter

**Hooks Used:**

- `useSelector` - Redux user data
- `useSocket` - WebSocket connection
- `useDashboardStats` - Stats data & logic
- `useRecentOrders` - Orders data & logic
- `useSocketUpdates` - Real-time updates

**Structure:**

```
AdminDashboard
├── DashboardHeader
├── StatsGrid
│   └── StatCard (x6)
└── RecentOrdersTable
```

**Features:**

- Clean, readable main component
- Minimal state management (only timeRange)
- Proper hook composition
- Real-time updates
- Responsive layout

---

## 🔄 Data Flow

```
Redux Store (user)
    ↓
AdminDashboard
    ├─→ useDashboardStats → API call → setStats
    ├─→ useRecentOrders → API call → setRecentOrders
    └─→ useSocketUpdates
        ├─→ Listen for order:placed → addRecentOrder
        └─→ Listen for table:status-changed → setStats

Socket Events
    ├─→ order:placed → addRecentOrder
    └─→ table:status-changed → setStats

Time Range Change
    ├─→ useDashboardStats refetch
    └─→ useRecentOrders refetch
```

---

## 📊 Component Dependencies

```
AdminDashboard (MAIN)
    ├── Hook: useDashboardStats
    │   └── API: dashboardApi.getStats
    │       └── AuthAxios
    │
    ├── Hook: useRecentOrders
    │   └── API: dashboardApi.getRecentOrders
    │       └── AuthAxios
    │
    ├── Hook: useSocketUpdates
    │   └── Socket: order:placed, table:status-changed
    │
    ├── Component: DashboardHeader
    │   └── Props: userName, timeRange, onTimeRangeChange
    │
    ├── Component: StatsGrid
    │   ├── Props: stats, loading
    │   └── Component: StatCard (6x)
    │       └── Props: title, value, icon, color, trend
    │
    └── Component: RecentOrdersTable
        ├── Props: orders, loading
        └── Component: OrderStatusBadge
            └── Props: status
```

---

## ✅ Benefits of This Structure

### Code Organization

✅ **Separation of Concerns**

- Components (UI) separate from hooks (logic)
- Each file has single responsibility
- Easy to locate and modify code

✅ **Reusability**

- Hooks can be used by other components
- Components can be used independently
- Reduced code duplication

✅ **Testability**

- Hooks easy to test in isolation
- Components easy to test with mock data
- Clear interfaces between layers

### Maintainability

✅ **Readability**

- Main component is now ~50 lines vs 303 lines
- Clear component hierarchy
- Self-documenting code

✅ **Scalability**

- Easy to add new stats cards
- Easy to add new filters
- Easy to extend functionality

✅ **Performance**

- Component only re-renders when needed
- Hooks manage their own state
- Efficient socket cleanup

---

## 🚀 Usage Example

```jsx
import AdminDashboard from "./modules/admin/AdminDashboard";

// In your router or layout
<AdminDashboard />;

// That's it! All functionality is encapsulated
```

---

## 🔧 Extending the Component

### Adding a New Stat Card

1. Add data to API response
2. Update `useDashboardStats` initial state
3. Add new `<StatCard>` in `StatsGrid`

### Adding a New Filter

1. Add filter option to `DashboardHeader`
2. Add parameter to API calls
3. Update hooks to use new parameter

### Adding a New Socket Event

1. Listen in `useSocketUpdates`
2. Update relevant state (`setStats` or `setRecentOrders`)

---

## 📝 File Sizes Comparison

**Before (Single File):**

```
AdminDashboard.jsx - 303 lines
Total: 303 lines
```

**After (Modular):**

```
AdminDashboard.jsx - 52 lines
DashboardHeader.jsx - 42 lines
StatsCards.jsx - 95 lines
RecentOrdersTable.jsx - 105 lines
useDashboardStats.js - 51 lines
useRecentOrders.js - 44 lines
useSocketUpdates.js - 49 lines
Total: ~438 lines (distributed)
```

**Benefits:**

- Each file is focused and understandable
- Easier navigation
- Less cognitive load
- Better for team development

---

## 🎓 Learning Path

1. **Understand the structure** - Review this document
2. **Read AdminDashboard.jsx** - See how hooks & components work together
3. **Read components/** - Understand UI layer
4. **Read hooks/** - Understand business logic
5. **Modify a component** - Try changing a stat card color
6. **Add a new feature** - Try adding a new stat or filter

---

## 🐛 Debugging Tips

**Check stats not loading:**

1. Open browser DevTools
2. Go to Network tab
3. Check for `/api/dashboard/stats` request
4. Verify response status & data
5. Check `useDashboardStats.js` error logs

**Check socket updates not working:**

1. Open browser DevTools
2. Look for socket events in console
3. Check `useSocketUpdates.js` listeners
4. Verify server is emitting events

**Check components not rendering:**

1. Add `console.log` at component top
2. Check props are being passed
3. Verify loading states
4. Check browser console for errors

---

## 📚 Related Files

- **API Configuration:** `client/src/api/dashboard.api.js`
- **Auth Interceptor:** `client/src/api/authAxios.js`
- **Socket Provider:** `client/src/socket/SocketProvider.jsx`
- **Redux Store:** `client/src/store/` (for user data)

---

**Structure Created:** January 2026
**Benefits:** Modularity, Reusability, Testability, Maintainability
**Status:** ✅ Ready for Development
