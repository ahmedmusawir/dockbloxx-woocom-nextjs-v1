# Getting Started

This guide will get you set up to run the Dockbloxx Next.js + WooCommerce app locally in minutes.

---

## Prerequisites

- __Node.js__: v18.x LTS recommended (Next.js 15 supports Node 18 or 20)
  - Verify: `node -v` (should print v18.x)
  - Optional: use `nvm` to install and switch versions.
- __npm__: v9+ (bundled with Node 18)
- __Git__: latest stable

Optional tools:
- __VS Code__ with ESLint/Prettier extensions
- __Stripe CLI__ (useful for payment testing)

---

## Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/dockbloxx-woocom-nextjs-v1.git

# Enter the project directory
cd dockbloxx-woocom-nextjs-v1

# Install dependencies
npm install
```

---

## Environment Variables

Create a `.env.local` file in the project root. This file is git-ignored and will override defaults for local dev. Replace placeholders with real values.

```bash
# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend base URL (WordPress/WooCommerce host)
NEXT_PUBLIC_BACKEND_URL=https://your-backend.example.com

# WordPress GraphQL endpoint
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress.example.com/graphql

# WooCommerce REST API credentials (Server-side only usage via API routes)
WOOCOM_CONSUMER_KEY=YOUR_WOOCOM_CONSUMER_KEY_HERE
WOOCOM_CONSUMER_SECRET=YOUR_WOOCOM_CONSUMER_SECRET_HERE

# Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

Notes:
- Do __not__ commit real keys. `.env.local` is excluded from version control.
- Backend endpoints are centralized in `src/constants/apiEndpoints.ts` using `NEXT_PUBLIC_BACKEND_URL`.
- Server-only secrets (Woo/Stripe secret) are accessed inside Next.js API routes and never shipped to the browser.

---

## Running the Application

```bash
# Start the dev server
npm run dev
```

Then open:
- http://localhost:3000

---

## Verifying the Setup

Perform these quick checks:
- __Homepage__: Navigate to `/` and confirm featured products render without errors.
- __Shop__: Visit `/shop` and verify products load and pagination works.
- __Search__: Use the search UI and confirm results render (proxied via `/api/search`).
- __Cart__: Add a product to the cart and confirm the cart drawer updates and persists on refresh.
- __Checkout (non-payment smoke test)__: Open `/checkout`, ensure totals hydrate without flicker and shipping method selection updates totals.

If something fails:
- Re-check `.env.local` values (especially backend URLs and keys).
- Ensure your backend/WordPress/WooCommerce instance is reachable from your machine.
- Inspect browser console and terminal for clear error messages from API routes under `src/app/api/*`.

---

## Common Scripts

```bash
npm run dev       # Start Next.js in development mode
npm run build     # Production build
npm run start     # Start the production server (after build)
```

You are ready to build! For deeper architecture, see:
- `docs/architecture/data-flow.md`
- `docs/state/zustand-stores.md`
- `docs/state/data-persistence.md`
- `docs/api/custom-endpoints.md`
