# 🚚 DELIVERY ORDERS - SYSTEM ARCHITECTURE & FLOW

---

## 📐 SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                       EXTERNAL PLATFORMS                        │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐      │
│  │   SWIGGY     │    │   ZOMATO     │    │   CUSTOM    │      │
│  │   (REST API) │    │  (REST API)  │    │ (REST API)  │      │
│  └──────────────┘    └──────────────┘    └─────────────┘      │
└────────┬─────────────────────┬──────────────────────┬──────────┘
         │                     │                      │
         │ Webhook            │ Webhook              │ API Call
         ↓                     ↓                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Node.js/Express)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              API Routes (delivery.route.js)             │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ POST   /restaurants/:id/delivery/orders       (Create) │  │
│  │ GET    /restaurants/:id/delivery/orders       (List)   │  │
│  │ PATCH  /restaurants/:id/delivery/orders/:id/status     │  │
│  │ POST   /restaurants/:id/delivery/orders/:id/assign     │  │
│  │ PATCH  /restaurants/:id/delivery/orders/:id/location   │  │
│  │ POST   /delivery/webhook                    (Webhook)  │  │
│  │ GET    /restaurants/:id/delivery/summary    (Analytics)│  │
│  └─────────────────────────────────────────────────────────┘  │
│            ↓                                        ↓            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │       Controller (delivery.controller.js)               │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ • createDeliveryOrderController                         │ │
│  │ • listDeliveryOrdersController                          │ │
│  │ • updateDeliveryOrderStatusController                   │ │
│  │ • assignDeliveryPartnerController                       │ │
│  │ • updateDeliveryPartnerLocationController               │ │
│  │ • getDeliveryPartnerOrdersController                    │ │
│  │ • completeDeliveryController                            │ │
│  │ • cancelDeliveryOrderController                         │ │
│  │ • getDeliveryOrdersSummaryController                    │ │
│  │ • platformWebhookController                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│            ↓                                        ↓            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │         Database (MongoDB - deliveryOrder)              │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ • DeliveryOrder Collection (indexed)                   │ │
│  │ • Order details, customer info, items                  │ │
│  │ • Delivery partner assignment, tracking                │ │
│  │ • Payment status, feedback, analytics                  │ │
│  └──────────────────────────────────────────────────────────┘ │
│            ↓                                        │            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │         Socket.io Emitter (emitter.js)                 │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ Real-time events emitted:                              │ │
│  │ • delivery:order-received                              │ │
│  │ • delivery:status-updated                              │ │
│  │ • delivery:partner-assigned                            │ │
│  │ • delivery:location-updated (GPS)                      │ │
│  │ • delivery:delivered                                   │ │
│  │ • delivery:cancelled                                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                           ↓                                     │
└─────────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ↓             ↓             ↓
         ┌─────────┐   ┌─────────┐   ┌──────────┐
         │ Kitchen │   │ Manager │   │ Delivery │
         │ Display │   │ App     │   │ Partner  │
         │ System  │   │         │   │ App      │
         └─────────┘   └─────────┘   └──────────┘
              ↓             ↓             ↓
         ┌─────────────────────────────────────┐
         │   Frontend (React with Socket.io)   │
         │  (client/src/hooks/useDeliveryOrders) │
         └─────────────────────────────────────┘
```

---

## 🔄 ORDER LIFECYCLE FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                   ORDER CREATION                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Swiggy/Zomato Order  →  Platform API/Webhook                 │
│         │                     │                                 │
│         └─────────────────────┤                                │
│                               ↓                                 │
│                  createDeliveryOrderController                 │
│                               ↓                                 │
│                    Validate items & prices                      │
│                               ↓                                 │
│                  Create DeliveryOrder document                 │
│                               ↓                                 │
│                  Emit: delivery:order-received                 │
│                               ↓                                 │
│                  Socket broadcast to kitchen                   │
│                          Status: NEW                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                   KITCHEN PREPARATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Kitchen staff see order on display system                    │
│                               ↓                                 │
│       Update items status: NEW → IN_PROGRESS                  │
│                               ↓                                 │
│   updateDeliveryOrderStatusController                          │
│   Status: PREPARING                                            │
│                               ↓                                 │
│   Emit: delivery:status-updated to managers                   │
│                               ↓                                 │
│   Continue preparing items...                                  │
│                               ↓                                 │
│   Mark items as: IN_PROGRESS → READY → PACKED                │
│                               ↓                                 │
│   Update order status: READY_FOR_PICKUP                       │
│                               ↓                                 │
│   Emit: delivery:ready-for-pickup                             │
│   Kitchen done, waiting for delivery partner                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│              DELIVERY PARTNER ASSIGNMENT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Manager assigns delivery partner to order                    │
│                               ↓                                 │
│   assignDeliveryPartnerController                              │
│                               ↓                                 │
│   Validate delivery partner ID & availability                 │
│                               ↓                                 │
│   Update order with:                                           │
│   • deliveryPartner {userId, name, phone, rating}            │
│   • orderStatus: CONFIRMED                                    │
│   • estimatedDeliveryTime                                     │
│                               ↓                                 │
│   Emit: delivery:partner-assigned                             │
│                               ↓                                 │
│   Delivery partner receives notification                       │
│   in their mobile app (Socket.io)                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                 DELIVERY PARTNER PICKUP                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Delivery partner arrives at restaurant                       │
│                               ↓                                 │
│   updateDeliveryOrderStatusController                          │
│   Status: PICKED_UP                                            │
│                               ↓                                 │
│   Emit: delivery:picked-up                                    │
│   Order handover complete                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                  IN-TRANSIT DELIVERY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   updateDeliveryOrderStatusController                          │
│   Status: OUT_FOR_DELIVERY                                    │
│                               ↓                                 │
│   Delivery partner starts real-time GPS tracking               │
│                               ↓                                 │
│   updateDeliveryPartnerLocationController (repeated)           │
│   Latitude: 28.6149, Longitude: 77.2100                       │
│   Timestamp: current time                                      │
│                               ↓                                 │
│   Emit: delivery:location-updated                             │
│   (every 30-60 seconds during transit)                        │
│                               ↓                                 │
│   Customer receives real-time location on map                 │
│   (via Socket.io listener)                                    │
│                               ↓                                 │
│   When partner is close to delivery address:                   │
│   Status: NEARBY                                               │
│   Emit: delivery:nearby (notify customer)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────┐
│                   ORDER DELIVERY                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Delivery partner delivers order to customer                  │
│                               ↓                                 │
│   completeDeliveryController                                   │
│   Status: DELIVERED                                            │
│                               ↓                                 │
│   Update:                                                       │
│   • deliveryTracking.deliveredAt: current timestamp           │
│   • feedback.deliveryRating: partner rating (1-5)            │
│   • feedback.deliveryReview: customer review                 │
│   • feedback.feedbackAt: current timestamp                   │
│                               ↓                                 │
│   Emit: delivery:delivered                                    │
│                               ↓                                 │
│   Update delivery partner stats:                               │
│   • Orders completed                                           │
│   • Average rating                                             │
│   • Performance metrics                                        │
│                               ↓                                 │
│   Order lifecycle complete                                     │
│   (Ready for next order)                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔴 ALTERNATIVE FLOWS

### Cancellation Flow

```
Order @ any status
     ↓
cancelDeliveryOrderController
     ↓
Update: orderStatus = CANCELLED
        cancelledBy = CUSTOMER/RESTAURANT/DELIVERY_PARTNER
        cancelledAt = current timestamp
        cancelledReason = "reason"
     ↓
Emit: delivery:cancelled
     ↓
Process refund (if applicable)
     ↓
Update refundStatus = PENDING/PROCESSED
     ↓
Order removed from active lists
```

### Failed Delivery Flow

```
Order @ OUT_FOR_DELIVERY
     ↓
updateDeliveryOrderStatusController
     ↓
Update: orderStatus = FAILED
        cancelledReason = "Unable to deliver"
     ↓
Emit: delivery:failed
     ↓
Initiate return to restaurant
     ↓
Process refund
     ↓
Manager decides:
- Retry with different partner
- Full refund
- Credit to customer account
```

---

## 🔌 SOCKET EVENTS FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│              SOCKET.IO EVENT BROADCASTING                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Event: delivery:order-received                                │
│  Emitted: createDeliveryOrderController                         │
│  Broadcast to: Kitchen display system                          │
│  Payload: { deliveryOrder, restaurantId }                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Kitchen staff see: New order #PLD-xxx                 │   │
│  │ Items: [Butter Chicken (2), Naan (2)]                │   │
│  │ Customer: Rajesh Kumar, 9876543210                    │   │
│  │ Delivery to: Main Street, Delhi                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                               ↓                                 │
│  Event: delivery:status-updated                                │
│  Emitted: updateDeliveryOrderStatusController                 │
│  Broadcast to: Managers, restaurant staff                     │
│  Payload: { deliveryOrder, restaurantId }                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Order status changed: PREPARING                        │   │
│  │ Items in progress, ETA: 15 minutes                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                               ↓                                 │
│  Event: delivery:partner-assigned                              │
│  Emitted: assignDeliveryPartnerController                      │
│  Broadcast to: Delivery partner app                            │
│  Payload: { deliveryOrder, restaurantId }                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ New assignment! Order #PLD-xxx                         │   │
│  │ Restaurant: Pizza House                                │   │
│  │ Delivery location: Main Street                         │   │
│  │ Distance: 3.2 km                                       │   │
│  │ ETA: 12 minutes                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                               ↓                                 │
│  Event: delivery:location-updated                              │
│  Emitted: updateDeliveryPartnerLocationController              │
│  Broadcast to: Customer app (real-time map)                   │
│  Payload: { orderId, location: {lat, lng} }                   │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Partner location: 28.6149, 77.2100                    │   │
│  │ Distance remaining: 1.2 km                             │   │
│  │ ETA: 3 minutes                                         │   │
│  └────────────────────────────────────────────────────────┘   │
│                               ↓                                 │
│  Event: delivery:nearby                                        │
│  Emitted: updateDeliveryOrderStatusController                 │
│  Broadcast to: Customer notifications                         │
│  Payload: { deliveryOrder, restaurantId }                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Partner is nearby!                                      │   │
│  │ Name: Amit Sharma                                       │   │
│  │ Vehicle: Bike                                           │   │
│  │ Number: DL01AB1234                                      │   │
│  │ Rating: 4.8★                                            │   │
│  └────────────────────────────────────────────────────────┘   │
│                               ↓                                 │
│  Event: delivery:delivered                                     │
│  Emitted: completeDeliveryController                           │
│  Broadcast to: Managers, customer app                         │
│  Payload: { deliveryOrder, restaurantId }                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Order delivered successfully! ✅                        │   │
│  │ Delivered at: 2024-01-24 10:38:00                      │   │
│  │ Delivery time: 35 minutes                              │   │
│  │ Partner rating: 5/5 ⭐                                  │   │
│  │ Feedback: "Excellent service"                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 DATA FLOW THROUGH SYSTEM

```
External Platform (Swiggy/Zomato)
        │
        │ Order data
        ↓
┌───────────────────────────────────────┐
│   API Endpoint / Webhook Receiver    │
│   POST /api/delivery/webhook         │
│   or                                  │
│   POST /restaurants/:id/delivery/..  │
└───────────────────────────────────────┘
        │
        │ JSON payload
        ↓
┌───────────────────────────────────────┐
│   Input Validation                    │
│   • Phone format check                │
│   • Items exist?                      │
│   • Coordinates valid?                │
│   • Items in stock?                   │
└───────────────────────────────────────┘
        │
        │ Validated data
        ↓
┌───────────────────────────────────────┐
│   DeliveryOrder Model                 │
│   • Create document                   │
│   • Calculate totals                  │
│   • Generate order ID                 │
│   • Create status timeline            │
└───────────────────────────────────────┘
        │
        │ Saved to DB
        ↓
┌───────────────────────────────────────┐
│   Socket.io Emitter                   │
│   • Emit delivery:order-received      │
│   • Send to kitchen rooms             │
│   • Notify managers                   │
└───────────────────────────────────────┘
        │
        │ Real-time broadcast
        ├─────────────────────┬─────────────────┐
        ↓                     ↓                 ↓
   Kitchen         Manager App         API Response
   Display         Updates list        Returns to
   System          Shows notification  client with
   Shows order     Refreshes data      order details
   to chefs                            & ID
```

---

## 🌐 PLATFORM INTEGRATION MAPPING

### Swiggy → DeliveryOrder

```
Swiggy API Response         →  DeliveryOrder Field
──────────────────────────────────────────────────
order_id                    →  platformOrderId
customer.first_name         →  customerName
customer.phone_number       →  customerPhone
customer.email              →  customerEmail
location.address            →  deliveryAddress.fullAddress
location.lat/lng            →  deliveryAddress.coordinates
location.city               →  deliveryAddress.city
location.pincode            →  deliveryAddress.postalCode
items[]                     →  items[]
order_subtotal              →  itemsSubtotal
delivery_charge             →  deliveryCharges
taxes                       →  tax
order_total                 →  totalAmount
payment_method              →  paymentMethod
"SWIGGY"                    →  platform
```

### Zomato → DeliveryOrder

```
Zomato API Response         →  DeliveryOrder Field
──────────────────────────────────────────────────
order_hash                  →  platformOrderId
customer_name               →  customerName
customer_phone              →  customerPhone
customer_email              →  customerEmail
delivery_address            →  deliveryAddress.fullAddress
latitude/longitude          →  deliveryAddress.coordinates
city                        →  deliveryAddress.city
postal_code                 →  deliveryAddress.postalCode
order_items[]               →  items[]
subtotal                    →  itemsSubtotal
delivery_fee                →  deliveryCharges
taxes                       →  tax
bill_amount                 →  totalAmount
payment_mode                →  paymentMethod
"ZOMATO"                    →  platform
```

---

## 📊 DATABASE SCHEMA RELATIONSHIPS

```
Restaurant
    │
    ├─→ DeliveryOrder (One-to-Many)
    │   │
    │   ├─→ BranchMenuItem (via items[].branchMenuItemId)
    │   │
    │   └─→ User (via deliveryPartner.userId)
    │       └─→ DeliveryPartner role
    │
    ├─→ Bill (separate)
    │
    ├─→ Order (in-house orders)
    │
    └─→ User (Staff: MANAGER, CHEF, WAITER, etc.)
```

---

## 🔐 ROLE-BASED ACCESS MATRIX

```
                    Manager  Chef  Waiter  Cashier  Partner  Admin
Create              ✅       ❌    ❌      ❌       ❌       ✅
List orders         ✅       ✅    ✅      ✅       ❌       ✅
View details        ✅       ✅    ✅      ✅       ⚠️*      ✅
Update status       ✅       ⚠️*   ❌      ❌       ✅       ✅
Assign partner      ✅       ❌    ❌      ❌       ❌       ✅
Update location     ❌       ❌    ❌      ❌       ✅       ❌
Complete delivery   ✅       ❌    ❌      ❌       ✅       ✅
Cancel order        ✅       ❌    ❌      ❌       ⚠️*      ✅
View analytics      ✅       ❌    ❌      ❌       ❌       ✅

Legend:
✅ = Full access
⚠️ = Limited access (own orders only)
❌ = No access
* = Partner: only assigned orders
* = Partner: own assigned orders only
```

---

## ⏱️ TYPICAL ORDER TIMELINE

```
T+0min    Order placed on Swiggy
          └─→ Webhook received
          └─→ Order created in DB
          └─→ Kitchen notified (socket)
          └─→ Status: NEW

T+2min    Kitchen starts preparing
          └─→ Status: PREPARING
          └─→ Items status: IN_PROGRESS

T+12min   All items ready
          └─→ Status: READY_FOR_PICKUP
          └─→ Items status: READY

T+15min   Delivery partner assigned
          └─→ Status: CONFIRMED
          └─→ Partner notified (socket)
          └─→ ETA: 20 minutes

T+18min   Delivery partner arrives
          └─→ Status: PICKED_UP
          └─→ Items packed and handed over

T+19min   Partner starts delivery
          └─→ Status: OUT_FOR_DELIVERY
          └─→ GPS tracking started
          └─→ Customer tracking enabled

T+30min   Partner is near
          └─→ Status: NEARBY
          └─→ Customer notified

T+33min   Order delivered
          └─→ Status: DELIVERED
          └─→ Customer feedback collected
          └─→ Partner rating updated
          └─→ Order complete ✅

Total time: 33 minutes (from order to delivery)
```

---

## 🎨 COMPONENT HIERARCHY

```
App
├── RestaurantContext (restaurantId)
│
├── DeliveryDashboard
│   └── useDeliveryOrders hook
│       ├── API calls (delivery.api.js)
│       ├── Socket listeners
│       ├── State management
│       └── Real-time updates
│
├── OrderList
│   ├── useDeliveryOrders
│   └── OrderCard (for each order)
│       ├── Order details
│       ├── Status display
│       ├── Partner info
│       └── Action buttons
│
├── DeliveryPartnerApp
│   └── useDeliveryOrders hook
│       ├── getPartnerOrders()
│       ├── updatePartnerLocation()
│       ├── completeDelivery()
│       └── Socket: location-updated
│
└── CustomerTracking
    └── useDeliveryOrders hook
        ├── getDeliveryOrderDetail()
        ├── Socket listeners
        │   ├── location-updated (map)
        │   ├── status-updated
        │   └── delivered
        └── Real-time map display
```

---

## 📈 ANALYTICS & REPORTING FLOW

```
DeliveryOrder Collection
    │
    ├─→ Aggregation Pipeline 1: Daily Orders
    │   └─→ Group by date, sum amounts
    │
    ├─→ Aggregation Pipeline 2: Platform Stats
    │   └─→ Group by platform (SWIGGY, ZOMATO, CUSTOM)
    │       └─→ Sum revenue, count orders
    │
    ├─→ Aggregation Pipeline 3: Delivery Time
    │   └─→ Filter by status=DELIVERED
    │       └─→ Calculate duration
    │       └─→ Average delivery time
    │
    ├─→ Aggregation Pipeline 4: Partner Performance
    │   └─→ Group by deliveryPartner.userId
    │       └─→ Count orders, avg rating
    │       └─→ Orders/day, success rate
    │
    └─→ Dashboard Display
        ├── Total orders (count)
        ├── Completion rate (%)
        ├── Avg delivery time (mins)
        ├── Revenue by platform
        ├── Payment breakdown
        └── Partner performance
```

---

**Architecture Complete** ✅  
**All flows documented** ✅  
**System ready for deployment** ✅
