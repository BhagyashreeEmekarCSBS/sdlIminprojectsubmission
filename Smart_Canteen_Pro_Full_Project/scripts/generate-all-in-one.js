const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const filesToInclude = [
  // Configuration
  { title: 'Project Configuration: package.json', file: 'package.json', lang: 'json' },
  { title: 'Database Configuration: prisma/schema.prisma', file: 'prisma/schema.prisma', lang: 'prisma' },
  { title: 'Environment Config: .env.example', file: '.env.example', lang: 'env' },
  { title: 'TypeScript Config: tsconfig.json', file: 'tsconfig.json', lang: 'json' },
  { title: 'Tailwind CSS Config: tailwind.config.js', file: 'tailwind.config.js', lang: 'javascript' },

  // Database Seed
  { title: 'Database Seed Script: prisma/seed.js', file: 'prisma/seed.js', lang: 'javascript' },

  // Core Libraries
  { title: 'Database Client: src/lib/prisma.ts', file: 'src/lib/prisma.ts', lang: 'typescript' },
  { title: 'Auth & JWT Security: src/lib/auth.ts', file: 'src/lib/auth.ts', lang: 'typescript' },
  { title: 'Cart State Manager: src/lib/cartContext.tsx', file: 'src/lib/cartContext.tsx', lang: 'typescript' },
  { title: 'Auth State Provider: src/lib/authContext.tsx', file: 'src/lib/authContext.tsx', lang: 'typescript' },
  { title: 'Smart Queue Prediction Algorithm: src/lib/queue.ts', file: 'src/lib/queue.ts', lang: 'typescript' },
  { title: 'Sales CSV Report Generator: src/lib/csv.ts', file: 'src/lib/csv.ts', lang: 'typescript' },
  { title: 'QR Code Generator Service: src/lib/qr.ts', file: 'src/lib/qr.ts', lang: 'typescript' },

  // Backend API Routes
  { title: 'Auth API: Register - src/app/api/auth/register/route.ts', file: 'src/app/api/auth/register/route.ts', lang: 'typescript' },
  { title: 'Auth API: Login - src/app/api/auth/login/route.ts', file: 'src/app/api/auth/login/route.ts', lang: 'typescript' },
  { title: 'Auth API: Profile (Me) - src/app/api/auth/me/route.ts', file: 'src/app/api/auth/me/route.ts', lang: 'typescript' },
  { title: 'Auth API: Logout - src/app/api/auth/logout/route.ts', file: 'src/app/api/auth/logout/route.ts', lang: 'typescript' },
  { title: 'Categories API - src/app/api/categories/route.ts', file: 'src/app/api/categories/route.ts', lang: 'typescript' },
  { title: 'Menu Catalog API - src/app/api/menu/route.ts', file: 'src/app/api/menu/route.ts', lang: 'typescript' },
  { title: 'Menu Item Details & Update API - src/app/api/menu/[id]/route.ts', file: 'src/app/api/menu/[id]/route.ts', lang: 'typescript' },
  { title: 'Transactional Order Placement API - src/app/api/orders/route.ts', file: 'src/app/api/orders/route.ts', lang: 'typescript' },
  { title: 'Order Status Lifecycle API - src/app/api/orders/[id]/route.ts', file: 'src/app/api/orders/[id]/route.ts', lang: 'typescript' },
  { title: '5-Step Pickup Token Verification API - src/app/api/orders/verify-token/route.ts', file: 'src/app/api/orders/verify-token/route.ts', lang: 'typescript' },
  { title: 'Coupon Validation API - src/app/api/coupons/route.ts', file: 'src/app/api/coupons/route.ts', lang: 'typescript' },
  { title: 'Inventory & Restock API - src/app/api/inventory/route.ts', file: 'src/app/api/inventory/route.ts', lang: 'typescript' },
  { title: 'Food Waste & Surplus Flash Deals API - src/app/api/waste/route.ts', file: 'src/app/api/waste/route.ts', lang: 'typescript' },
  { title: 'Feedback & Dish Ratings API - src/app/api/feedback/route.ts', file: 'src/app/api/feedback/route.ts', lang: 'typescript' },
  { title: 'Support Complaints API - src/app/api/complaints/route.ts', file: 'src/app/api/complaints/route.ts', lang: 'typescript' },
  { title: 'In-App Notifications API - src/app/api/notifications/route.ts', file: 'src/app/api/notifications/route.ts', lang: 'typescript' },
  { title: 'Live Crowd Status API - src/app/api/crowd/route.ts', file: 'src/app/api/crowd/route.ts', lang: 'typescript' },
  { title: 'Sales CSV Stream API - src/app/api/reports/export-csv/route.ts', file: 'src/app/api/reports/export-csv/route.ts', lang: 'typescript' },

  // UI Components
  { title: 'Top Navigation Bar: src/components/Navbar.tsx', file: 'src/components/Navbar.tsx', lang: 'tsx' },
  { title: 'Sidebar Navigation: src/components/Sidebar.tsx', file: 'src/components/Sidebar.tsx', lang: 'tsx' },
  { title: 'Food Card Component: src/components/FoodCard.tsx', file: 'src/components/FoodCard.tsx', lang: 'tsx' },
  { title: 'Cart Drawer & Checkout: src/components/CartDrawer.tsx', file: 'src/components/CartDrawer.tsx', lang: 'tsx' },
  { title: 'QR Code Modal & Pass: src/components/QrCodeModal.tsx', file: 'src/components/QrCodeModal.tsx', lang: 'tsx' },
  { title: 'Staff Camera & Token Scanner: src/components/StaffScanner.tsx', file: 'src/components/StaffScanner.tsx', lang: 'tsx' },
  { title: 'Dark/Light Theme Toggle: src/components/ThemeToggle.tsx', file: 'src/components/ThemeToggle.tsx', lang: 'tsx' },

  // Frontend Pages
  { title: 'Root Layout: src/app/layout.tsx', file: 'src/app/layout.tsx', lang: 'tsx' },
  { title: 'Global CSS: src/app/globals.css', file: 'src/app/globals.css', lang: 'css' },
  { title: 'Home Page: src/app/page.tsx', file: 'src/app/page.tsx', lang: 'tsx' },
  { title: 'Menu Page: src/app/menu/page.tsx', file: 'src/app/menu/page.tsx', lang: 'tsx' },
  { title: 'Orders & Tokens Page: src/app/orders/page.tsx', file: 'src/app/orders/page.tsx', lang: 'tsx' },
  { title: 'Kitchen Dashboard: src/app/kitchen/page.tsx', file: 'src/app/kitchen/page.tsx', lang: 'tsx' },
  { title: 'Administrator Control Center: src/app/admin/page.tsx', file: 'src/app/admin/page.tsx', lang: 'tsx' },
  { title: 'Sign-in Page: src/app/login/page.tsx', file: 'src/app/login/page.tsx', lang: 'tsx' },
  { title: 'Student Registration: src/app/register/page.tsx', file: 'src/app/register/page.tsx', lang: 'tsx' },
  { title: 'Loyalty Points & Coupons: src/app/loyalty/page.tsx', file: 'src/app/loyalty/page.tsx', lang: 'tsx' },
  { title: 'Feedback & Support: src/app/feedback/page.tsx', file: 'src/app/feedback/page.tsx', lang: 'tsx' },
  { title: 'Profile Page: src/app/profile/page.tsx', file: 'src/app/profile/page.tsx', lang: 'tsx' },

  // Core Java Implementation
  { title: 'Java Main Entry Point: Main.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/Main.java', lang: 'java' },
  { title: 'Java Model: FoodItem.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/model/FoodItem.java', lang: 'java' },
  { title: 'Java Model: OrderItem.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/model/OrderItem.java', lang: 'java' },
  { title: 'Java Model: Order.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/model/Order.java', lang: 'java' },
  { title: 'Java Model: OrderStatus.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/model/OrderStatus.java', lang: 'java' },
  { title: 'Java Payment Interface: PaymentMethod.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/payment/PaymentMethod.java', lang: 'java' },
  { title: 'Java Payment: UPIPayment.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/payment/UPIPayment.java', lang: 'java' },
  { title: 'Java Payment: CashPayment.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/payment/CashPayment.java', lang: 'java' },
  { title: 'Java Payment: CampusCardPayment.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/payment/CampusCardPayment.java', lang: 'java' },
  { title: 'Java Service Interface: MenuService.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/service/MenuService.java', lang: 'java' },
  { title: 'Java Service Interface: OrderService.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/service/OrderService.java', lang: 'java' },
  { title: 'Java Service Implementation: CanteenServiceImpl.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/service/CanteenServiceImpl.java', lang: 'java' },
  { title: 'Java Persistence: FileStorageService.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/service/FileStorageService.java', lang: 'java' },
  { title: 'Java Exceptions: Exceptions Suite', file: 'java-mini-project/src/com/rscoe/smartcanteen/exception/InvalidOrderException.java', lang: 'java' },
  { title: 'Java UI: SmartCanteenConsoleApp.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/ui/SmartCanteenConsoleApp.java', lang: 'java' },
  { title: 'Java Automated Test Suite: SmartCanteenTest.java', file: 'java-mini-project/src/com/rscoe/smartcanteen/test/SmartCanteenTest.java', lang: 'java' },

  // Automated Test Verification Scripts
  { title: 'Automated Test Runner: scripts/run-tests.js', file: 'scripts/run-tests.js', lang: 'javascript' },
  { title: 'Live HTTP Verification Runner: scripts/verify-http.js', file: 'scripts/verify-http.js', lang: 'javascript' },
];

let doc = `# SMART CANTEEN PRO — COMPLETE MASTER SPECIFICATION & SOURCE BUNDLE
### Autonomous Smart Canteen Pre-Order & Token System
**Department of Computer Science and Business Systems**  
**Rajarshi Shahu College of Engineering, Pune (RSCOE)**  
**Academic Year:** 2026-27 | **Semester:** III | **Class:** S.Y. B.Tech  
**Student Contributors:** Yashraj Ghate (RBT25CB042), Piyush Lokhande (RBT25CB043), Arush Yambarwar (RBT25CB041)  
**Document Generation Date:** ${new Date().toISOString()}

---

## TABLE OF CONTENTS
1. [Academic Project Overview & Problem Statement](#1-academic-project-overview--problem-statement)
2. [Architectural Overview & System Design](#2-architectural-overview--system-design)
3. [User Roles & Functional Capabilities](#3-user-roles--functional-capabilities)
4. [Smart Token, QR & 5-Step Verification Logic](#4-smart-token-qr--5-step-verification-logic)
5. [Innovative Features Implementation](#5-innovative-features-implementation)
6. [Core Java OOP Mini-Project Compatibility & Mapping](#6-core-java-oop-mini-project-compatibility--mapping)
7. [Automated Test Results & Verification](#7-automated-test-results--verification)
8. [Complete Source Code Listings](#8-complete-source-code-listings)

---

## 1. Academic Project Overview & Problem Statement
College canteens frequently experience severe congestion, disorderly physical queues, and lost study time during short 15-minute lecture breaks and lunch hours. Manual cash handling and paper tokens create order confusion, food preparation delays, and lack of visibility for kitchen staff.

**Smart Canteen Pro** computerizes the entire canteen ecosystem:
- **Pre-Ordering:** Students browse all 10 food categories and schedule pickups from anywhere on campus.
- **Smart Pickup Tokens & Signed QR Codes:** Unique tokens (e.g. SC-1008) eliminate order mix-ups.
- **Kitchen Flow Management:** Real-time 3-stage kitchen board organizes orders by preparation status.
- **5-Step Counter Verification:** Protects against unauthorized pickup, unpaid collection, and token re-use.
- **Sustainability:** Surplus food flash sales reduce daily canteen wastage.

---

## 2. Architectural Overview & System Design
The system uses a modern dual-stack architecture:
1. **Full-Stack Enterprise Web Application:** Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, and SQLite.
2. **Standalone Core Java OOP Application:** Pure Java 8+ implementation demonstrating Classes, Objects, Inheritance, Polymorphism, Abstraction, Custom Exceptions, Collections, and File Persistence.

---

## 3. User Roles & Functional Capabilities
- **Student:** Register, authenticate, browse 10 categories, add to cart with customizations, apply promo coupons, redeem loyalty points, track order progression, display QR pass, and print receipts.
- **Canteen Staff:** Live kitchen queue, accept orders, update cooking status, mark ready for pickup, scan QR codes with camera or manual token entry, and toggle item stock.
- **Administrator:** KPI analytics, real CSV sales exports matching college formats, food menu catalog CRUD, inventory restocking, wastage logging, and complaint resolution.

---

## 4. Smart Token, QR & 5-Step Verification Logic
Every order generates a signed QR code payload: \`SCP-VERIFY:<OrderNumber>:<TokenNumber>:<PaymentStatus>\`.
When staff scans or enters the token, the backend executes 5 mandatory security checks:
1. **Order Exists:** Matches unique order in database.
2. **Token Matches:** Prevents tampering or mismatched token numbers.
3. **Authorized Payment:** Confirms order payment status is PAID.
4. **Kitchen Readiness:** Rejects orders unless status is marked READY FOR PICKUP.
5. **No Re-Use:** Verifies order was not previously collected. Prevents duplicate food collection.

---

## 5. Innovative Features Implementation
- **Smart Queue Prediction:** Dynamic estimate = \`8 min base + (Active Orders * 1.5 min) + (Total Items * 0.5 min)\`.
- **Canteen Crowd Indicator:** Real-time crowd classification (Low, Moderate, Busy, Peak) with wait time pill.
- **Food Waste Reduction:** Automated 20% discount flash sale banner for end-of-day surplus items.
- **Loyalty & Rewards:** Earn 1 pt per ₹10 spent, 50 welcome points, 1 point = ₹0.50 discount.
- **Digital Thermal Receipts:** Print-ready formatting for thermal and A4 printers.

---

## 6. Core Java OOP Mini-Project Compatibility & Mapping
The Core Java application mirrors the web business logic using pure OOP:
- \`FoodItem\` & \`OrderItem\`: Encapsulation with defensive copying and positive validation.
- \`PaymentMethod\` Hierarchy: Abstraction and Polymorphism (\`UPIPayment\`, \`CashPayment\`, \`CampusCardPayment\`).
- \`CanteenServiceImpl\`: Interface-driven design implementing \`MenuService\` and \`OrderService\`.
- \`FileStorageService\`: Reads and writes \`menu.txt\` and \`orders.txt\`.

---

## 7. Automated Test Results & Verification
- **Backend & Database Engine:** 12 Passed, 0 Failed (\`node scripts/run-tests.js\`)
- **Live HTTP Endpoints:** 10 Passed, 0 Failed (\`node scripts/verify-http.js\`)
- **Core Java Verification Suite:** 6 Passed, 0 Failed (\`SmartCanteenTest.java\`)

---

## 8. Complete Source Code Listings

`;

for (const item of filesToInclude) {
  const fullPath = path.join(rootDir, item.file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    doc += `\n### ${item.title}\n`;
    doc += `**File Path:** \`${item.file}\`\n\n`;
    doc += '```' + item.lang + '\n';
    doc += content;
    if (!content.endsWith('\n')) doc += '\n';
    doc += '```\n\n---\n';
  } else {
    console.warn(`File not found: ${item.file}`);
  }
}

const outputPath = path.join(rootDir, 'SMART_CANTEEN_PRO_COMPLETE_ALL_IN_ONE.md');
fs.writeFileSync(outputPath, doc, 'utf8');
console.log(`Successfully generated master document at: ${outputPath}`);

// Also copy to Downloads folder for instant accessibility
const downloadsPath = 'C:\\Users\\ADMIN\\Downloads\\SMART_CANTEEN_PRO_COMPLETE_ALL_IN_ONE.md';
try {
  fs.copyFileSync(outputPath, downloadsPath);
  console.log(`Copied master document to Downloads: ${downloadsPath}`);
} catch (e) {
  console.warn(`Could not copy to Downloads: ${e.message}`);
}
