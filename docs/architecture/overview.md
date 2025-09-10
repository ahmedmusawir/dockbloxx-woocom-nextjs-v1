# Architecture Overview

## Project Goal

Dockbloxx is a modern headless e-commerce platform built with Next.js that combines the power of WooCommerce for product management and order processing with WordPress for content management. The application provides a seamless shopping experience with integrated blog functionality, secure payment processing through Stripe, and a responsive, component-driven user interface. It solves the problem of needing separate systems for e-commerce and content management by providing a unified, performant frontend that leverages the best of both WordPress and WooCommerce ecosystems while maintaining modern web development practices.

---

## Architecture Type: Monolith

Dockbloxx follows a **monolithic frontend architecture** with external service integrations. The entire application is contained within a single Next.js codebase that communicates with external APIs and services:

- **Single Codebase**: All frontend logic, routing, and components are contained in one Next.js application
- **External Services**: Integrates with WordPress (GraphQL), WooCommerce (REST API), and Stripe (Payment Processing)
- **Unified Deployment**: The entire application deploys as a single unit
- **Shared State**: Global state management through Zustand stores

---

## High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        DOCKBLOXX FRONTEND                      │
│                         (Next.js 15)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Public    │  │  Customers  │  │    Admin    │             │
│  │   Routes    │  │   Routes    │  │   Routes    │             │
│  │ (/blog,     │  │ (/account,  │  │ (/admin/*)  │             │
│  │  /shop,     │  │  /orders,   │  │             │             │
│  │  /checkout) │  │  /profile)  │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Custom    │  │   Service   │  │    State    │             │
│  │ API Routes  │  │    Layer    │  │ Management  │             │
│  │ (/api/*)    │  │             │  │  (Zustand)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ WordPress   │  │ WooCommerce │  │   Stripe    │             │
│  │  GraphQL    │  │  REST API   │  │  Payments   │             │
│  │             │  │             │  │             │             │
│  │ • Blog      │  │ • Products  │  │ • Payment   │             │
│  │   Posts     │  │ • Orders    │  │   Intents   │             │
│  │ • Categories│  │ • Customers │  │ • Webhooks  │             │
│  │ • Authors   │  │ • Cart      │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow:

1. **Frontend (Next.js)** → **Custom REST Endpoints** → **WooCommerce API** (Products, Orders, Cart)
2. **Frontend (Next.js)** → **GraphQL Queries** → **WordPress API** (Blog Content)
3. **Frontend (Next.js)** → **Custom API Routes** → **Stripe API** (Payment Processing)
4. **State Management (Zustand)** ↔ **React Components** (UI State)

---

## Key Directories and Their Purpose

### Root Level
```
dockbloxx-staging-repo/
├── src/                    # Main application source code
├── docs/                   # Project documentation
├── public/                 # Static assets (images, icons)
├── package.json           # Dependencies and scripts
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

### Source Code Structure (`/src`)
```
src/
├── app/                            # Next.js App Router (Pages & Layouts)
│   ├── (public)/                   # Public routes (blog, shop, checkout)
│   ├── (customers)/                # Customer dashboard routes
│   ├── (admin)/                    # Admin panel routes
│   ├── api/                        # Custom API endpoints
│   ├── globals.scss                # Global styles
│   └── layout.tsx                  # Root layout component
│
├── components/                     # Reusable React components
│   ├── ui/                         # Base UI components
│   ├── about/                      # About page components
│   ├── blog/                       # Blog-related components
│   ├── cart/                       # Shopping cart components
│   ├── checkout/                   # Payment and checkout components
│   ├── common/                     # Common/shared components
│   ├── contact/                    # Contact page components
│   ├── dealer/                     # Dealer-specific components
│   ├── global/                     # Global layout components
│   ├── home/                       # Homepage components
│   ├── how-to/                     # How-to and product video components
│   ├── search/                     # Search-related components
│   └── shop/                       # E-commerce/shop components
│
├── hooks/                          # Reusable React hooks
│   ├── useCheckoutTracking.ts
│   ├── useCouponTracking.ts
│   ├── useProductTracking.ts
│   └── useSignupTracking.ts
│
├── services/                       # API service layer
│   ├── blogServices.ts
│   ├── categoryServices.ts
│   ├── checkoutServices.ts
│   ├── customerService.ts
│   ├── dealerServices.ts
│   ├── orderServices.ts
│   ├── pageServices.ts
│   ├── productServices.ts
│   ├── searchServices.ts
│   ├── testServices.ts
│   └── trackingSeoServices.ts
│
├── lib/                            # Utility functions and configurations
│   ├── analytics.ts
│   ├── checkoutUtils.ts
│   ├── couponUtils.ts
│   ├── orderUtils.ts
│   ├── renderPricingModules.tsx
│   ├── seoUtils.ts
│   ├── test.ts
│   ├── utils.ts
│   └── yoastMapper.ts
│
├── constants/                      # Centralized constants
│   └── apiEndpoints.ts             # Endpoints built from NEXT_PUBLIC_BACKEND_URL
│
├── rest-api/                       # REST API helpers
│   ├── checkout.ts
│   └── products.ts
│
├── graphql/                        # GraphQL queries and types
│   └── queries/
│
├── store/                          # Zustand state management
│   ├── useCartStore.ts
│   ├── useCheckoutStore.ts
│   ├── useNumberedPaginationStore.ts
│   ├── usePaginationStore.ts
│   └── useProductStore.ts
│
├── types/                          # TypeScript type definitions
│   ...
│
└── demo-data/                      # Demo/fixture content
    ...
```

### Documentation Structure (`/docs`)
```
docs/
├── api/                 # API documentation
│   ├── woocommerce.md   # WooCommerce REST API docs
│   ├── graphql.md       # WordPress GraphQL docs
│   ├── stripe.md        # Stripe integration docs
│   └── custom-endpoints.md # Custom API endpoints docs
│
├── architecture/        # Architecture documentation
│   ├── overview.md      # This file - high-level overview
│   ├── frontend.md      # Frontend architecture details
│   ├── routing.md       # Next.js routing structure
│   ├── state-management.md # Zustand state patterns
│   └── data-flow.md     # Data flow and API interactions
│
├── deployment/          # Deployment and DevOps docs
├── guides/              # Development guides and tutorials
├── state/               # State management documentation
└── ui-ux/               # UI/UX design documentation
```

---

## Technology Stack Summary

### **Frontend Framework**
- **Next.js 15** - React framework with App Router
- **React 18** - UI library with latest features
- **TypeScript** - Type-safe development

### **Styling & UI**
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Shadcn/ui** - Component library built on Radix
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - SVG icon library

### **State Management**
- **Zustand** - Lightweight state management
- **React Hook Form** - Form state and validation
- **LocalForage** - Client-side storage

### **Data Fetching & APIs**
- **Native Fetch** - HTTP client for API calls
- **Axios** - Alternative HTTP client for complex requests
- **GraphQL** - Query language for WordPress content
- **REST APIs** - WooCommerce and custom endpoints

### **External Services**
- **WordPress** - Content management (GraphQL endpoint)
- **WooCommerce** - E-commerce backend (REST API)
- **Stripe** - Payment processing and webhooks

### **Development Tools**
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Turbopack** - Fast bundler for development

### **Deployment & Hosting**
- **Vercel** - Primary frontend hosting platform
- **Environment Variables** - Configuration management
- **HTTPS** - Secure communication

---

## Key Architectural Decisions

### **1. Headless Architecture**
- **Separation of Concerns**: Frontend and backend are decoupled
- **Flexibility**: Can swap backend services without affecting frontend
- **Performance**: Optimized frontend with CDN delivery

### **2. Next.js App Router**
- **File-based Routing**: Intuitive route organization
- **Server Components**: Improved performance with SSR
- **API Routes**: Custom backend logic within the same codebase

### **3. Service Layer Pattern**
- **Abstraction**: Clean separation between UI and data fetching
- **Reusability**: Shared service functions across components
- **Testing**: Easier to mock and test API interactions

### **4. Type Safety**
- **TypeScript**: Compile-time error checking
- **Interface Definitions**: Strongly typed API responses
- **Developer Experience**: Better IDE support and refactoring

### **5. Component-Driven Development**
- **Reusability**: Modular, reusable UI components
- **Consistency**: Shared design system
- **Maintainability**: Isolated component logic

---

## Endpoints Source of Truth

- All WordPress/WooCommerce/GraphQL endpoints are centralized in `src/constants/apiEndpoints.ts`.
- Endpoints are built via `getApiUrl()` using `NEXT_PUBLIC_BACKEND_URL` as the base (set in `.env.local`).

Defined constants (one-liners):

- `WC_REST_URL` → Base WooCommerce REST root (`/wp-json/wc/v3`).
- `ACF_REST_OPTIONS` → ACF options endpoint (`/wp-json/acf/v3/options/options`).
- `WP_REST_PAGES` → WordPress pages (`/wp-json/wp/v2/pages`).
- `WP_REST_POSTS` → WordPress posts (`/wp-json/wp/v2/posts`).
- `WP_REST_PRODUCT_CATS` → Product categories (`/wp-json/wp/v2/product_cat`).
- `DEALER_REST_COUPONS` → Dealer coupon CPT (`/wp-json/wp/v2/dealer_coupon`).
- `GRAPHQL_ENDPOINT` → WordPress GraphQL endpoint (`/graphql`).
- `HOW_TO_BLOXX_REST_URL` → Dockbloxx product videos (`/wp-json/dockbloxx/v1/product-videos`).

Note: Any example URLs/domains in docs are placeholders. See `docs/deployment/environments.md` for environment-specific hosts.

---

## Notes on Directory Counts

Component/file counts shown in structure examples are illustrative and may change over time. Treat them as examples rather than exact tallies.

This overview provides the foundation for understanding the Dockbloxx architecture. For detailed information about specific aspects, refer to the other documentation files in this architecture section.