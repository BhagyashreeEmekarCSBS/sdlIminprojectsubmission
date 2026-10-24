# Smart Canteen Pro
### Enterprise-Grade Smart Canteen Management & Token System
**Department of Computer Science & Business Systems**  
**Rajarshi Shahu College of Engineering, Pune (RSCOE)**  
**Authors:** Yashraj Ghate, Piyush Lokhande, Arush Yambarwar

---

## 🌟 Executive Summary
**Smart Canteen Pro** is a modern, responsive, full-stack college canteen management system designed to eliminate physical cafeteria queues, automate order flow, provide contactless smart token & QR pickup, optimize kitchen preparation, reduce food waste, and deliver real-time operational analytics for college cafeterias.

The system is built on **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM** with **SQLite**, and includes a parallel **Core Java OOP Mini-Project** designed for academic evaluation and demonstration.

---

## 🚀 Key Features Implemented

### 1. Modern Responsive UI / UX
- **College-Tech Startup Aesthetics:** Warm amber/orange branding with clean sidebar and header navigation.
- **Dark & Light Mode:** Seamless toggle with local storage persistence.
- **Accessibility:** Readable contrast, keyboard accessibility, clear error and success toasts.
- **Every Button Works:** Complete end-to-end functionality across every interactive button, modal, and drawer.

### 2. Role-Based Permissions & Authentication
- **Student Role:**
  - Register & sign in with bcrypt password protection.
  - Browse 10 menu categories with search, diet filters, and price ranges.
  - Persistent cart with quantity counters and item customizations.
  - Instant order placement with unique Token (`SC-XXXX`) & signed QR pass.
  - Live order tracking timeline (`PLACED` → `CONFIRMED` → `PREPARING` → `READY` → `COLLECTED`).
  - Printable official thermal/A4 receipts.
  - Loyalty point rewards (earn 1 pt per ₹10, 50 welcome pts, redeem for cash discounts).
  - Submit ratings, reviews, and raise support tickets.
- **Canteen Staff Role:**
  - 3-column live kitchen display board.
  - One-click status progression: Accept, Cook, Mark Ready.
  - Rejection with required reason and automatic inventory restoration.
  - **Counter QR & Token Scanner:** Camera-based scanning via `jsqr` and manual token entry with instant 5-step backend verification.
  - One-click temporary stock availability toggles.
- **Administrator Role:**
  - Executive analytics dashboard: Gross Sales, Net Revenue, Orders, Average Order Value, Cancellation Rate.
  - Real CSV report export matching academic sales report formats.
  - Menu catalog CRUD with image, price, stock, prep time, allergens, and dietary flags.
  - Raw inventory and supplier management with low-stock alerts.
  - Support ticket resolution with administrator replies.

### 3. Innovative Smart Features
- **Smart Queue Prediction:** Real-time wait time calculation based on queue depth and item prep complexity.
- **Canteen Crowd Indicator:** Real-time indicator (Low, Moderate, Busy, Peak) with wait time forecasts.
- **Food Waste Reduction:** Surplus food flash sale banner with automated 20% discounts before closing, plus waste incident logging.
- **Personalized Recommendations:** Bestsellers, popular combos, and value thalis.
- **Promo Coupons:** Backend validation for percentage and flat discounts (`WELCOME20`, `HUNGRY50`, `CHAI10`).

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons
- **Backend:** Next.js API Routes (REST), Node.js v20
- **Database:** Prisma ORM with SQLite (`prisma/dev.db`)
- **Security:** JSON Web Tokens (JWT), Bcrypt password hashing
- **QR Code System:** `qrcode` generation & `jsqr` client-side camera decoder
- **Core Java Implementation:** Java 8+ Standalone OOP application with Swing GUI & Console interfaces

---

## 🔑 Demo Evaluation Accounts (1-Click Login Available)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@rscoe.edu` | `Student@123` | Yashraj Ghate (CSBS, Roll: RBT25CB042) • 160 Pts |
| **Staff** | `staff@canteen.rscoe.edu` | `Staff@123` | Rameshwar (Kitchen Head) • Kitchen & Scanner |
| **Admin** | `admin@canteen.rscoe.edu` | `Admin@123` | Prof. Sharma (Canteen Admin) • Analytics & CRUD |

---

## 🏁 How to Run the Application

### 1. Full-Stack Web Application
```powershell
# Navigate to the project root
cd "C:\Users\ADMIN\.gemini\antigravity\scratch\smart-canteen-pro"

# Ensure database is pushed and seeded (already performed)
npx prisma db push
node prisma/seed.js

# Start the application in development or production mode
npm run dev
# OR for production build:
npm start

# Open your browser at:
# http://localhost:3000
```

### 2. Core Java Academic Project
```powershell
cd "C:\Users\ADMIN\.gemini\antigravity\scratch\smart-canteen-pro\java-mini-project"

# Compile with UTF-8 encoding
javac -encoding UTF-8 -d bin (Get-ChildItem -Recurse -Filter "*.java" src | Select-Object -ExpandProperty FullName)

# Run interactive console application
java -cp bin com.rscoe.smartcanteen.Main

# Run automated Java verification tests
java -cp bin -ea com.rscoe.smartcanteen.test.SmartCanteenTest
```
*Note:* The Java project is also pre-configured and copied into your Eclipse workspace at:  
`C:\Users\ADMIN\eclipse-workspace\SmartCanteenMiniProject`.

---

## 🧪 Automated Test Verification

All automated test suites executed with 100% pass rates:

### Backend & Database Tests (`node scripts/run-tests.js`)
- `[PASS]` Role-based user authentication & bcrypt hashing verified
- `[PASS]` All 10 required menu categories configured
- `[PASS]` Menu catalog verified with 21 items and surplus food pricing
- `[PASS]` Coupon validation rules (discount, min-order, expiry) verified
- `[PASS]` Order creation with atomic stock deduction and Token `SC-XXXX`
- `[PASS]` Rejected premature token collection when status is not `READY`
- `[PASS]` Order lifecycle progression to `PREPARING` and `READY` verified
- `[PASS]` 5-step pickup verification succeeded and recorded staff handover
- `[PASS]` Re-use of collected token correctly rejected
- `[PASS]` Order cancellation correctly restored inventory stock
- `[PASS]` Inventory item stock tracking and restocking operations verified
- `[PASS]` Analytics & report calculations verified

### Live HTTP Endpoint Tests (`node scripts/verify-http.js`)
- `[PASS]` Homepage (`/`) renders with 200 OK
- `[PASS]` Menu page (`/menu`) renders with 200 OK
- `[PASS]` `/api/categories` returned 10 categories
- `[PASS]` `/api/crowd` returned prediction (Low Traffic, ~10m wait)
- `[PASS]` Student login successful
- `[PASS]` `/api/coupons` correctly validated `WELCOME20`
- `[PASS]` Staff login successful
- `[PASS]` Staff `/api/orders/verify-token` correctly rejected non-existent token
- `[PASS]` Admin login successful
- `[PASS]` `/api/reports/export-csv` generated matching sales report CSV

---

## 📦 Deployment & Git Instructions
```powershell
cd "C:\Users\ADMIN\.gemini\antigravity\scratch\smart-canteen-pro"

# Initialize git repository
git init
git add .
git commit -m "feat: Upgrade Smart Canteen Pro with complete 10-category ordering, smart tokens, kitchen dashboard, inventory, and Core Java compatibility"

# Push to your GitHub repository
git remote add origin https://github.com/your-username/smart-canteen-pro.git
git branch -M main
git push -u origin main
```
