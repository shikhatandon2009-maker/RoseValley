# Luxury Essential Oils & Perfumes E-Commerce Platform

A premium, fully-editable, **100% Vercel-ready** Next.js 14 (App Router) + Supabase e-commerce store designed for **Essential Oils & Perfumes** with a soft Blush-to-Mulberry theme (`#F8E8E8` to `#5A1030`).

---

## 🌟 Key Features

1. **Store-Scoped Multi-Tenant Database**: Every database query is scoped with `STORE_ID` to seamlessly share a multi-shop Supabase instance without data collisions.
2. **Custom HTTP-Only JWT Auth**: `users` table with `bcryptjs` password hashing and JWT sessions stored in HTTP-only cookies (`auth_token`). Includes a **"Generate Password"** flow at registration/reset.
3. **Razorpay Payments**: Integrated Razorpay checkout with server-side HMAC SHA256 signature verification (`/api/razorpay/verify-webhook`).
4. **Smart Order Dispatch System (Mobile-First)**:
   - Scan shipping labels via mobile camera or photo upload.
   - **Tesseract.js OCR** automatically extracts tracking numbers (FedEx, DHL, BlueDart, Delhivery, SpeedPost).
   - Auto-fills tracking number with manual override option.
   - Updates order status to `shipped` and triggers customer email + in-app notification.
5. **Nodemailer SMTP & Email Send Logs**:
   - Gmail SMTP integration.
   - Every email sent (Welcome, Order Confirmation, Payment Success, Dispatch, Password Reset) is logged into `notification_logs` table (`recipient`, `subject`, `status`, `provider_response`, `timestamp`) with an Admin viewer.
6. **✨ AI-Assisted Admin Content Generation**:
   - Unified AI service (`/api/ai/generate-content`) for drafting Product Descriptions, Scent Notes, Category Descriptions, Blog Articles, and Q&A Answers.
   - Output lands as an **editable draft** requiring explicit admin save.
7. **Database-Connected Intelligent Chatbot**:
   - Floating glassmorphic widget on all storefront pages.
   - Queries live Supabase database for products, notes, ingredients, and order status.
   - Guarded: Order status requires **BOTH** Order Number (`MDE-XXXX`) AND matching email address.
8. **In-App Notification Feed**: Real-time notifications for order updates, wishlist alerts, low stock, and new reviews.
9. **Multi-Currency Support**: Exchange rates stored in database (`exchange_rates`) with automatic daily refresh via Vercel Cron (`/api/cron/exchange-rates`).
10. **Customer Reviews & High-Quality Q&A**: Verified purchase badges, helpful votes, moderation queue, official perfumer answers.

---

## 🎨 Luxury Color Palette

| Name | Hex | Usage |
|---|---|---|
| Blush | `#F8E8E8` | Page backgrounds, light cards |
| Petal | `#F2D4D4` | Secondary backgrounds, borders |
| Rose | `#E8B8B8` | Soft accents, muted highlights |
| Peony | `#E08A9A` | Hover states, secondary buttons |
| Pink | `#D45A7A` | Primary CTA buttons, interactive links |
| Flamingo | `#C94A6A` | Strong accents |
| Fuchsia | `#B03060` | Active states, badges |
| Raspberry | `#9A2048` | Dark accents, focus elements |
| Magenta | `#7A1840` | Headers, important titles |
| Mulberry | `#5A1030` | Footer, dark text, dark mode panels |

---

## ⚡ Quick Start & Setup

### 1. Database Setup (Supabase)
Run the SQL scripts in your Supabase SQL Editor in order:
1. `database/schema.sql`: Creates all store-scoped tables, indexes, and constraints.
2. `database/seed.sql`: Seeds currencies, initial luxury products, categories, reviews, Q&A, and sample users.

**Sample Admin Credentials**:
- **Email**: `admin@maisonessence.com`
- **Password**: `admin123`

### 2. Environment Variables (`.env.local`)
Copy `.env.example` to `.env.local` and populate:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your_supabase_project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STORE_ID=essential_oils_perfumes_store_01

JWT_SECRET=super_secret_jwt_key_luxury_perfumes_essential_oils_2026
JWT_EXPIRES_IN=7d

NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=your_gmail_address@gmail.com
EMAIL_FROM_NAME=Maison De L'Essence

AI_PROVIDER_API_KEY=your_openai_or_anthropic_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies & Launch
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deploying to Vercel

1. Push code repository to GitHub/GitLab.
2. Import project into Vercel Dashboard.
3. Configure the Environment Variables listed in `.env.example`.
4. Deployment builds automatically with Next.js 14 App Router.
5. Vercel Cron automatically picks up `vercel.json` to refresh exchange rates daily at midnight UTC via `/api/cron/exchange-rates`.
