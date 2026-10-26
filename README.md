# Miraya Couture — Luxury Indian Women's Fashion E-Commerce Platform

A production-grade, mobile-first haute couture shopping platform designed for Indian women's luxury festive wear, bridal lehengas, pure handloom Banarasi sarees, and artisanal anarkalis.

Built with **React 19 + TypeScript + Vite + Tailwind CSS** on the frontend, and a **C# ASP.NET Core 9 Web API Clean Architecture** with **Razorpay Online Payments** and **Cloud Database Support (Neon PostgreSQL / SQL Server)**.

---

## 💎 Brand Identity & Aesthetics

- **Brand Name**: *Miraya Couture (Atelier & Bespoke Silhouettes)*
- **Color Palette**: Warm Alabaster Ivory (`#FBF9F5`), Deep Royal Bordeaux Burgundy (`#722F37`), Imperial Antique Gold (`#C5A059`), Charcoal (`#1C1B1A`).
- **Typography**: Playfair Display (Serif headings) and Plus Jakarta Sans (UI body).
- **Mobile-First**: Tested for 360px+ screens with no horizontal overflow, fixed mobile bottom navigation bar (Home, Explore, Wishlist, Bag, Account), and sticky Add to Bag / Buy Now buttons on product details.

---

## 🚀 Key Functional Modules

1. **Editorial Storefront**:
   - Announcement ticker bar with active promotion code (`FESTIVE15`).
   - Shop by silhouette carousel (Bridal Lehengas, Banarasi Sarees, Anarkalis, Shararas, Indo-Western).
   - Trending drops, best sellers, artisanal heritage storytelling, and verified buyer reviews.
2. **Product Catalog & Details (PLP & PDP)**:
   - Live search by title, SKU, or craft.
   - Filter drawer for mobile view (category, price range slider, sizes XS to XXL).
   - High-res image gallery with zoom and thumbnails.
   - Indian couture Size Guide Modal with measurements in inches and cm.
   - Pincode express delivery checker with BlueDart tracking estimate.
3. **Shopping Bag & Checkout**:
   - Quantity stepper and stock protection.
   - Promo coupon engine (`FESTIVE15` for 15% discount, `WELCOME10` for 10% discount).
   - Complimentary Pan-India shipping for orders over ₹2,999.
   - Address selector and dynamic address creation with pincode validation.
   - **Razorpay Online Payment Integration**: Official test sandbox with UPI (GPay, PhonePe, Paytm), Cards, and NetBanking simulation.
   - Confetti animation and order confirmation receipt.
4. **Customer Account Center**:
   - Order history with live shipment tracking.
   - Saved delivery addresses management.
   - Wishlist with quick "Move to Bag" action.
   - 1-click switcher to test Admin Console.
5. **Backoffice Admin Portal (`/admin`)**:
   - Real-time gross revenue, active orders, and low-stock alerts.
   - Product catalog manager: publish new ensembles with images, fabrics, and variant stock.
   - Inventory stock adjuster with audit log reasons.
   - Order fulfillment manager.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, TanStack Query, React Router, Canvas Confetti |
| **Backend** | C# .NET 9.0 SDK, ASP.NET Core Web API, Entity Framework Core 9 |
| **Database** | Dual Provider: PostgreSQL (Neon / Supabase Free Cloud DB) and SQL Server |
| **Payment Gateway** | Razorpay (HMAC-SHA256 signature verification and idempotent webhooks) |
| **Free Cloud Hosting** | Vercel (Frontend), Render (Backend API), Neon.tech (Database) |

---

## ⚡ Quick Start

### 1. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open: [http://127.0.0.1:5174/](http://127.0.0.1:5174/)

### 2. Start Backend API (ASP.NET Core 9)
```bash
cd backend
dotnet run --project FashionStore.Api/FashionStore.Api.csproj --urls "http://127.0.0.1:5050"
```
- Swagger API Docs: [http://127.0.0.1:5050/swagger](http://127.0.0.1:5050/swagger)
- Health Check: [http://127.0.0.1:5050/health](http://127.0.0.1:5050/health)

### 3. Run Automated Tests
```bash
cd backend
dotnet test
```

---

## 📚 Documentation

- [Architecture Specification](file:///Users/jrajini/Desktop/NewSourceCode/docs/architecture.md)
- [Database ERD & Schema](file:///Users/jrajini/Desktop/NewSourceCode/docs/database-design.md)
- [REST API Contract & Guide](file:///Users/jrajini/Desktop/NewSourceCode/docs/api-guide.md)
- [UI Page Map & Mobile UX](file:///Users/jrajini/Desktop/NewSourceCode/docs/ui-page-map.md)
- [Free Cloud Deployment Guide](file:///Users/jrajini/Desktop/NewSourceCode/docs/deployment-guide.md)
- [Security & Razorpay Guide](file:///Users/jrajini/Desktop/NewSourceCode/docs/security-and-deployment-plan.md)
