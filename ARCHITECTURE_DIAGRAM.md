# Dashboard & Reports Integration Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER (Port 5173)                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           AdminDashboard Component                       │  │
│  │  ┌──────────────────────────────────────────────┐       │  │
│  │  │ useEffect: Fetch Stats on mount             │       │  │
│  │  │ dashboardApi.getStats(timeRange)            │       │  │
│  │  │ → AuthAxios.get('/api/dashboard/stats')     │       │  │
│  │  │ ↓ Cookies auto-included (credentials:true)  │       │  │
│  │  └──────────────────────────────────────────────┘       │  │
│  │  ┌──────────────────────────────────────────────┐       │  │
│  │  │ Display Stats:                               │       │  │
│  │  │ • Total Sales                                │       │  │
│  │  │ • Orders Today                               │       │  │
│  │  │ • Active Tables                              │       │  │
│  │  │ • Active Users                               │       │  │
│  │  │ • Average Order Value                        │       │  │
│  │  │ • Completion Rate                            │       │  │
│  │  └──────────────────────────────────────────────┘       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        authAxios (axios with interceptors)               │  │
│  │  • withCredentials: true                                 │  │
│  │  • Request interceptor: Logs token sending               │  │
│  │  • Response interceptor: Handles 401 + refresh           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│           HTTP Request (with cookies)                          │
│      GET /api/dashboard/stats?range=today                      │
│      Headers: Cookie: accessToken=...; refreshToken=...        │
└─────────────────────────────────────────────────────────────────┘
                           ↓↓↓
                    NETWORK (HTTP)
                           ↓↓↓
┌─────────────────────────────────────────────────────────────────┐
│              EXPRESS SERVER (Port 8080)                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Dashboard Router Middleware                    │  │
│  │  app.use('/api/dashboard', (req,res,next) => {          │  │
│  │    logs request info                                    │  │
│  │    next()                                               │  │
│  │  })                                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Route Matching & Middleware Chain                │  │
│  │  GET /stats                                              │  │
│  │  ├─ requireAuth middleware                               │  │
│  │  │  ├─ Read token from req.cookies.accessToken           │  │
│  │  │  ├─ Verify JWT signature                              │  │
│  │  │  ├─ Load user from MongoDB                            │  │
│  │  │  ├─ Attach req.user = { _id, role, ... }             │  │
│  │  │  └─ next()                                            │  │
│  │  │                                                        │  │
│  │  └─ dashboardStatsController()                            │  │
│  │     ├─ Parse query param: range (today/week/month)       │  │
│  │     ├─ Query MongoDB:                                    │  │
│  │     │  • Bill.find({ status: PAID, createdAt: ... })    │  │
│  │     │  • Order.find({ createdAt: ... })                 │  │
│  │     │  • Table.find({})                                 │  │
│  │     │  • Session.countDocuments({ status: OPEN })       │  │
│  │     ├─ Calculate stats:                                 │  │
│  │     │  • totalSales = sum of bills                      │  │
│  │     │  • ordersToday = count of orders                  │  │
│  │     │  • activeTables = count where status=OCCUPIED     │  │
│  │     │  • activeUsers = count of open sessions           │  │
│  │     │  • averageOrderValue = totalSales / ordersCount   │  │
│  │     │  • completionRate = served / total * 100          │  │
│  │     └─ res.json({ success, data: { ... } })             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                     │
│              MongoDB Database (Atlas)                           │
│              ├─ bills collection                                │
│              ├─ orders collection                               │
│              ├─ tables collection                               │
│              ├─ sessions collection                             │
│              └─ users collection                                │
└─────────────────────────────────────────────────────────────────┘
                           ↓↓↓
                    JSON Response (200 OK)
                           ↓↓↓
┌─────────────────────────────────────────────────────────────────┐
│                    BROWSER Again                                │
│                                                                 │
│  Response JSON:                                                 │
│  {                                                              │
│    "success": true,                                             │
│    "error": false,                                              │
│    "data": {                                                    │
│      "totalSales": 5000,                                        │
│      "ordersToday": 12,                                         │
│      "activeTables": 3,                                         │
│      "activeUsers": 5,                                          │
│      "averageOrderValue": 416,                                  │
│      "completionRate": 92                                       │
│    }                                                            │
│  }                                                              │
│          ↓                                                      │
│  AdminDashboard.jsx:                                            │
│  ├─ setStats(res.data.data)                                    │
│  ├─ Re-render component                                         │
│  └─ Display stats on screen ✅                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌─────────────┐
│   LOGIN     │
└──────┬──────┘
       │ user sends credentials
       ↓
┌──────────────────────────────────┐
│  POST /api/auth/login            │
│  { email, password }             │
└──────┬───────────────────────────┘
       │
       ↓ validate credentials
┌──────────────────────────────────┐
│  Generate JWT token              │
│  exp: 15 minutes                 │
└──────┬───────────────────────────┘
       │
       ↓ set httpOnly cookie
┌──────────────────────────────────┐
│  Set-Cookie: accessToken=jwt     │
│  HttpOnly, Secure, Path=/         │
│  SameSite=lax (dev), None (prod)  │
└──────┬───────────────────────────┘
       │
       ↓ set refresh cookie
┌──────────────────────────────────┐
│  Set-Cookie: refreshToken=jwt    │
│  HttpOnly, Path=/                 │
│  exp: 30 days                    │
└──────┬───────────────────────────┘
       │ cookies stored by browser
       ↓
┌──────────────────────────────────┐
│  Browser local storage:          │
│  document.cookie shows:          │
│  accessToken=...;               │
│  refreshToken=...;              │
└──────┬───────────────────────────┘
       │
       ↓ subsequent requests
┌──────────────────────────────────┐
│  GET /api/dashboard/stats        │
│  ↓ (withCredentials: true)       │
│  Browser auto-includes:          │
│  Cookie: accessToken=...;        │
│  refreshToken=...;               │
└──────┬───────────────────────────┘
       │ backend reads from req.cookies
       ↓
┌──────────────────────────────────┐
│  requireAuth middleware:         │
│  jwt.verify(token, secret)       │
│  ↓ Success                       │
│  Load user from DB               │
│  req.user = { _id, role, ... }  │
│  ↓ next()                        │
└──────┬───────────────────────────┘
       │
       ↓ controller executes
┌──────────────────────────────────┐
│  dashboardStatsController()      │
│  Access req.user for context     │
│  Execute business logic          │
│  Return data                     │
└──────────────────────────────────┘
```

## Report Flow (Example: Sales Report)

```
┌────────────────────────────────────────────┐
│        Frontend: Reports Component         │
│                                            │
│  onClick: Fetch Sales Report               │
│  reportsApi.getSalesReport(from, to)       │
│                                            │
│  → AuthAxios.get('/api/reports/sales',     │
│    { params: { from, to } })               │
└─────────────────┬──────────────────────────┘
                  ↓
         HTTP Request with cookies
                  ↓
┌────────────────────────────────────────────┐
│      Backend: Reports Router                │
│                                            │
│  GET /api/reports/sales?from=...&to=...   │
│  │                                        │
│  ├─ requireAuth                           │
│  │  └─ Validate JWT token                 │
│  │                                        │
│  └─ requireRole("MANAGER", "OWNER")       │
│     └─ Check user.role                    │
│        • If MANAGER: ✅ Allow             │
│        • If OWNER: ✅ Allow               │
│        • Else: ❌ 403 Forbidden           │
└─────────────────┬──────────────────────────┘
                  ↓
┌────────────────────────────────────────────┐
│   salesSummaryController() executes        │
│                                            │
│  const { from, to } = req.query            │
│                                            │
│  Bill.find({                               │
│    status: "PAID",                         │
│    createdAt: { $gte: from, $lte: to }    │
│  })                                        │
│                                            │
│  Calculate:                                │
│  • Total sales                             │
│  • Average bill value                      │
│  • Items sold                              │
│  • Discount total                          │
│  • Tax collected                           │
│                                            │
│  Return: { success, data: { ... } }        │
└─────────────────┬──────────────────────────┘
                  ↓
         HTTP 200 OK with JSON
                  ↓
┌────────────────────────────────────────────┐
│    Frontend: Display Report Data           │
│                                            │
│  • Show report table                       │
│  • Update charts/graphs                    │
│  • Enable export button                    │
└────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────┐
│   Request sent to backend                │
└────────────┬────────────────────────────┘
             ↓
        ❌ Possible Errors:

        401 Unauthorized
        ├─ Token missing
        ├─ Token expired
        ├─ Invalid signature
        └─ → Response Interceptor
            ├─ Try to refresh token
            ├─ If success: Retry request ✅
            └─ If fail: Redirect to login ❌

        403 Forbidden
        ├─ User lacks required role
        ├─ Cannot refresh (no valid refresh token)
        └─ → Show error message ❌

        500 Server Error
        ├─ Database error
        ├─ Logic error
        └─ → Show error message ❌

        Network Error
        ├─ No connection
        ├─ Timeout
        └─ → Show error message ❌
```

## Role-Based Access

```
Endpoint: GET /api/dashboard/stats
├─ Authentication: ✅ Required (requireAuth)
└─ Authorization: ❌ None (any authenticated user)
   └─ Result: Any logged-in user can access

Endpoint: GET /api/dashboard/summary
├─ Authentication: ✅ Required (requireAuth)
└─ Authorization: ✅ Required (requireRole)
   ├─ MANAGER: ✅ Access
   ├─ OWNER: ✅ Access
   ├─ WAITER: ❌ 403 Forbidden
   └─ CHEF: ❌ 403 Forbidden

Endpoint: GET /api/reports/sales
├─ Authentication: ✅ Required (requireAuth)
└─ Authorization: ✅ Required (requireRole)
   ├─ MANAGER: ✅ Access
   ├─ OWNER: ✅ Access
   ├─ BRAND_ADMIN: ❌ 403 Forbidden
   ├─ WAITER: ❌ 403 Forbidden
   └─ CHEF: ❌ 403 Forbidden

Endpoint: GET /api/reports/monthly-pl
├─ Authentication: ✅ Required (requireAuth)
└─ Authorization: ✅ Required (requireRole)
   ├─ OWNER: ✅ Access (only owner!)
   ├─ MANAGER: ❌ 403 Forbidden
   ├─ WAITER: ❌ 403 Forbidden
   └─ CHEF: ❌ 403 Forbidden
```

---

This diagram shows the complete flow from browser request through backend processing to response rendering!
