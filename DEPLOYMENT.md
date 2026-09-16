# 018 BOKONE BOPHIRIMA • DEPLOYMENT & DATABASE INTEGRATION GUIDE

This document guides you through connecting your **Supabase Live PostgreSQL Database**, enabling **Dark & Light Mode**, deploying effortlessly on **Vercel**, and configuring **PayFast South Africa**.

---

## 1. Connecting Your Live Supabase Database (Step-by-Step)

The application includes built-in Supabase PostgreSQL support with an automated fallback to in-memory state if credentials are not present.

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create or log in to your account.
2. Click **New Project**, name it `018-bokone-store`, and set a secure database password.
3. Choose your closest region (e.g., `af-south-1` Cape Town or `eu-west-1` Europe).

### Step 2: Run the 018 Database Schema & Seeds
1. In your Supabase project dashboard, open the **SQL Editor** tab from the left sidebar.
2. Click **New Query**.
3. Open the file `supabase/schema.sql` located in this repository, copy its entire contents, and paste it into the Supabase SQL editor.
4. Click **Run** (or `Cmd + Enter`).
5. This automatically provisions:
   - `products` (All 018 caps, knitwear, hoodies, combos, sizes, colors, and stock)
   - `orders` (Fulfillment details, tracking numbers, customer info, PayFast tokens)
   - `community_photos` (Street looks feed and likes)
   - `store_settings` (Global store config and theme mode)
   - Row Level Security (RLS) policies and performance indexes.

### Step 3: Add Your Supabase Keys to Environment Variables
In your Supabase project settings under **Project Settings > API**, copy your **Project URL** and **anon public key**.

Add them to your `.env` file (and Vercel environment variables):

```env
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsIn..."
# Optional service role key for backend-only privileged operations:
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsIn..."
```

---

## 2. Deploying on Vercel (1-Click & Git Push)

The app is pre-configured with `vercel.json` and a serverless API handler (`/api/index.ts`).

### Method A: Deploy via GitHub / Git Repository (Recommended)
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [https://vercel.com](https://vercel.com) and click **Add New > Project**.
3. Import your 018 Bokone repository.
4. Framework Preset will auto-detect as **Vite**.
5. Under **Environment Variables**, add:
   - `SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `SUPABASE_ANON_KEY` = `your-anon-key`
   - `PAYFAST_MERCHANT_ID` = `10000100` (or your live merchant ID)
   - `PAYFAST_MERCHANT_KEY` = `46f0cd694581a` (or your live key)
   - `PAYFAST_PASSPHRASE` = `payfast_salt_dev` (or your live passphrase)
   - `PAYFAST_SANDBOX` = `false` (for production live payments)
   - `APP_URL` = `https://your-vercel-domain.vercel.app`
6. Click **Deploy**. Vercel will build the frontend and serve both the static Vite assets and `/api/*` serverless routes.

### Method B: Deploy via Vercel CLI
```bash
npm i -g vercel
vercel
# Follow prompts to link and deploy
```

---

## 3. Dark Mode & Light Mode Options

The store supports both **Obsidian Luxury Dark Mode** and **Crisp Studio Light Mode**:

- **Frontend Toggle**: Users can toggle between Dark and Light mode using the theme switch icon in the navigation bar and footer.
- **Persistence**: Theme preference is remembered across sessions via `localStorage` (`018_theme`) and synchronized with system preferences.
- **Backend Sync**: Default store theme can be retrieved and updated via `GET /api/settings` and `POST /api/settings/theme`.

---

## 4. Admin Management Access

- **Location**: The Admin & Inventory Portal link is placed in the **Footer** under the studio section.
- **Features**: Live stock adjustment, adding new garments via camera snap or gallery upload, order status updates, courier tracking waybill assignment, and live Supabase database connection health monitoring.

---

## 5. PayFast South Africa Payment Gateway Setup

For live transactions in South Africa:
1. Register an account at [https://www.payfast.io](https://www.payfast.io).
2. Complete your merchant verification (FICA).
3. Under **Settings > Integration**, retrieve your **Merchant ID**, **Merchant Key**, and configure a **Passphrase**.
4. Set `PAYFAST_SANDBOX="false"` in your production environment variables.
