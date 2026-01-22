# Real-Time Menu Synchronization Feature

## Overview

This document explains the real-time menu synchronization system that automatically updates customer menus when admin or manager makes changes.

## Feature Flow

### 1. Admin Creates/Updates Master Menu Item

- **Location**: Brand admin dashboard
- **Action**: Admin creates new item, category, or updates master menu
- **Trigger**: `createMasterItem()` or `updateMasterItem()` in `masterMenu.controller.js`
- **Broadcast**: Emits `master_item_created` or `master_item_updated` event with brandId
- **Affected**: All restaurants/branches under this brand

### 2. Manager Imports Master Items to Branch

- **Location**: Manager panel → Import Master Menu
- **Action**: Manager imports selected master items to their restaurant/branch
- **Trigger**: `importMasterMenu()` in `menu.controller.js`
- **Broadcast**: Emits `menu_import` event with restaurantId and count of imported items
- **Affected**: Only customers viewing this restaurant's menu

### 3. Manager Updates Branch Level Menu

- **Location**: Manager panel → Menu Items
- **Actions**:
  - Update item name, description, price, station, status
  - Toggle items ON/OFF
  - Update stock levels
- **Triggers**:
  - `updateBranchMenuItem()` - Single item update
  - `bulkToggleBranchMenu()` - Bulk ON/OFF toggle
  - `updateBranchStock()` - Stock updates
- **Broadcast**: Emits `item_updated`, `items_toggled`, or `stock_updated`
- **Affected**: Only customers viewing this restaurant's menu

### 4. Customer Menu Auto-Updates

- **Location**: Customer menu page (CustomerMenu.jsx)
- **Action**: Customer connects to socket and joins restaurant room
- **Listeners**: React hook `useCustomerSocket` listens for:
  - `menu:update` - Full menu refresh
  - `menu:item:change` - Individual item change
  - `menu:category:change` - Category restructure
- **Callback**: `onMenuUpdate()` is triggered, which refetches menu from API
- **Result**: Menu UI updates without page reload

## Technical Architecture

### Server-Side Components

#### 1. Socket Emitter (`server/socket/emitter.js`)

```javascript
// Broadcast menu updates to all customers in a restaurant
emitMenuUpdate(restaurantId, data);

// Example usage in controllers:
emitMenuUpdate(restaurantId, {
  type: "menu_import",
  count: 5,
});
```

**Functions:**

- `emitMenuUpdate(restaurantId, data)` - Broadcast to `restaurant:{restaurantId}:customers` room
- `emitMenuItemUpdate(restaurantId, menuItemId, action)` - Item-specific updates

**Broadcasting Pattern:**

```
if (restaurantId) {
  io.to(`restaurant:${restaurantId}:customers`).emit("menu:update", data);
} else {
  // Brand-level update - reach all restaurants
  io.emit("menu:update", data);
}
```

#### 2. Socket Connection Handler (`server/socket/index.js`)

```javascript
socket.on("join:customer", ({ sessionId, tableId, restaurantId }) => {
  if (restaurantId) {
    socket.join(`restaurant:${restaurantId}:customers`);
    console.log(`👥 Customer joined: restaurant:${restaurantId}:customers`);
  }
});
```

**Room Structure:** `restaurant:{restaurantId}:customers`

- All customers viewing the same restaurant's menu are in this room
- Updates to this room reach all connected customers instantly

#### 3. Controller Integration

**Files Modified:**

- `server/controller/masterMenu.controller.js` - Admin menu operations
- `server/controller/menu.controller.js` - Manager and branch menu operations

**Events Emitted:**

```javascript
// Master menu changes
"master_item_created";
"master_item_updated";
"master_item_deleted";

// Branch menu changes
"menu_import";
"item_updated";
"items_toggled";
"stock_updated";
```

### Client-Side Components

#### 1. Socket Hook (`client/src/modules/customer/hooks/useCustomerSocket.jsx`)

```javascript
useCustomerSocket({
  sessionId, // Customer session ID
  restaurantId, // Restaurant/branch ID
  tableId, // Table ID
  onCartUpdate, // Callback when cart updates
  onMenuUpdate, // Callback when menu updates
});
```

**Features:**

- Auto-connects to socket on component mount
- Emits `join:customer` event to put customer in room
- Listens for `menu:update`, `menu:item:change`, `menu:category:change` events
- Triggers callbacks on received events
- Auto-disconnects on component unmount

#### 2. Customer Menu Component (`client/src/modules/customer/pages/CustomerMenu.jsx`)

```javascript
const handleMenuUpdate = async () => {
  console.log("🔄 Reloading menu after update...");
  try {
    const res = await Axios(customerApi.publicMenuByTable(tableId));
    const data = res.data?.data || [];
    setMenu(data);
    toast.success("Menu updated!", { duration: 2000 });
  } catch (err) {
    console.error("Failed to reload menu:", err);
  }
};

useCustomerSocket({
  sessionId,
  restaurantId,
  tableId,
  onCartUpdate: () => dispatch(fetchCart()),
  onMenuUpdate: handleMenuUpdate,
});
```

**Features:**

- Uses socket hook to listen for menu events
- Implements `handleMenuUpdate` callback to reload menu
- Shows toast notification when menu is updated
- Seamless refresh without page reload

## Data Flow Diagram

```
Admin Creates Item
        ↓
masterMenu.controller.js::createMasterItem()
        ↓
emitMenuUpdate() with "master_item_created"
        ↓
socket.io broadcast to all "restaurant:{id}:customers" rooms
        ↓
useCustomerSocket hook receives "menu:update" event
        ↓
handleMenuUpdate() callback triggered
        ↓
customerApi.publicMenuByTable() API call
        ↓
Menu state updated in React
        ↓
Customer sees new menu item WITHOUT page refresh ✨
```

## Implementation Details

### Step 1: Customer Joins Room

When customer opens their menu (CustomerMenu.jsx loads):

```javascript
useCustomerSocket({
  sessionId, // "session:abc123"
  restaurantId, // "rest:xyz789"
  tableId, // "table:def456"
  onMenuUpdate: handleMenuUpdate,
});
```

Hook emits:

```javascript
socket.emit("join:customer", {
  sessionId,
  tableId,
  restaurantId,
});
```

Server joins socket to room:

```
socket.join("restaurant:rest:xyz789:customers")
```

### Step 2: Admin Makes Change

Admin creates/updates item in master menu:

```javascript
// In masterMenu.controller.js::createMasterItem()
const item = await MasterMenuItem.create({ ... });

emitMenuUpdate(null, {
  type: "master_item_created",
  brandId: req.user.brandId,
  itemId: item._id,
  name: item.name
});
```

### Step 3: Manager Imports to Branch

Manager imports items to their restaurant:

```javascript
// In menu.controller.js::importMasterMenu()
const ops = await BranchMenuItem.bulkWrite(operations);

emitMenuUpdate(restaurantId, {
  type: "menu_import",
  count: ops.length,
});
```

### Step 4: Socket Broadcast

Server broadcasts to all customers in that restaurant:

```javascript
io.to(`restaurant:${restaurantId}:customers`).emit("menu:update", {
  type: "menu_import",
  count: ops.length,
});
```

### Step 5: Client Receives & Updates

Hook receives event and triggers callback:

```javascript
socket.on("menu:update", (data) => {
  console.log("📢 Menu update received:", data);
  if (onMenuUpdate) onMenuUpdate(data); // ← Calls handleMenuUpdate
});
```

Menu is reloaded:

```javascript
const handleMenuUpdate = async () => {
  const res = await Axios(customerApi.publicMenuByTable(tableId));
  setMenu(res.data?.data || []);
  toast.success("Menu updated!");
};
```

## Testing the Feature

### Manual Testing Flow

1. **Setup:**
   - Open customer menu page with QR code
   - Check browser console for logs
   - Open server logs in terminal

2. **Test Admin Creates Item:**
   - Go to admin dashboard
   - Create new master menu item
   - Watch server logs for: `📢 Menu update broadcast for restaurant:{id}`
   - Check customer browser console for: `📢 Menu update received:`
   - Verify: New item appears in customer menu WITHOUT page refresh

3. **Test Manager Imports:**
   - Go to manager panel
   - Import master items to their restaurant
   - Verify: Items appear for all customers in that restaurant instantly

4. **Test Manager Updates Item:**
   - Go to manager panel
   - Update item name, price, or status
   - Verify: Update appears for all customers in real-time

5. **Test Multiple Customers:**
   - Open customer menu in 2+ browser tabs/windows
   - Make change on admin/manager
   - Verify: ALL customers see update simultaneously

### Console Logs to Look For

**Server Logs:**

```
📢 Menu update broadcast for restaurant:rest:xyz789
```

**Client Logs:**

```
👥 Customer joined: restaurant:rest:xyz789:customers
📢 Menu update received: { type: "menu_import", count: 5 }
🔄 Reloading menu after update...
```

## Edge Cases & Error Handling

### Connection Drops

- Socket auto-reconnects when connection is lost
- `join:customer` event re-fires on reconnection
- Customer joins room again and receives updates

### Concurrent Updates

- Multiple updates to same item handled by socket queue
- Latest version of menu pulled from API
- Potential race conditions mitigated by server-side version field

### Large Number of Items

- Bulk operations emit single event instead of per-item
- `bulkToggleBranchMenu()` emits once for all items
- Reduces socket traffic

## Files Modified

### Server Files

1. **server/socket/emitter.js**
   - Added: `emitMenuUpdate()` function
   - Added: `emitMenuItemUpdate()` function

2. **server/socket/index.js**
   - Added: `socket.on("join:customer")` handler
   - Feature: Auto-joins customer to `restaurant:{id}:customers` room

3. **server/controller/menu.controller.js**
   - Import: `{ emitMenuUpdate }`
   - Updated: `importMasterMenu()` - Emits after bulkWrite
   - Updated: `updateBranchMenuItem()` - Emits after update
   - Updated: `bulkToggleBranchMenu()` - Emits after toggle

4. **server/controller/masterMenu.controller.js**
   - Import: `{ emitMenuUpdate }`
   - Updated: `createMasterItem()` - Emits after create
   - Updated: `updateMasterItem()` - Emits after update
   - Updated: `deleteMasterItem()` - Emits after delete

### Client Files

1. **client/src/modules/customer/hooks/useCustomerSocket.jsx**
   - Added: `restaurantId` parameter
   - Added: `tableId` parameter
   - Added: `onMenuUpdate` callback parameter
   - Added: `socket.emit("join:customer")` event
   - Added: 3 socket event listeners for menu updates

2. **client/src/modules/customer/pages/CustomerMenu.jsx**
   - Import: `useCustomerSocket` hook
   - Added: `restaurantId` state tracking
   - Added: `handleMenuUpdate()` callback
   - Added: Hook initialization with callbacks
   - Feature: Menu auto-reloads when socket event received

## Performance Considerations

### Bandwidth

- Events are small (< 1KB typically)
- Bulk operations reduce event count
- Socket.io handles compression automatically

### CPU Usage

- Client-side: Single API call per update (same as manual refresh)
- Server-side: Event emission is non-blocking
- No polling - push-based is more efficient

### Database

- Menu fetch is already optimized (same query as before)
- No additional DB queries needed
- Socket.io is in-memory

## Future Enhancements

1. **Partial Menu Updates**
   - Instead of full reload, patch specific items
   - Reduces API calls for large menus

2. **Debouncing**
   - Group rapid updates together
   - Emit single event after 500ms of inactivity

3. **Conflict Resolution**
   - Handle concurrent edits by same admin/manager
   - Version tracking for menu items

4. **Offline Support**
   - Cache menu locally
   - Sync when reconnected

## Troubleshooting

### Menu Not Updating

1. Check browser console for socket connection errors
2. Verify `join:customer` event was emitted
3. Check server logs for `Menu update broadcast` message
4. Ensure `restaurantId` is correct

### Socket Connection Issues

1. Verify socket.io server is running
2. Check browser's Socket.io connection status
3. Look for CORS or proxy issues
4. Check server logs for socket connection errors

### Performance Issues

1. Check number of connected sockets (server logs)
2. Monitor API response time for menu fetch
3. Look for slow network in browser DevTools
4. Check if multiple updates stacking up

## Summary

The real-time menu synchronization system creates a seamless experience where:

- ✅ Admin creates → Updates broadcast to all branches
- ✅ Manager imports → Customers see new items instantly
- ✅ Manager updates → Changes appear in real-time
- ✅ Multiple customers → All see same updates simultaneously
- ✅ No page refresh → Seamless user experience

All powered by Socket.io rooms and event-driven architecture! 🚀
