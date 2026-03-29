

https://github.com/user-attachments/assets/d05b49e3-3f02-4eb0-977e-0c0cf1e736b2

# 🍽️ Plato — The Plate Operating System

> A real-time operating system for restaurant chains.

[![Live Demo](https://img.shields.io/badge/Live-platoinfinity.xyz-blue?style=for-the-badge)](https://platoinfinity.xyz)
[![GitHub](https://img.shields.io/badge/GitHub-PlatoInfinity-black?style=for-the-badge&logo=github)](https://github.com/koyyana-rahul/PlatoInfinity)
[![Status](https://img.shields.io/badge/Status-In%20Progress-orange?style=for-the-badge)]()

---

## 💡 The Idea

I was sitting at a restaurant. Waited 25 minutes. The waiter walked past me three times. Chef yelling. Staff arguing. Food never came.

**"Why is this still so broken?"**

I told my friends. They said:
- *"It already exists."*
- *"You can't even code."*
- *"Stop wasting time."*

They weren't completely wrong. But I went home, opened my laptop, and started anyway.

That's how **Plato** was born.

---

## ❌ 3 Problems Plato Destroys

| Problem | Reality | Plato's Fix |
|--------|---------|-------------|
| 🔴 **Chaos** | Orders reach the wrong station. Tandoor gets the drink. Every single day. | Every item mapped to its exact station. Zero miscommunication. |
| 🔴 **Fraud** | Prank orders flood the kitchen. 50 biryanis cooked. Nobody shows up. | Two-lock order system. No real waiter present = no order placed. |
| 🔴 **Blame Game** | *"I sent it." "I never got it."* No proof. Owner stands helpless. | Every action permanently timestamped. Irrefutable logs. Forever. |

---

## 👥 5 Roles. One System. Finally Connected.

Most restaurant software solves for one person. Plato connects all five.

### 👤 Brand Owner
**Before:** Survives on phone calls and hope. Zero real-time visibility across branches.
**In Plato:** Live orders, revenue & staff across every branch. One dashboard.

### 👤 Branch Manager
**Before:** Spends the entire day putting out fires. No system. Just chaos.
**In Plato:** Controls access, staff, menu, tables. Full live view of every order.

### 👤 Chef
**Before:** Shouted at. Paper tickets. Expected to cook perfectly inside chaos.
**In Plato:** Sees only their station orders. Clean. Digital. No noise.

### 👤 Waiter
**Before:** Blamed for everything. No tools. No proof.
**In Plato:** Live table view, order alerts & timestamped proof of every action.

### 👤 Customer
**Before:** Waves hands. Repeats orders. Has no idea where their food is.
**In Plato:** Scans QR, sees menu instantly, tracks order live. No app. No account. Fully anonymous.

---

## ⚙️ How It Works — 12 Steps

### Step 1 — Owner Sets Up the Brand
Owner creates the brand, uploads logo, adds branches. Builds one **Master Menu** — item name, price, category, photo, veg/non-veg tag.

> One change at the top → updates every branch automatically.

---

### Step 2 — Managers Invited to Branches
Owner types email, selects branch, hits invite. Manager sets their own password.

> Each manager is locked to their one branch only. No cross-branch access.

---

### Step 3 — Manager Builds the Branch
Manager creates Kitchen Stations — Tandoor, Bar, Grill. Adds staff. System auto-generates unique 4-digit PINs for each person.

```
Ramesh the waiter  → PIN: 1122
Suresh the chef    → PIN: 5566
```

---

### Step 4 — 🔑 The Shift QR System *(My Favourite Invention)*

A PIN alone felt weak. What if someone shared it? Logged in from home?

So I built the **Shift QR System**:
- Every shift → Manager generates a **fresh QR code**
- Staff must **scan the QR AND enter their PIN** — both, together
- QR without PIN → useless
- PIN without QR → useless
- Shift ends → QR expires immediately

> Manager controls who is inside Plato. Every single day.

---

### Step 5 — Menu Mapped to Stations
Manager imports the master menu. Adjusts local prices if needed. Maps every item to its station:

```
Paneer Tikka  →  Tandoor
Coke          →  Bar
Biryani       →  Grill
```

Tables are created. Each gets a **permanent QR code** placed on the table. Setup complete.

---

### Step 6 — Shift Begins. Staff Clock In.
```
Ramesh scans QR + types 1122  →  Live on Waiter Portal
Suresh scans QR + types 5566  →  Live on Chef Portal (sees only Tandoor orders)
```

Every action from this point is tracked to the individual.

---

### Step 7 — Customer Arrives
Customer scans the table QR. Full menu opens instantly.

- ✅ No app download
- ✅ No account creation
- ✅ No OTP
- ✅ Completely anonymous

But they **cannot add to cart yet** — the waiter must open the session first.

> Ramesh taps "Open Table" → cart unlocks.
> Nobody outside the restaurant can trigger this. That alone kills every fake internet order.

---

### Step 8 — 🔒 The Two-Lock Order System

```
Customer fills cart → taps "Request PIN"
         ↓
Alert fires instantly to Ramesh's device
         ↓
Ramesh walks to the table → "Your PIN is 4-5-2-1"
         ↓
Customer enters PIN → Order placed ✅
```

**No PIN = No order.**
The only way to get the PIN is a real waiter, standing in front of you, right now.

> Pranks? Gone. Ghost orders? Impossible.
> Same PIN stays valid the entire meal — expires only when the bill is paid.

---

### Step 9 — One Order. Every Screen. Live.

Order placed → fires **simultaneously** to all screens via **WebSockets**:

| Who | What They See |
|-----|--------------|
| Customer | Live order status on their phone |
| Ramesh (Waiter) | Order under Table 5 |
| Suresh (Chef) | Only Paneer Tikka on Tandoor tablet |
| Bar | Only the Coke |
| Manager | Full branch live view |
| Owner | Every branch, every city |

> Powered by WebSockets. Real-time. Zero delay.

---

### Step 10 — Four Stages. Zero Arguments.

```
Suresh taps PREPARING  →  every screen updates
Suresh taps READY      →  every screen updates
Ramesh serves → taps SERVED  →  every screen updates
```

Every tap is **permanent and timestamped**. Forever.

```
"I never got the order."   →   Log: Received. 7:43 PM
"I sent it on time."       →   Log: Ready 7:51 PM. Served 7:54 PM.
```

> **The blame game is over.**

---

### Step 11 — Repeat Orders. Same PIN. Zero Friction.

Customer wants another drink. Adds to cart. Enters the same PIN. Done instantly.

```
PLACED → PREPARING → READY → SERVED
```

Every time. No hand waving. No waiting.

---

### Step 12 — 🧾 The Bill. The Final Lock.

```
Customer taps "Request Bill"  →  instant alert to Ramesh
Ramesh collects payment       →  closes session
PIN expires. Table resets. Ready for next guest.
```

Manager now sees **exactly how much cash Ramesh collected**. Table by table. Rupee by rupee.

> Nothing can be pocketed. Everything is visible.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Real-time Communication | WebSockets |
| Authentication | Role-based (5 levels) + Shift QR + PIN |
| QR System | Shift QR (dynamic) + Table QR (permanent) |
| Frontend | *(add your stack here)* |
| Backend | *(add your stack here)* |
| Database | *(add your stack here)* |

---

## 🚀 What I Learned Building This

I started without knowing a single line of code.

- Learned **WebSockets** because I needed real-time sync across 5 portals
- Learned **role-based auth** because 5 people needed 5 completely different access levels
- Invented the **session-PIN system** because I needed fraud protection without collecting any user data

> Every problem taught me something a tutorial never would.
> **Building teaches what studying never will.**

*One honest confession — GitHub Copilot and ChatGPT made me faster throughout this build. Use them. No shame in it.*

---

## 📌 Current Status

Plato is still in progress. Some flows need refining. Some things might be wrong.

That's okay. **Nothing is ever fully ready. Ship it. Learn. Come back stronger.**

---

## 🔗 Links

- 🌐 Live: [platoinfinity.xyz](https://platoinfinity.xyz)
- 💻 GitHub: [github.com/koyyana-rahul/PlatoInfinity](https://github.com/koyyana-rahul/PlatoInfinity)

---

## 🤝 Feedback Welcome

Is there a flaw I haven't seen? A restaurant problem Plato hasn't solved?

**Open an issue. Brutal honesty welcome.**

---

*Built by Rahul Koyyana*
