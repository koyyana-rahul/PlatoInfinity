# AdminDashboard - Directory Structure Visual

## 🎨 Complete File Tree

```
PLATO_MENU/
│
└── client/src/modules/admin/
    │
    ├── 📄 AdminDashboard.jsx ✨ REFACTORED
    │   └─ 52 lines (was 303)
    │   └─ Main component orchestrating everything
    │   └─ Uses hooks & components
    │
    ├── 📁 hooks/ ✨ NEW FOLDER
    │   ├─ index.js (3 lines)
    │   │  └─ Barrel export for all hooks
    │   │
    │   ├─ useDashboardStats.js (51 lines)
    │   │  └─ Fetch stats, auto-refresh every 30s
    │   │  └─ Returns: stats, loading, error, setStats
    │   │
    │   ├─ useRecentOrders.js (44 lines)
    │   │  └─ Fetch recent orders
    │   │  └─ Returns: orders, loading, error, setRecentOrders, addRecentOrder
    │   │
    │   └─ useSocketUpdates.js (49 lines)
    │      └─ Listen to socket events
    │      └─ Update stats & orders in real-time
    │
    ├── 📁 components/ ✨ NEW FOLDER
    │   ├─ index.js (3 lines)
    │   │  └─ Barrel export for all components
    │   │
    │   ├─ DashboardHeader.jsx (42 lines)
    │   │  └─ Header with title & time range selector
    │   │  └─ Props: userName, timeRange, onTimeRangeChange
    │   │
    │   ├─ StatsCards.jsx (95 lines)
    │   │  ├─ StatsGrid component (displays 6 cards)
    │   │  └─ StatCard component (individual card)
    │   │  └─ Props: stats, loading for grid
    │   │  └─ Props: title, value, icon, color, trend for card
    │   │
    │   └─ RecentOrdersTable.jsx (105 lines)
    │      ├─ RecentOrdersTable component (main table)
    │      └─ OrderStatusBadge component (internal)
    │      └─ Props: orders, loading
    │
    ├── 📁 managers/ (existing)
    │   └─ (manager-related components)
    │
    ├── 📁 master-menu/ (existing)
    │   └─ (menu-related components)
    │
    ├── 📁 restaurants/ (existing)
    │   └─ (restaurant-related components)
    │
    ├── 📄 AdminReports.jsx (existing)
    ├── 📄 AdminSettings.jsx (existing)
    ├── 📄 OrderDashboard.jsx (existing)
    │
    └── 📄 index.js (if exists)
       └─ Barrel export for admin module
```

---

## 📊 Component Hierarchy

```
AdminDashboard (Main Container)
│
├─ Redux Store
│  └─ user { name, email, role, ... }
│
├─ Socket.io Connection
│  └─ Emits: "order:placed", "table:status-changed"
│
├─ State
│  └─ timeRange: 'today' | 'week' | 'month'
│
├─ Hooks
│  ├─ useDashboardStats(timeRange)
│  │  └─ State: stats, loading, error
│  │  └─ Effect: Fetch every 30s
│  │  └─ Return: stats, loading, error, setStats
│  │
│  ├─ useRecentOrders(timeRange)
│  │  └─ State: orders, loading, error
│  │  └─ Effect: Fetch once
│  │  └─ Return: orders, loading, error, setOrders, addOrder
│  │
│  └─ useSocketUpdates(socket, setStats, addOrder)
│     └─ Effect: Set socket listeners
│     └─ Handlers: Update stats & orders
│     └─ Cleanup: Remove listeners
│
└─ Render
   │
   ├─ DashboardHeader
   │  ├─ Props: userName, timeRange, onTimeRangeChange
   │  └─ Renders:
   │     ├─ Title "Dashboard"
   │     ├─ Greeting "Welcome back, {name}"
   │     ├─ Time range buttons
   │     └─ Live indicator
   │
   ├─ StatsGrid
   │  ├─ Props: stats (object), loading (boolean)
   │  └─ Renders:
   │     ├─ StatCard: Total Sales (emerald)
   │     ├─ StatCard: Orders Today (blue)
   │     ├─ StatCard: Active Tables (orange)
   │     ├─ StatCard: Avg Order Value (purple)
   │     ├─ StatCard: Completion Rate (indigo)
   │     └─ StatCard: Active Users (pink)
   │
   └─ RecentOrdersTable
      ├─ Props: orders (array), loading (boolean)
      └─ Renders:
         └─ Table with columns:
            ├─ Order #
            ├─ Table
            ├─ Items
            ├─ Amount
            ├─ Status (with colored badge)
            └─ Time
```

---

## 🔀 File Relationship Diagram

```
AdminDashboard.jsx (MAIN)
    │
    ├─ Imports from: ./hooks
    │  ├─ useDashboardStats
    │  ├─ useRecentOrders
    │  └─ useSocketUpdates
    │
    ├─ Imports from: ./components
    │  ├─ DashboardHeader
    │  ├─ StatsGrid
    │  └─ RecentOrdersTable
    │
    ├─ Imports from: react
    │  ├─ useState
    │  └─ (React 19)
    │
    ├─ Imports from: react-redux
    │  └─ useSelector
    │
    └─ Imports from: SocketProvider
       └─ useSocket

DashboardHeader.jsx
    └─ Imports from: react-icons/fi
       ├─ FiTrendingUp
       └─ (icons)

StatsCards.jsx
    └─ Imports from: react-icons/fi
       ├─ FiDollarSign
       ├─ FiShoppingBag
       ├─ FiLayers
       ├─ FiUsers
       ├─ FiActivity
       └─ FiTrendingUp

RecentOrdersTable.jsx
    └─ No external UI library imports
       └─ Pure Tailwind + React

useDashboardStats.js
    ├─ Imports from: api/authAxios
    │  └─ AuthAxios (axios instance)
    │
    └─ Imports from: api/dashboard.api
       └─ dashboardApi

useRecentOrders.js
    ├─ Imports from: api/authAxios
    │  └─ AuthAxios
    │
    └─ Imports from: api/dashboard.api
       └─ dashboardApi

useSocketUpdates.js
    └─ No external imports
       └─ Uses passed socket parameter
```

---

## 📦 Import/Export Chain

```
client/src/modules/admin/

hooks/index.js
├─ import { useDashboardStats } from './useDashboardStats'
├─ import { useRecentOrders } from './useRecentOrders'
├─ import { useSocketUpdates } from './useSocketUpdates'
└─ export { useDashboardStats, useRecentOrders, useSocketUpdates }

components/index.js
├─ import { DashboardHeader } from './DashboardHeader'
├─ import { StatsGrid, StatCard } from './StatsCards'
├─ import { RecentOrdersTable } from './RecentOrdersTable'
└─ export { DashboardHeader, StatsGrid, StatCard, RecentOrdersTable }

AdminDashboard.jsx
├─ import { useDashboardStats, useRecentOrders, useSocketUpdates } from './hooks'
├─ import { DashboardHeader, StatsGrid, RecentOrdersTable } from './components'
└─ export default AdminDashboard

Parent Component (e.g., in routing)
└─ import AdminDashboard from './modules/admin/AdminDashboard'
   └─ Uses: <AdminDashboard />
```

---

## 🎯 Data Dependencies

```
External Dependencies:
│
├─ Redux Store
│  └─ state.user
│     ├─ _id
│     ├─ name (used in DashboardHeader)
│     ├─ email
│     └─ role
│
├─ API Endpoints
│  ├─ GET /api/dashboard/stats?range=...
│  │  └─ Called by: useDashboardStats
│  │  └─ Returns: {totalSales, ordersToday, activeTables, ...}
│  │
│  └─ GET /api/order/recent?limit=10&range=...
│     └─ Called by: useRecentOrders
│     └─ Returns: [orders]
│
├─ Socket Events
│  ├─ "order:placed" (incoming)
│  │  └─ Listened in: useSocketUpdates
│  │  └─ Data: {orderNumber, totalAmount, ...}
│  │
│  └─ "table:status-changed" (incoming)
│     └─ Listened in: useSocketUpdates
│     └─ Data: {tableId, status}
│
└─ Icons (react-icons/fi)
   ├─ FiDollarSign
   ├─ FiShoppingBag
   ├─ FiLayers
   ├─ FiUsers
   ├─ FiActivity
   └─ FiTrendingUp
```

---

## 📁 Suggested Organization for Future

```
client/src/modules/admin/
│
├─ 📁 hooks/
│  ├─ data/
│  │  ├─ useDashboardStats.js
│  │  └─ useRecentOrders.js
│  ├─ realtime/
│  │  └─ useSocketUpdates.js
│  └─ index.js
│
├─ 📁 components/
│  ├─ dashboard/
│  │  ├─ DashboardHeader.jsx
│  │  ├─ StatsCards.jsx
│  │  └─ RecentOrdersTable.jsx
│  ├─ common/
│  │  ├─ LoadingSpinner.jsx
│  │  └─ ErrorBoundary.jsx
│  └─ index.js
│
├─ 📁 pages/
│  ├─ AdminDashboard.jsx
│  ├─ AdminReports.jsx
│  └─ AdminSettings.jsx
│
├─ 📁 utils/
│  ├─ formatters.js
│  ├─ validators.js
│  └─ constants.js
│
├─ 📁 types/
│  ├─ dashboard.types.js
│  └─ orders.types.js
│
└─ 📁 tests/
   ├─ hooks/
   ├─ components/
   └─ integration/

(Optional - for future growth)
```

---

## 🔄 Data Flow Routes

```
User Interaction: Click time range button
│
└─ DashboardHeader.jsx
   └─ onTimeRangeChange("week")
      │
      └─ AdminDashboard.jsx
         └─ setTimeRange("week")
            │
            ├─ useDashboardStats("week")
            │  └─ Call API: /api/dashboard/stats?range=week
            │     └─ setStats(response)
            │        │
            │        └─ StatsGrid
            │           └─ Re-render with new stats
            │
            └─ useRecentOrders("week")
               └─ Call API: /api/order/recent?range=week
                  └─ setRecentOrders(response)
                     │
                     └─ RecentOrdersTable
                        └─ Re-render with new orders

Socket Event: Order placed on another device
│
└─ useSocketUpdates listener
   └─ socket.on("order:placed", handler)
      ├─ addRecentOrder(newOrder)
      │  └─ RecentOrdersTable
      │     └─ Re-render (new order at top)
      │
      └─ setStats({ordersToday++, totalSales+=amount})
         │
         └─ StatsGrid
            └─ Re-render (updated stats)
```

---

## 📊 Lines of Code Distribution

```
Before Refactoring:
AdminDashboard.jsx ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 303 lines

After Refactoring:
AdminDashboard.jsx ▓▓▓ 52 lines
DashboardHeader.jsx ▓▓ 42 lines
StatsCards.jsx ▓▓▓▓▓ 95 lines
RecentOrdersTable.jsx ▓▓▓▓▓▓ 105 lines
useDashboardStats.js ▓▓▓ 51 lines
useRecentOrders.js ▓▓ 44 lines
useSocketUpdates.js ▓▓▓ 49 lines
Total: 438 lines (better distribution!)
```

---

## ✅ File Checklist

### Hooks Created

- [x] `client/src/modules/admin/hooks/useDashboardStats.js`
- [x] `client/src/modules/admin/hooks/useRecentOrders.js`
- [x] `client/src/modules/admin/hooks/useSocketUpdates.js`
- [x] `client/src/modules/admin/hooks/index.js`

### Components Created

- [x] `client/src/modules/admin/components/DashboardHeader.jsx`
- [x] `client/src/modules/admin/components/StatsCards.jsx`
- [x] `client/src/modules/admin/components/RecentOrdersTable.jsx`
- [x] `client/src/modules/admin/components/index.js`

### Files Refactored

- [x] `client/src/modules/admin/AdminDashboard.jsx`

### Documentation Created

- [x] `ADMINDASHBOARD_STRUCTURE.md`
- [x] `ADMINDASHBOARD_QUICKREF.md`
- [x] `ADMINDASHBOARD_ARCHITECTURE.md`
- [x] `ADMINDASHBOARD_COMPLETE_SUMMARY.md`
- [x] `ADMINDASHBOARD_DOCS_INDEX.md`
- [x] `ADMINDASHBOARD_FILES_VISUAL.md` (this file)

---

## 🎯 Quick File Locations

### Components

```
client/src/modules/admin/components/DashboardHeader.jsx
client/src/modules/admin/components/StatsCards.jsx
client/src/modules/admin/components/RecentOrdersTable.jsx
```

### Hooks

```
client/src/modules/admin/hooks/useDashboardStats.js
client/src/modules/admin/hooks/useRecentOrders.js
client/src/modules/admin/hooks/useSocketUpdates.js
```

### Main

```
client/src/modules/admin/AdminDashboard.jsx
```

### Documentation

```
ADMINDASHBOARD_STRUCTURE.md
ADMINDASHBOARD_QUICKREF.md
ADMINDASHBOARD_ARCHITECTURE.md
ADMINDASHBOARD_COMPLETE_SUMMARY.md
ADMINDASHBOARD_DOCS_INDEX.md
ADMINDASHBOARD_FILES_VISUAL.md
```

---

**Structure Complete:** ✅
**Files Organized:** ✅
**Ready to Use:** ✅
