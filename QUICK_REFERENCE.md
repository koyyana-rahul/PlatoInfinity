# 🔗 PLATO MENU - QUICK REFERENCE CARD

## 📍 Key URLs & Endpoints

### Frontend Routes
```
Customer Flow
/menu/:brandSlug/:restaurantSlug/:tableId    → CustomerMenuApp (QR menu)

Staff Apps
/staff/waiter-app                             → WaiterApp (table service + PIN)
/staff/chef-kitchen                           → ChefKitchenApp (kitchen tablet)
/staff/cashier-counter                        → CashierApp (payments)

Admin Dashboards
/:brandSlug/admin/dashboard                   → AdminDashboard (platform KPIs)
/:brandSlug/:restaurantSlug/manager           → ManagerDashboard (branch ops)
```

### Backend API Endpoints

**Authentication (Staff)**
```
POST   /api/auth/staff/pin-login              → Login with code + PIN
POST   /api/auth/staff/pin-logout             → Logout
GET    /api/auth/staff/me                     → Current staff profile
POST   /api/auth/staff/confirm-action         → Verify PIN for actions
POST   /api/auth/staff/reset-pin              → Reset PIN via WhatsApp
POST   /api/auth/staff/change-pin             → Update PIN
```

**Orders**
```
POST   /api/order                             → Place order (with fraud check)
GET    /api/order/:orderId                    → Get order + progress metrics
PUT    /api/order/:orderId/approve            → Approve suspicious order
PUT    /api/order/:orderId/reject             → Reject suspicious order
GET    /api/session/:sessionId/orders         → Get session orders
```

**Suspicious Orders**
```
GET    /api/suspicious                        → List suspicious orders
GET    /api/suspicious?filter=PENDING_APPROVAL → Filter by status
```

**Kitchen**
```
POST   /api/kitchen/claim                     → Chef claims item
POST   /api/kitchen/mark-ready                → Mark item ready
```

**Payments**
```
POST   /api/payment/razorpay                  → Process UPI payment
POST   /api/payment/cash                      → Record cash payment
```

**Bills**
```
GET    /api/bill/:billId                      → Get bill details
POST   /api/bill/:billId/whatsapp             → Share via WhatsApp
```

---

## 🔌 Socket.io Events

### Real-Time Events Emitted

**To Customers**
```
order:placed                                  → Order confirmation
order:started                                 → Kitchen began order
item:ready                                    → Item ready for serving
order:completed                               → All items ready
bill:generated                                → Billing started
payment:received                              → Payment confirmed
```

**To Waiters**
```
order:new                                     → New order from customer
item:ready                                    → Item ready to serve
refund:initiated                              → Refund started
```

**To Chefs/Kitchen**
```
order:routed                                  → Order for station
item:claimed                                  → Chef claimed item (IN_PROGRESS)
item:ready                                    → Item marked ready
order:cancelled                               → Order cancelled midway
```

**To Managers/Admins**
```
fraud:alert                                   → Suspicious order detected
order:placed                                  → Regular order placed
payment:received                              → Payment received
staff:login                                   → Staff member logged in
```

---

## 🗄️ Database Collections

```
users                       → All system users (staff, admins)
restaurants                 → Branch/location info
sessions                    → Customer table sessions
orders                      → Order details
suspiciousOrders            → Fraud-flagged orders
bills                       → Billing info
cartItems                   → Shopping cart
kitchenStations             → Station definitions
masterMenuItems             → Menu items master
branchMenuItems             → Branch-specific menu
payments                    → Payment transactions
refunds                     → Refund records
auditLog                    → All action logs
```

---

## 🎯 Fraud Detection Rules

| Rule | Condition | Action |
|------|-----------|--------|
| HIGH_QUANTITY | Qty > 10 | Flag (20 pts) |
| PRICE_ANOMALY | Price > 5x avg | Flag (25 pts) |
| SPEED_ANOMALY | Placed < 10s | Flag (15 pts) |
| TIME_ANOMALY | Off-hours order | Flag (15 pts) |
| PATTERN_ANOMALY | Bulk same item | Flag (20 pts) |
| ZERO_AMOUNT | Amount = ₹0 | Flag (30 pts) |

**Score ≥ 50 → PENDING_APPROVAL**

---

## 🔑 Environment Variables Required

```bash
# Server (.env)
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=+91xxxxx
WHATSAPP_BUSINESS_PHONE_ID=your_phone_id
WHATSAPP_BUSINESS_API_TOKEN=your_api_token
FRAUD_DETECTION_ENABLED=true
FRAUD_ALERT_THRESHOLD=50
```

---

## 📦 Dependencies

### Frontend (client/package.json)
```json
{
  "react": "^19.0.0",
  "react-router-dom": "^7.0.0",
  "redux": "^4.2.0",
  "socket.io-client": "^4.7.0",
  "tailwindcss": "^3.3.0",
  "axios": "^1.6.0",
  "react-hot-toast": "^2.4.0",
  "i18next": "^23.0.0"
}
```

### Backend (server/package.json)
```json
{
  "express": "^5.0.0",
  "mongoose": "^8.0.0",
  "socket.io": "^4.7.0",
  "jsonwebtoken": "^9.1.0",
  "bcryptjs": "^2.4.0",
  "razorpay": "^2.9.0",
  "twilio": "^3.88.0",
  "multer": "^1.4.5"
}
```

---

## 🚀 Startup Commands

```bash
# Development Mode
cd server && npm run dev &          # Backend on 8080
cd client && npm run dev            # Frontend on 5173

# Production Build
cd client && npm run build          # Creates dist/
cd server && NODE_ENV=production npm start

# With Docker
docker-compose up                   # Starts all services
```

---

## 🧪 Testing Key Flows

### Customer Flow
```
1. Go to: http://localhost:5173/menu/testbrand/testrestaurant/table1
2. Browse items → Add to cart
3. Call waiter → Waiter approves
4. Enter PIN → Place order
5. See kitchen progress → Get bill
6. Pay via Cashier
```

### Fraud Alert Flow
```
1. Place order with qty > 10
2. Manager should see fraud alert
3. Manager approves/rejects
4. Kitchen receives order or cancel
```

### Staff App Flow
```
1. Waiter: /staff/waiter-app
2. Enter staff code + PIN
3. See pending carts → Approve
4. Chef: /staff/chef-kitchen
5. See orders → Claim → Mark ready
```

---

## 🔍 Debug Checklist

- [ ] MongoDB connected? (check `server` logs)
- [ ] Socket.io connected? (check browser console)
- [ ] All .env variables set? (check `server/.env`)
- [ ] Ports available? (8080 backend, 5173 frontend)
- [ ] Node modules installed? (rm -rf node_modules && npm install)
- [ ] JWT tokens valid? (check expiry times)
- [ ] PIN hashing working? (order > fraudDetection > suspicious)

---

## 📊 Schema Highlights

### Order Document
```javascript
{
  _id: ObjectId,
  orderNumber: "ORD-001",
  sessionId: ObjectId,
  restaurantId: ObjectId,
  items: [{
    menuItemId: ObjectId,
    quantity: 2,
    kitchenStation: "TANDOOR_STATION",
    status: "IN_PROGRESS"
  }],
  totalAmount: 450,
  status: "OPEN" | "PENDING_APPROVAL" | "CONFIRMED",
  fraudMetadata: {
    isFraudulent: false,
    fraudScore: 15,
    fraudReasons: ["SPEED_ANOMALY"],
    recommendedAction: "APPROVE"
  },
  createdAt: Date,
  updatedAt: Date
}
```

### SuspiciousOrder Document
```javascript
{
  _id: ObjectId,
  orderId: ObjectId,
  fraudScore: 75,
  fraudReasons: ["HIGH_QUANTITY", "PRICE_ANOMALY"],
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED",
  approvalDetails: {
    approvedBy: ObjectId,
    rejectionReason: "Unusual amount",
    timestamp: Date
  },
  createdAt: Date
}
```

---

## 🎨 Component Tree

```
App.jsx
├── Router
│   ├── CustomerMenuApp (/:brandSlug/:restaurantSlug/:tableId)
│   ├── WaiterApp (/staff/waiter-app)
│   ├── ChefKitchenApp (/staff/chef-kitchen)
│   ├── CashierApp (/staff/cashier-counter)
│   ├── ManagerDashboard (/:brandSlug/:restaurantSlug/manager)
│   └── AdminDashboard (/:brandSlug/admin/dashboard)

Frontend Modules
├── Customer (Menu browsing)
├── Staff (PIN auth, apps)
├── Manager (Operations)
└── Admin (Platform KPIs)

State Management
├── Redux Store
│   ├── Auth (user token, staff)
│   ├── Order (current order)
│   ├── Cart (items)
│   └── Session (table info)
└── Local State (UI)

Real-Time
├── Socket.io Connection
└── Event Listeners (order, fraud, payment)
```

---

## 🧠 Key State Shapes

```javascript
// Redux Auth
auth: {
  user: { id, email, role, restaurantId },
  token: "jwt_token",
  isAuthenticated: true
}

// Redux Order
order: {
  currentOrder: { id, items[], total, status },
  fraudMetadata: { score, reasons, action }
}

// Redux Cart
cart: {
  items: [{ menuItemId, quantity, price }],
  subtotal: 450
}

// Local State - ManagerDashboard
const [suspiciousOrders, setSuspiciousOrders] = useState([])
const [fraudAlerts, setFraudAlerts] = useState([])
```

---

## 🔄 API Response Format

```javascript
// Success Response
{
  success: true,
  data: { /* response payload */ },
  message: "Operation successful"
}

// Error Response
{
  success: false,
  message: "Error description",
  code: "ERROR_CODE"
}

// Socket Event
io.emit("event-name", {
  orderId: "...",
  timestamp: Date,
  /* other payload */
})
```

---

## 🎯 Most Important Files

**MUST KNOW:**
- `server/controller/order.controller.js` - 12-step order flow
- `server/utils/fraudDetection.js` - Fraud detection engine
- `client/src/modules/customer/CustomerMenuApp.jsx` - Main customer flow
- `client/src/modules/manager/ManagerDashboard.jsx` - Fraud management
- `server/route/auth.route.js` - Staff authentication

**IMPORTANT CONFIG:**
- `server/.env` - All credentials
- `client/src/i18n/translations.js` - Language strings
- `server/models/order.model.js` - Order schema

---

## ⚡ Performance Tips

1. **Database Queries**
   - Use `.lean()` for read-only queries
   - Add indexes on frequently searched fields
   - Paginate results (limit: 20)

2. **Socket.io**
   - Use rooms for broadcasting (restaurant:id:role)
   - Emit only changed data
   - Implement acknowledgments for critical updates

3. **Frontend**
   - Lazy load modules/components
   - Use React.memo for expensive renders
   - Debounce search inputs

4. **Caching**
   - Cache menu items (rarely change)
   - Cache translation keys
   - Cache user session data

---

## 🔐 Security Checklist

- [ ] All passwords hashed (bcryptjs salt 10)
- [ ] JWT secrets long & random (>30 chars)
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] No sensitive data in logs
- [ ] Database backups enabled
- [ ] HTTPS in production
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS prevention (React escaping)

---

## 📞 Common Issues

| Issue | Solution |
|-------|----------|
| Socket not connecting | Check CORS in server, port 8080 open |
| Fraud detection not running | Check FRAUD_DETECTION_ENABLED=true |
| Menu not loading | Verify menu items in DB, check brand slug |
| Staff PIN not working | Check bcryptjs version, verify PIN format |
| WhatsApp not sending | Check Twilio credentials, verify phone format |
| Orders not appearing | Check Socket.io event names, listener setup |

---

**Quick Reference Card v1.0 | Plato Menu**  
Keep this handy while developing!
