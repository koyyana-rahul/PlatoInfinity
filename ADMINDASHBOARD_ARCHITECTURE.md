# AdminDashboard Architecture Diagram

## 🏗️ Directory Structure

```
PLATO_MENU/
└── client/src/modules/admin/
    ├── AdminDashboard.jsx                    ← Main component (52 lines) ✅
    ├── AdminReports.jsx                      ← Existing file
    ├── AdminSettings.jsx                     ← Existing file
    ├── OrderDashboard.jsx                    ← Existing file
    │
    ├── components/                           ← NEW: UI Components
    │   ├── index.js                          ← Barrel export
    │   ├── DashboardHeader.jsx               ← Header + time range filter
    │   ├── StatsCards.jsx                    ← Stats display cards
    │   └── RecentOrdersTable.jsx             ← Orders table
    │
    ├── hooks/                                ← NEW: Custom React Hooks
    │   ├── index.js                          ← Barrel export
    │   ├── useDashboardStats.js              ← Fetch stats, auto-refresh
    │   ├── useRecentOrders.js                ← Fetch recent orders
    │   └── useSocketUpdates.js               ← Real-time socket updates
    │
    ├── managers/                             ← Existing module
    ├── master-menu/                          ← Existing module
    └── restaurants/                          ← Existing module
```

---

## 🔄 Component Composition Tree

```
AdminDashboard (Main Container)
│
├─ Hooks (Logic Layer)
│  ├─ useDashboardStats(timeRange)
│  │  ├─ State: stats, loading, error
│  │  ├─ Effect: Fetch from API every 30s
│  │  └─ Returns: stats, loading, error, setStats
│  │
│  ├─ useRecentOrders(timeRange)
│  │  ├─ State: recentOrders, loading, error
│  │  ├─ Effect: Fetch from API once
│  │  └─ Returns: recentOrders, loading, error, setRecentOrders, addRecentOrder
│  │
│  └─ useSocketUpdates(socket, setStats, addRecentOrder)
│     ├─ Listens: "order:placed" event
│     ├─ Listens: "table:status-changed" event
│     └─ Updates: stats & orders in real-time
│
├─ Components (UI Layer)
│  │
│  ├─ DashboardHeader
│  │  ├─ Props: userName, timeRange, onTimeRangeChange
│  │  ├─ Display: Title, greeting
│  │  ├─ Buttons: Time range selector (today, week, month)
│  │  └─ Indicator: Live status with pulse
│  │
│  ├─ StatsGrid
│  │  ├─ Props: stats (object), loading (bool)
│  │  ├─ Children: StatCard x 6
│  │  │  ├─ StatCard (1) Total Sales
│  │  │  ├─ StatCard (2) Orders Today
│  │  │  ├─ StatCard (3) Active Tables
│  │  │  ├─ StatCard (4) Avg Order Value
│  │  │  ├─ StatCard (5) Completion Rate
│  │  │  └─ StatCard (6) Active Users
│  │  └─ Features: Icons, colors, trends
│  │
│  └─ RecentOrdersTable
│     ├─ Props: orders (array), loading (bool)
│     ├─ Display: Table with columns
│     │  ├─ Order #
│     │  ├─ Table
│     │  ├─ Items
│     │  ├─ Amount
│     │  ├─ Status (with color badge)
│     │  └─ Time
│     └─ Features: Hover effects, formatting

Redux
  └─ user (for userName)

Socket.io
  ├─ order:placed event
  └─ table:status-changed event
```

---

## 🔗 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      STATE CHANGES                              │
└─────────────────────────────────────────────────────────────────┘

Time Range Change (today/week/month)
    │
    ├─→ AdminDashboard.setState(timeRange)
    │       │
    │       ├─→ useDashboardStats(timeRange)
    │       │       └─→ Fetch /api/dashboard/stats?range=...
    │       │           └─→ setStats(data)
    │       │
    │       └─→ useRecentOrders(timeRange)
    │               └─→ Fetch /api/order/recent?range=...
    │                   └─→ setRecentOrders(data)
    │
    └─→ Components Re-render with new data

Real-time Socket Event: order:placed
    │
    ├─→ useSocketUpdates listener
    │       ├─→ addRecentOrder(newOrder)
    │       │       └─→ RecentOrdersTable updates
    │       │
    │       └─→ setStats({ ordersToday++, totalSales+... })
    │               └─→ StatsGrid updates
    │
    └─→ UI Updates instantly

Auto-refresh (Every 30 seconds)
    │
    ├─→ useEffect in useDashboardStats
    │       └─→ setInterval → Fetch stats again
    │           └─→ setStats(newData)
    │               └─→ StatsGrid re-renders
    │
    └─→ User sees latest data without manual refresh
```

---

## 📦 Import/Export Structure

```
components/index.js
├─ export { DashboardHeader }
├─ export { StatsGrid, StatCard }
└─ export { RecentOrdersTable }
    │
    └─ AdminDashboard.jsx imports from:
        import {
          DashboardHeader,
          StatsGrid,
          RecentOrdersTable,
        } from "./components";

hooks/index.js
├─ export { useDashboardStats }
├─ export { useRecentOrders }
└─ export { useSocketUpdates }
    │
    └─ AdminDashboard.jsx imports from:
        import {
          useDashboardStats,
          useRecentOrders,
          useSocketUpdates,
        } from "./hooks";
```

---

## 🎯 Responsibility Matrix

```
┌──────────────────────┬─────────────┬──────────┬──────────┬────────────┐
│ Feature              │ Hook        │Component │ AdminDB  │ Parent     │
├──────────────────────┼─────────────┼──────────┼──────────┼────────────┤
│ Fetch stats          │ ✅          │          │          │            │
│ Auto-refresh         │ ✅          │          │          │            │
│ Socket updates       │ ✅          │          │          │            │
│ Time range state     │             │          │ ✅       │            │
│ Render header        │             │ ✅       │          │            │
│ Render stats grid    │             │ ✅       │          │            │
│ Render orders table  │             │ ✅       │          │            │
│ Compose UI           │             │          │ ✅       │            │
│ Pass props           │             │          │ ✅       │            │
│ Handle routing       │             │          │          │ ✅         │
└──────────────────────┴─────────────┴──────────┴──────────┴────────────┘
```

---

## 🧩 Component Interface

```
AdminDashboard Component Interface
├─ Input
│  └─ Redux: user { _id, name, email, role }
│  └─ Socket: WebSocket connection from SocketProvider
│
├─ Internal State
│  └─ timeRange: 'today' | 'week' | 'month'
│
├─ Outputs (via render)
│  ├─ DashboardHeader
│  │  ├─ Button clicks → setState(timeRange)
│  │  └─ Display: title, greeting, live status
│  ├─ StatsGrid
│  │  └─ Display: 6 stat cards with icons & colors
│  └─ RecentOrdersTable
│     └─ Display: table of recent orders
│
└─ Side Effects
   ├─ API calls every 30s
   ├─ Socket event listeners
   └─ Auto-cleanup on unmount
```

---

## 🔀 Lifecycle Flow

```
MOUNT
  │
  ├─→ useDashboardStats()
  │   ├─→ Initial fetch from API
  │   ├─→ setInterval(refetch, 30000)
  │   └─→ Return cleanup
  │
  ├─→ useRecentOrders()
  │   ├─→ Initial fetch from API
  │   └─→ Return cleanup
  │
  └─→ useSocketUpdates()
      ├─→ socket.on("order:placed", handler)
      ├─→ socket.on("table:status-changed", handler)
      └─→ Return cleanup (socket.off)

Render
  │
  ├─→ DashboardHeader
  ├─→ StatsGrid
  └─→ RecentOrdersTable

TIME RANGE CHANGE
  │
  ├─→ dependencies: [timeRange]
  ├─→ cleanup previous intervals
  ├─→ trigger new API calls
  └─→ re-render with new data

UNMOUNT
  │
  ├─→ Clear interval (useDashboardStats)
  ├─→ Clear dependencies (useRecentOrders)
  └─→ socket.off() all listeners (useSocketUpdates)
```

---

## 🎨 Styling Architecture

```
Tailwind CSS (Utility-based)
  │
  ├─ DashboardHeader
  │  └─ Layout: flex, gap, responsive (sm:, lg:)
  │  └─ Typography: text-3xl, font-bold, uppercase
  │  └─ Colors: emerald, slate
  │  └─ Animations: animate-pulse
  │
  ├─ StatsCards
  │  └─ Grid: grid-cols-1, sm:grid-cols-2, lg:grid-cols-3
  │  └─ Cards: border, rounded-lg, shadow, hover:shadow-md
  │  └─ Colors: text-emerald-600, bg-emerald-50
  │  └─ Animations: fade-in, slide-in
  │
  └─ RecentOrdersTable
     └─ Table: w-full, divide-y, overflow-x-auto
     └─ Status badges: px-2, py-1, rounded-full, text-xs
     └─ Colors: based on order status (red, yellow, green, blue)
     └─ Hover: hover:bg-slate-50, transition-colors
```

---

## 🔌 External Dependencies

```
AdminDashboard depends on:
│
├─ React
│  ├─ useState (timeRange state)
│  ├─ useEffect (in hooks)
│  └─ Hooks API
│
├─ Redux
│  └─ useSelector (get user data)
│
├─ Socket.io
│  └─ useSocket (from SocketProvider)
│
├─ Axios
│  └─ AuthAxios (with interceptors)
│
├─ react-icons
│  └─ FiDollarSign, FiShoppingBag, etc.
│
└─ APIs
   ├─ dashboardApi.getStats()
   └─ dashboardApi.getRecentOrders()
```

---

## 📊 Performance Characteristics

```
Initial Load
  │
  ├─ AdminDashboard.jsx: ~52 lines (fast parse)
  ├─ Components parse: ~242 lines total (fast)
  ├─ Hooks parse: ~144 lines total (fast)
  ├─ API call: 1-2 seconds (network dependent)
  └─ Total: ~2-3 seconds to first render

Component Updates
  │
  ├─ Time range change
  │  ├─ Re-fetch stats: 1 API call
  │  ├─ Re-fetch orders: 1 API call
  │  └─ Re-render: <100ms (fast)
  │
  ├─ Socket update (order placed)
  │  ├─ Add to orders: <1ms (instant)
  │  ├─ Update stats: <1ms (instant)
  │  └─ Re-render: <100ms (fast)
  │
  └─ Auto-refresh (30s interval)
     ├─ API call: 1-2 seconds
     └─ Re-render: <100ms

Memory
  │
  ├─ Component instances: 4 (Dashboard + 3 sub-components)
  ├─ Hooks instances: 3
  ├─ Intervals: 1 (30s refresh)
  ├─ Socket listeners: 2
  └─ Total: Minimal, proper cleanup on unmount
```

---

## 🎯 Testing Structure

```
Unit Tests (Jest)
├─ hooks/
│  ├─ useDashboardStats.test.js
│  │  ├─ Test API call
│  │  ├─ Test auto-refresh
│  │  └─ Test error handling
│  ├─ useRecentOrders.test.js
│  │  └─ Test API call
│  └─ useSocketUpdates.test.js
│     └─ Test socket listeners
│
├─ components/
│  ├─ DashboardHeader.test.js
│  │  └─ Test button clicks, props
│  ├─ StatsCards.test.js
│  │  └─ Test rendering, formatting
│  └─ RecentOrdersTable.test.js
│     └─ Test table rendering, status badges
│
└─ integration/
   └─ AdminDashboard.integration.test.js
      ├─ Test full page load
      ├─ Test data flow
      └─ Test user interactions

E2E Tests (Cypress/Playwright)
└─ Test complete user workflows
   ├─ Load dashboard
   ├─ Change time range
   ├─ Verify stats update
   └─ Verify orders list
```

---

## 🚀 Optimization Opportunities

```
Current State ✅
├─ Component code splitting
├─ Hook logic separation
├─ Proper dependency arrays
└─ Cleanup on unmount

Future Optimizations
├─ Memoize components (React.memo)
├─ Memoize callbacks (useCallback)
├─ Memoize computed values (useMemo)
├─ Code split components (React.lazy)
├─ Cache API responses (custom hook)
├─ Batch socket updates
└─ Lazy load chart libraries
```

---

This architecture provides a clean, maintainable, and scalable foundation for the AdminDashboard component! 🎉
