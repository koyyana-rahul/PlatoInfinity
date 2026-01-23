# PLATO MENU - COMPREHENSIVE CODEBASE ANALYSIS

## 📋 Project Overview

**PLATO** is a full-stack restaurant management system built with:

- **Frontend:** React 19, Vite, Redux Toolkit, Tailwind CSS, Socket.io Client
- **Backend:** Node.js/Express 5, MongoDB, Socket.io Server
- **Deployment:** Vercel (Frontend) + Custom Server (Backend)
- **Live Domain:** https://platoinfinity.xyz

This is a sophisticated **multi-role restaurant POS (Point of Sale) and menu management system** with real-time features, kitchen operations, billing, and customer dining experiences.

---

## 🏗️ ARCHITECTURE OVERVIEW

```
PLATO_MENU/
├── client/                    # React Frontend (Vite + TailwindCSS)
│   ├── src/
│   │   ├── api/              # Axios instance + API endpoints
│   │   ├── app/              # Redux store + routing + providers
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── modules/          # Feature modules by role
│   │   ├── socket/           # Socket.io client logic
│   │   ├── store/            # Redux slices
│   │   ├── utils/            # Helper utilities
│   │   └── main.jsx          # Entry point
│   └── package.json          # React dependencies
│
└── server/                    # Express Backend (Node.js)
    ├── controller/           # Business logic handlers
    ├── models/               # MongoDB schemas
    ├── route/                # API routes
    ├── middleware/           # Auth, validation, error handling
    ├── services/             # Utility services (PDF, WhatsApp, Reports)
    ├── socket/               # Real-time Socket.io logic
    ├── config/               # DB, upload, email configs
    ├── jobs/                 # Cron jobs (session timeout)
    ├── utils/                # Helper functions
    ├── cron.js              # Cron job scheduler
    └── index.js             # Server entry point
```

---

## 🎯 CORE FEATURES & BUSINESS LOGIC

### 1. **Authentication & Authorization**

- **Roles:** BRAND_ADMIN, MANAGER, CHEF, WAITER, CASHIER
- **Auth Methods:**
  - Email/Password login with JWT tokens
  - Access Token (15 min) + Refresh Token (30 days)
  - Email verification with OTP
  - Password reset flow
  - Google OAuth integration
  - Session tokens for customer QR/PIN access

**Key Files:**

- [server/controller/auth.controller.js](server/controller/auth.controller.js) - 730 lines of auth logic
- [server/middleware/requireAuth.js](server/middleware/requireAuth.js) - JWT validation
- [server/middleware/requireRole.js](server/middleware/requireRole.js) - Role-based access control

### 2. **Restaurant Management**

- **Multi-brand, Multi-restaurant Structure**
  - Brands own multiple restaurants
  - Managers oversee specific restaurants
  - Staff assigned to restaurants

**Models:**

- `brand.model.js` - Brand/chain information
- `restaurant.model.js` - Individual restaurant details
- `user.model.js` - Users with role-based access

### 3. **Menu Management**

- **Master Menu** (brand-level templates)
- **Branch Menu** (restaurant-specific menu items with pricing)
- **Categories & Subcategories** - Hierarchical organization
- **Modifiers** - Customizable options for items
- **Stock Management** - Track available items

**Models:**

- `masterMenuItem.model.js`
- `branchMenuItem.model.js`
- `menuCategory.model.js`
- `menuSubcategory.model.js`

### 4. **Table & Session Management**

- **Tables** - Physical tables in restaurant
- **Sessions** - Customer dining sessions tied to tables
- **Session Tokens** - Generated for customer access via QR/PIN
- **Table PIN** - 4-digit code for customer verification

**Key Logic:**

```javascript
// Session creation for table
sessionSchema.statics.createForTable = async function ({
  restaurantId, tableId, openedByUserId
})
```

**Models:**

- `table.model.js`
- `session.model.js`
- `sessionToken.model.js`

### 5. **Order Management**

- **Order Creation** - Items added to cart for a session
- **Real-time Kitchen Updates** - Orders sent to kitchen stations
- **Order Status Tracking:**
  - NEW → IN_PROGRESS → READY → SERVED → CANCELLED
- **Item-level Status** - Each item has independent status
- **Chef Assignment** - Chefs claim items from queue

**Models:**

- `order.model.js` - Main order document with items
- `kitchenStation.model.js` - Kitchen station organization
- `kitchenActivity.model.js` - Activity logs for kitchen

### 6. **Billing System**

- **Bill Generation** - Per session/table
- **Item Snapshots** - Captures order state at billing time
- **Payments** - Cash, Card, UPI support
- **Refunds** - Partial/full refund tracking
- **Tax Calculation** - Per-item and bill-level taxes
- **Idempotency** - Prevent duplicate bills

**Key Concepts:**

```javascript
// One bill per session (unique constraint)
sessionId: {
  unique: true;
}

// Bill captures item snapshots
items: [{ orderId, name, quantity, rate, taxPercent, lineTotal }];
```

**Models:**

- `bill.model.js`
- `payment.model.js`
- `refund.model.js`
- `idempotencyKey.model.js`

### 7. **Real-time Features (Socket.io)**

- **Customer Live Updates** - Menu changes, order status
- **Waiter Real-time Sync** - Table assignments, order updates
- **Chef Kitchen Queue** - Real-time order assignments
- **Cashier Notifications** - Bills ready for payment

**Architecture:**

```javascript
// Rooms
restaurant:{restaurantId}           // All staff
restaurant:{restaurantId}:waiters   // Waiter-only
restaurant:{restaurantId}:station:{station} // Station-specific
```

**Socket Events:**

- `join:waiter` - Waiter joins room
- `join:customer` - Customer joins via session
- Order status updates
- Table assignments
- Menu sync notifications

---

## 🔐 AUTHENTICATION FLOW

### Staff Login (Email/Password)

```
1. POST /api/auth/login
2. Verify email & password
3. Generate JWT Access Token (15m) + Refresh Token (30d)
4. Set httpOnly cookies
5. Return user role and details
6. Middleware: requireAuth checks JWT validity
```

### Customer Session (QR/PIN)

```
1. Customer scans table QR code
2. Enters PIN (4-digit code)
3. POST /api/session/join-with-pin
4. Generate session token (hashed, expiry tracked)
5. Customer joins socket room: restaurant:{id}:customer:{sessionId}
```

### Protected Route Pattern

```javascript
requireAuth              // Verify JWT token
  ↓
requireRole(...)        // Check user role
  ↓
Controller Handler      // Execute business logic
```

---

## 📡 API ENDPOINTS STRUCTURE

```
/api/
├── auth/              # Authentication (login, register, refresh)
├── brand/             # Brand management (BRAND_ADMIN)
├── restaurants/       # Restaurant CRUD
├── restaurants/:id/managers/  # Manager assignment
├── staff/             # Staff management
├── shifts/            # Shift scheduling
├── branch-menu/       # Restaurant menu items
├── session/           # Table sessions
├── customer/          # Customer-facing menu
├── orders/            # Order management
├── kitchen/           # Kitchen operations
├── kitchen-stations/  # Station management
├── tables/            # Table management
├── cart/              # Cart operations
├── bills/             # Bill generation
├── payments/          # Payment processing
├── reports/           # Analytics & reports
├── waiter/            # Waiter operations
├── dashboard/         # Dashboard analytics
├── suspicious/        # Suspicious order detection
└── public/            # Public endpoints (no auth)
```

---

## 💾 DATABASE SCHEMA OVERVIEW

### Core Entities

**User**

```javascript
{
  name, email, password (hashed),
  role: [BRAND_ADMIN, MANAGER, CHEF, WAITER, CASHIER],
  brandId (ref), restaurantId (ref),
  staffCode, avatar, phone,
  isActive, lastLoginAt
}
```

**Session**

```javascript
{
  restaurantId, tableId, openedByUserId,
  tablePin, sessionTokenHash,
  customerTokens: [{tokenHash, expiresAt, lastActivityAt}],
  status: [OPEN, CLOSED],
  startedAt, closedAt, lastActivityAt,
  customerPhone, whatsappVerified
}
```

**Order**

```javascript
{
  restaurantId, sessionId, tableId,
  items: [{
    branchMenuItemId, name, price, quantity,
    selectedModifiers: [{title, optionName, price}],
    station, itemStatus, chefId, waiterId,
    claimedAt, readyAt, servedAt
  }],
  status: [DRAFT, PLACED, PARTIAL, COMPLETE],
  totalAmount, discountAmount, createdAt
}
```

**Bill**

```javascript
{
  restaurantId, sessionId (unique),
  items: [{orderId, orderItemIndex, name, quantity, rate, taxPercent, lineTotal}],
  subtotal, taxAmount, total,
  discountType, discountAmount,
  paymentStatus, paymentMode,
  billNumber, billDate, createdBy
}
```

---

## 🎨 FRONTEND ARCHITECTURE

### Module Structure

```
client/src/modules/
├── admin/          # Brand admin dashboard & management
├── auth/           # Login, registration, password reset
├── customer/       # Customer menu, cart, ordering
├── manager/        # Manager dashboard, staff, tables, reports
├── onboarding/     # Invite flow, registration
└── staff/          # Waiter, Chef, Cashier UIs
    ├── cashier/
    ├── chef/
    ├── waiter/
    └── login/
```

### State Management (Redux)

```
store/
├── auth/userSlice.js        # User auth state
├── brand/brandSlice.js      # Brand/restaurant info
└── customer/                # Customer-specific state
```

### API Layer

```
api/
├── axios.js                 # Axios instance with base URL logic
├── axios.interceptor.js     # Request/response interceptors
├── summaryApi.js            # Centralized endpoint definitions
├── auth.api.js, order.api.js, etc. # Feature-specific endpoints
```

### Components

- **UI Components:** Headers, sidebars, modals, forms
- **Address Module:** Pincode lookup, state/district selection
- **Waiter Module:** Table management, order display
- **Responsive Design:** Mobile-first with Tailwind CSS

### Socket Integration

```
socket/
├── SocketProvider.jsx       # React context for socket
└── (Event handlers in components)

// Usage
const socket = useSocket();
socket.emit('join:waiter', { restaurantId })
socket.on('order:new', handleNewOrder)
```

---

## 🔧 SERVER UTILITIES & SERVICES

### Services

1. **billPdf.service.js** - Generate PDF bills using PDFKit
2. **order.service.js** - Order business logic
3. **placeOrder.service.js** - Order creation with validation
4. **reports.service.js** - Analytics and reporting
5. **whatsapp.service.js** - WhatsApp integration
6. **address.service.js** - Location/address services

### Utilities

- **uploadImageClodinary.js** - Image upload to Cloudinary CDN
- **uploadQrToCloudinary.js** - QR code upload
- **generateTableQR.js** - QR code generation
- **generatePin.js** - 4-digit PIN generation
- **generateStaffCode.js** - Unique staff code generation
- **getInviteEmailTemplate.js** - Email template generation

### Configuration

- **connectDB.js** - MongoDB connection setup
- **cloudinary.js** - Cloudinary API configuration
- **multer.js** - Single file upload middleware
- **multerMultiImages.js** - Multiple file upload
- **platoBrand.js** - Brand/theme configuration
- **sendEmail.js** - Email sending setup (Resend)

---

## 🔄 REAL-TIME DATA FLOW

### Example: New Order to Kitchen to Bill

```
1. Customer places order via /api/orders
   ↓
2. Socket event emitted: 'order:new'
   ↓
3. Chef receives in socket: restaurant:{id}:station:{station}
   ↓
4. Chef claims item, status changes to IN_PROGRESS
   ↓
5. Socket update sent: 'order:item-status-updated'
   ↓
6. Waiter/Manager see update in real-time
   ↓
7. Chef marks ready, socket: 'order:item-ready'
   ↓
8. Waiter serves item
   ↓
9. Cashier generates bill: POST /api/bills
   ↓
10. Bill PDF generated & sent via email/WhatsApp
```

---

## 🔑 KEY CONCEPTS & PATTERNS

### 1. **Idempotency**

- `idempotencyKey` model prevents duplicate bill creation
- Clients send unique key with sensitive operations

### 2. **Session Security**

- Session tokens stored as SHA256 hashes
- Expiry management for customer access
- Per-token activity tracking

### 3. **Role-Based UI**

- Frontend renders different modules based on `user.role`
- Server validates all mutations with requireRole middleware
- Customer views never see admin/staff data

### 4. **Soft Deletes & Status Tracking**

- Entities use status enums instead of hard deletes
- Complete audit trail via timestamps
- `auditLog.model.js` for compliance

### 5. **Cron Jobs**

- Session timeout job runs every 15 minutes
- Closes inactive sessions (no activity for defined period)

### 6. **Email Notifications**

- Uses Resend for transactional emails
- Templates: Invite, verification, password reset, bills

---

## 🚀 DEPLOYMENT & ENVIRONMENT

### Frontend

- **Build:** Vite build to `/dist`
- **Hosting:** Vercel (via `vercel.json`)
- **CORS:** Configured for `platoinfinity.xyz`

### Backend

- **Server:** Express.js with Socket.io
- **Database:** MongoDB (connection via `MONGODB_URI`)
- **Static Files:** Serves built frontend from `../client/dist`
- **CORS:** Allows `platoinfinity.xyz` and `www.platoinfinity.xyz`

### Environment Variables Required

```
MONGODB_URI              # MongoDB connection string
JWT_SECRET              # Access token signing key
SECRET_KEY_REFRESH_TOKEN # Refresh token signing key
RESEND_API_KEY          # Email service API key
RESEND_FROM_EMAIL       # From email for transactional emails
CLOUDINARY_NAME         # Cloudinary account name
CLOUDINARY_API_KEY      # Cloudinary API key
CLOUDINARY_API_SECRET   # Cloudinary API secret
NODE_ENV                # development|production
```

---

## 📊 DATA RELATIONSHIPS

```
Brand (1) ──┬──> (Many) Restaurants
            └──> (Many) Users (BRAND_ADMIN)

Restaurant (1) ──┬──> (Many) Users (MANAGER, STAFF)
                ├──> (Many) Tables
                ├──> (Many) Sessions
                ├──> (Many) Orders
                ├──> (Many) Bills
                ├──> (Many) BranchMenuItems
                └──> (Many) KitchenStations

Session (1) ──┬──> (Many) Orders
              └──> (1) Bill

Order (1) ──┬──> (Many) OrderItems
            └──> (1) Bill (via billItems)

User (CHEF) ──> (Many) OrderItems (claimed items)
User (WAITER) ──> (Many) OrderItems (served items)
```

---

## 🎯 BUSINESS WORKFLOW EXAMPLES

### Opening a Table

```
Manager opens table → Session created with PIN
Customer scans QR → Joins session with PIN
Session status: OPEN
Customers view menu → Place orders
```

### Order to Serving

```
Customer places order → Order doc created
Items split by station → Socket to kitchen
Chefs claim items → Status: IN_PROGRESS
Items marked ready → Status: READY
Waiter serves → Status: SERVED
```

### Billing & Payment

```
Manager initiates bill → Bill created from session orders
Bill items captured (snapshot of prices/quantities)
Payment processed (cash/card/UPI)
PDF generated → Email/WhatsApp to customer
Session closed
```

---

## 🔍 KEY FILES TO UNDERSTAND

### Must-Read Server Files

1. `server/index.js` - Server setup, routes, socket initialization
2. `server/controller/order.controller.js` - Order creation logic
3. `server/controller/bill.controller.js` - Billing logic
4. `server/socket/index.js` - Real-time event handling
5. `server/middleware/requireAuth.js` - JWT validation pattern
6. `server/models/order.model.js` - Order schema and relationships

### Must-Read Client Files

1. `client/src/main.jsx` - Entry point, interceptor setup
2. `client/src/App.jsx` - Auth initialization
3. `client/src/app/providers.jsx` - Redux + Router setup
4. `client/src/socket/SocketProvider.jsx` - Socket context
5. `client/src/api/axios.js` - API configuration

---

## 🚨 IMPORTANT NOTES

### Auth Context in Requests

Every authenticated endpoint has access to:

```javascript
req.userId; // User's MongoDB ID
req.user = {
  _id: userId,
  name: string,
  role: string, // BRAND_ADMIN|MANAGER|CHEF|WAITER|CASHIER
  restaurantId: ID,
  brandId: ID,
  isStaff: boolean,
};
```

### Customer vs Staff Sessions

- **Staff:** JWT auth via httpOnly cookies
- **Customers:** Session token hash validation
- Customers never see privileged data

### Real-time Rooms

- All staff in `restaurant:{id}` room
- Specific roles join specific sub-rooms
- Customers join via `join:customer` event

### API Response Format

```javascript
{
  success: boolean,
  message: string,
  data: object,          // On success
  error: string|object   // On failure
}
```

---

## 📈 SCALABILITY CONSIDERATIONS

- **Indexes:** Compound indexes on common query patterns (restaurantId, status)
- **Pagination:** Implemented using mongoose-paginate-v2
- **Socket Rooms:** Organized hierarchically for efficient broadcasts
- **Caching:** Report cache model for heavy analytics
- **Rate Limiting:** express-rate-limit for sensitive endpoints
- **Security:** Helmet for HTTP headers, bcryptjs for password hashing

---

## 🎓 LEARNING PATH

1. Start with `server/index.js` - Understand app setup
2. Read `server/models/user.model.js` - Understand core entities
3. Study `server/controller/auth.controller.js` - Learn auth patterns
4. Review `server/socket/index.js` - Understand real-time logic
5. Examine `client/src/api/axios.js` - Client API setup
6. Check `client/src/modules/manager` - UI implementation example
7. Review complete `server/controller/bill.controller.js` - Complex business logic

---

**Last Updated:** January 23, 2026
**Status:** Production-Ready (platoinfinity.xyz)
