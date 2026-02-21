# Plato Menu — Architecture Document (PDF‑Style)

**Version:** 1.0  
**Date:** 2026‑02‑21  
**Audience:** Engineering / Product / Operations

---

## Executive Summary

Plato Menu is a full‑stack restaurant operating system that unifies **customer QR dining**, **staff workflows**, and **management analytics** into a single real‑time platform. It combines a React SPA frontend, an Express/MongoDB backend, and a Socket.io realtime layer to orchestrate table sessions, orders, kitchen execution, and billing.

---

## System Objectives

- **Frictionless QR dining:** Customers scan → join session → order → pay.
- **Operational clarity:** Chefs, waiters, and cashiers receive live updates.
- **Manager oversight:** Dashboards, reports, and staff visibility.
- **Resilience & scale:** Stateless APIs, session tokens, and realtime rooms.

---

## High‑Level Architecture

**Client (React + Vite)**

- Role‑based UX: Customer, Staff, Manager, Admin
- Axios with auth/session interceptors
- Socket client for realtime events

**Server (Express + MongoDB)**

- REST API for auth, menus, orders, bills, reports
- Role‑based access control
- Session and order lifecycle orchestration

**Realtime Layer (Socket.io)**

- Room‑based routing (restaurant, session, role)
- Kitchen & waiter notifications

**Background Jobs (Cron)**

- Close inactive sessions every 15 minutes

---

## Roles & Primary Journeys

### Customer (QR Flow)

1. Scan QR → open customer route
2. Fetch public table + menu
3. Join or resume session
4. Cart → place order
5. Realtime updates for prep/serve
6. View bill, settle with cashier

### Manager

- Configure menu and restaurant settings
- Manage staff, tables, kitchen stations
- Monitor KPIs, suspicious orders, analytics

### Staff

- **Chef:** claim items, mark ready
- **Waiter:** serve items, respond to table calls
- **Cashier:** bill settlement + payment updates

---

## Core Domain Modules

- **Auth / Invite** — login, OTP, password reset, staff invitations
- **Brand / Restaurant** — multi‑restaurant ownership + settings
- **Menu** — master menu + branch menu configuration
- **Tables / Sessions** — session lifecycle + QR join
- **Cart / Orders** — cart items, order creation, kitchen queue
- **Kitchen Stations** — station‑based prep and status
- **Billing** — bill generation, payment capture, WhatsApp share
- **Reports / Dashboard** — KPIs, performance, revenue breakdown

---

## Session‑First Model

**Session = live dining context for a table**

- Opened by waiter/manager
- Joined by customer using QR
- Session token persists in client
- All cart/order actions bound to session
- Closed explicitly or via cron timeout

---

## Realtime Event Topology

**Socket Rooms**

- `restaurant:<id>`
- `restaurant:<id>:managers`
- `restaurant:<id>:waiters`
- `restaurant:<id>:kitchen`
- `restaurant:<id>:station:<station>`
- `restaurant:<id>:cashier`
- `session:<sessionId>`

**Key Events**

- Kitchen: `kitchen:claim-item`, `kitchen:mark-ready`
- Waiter: `waiter:serve-item`, `table:call_waiter`
- Billing: `cashier:bill-paid`
- Manager: `manager:metrics-update`

---

## Frontend Routing (Role‑Based)

**Customer**  
`/:brandSlug/:restaurantSlug/table/:tableId/*`

**Admin**  
`/:brandSlug/admin/*`

**Manager**  
`/:brandSlug/manager/*`

**Staff**  
`/:brandSlug/staff/*`

---

## Data Model Highlights

- **User** (role, restaurant, station)
- **Restaurant / Brand**
- **Table**
- **Session**
- **Order** (items, statuses)
- **CartItem**
- **KitchenStation**
- **Bill / Payment**

---

## Security & Access Control

- JWT‑based staff/admin authentication
- Session token for customer actions
- Middleware: `requireAuth`, `requireRole`, `resolveCustomerSession`
- Token refresh via `/api/auth/refresh-token`

---

## Typical End‑to‑End Flow

1. Manager configures restaurant, menu, tables
2. Waiter opens session for a table
3. Customer joins session via QR
4. Customer adds items to cart, places order
5. Kitchen prepares; chef updates status
6. Waiter serves items, updates status
7. Bill generated, cashier settles payment
8. Session closes

---

## Operational Notes

- API serves both backend and frontend build
- Socket auth accepts JWT; customers join explicitly
- Cron closes inactive sessions

---

## Appendix A — Key API Areas (By Domain)

- **Auth**: `/api/auth/*`
- **Brand / Restaurant**: `/api/brand`, `/api/restaurants/*`
- **Menu**: `/api/master-menu`, `/api/branch-menu/*`, `/api/customer/menu/*`
- **Sessions**: `/api/sessions/*` and `/api/restaurants/:id/sessions/*`
- **Cart**: `/api/cart/*`
- **Orders**: `/api/order/*`
- **Kitchen**: `/api/kitchen/*`
- **Billing**: `/api/bill/*`, `/api/bill/:id/whatsapp`
- **Reports / Dashboard**: `/api/report/*`, `/api/dashboard/*`

---

## Appendix B — Tech Stack

- **Frontend:** React, Vite, Redux, Axios, Socket.io‑client
- **Backend:** Express, MongoDB/Mongoose, Socket.io
- **Infra:** Cron jobs, REST APIs, realtime websockets

---

**End of Document**
