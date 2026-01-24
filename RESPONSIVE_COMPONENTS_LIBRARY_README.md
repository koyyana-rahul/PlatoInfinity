# 🎨 PLATO MENU - RESPONSIVE COMPONENTS LIBRARY

**Version**: 1.0  
**Date**: January 24, 2026  
**Status**: Production Ready

---

## 📚 COMPONENT LIBRARY

A comprehensive collection of 12 production-ready, fully responsive React components for building modern restaurant management interfaces.

### Features

✅ **100% Responsive** - Works on all screen sizes (320px-4K)  
✅ **Mobile-First** - Designed for mobile, scales to desktop  
✅ **Accessible** - WCAG 2.1 compliant (ready)  
✅ **Well-Documented** - Clear examples & usage  
✅ **Production Ready** - Error handling, loading states  
✅ **Reusable** - DRY principles throughout  
✅ **Tailwind CSS** - No additional CSS needed  
✅ **Zero Dependencies** - Uses existing libraries

---

## 📦 QUICK START

### Installation

All components are already in `client/src/components/`

### Basic Usage

```jsx
import ResponsiveContainer from "./components/ui/ResponsiveContainer";
import ResponsiveGrid from "./components/ui/ResponsiveGrid";
import ResponsiveCard from "./components/ui/ResponsiveCard";

export default function App() {
  return (
    <ResponsiveContainer>
      <ResponsiveGrid>
        <ResponsiveCard>Content here</ResponsiveCard>
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
}
```

---

## 🎯 COMPONENTS OVERVIEW

### Layout Components

#### 1. ResponsiveContainer

Universal responsive wrapper with consistent padding

**Props**:

- `maxWidth`: Max container width (default: `max-w-7xl`)
- `padding`: Responsive padding (default: `px-4 sm:px-6 md:px-8 lg:px-10`)
- `className`: Additional classes

**Usage**:

```jsx
<ResponsiveContainer maxWidth="max-w-6xl">
  {/* Your content */}
</ResponsiveContainer>
```

**When to Use**:

- Wrap all page content
- Ensure consistent margins
- Center content on large screens

---

#### 2. ResponsiveGrid

Auto-adjusting grid layout for items

**Props**:

- `cols`: Grid columns (default: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`)
- `gap`: Gap between items (default: `gap-3 sm:gap-4 md:gap-5 lg:gap-6`)
- `className`: Additional classes
- `children`: Grid items

**Usage**:

```jsx
<ResponsiveGrid cols="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {items.map((item) => (
    <div key={item.id}>{item.name}</div>
  ))}
</ResponsiveGrid>
```

**Responsive Behavior**:

- Mobile (320-479px): 1 column
- Tablet (480-1023px): 2-3 columns
- Desktop (1024px+): 4 columns

**When to Use**:

- Display product lists
- Show menu items
- Grid layouts
- Card collections

---

#### 3. ResponsiveCard

Reusable card component with clickable variant

**Props**:

- `clickable`: Make clickable (boolean)
- `onClick`: Click handler function
- `padding`: Card padding (default: `p-3 sm:p-4 md:p-5 lg:p-6`)
- `className`: Additional classes
- `children`: Card content

**Usage**:

```jsx
<ResponsiveCard clickable onClick={handleClick}>
  <h3>Card Title</h3>
  <p>Card content</p>
</ResponsiveCard>
```

**Features**:

- Hover effects on clickable cards
- Responsive padding
- Border & rounded corners
- Shadow effects

**When to Use**:

- Show product information
- Display order details
- List items in collections
- Create dashboard sections

---

#### 4. ResponsiveText

Typography component with responsive sizing

**Props**:

- `variant`: Text style (`heading1`, `heading2`, `heading3`, `body`, `small`, `tiny`)
- `className`: Additional classes
- `children`: Text content

**Usage**:

```jsx
<ResponsiveText variant="heading1">Main Title</ResponsiveText>
<ResponsiveText variant="body">Paragraph text</ResponsiveText>
<ResponsiveText variant="small">Small text</ResponsiveText>
```

**Font Sizes**:

- **heading1**: 24px (mobile) → 48px (desktop)
- **heading2**: 20px (mobile) → 32px (desktop)
- **heading3**: 18px (mobile) → 24px (desktop)
- **body**: 14px (mobile) → 16px (desktop)
- **small**: 12px (mobile) → 14px (desktop)
- **tiny**: 12px (all sizes)

**When to Use**:

- Page titles
- Section headings
- Body text
- Small captions

---

#### 5. ResponsiveTable

Smart table that adapts to screen size

**Props**:

- `columns`: Column definitions array
  - `key`: Field key
  - `label`: Column header
  - `render`: Optional render function
- `data`: Array of data rows
- `onRowClick`: Click handler for rows
- `loading`: Loading state (boolean)

**Usage**:

```jsx
const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  {
    key: "status",
    label: "Status",
    render: (value) => <span className="badge">{value}</span>,
  },
];

<ResponsiveTable columns={columns} data={data} onRowClick={handleRowClick} />;
```

**Features**:

- Desktop: Full table view
- Mobile: Card view (expandable)
- Loading state
- Empty state
- Sorting ready (add yourself)

**When to Use**:

- Display lists of orders
- Show customer information
- List staff members
- Analytics tables

---

### State & Feedback Components

#### 6. LoadingSpinner

Animated loading indicator

**Props**:

- `size`: Spinner size (`sm`, `md`, `lg`)
- `message`: Loading message (optional)

**Usage**:

```jsx
<LoadingSpinner size="md" message="Loading data..." />
```

**Sizes**:

- **sm**: 24px (for inline loading)
- **md**: 40px (standard loading)
- **lg**: 64px (full page loading)

**When to Use**:

- Page/section loading
- Data fetching
- Async operations
- File uploads

---

#### 7. EmptyState

Display when no data available

**Props**:

- `icon`: Icon component (lucide-react)
- `title`: Empty state title
- `message`: Empty state message
- `image`: Image URL (optional)
- `action`: Action button
  - `label`: Button text
  - `onClick`: Click handler

**Usage**:

```jsx
import { Package } from "lucide-react";

<EmptyState
  icon={Package}
  title="No Orders"
  message="You haven't placed any orders yet"
  action={{
    label: "Browse Menu",
    onClick: () => navigate("/menu"),
  }}
/>;
```

**When to Use**:

- No search results
- Empty lists
- No data available
- First time user state

---

#### 8. ErrorBoundary

Error handling component

**Props**:

- `children`: Child components to wrap

**Usage**:

```jsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

**Features**:

- Catches render errors
- Shows fallback UI
- Logs errors
- Retry button

**When to Use**:

- Wrap page routes
- Wrap complex sections
- Prevent full app crashes
- Production error handling

---

### Data Display Components

#### 9. StatCard

KPI display card with trend

**Props**:

- `icon`: Icon component
- `label`: Metric label
- `value`: Metric value
- `trend`: Trend percentage (optional)
- `trendLabel`: Trend description
- `bgColor`: Background color
- `borderColor`: Border color
- `iconColor`: Icon color
- `onClick`: Click handler (optional)

**Usage**:

```jsx
import { TrendingUp } from "lucide-react";

<StatCard
  icon={TrendingUp}
  label="Total Revenue"
  value="₹45,000"
  trend={12}
  trendLabel="vs last month"
  bgColor="bg-green-50"
  borderColor="border-green-200"
  iconColor="text-green-600"
/>;
```

**When to Use**:

- Dashboard KPIs
- Metrics cards
- Performance indicators
- Summary statistics

---

#### 10. AnalyticsDashboard

Complete analytics dashboard

**Props**:

- `restaurantId`: Restaurant ID
- `dateRange`: Date range (`7d`, `30d`, `90d`, `1y`)

**Usage**:

```jsx
<AnalyticsDashboard restaurantId={restaurantId} dateRange="7d" />
```

**Features**:

- Revenue trend chart
- Order status pie chart
- Top selling items
- Hourly order distribution
- Payment method breakdown
- 4 KPI cards
- Date range selector
- Export functionality

**When to Use**:

- Manager dashboard
- Business analytics
- Performance tracking
- Reporting

---

#### 11. OrderTracker

Order status tracker with timeline

**Props**:

- `orderId`: Order ID
- `restaurantId`: Restaurant ID

**Usage**:

```jsx
<OrderTracker orderId={orderId} restaurantId={restaurantId} />
```

**Features**:

- Status timeline (5 stages)
- Order items listing
- Price breakdown
- Expected delivery time
- Real-time updates (5s refresh)

**When to Use**:

- Order detail pages
- Customer tracking
- Order history
- Delivery tracking

---

#### 12. NotificationCenter

Real-time notification system

**Props**:

- `restaurantId`: Restaurant ID

**Usage**:

```jsx
export default function Layout() {
  return (
    <>
      {/* Your layout */}
      <NotificationCenter restaurantId={restaurantId} />
    </>
  );
}
```

**Features**:

- Bell icon with notification count
- Notification panel (expandable)
- Multiple notification types
- Sound alerts
- Kitchen alerts
- Table call alerts
- Notification history (20 items)
- Dismissible notifications

**When to Use**:

- All layouts/pages
- Real-time alerts
- User notifications
- System alerts

---

## 🎨 RESPONSIVE BREAKPOINTS

All components use Tailwind breakpoints:

```
Mobile:  320px - 479px   (sm: not applied)
Tablet:  480px - 1023px  (sm: applied)
Desktop: 1024px+         (md, lg, xl: applied)
```

### Tailwind Classes Used

- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

---

## 🎯 BEST PRACTICES

### 1. Always Wrap Pages

```jsx
<ErrorBoundary>
  <ResponsiveContainer>{/* Your content */}</ResponsiveContainer>
</ErrorBoundary>
```

### 2. Use ResponsiveGrid for Collections

```jsx
<ResponsiveGrid>
  {items.map((item) => (
    <ResponsiveCard key={item.id}>{item.name}</ResponsiveCard>
  ))}
</ResponsiveGrid>
```

### 3. Add Loading States

```jsx
if (loading) return <LoadingSpinner message="Loading..." />;
if (!data?.length) return <EmptyState icon={Package} title="No data" />;
```

### 4. Mobile-First CSS Classes

```jsx
// ✅ Good: Mobile first
className = "px-4 sm:px-6 md:px-8 lg:px-10";

// ❌ Avoid: Desktop first
className = "px-10 md:px-8 sm:px-6 px-4";
```

### 5. Test on Multiple Devices

- Mobile (375×667)
- Tablet (768×1024)
- Desktop (1920×1080)

---

## 📊 COMPONENT MATRIX

| Component    | Responsive | Mobile | Desktop | Touch | Use Case   |
| ------------ | ---------- | ------ | ------- | ----- | ---------- |
| Container    | ✅         | ✅     | ✅      | -     | Wrapper    |
| Grid         | ✅         | 1col   | 4col    | ✅    | Lists      |
| Card         | ✅         | ✅     | ✅      | ✅    | Items      |
| Text         | ✅         | Scaled | Scaled  | -     | Typography |
| Table        | ✅         | Cards  | Table   | ✅    | Data       |
| Spinner      | ✅         | ✅     | ✅      | -     | Loading    |
| Empty        | ✅         | ✅     | ✅      | ✅    | No data    |
| Error        | ✅         | ✅     | ✅      | ✅    | Errors     |
| Stat         | ✅         | ✅     | ✅      | ✅    | KPIs       |
| Analytics    | ✅         | ✅     | ✅      | ✅    | Dashboard  |
| Tracker      | ✅         | ✅     | ✅      | ✅    | Orders     |
| Notification | ✅         | ✅     | ✅      | ✅    | Alerts     |

---

## 🚀 INTEGRATION WITH EXISTING CODE

### 1. Replace Old Components

```jsx
// Before (not responsive)
<div className="grid grid-cols-4 gap-6 px-8">
  {items.map(item => (
    <div key={item.id}>{item.name}</div>
  ))}
</div>

// After (responsive)
<ResponsiveContainer>
  <ResponsiveGrid>
    {items.map(item => (
      <ResponsiveCard key={item.id}>{item.name}</ResponsiveCard>
    ))}
  </ResponsiveGrid>
</ResponsiveContainer>
```

### 2. Add Error Handling

```jsx
// Before
<YourComponent />

// After
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 3. Add Loading States

```jsx
// Before
return <div>{data}</div>;

// After
if (loading) return <LoadingSpinner />;
return <div>{data}</div>;
```

---

## 📚 DOCUMENTATION

For detailed usage of each component, see:

- `PRODUCTION_UPGRADE_IMPLEMENTATION_GUIDE.md`
- Individual component files (JSDoc comments)
- Example implementations in existing pages

---

## 🧪 TESTING COMPONENTS

### Manual Testing

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on different screen sizes
4. Verify functionality

### Checklist

- [ ] Renders without errors
- [ ] Responsive on mobile (375px)
- [ ] Responsive on tablet (768px)
- [ ] Responsive on desktop (1920px)
- [ ] Touch events work
- [ ] No console errors
- [ ] Data displays correctly
- [ ] Interactions work

---

## 🆘 TROUBLESHOOTING

### Component Not Showing

- Check: Component is imported
- Verify: Component file exists
- Test: No errors in console

### Not Responsive

- Check: Tailwind CSS is running
- Verify: Correct breakpoint classes
- Test: DevTools device mode

### Styling Issues

- Check: No conflicting CSS
- Verify: Tailwind config correct
- Test: Clear cache (`npm run build:css`)

---

## 📞 SUPPORT

- Documentation: `PRODUCTION_UPGRADE_IMPLEMENTATION_GUIDE.md`
- Component Code: Check JSDoc comments
- Examples: See existing page implementations
- Issues: Check troubleshooting section

---

## ✅ COMPLIANCE

- ✅ Responsive: 320px - 4K
- ✅ Accessible: WCAG 2.1 ready
- ✅ Performant: Optimized
- ✅ Secure: Input validation ready
- ✅ Documented: Complete
- ✅ Tested: Manual testing ready
- ✅ Production: Ready to deploy

---

**Ready to use!** 🚀

Start with `PRODUCTION_UPGRADE_IMPLEMENTATION_GUIDE.md` for detailed examples.
