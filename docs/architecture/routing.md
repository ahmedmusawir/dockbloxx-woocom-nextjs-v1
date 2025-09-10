# Routing Architecture

This document provides a comprehensive overview of the Dockbloxx routing strategy, covering Next.js App Router implementation, route organization, dynamic routing, layouts, and navigation patterns.

---

## File-System Based Routing

The Dockbloxx application uses **Next.js 15 App Router** with file-system based routing. This approach automatically creates routes based on the folder structure within the `src/app` directory.

### App Router Benefits

1. **Automatic Route Generation**: Folders become route segments
2. **Nested Layouts**: Hierarchical layout system with shared UI
3. **Loading States**: Built-in loading.tsx support
4. **Error Boundaries**: Automatic error handling with error.tsx
5. **Server Components**: Default server-side rendering
6. **Streaming**: Progressive page rendering

### Root App Structure

```
src/app/
├── layout.tsx          # Root layout (wraps all pages)
├── not-found.tsx       # Global 404 page
├── globals.scss        # Global styles
├── favicon.ico         # Site favicon
├── fonts/              # Custom fonts (2 files)
│
├── (public)/           # Public routes (38 files/folders)
├── (admin)/            # Admin routes (5 files/folders) - PLACEHOLDER
├── (customers)/        # Customer routes (5 files/folders) - PLACEHOLDER
└── api/                # API routes (8 endpoints)
```

---

## Route Segments

The application uses **route groups** to organize different sections while maintaining clean URLs.

### Route Group Organization

#### 1. **(public)** - Primary E-commerce Routes

**Status**: ✅ **ACTIVELY USED** - Main application routes

```
src/app/(public)/
├── page.tsx                         # Homepage (/)
├── loading.tsx                      # Global loading state
├── HomePageContent.tsx              # Homepage content component
│
├── shop/                            # E-commerce routes
│   ├── page.tsx                     # Shop listing (/shop)
│   ├── ShopPageContent.tsx
│   └── [slug]/                      # Product pages (/shop/[slug])
│       ├── page.tsx
│       └── SingleProductContent.tsx
│
├── blog/                            # Content management
│   ├── page.tsx                     # Blog listing (/blog)
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── BlogPageContent.tsx
│   └── [slug]/                      # Blog posts (/blog/[slug])
│       ├── page.tsx
│       ├── loading.tsx
│       └── SinglePostContent.tsx
│
├── category/                        # Product categories
│   ├── page.tsx                     # Category index (/category)
│   └── [catSlug]/                   # Category pages (/category/[catSlug])
│       ├── page.tsx
│       └── SingleCategoryContent.tsx
│
├── cart/                            # Shopping cart
│   ├── page.tsx                     # Cart page (/cart)
│   └── CartPageContent.tsx
│
├── checkout/                        # Payment flow
│   ├── page.tsx                     # Checkout page (/checkout)
│   └── CheckoutPageContent.tsx
│
├── about/                           # Company information
│   ├── page.tsx                     # About page (/about)
│   └── AboutPageContent.tsx
│
├── contact/                         # Contact page
│   ├── page.tsx                     # Contact page (/contact)
│   └── ContactUsContent.tsx
│
├── dealer-coupon/                   # Dealer-specific features
│   ├── page.tsx                     # Dealer coupon page (/dealer-coupon)
│   └── [dealerSlug]/                # Dynamic dealer pages
│       ├── page.tsx
│       └── DealerPageContent.tsx
│
├── dealer-locator/                  # Dealer locator map
│   ├── page.tsx
│   ├── DealerLocatorContent.tsx
│   └── data.js
│
├── dealer-login/                    # Dealer login
│   ├── page.tsx
│   └── DealerLoginContent.tsx
│
├── thankyou/                        # Order confirmation
│   ├── page.tsx                     # Thank you page (/thankyou)
│   └── ThankyouPageContent.tsx
│
├── build-a-bloxx/                   # Custom product builder
│   ├── page.tsx
│   └── BuildABloxxPageContent.tsx
│
├── demo/                            # Demo pages
│   ├── page.tsx
│   └── DemoPageContent.tsx
│
├── slider-test/                     # UI testing
│   ├── page.tsx
│   └── TemplatePageContent.tsx
│
├── template/                        # Generic template page
│   ├── page.tsx
│   └── TemplatePageContent.tsx
│
├── template-bloxx/                  # Bloxx-specific template
│   ├── page.tsx
│   └── BuildABloxxPageContent.tsx
│
├── privacy/                         # Privacy policy
│   ├── page.tsx
│   ├── content.ts
│   └── PrivacyPolicyContent.tsx
│
├── returns/                         # Returns policy
│   ├── page.tsx
│   ├── content.ts
│   └── RefundsPolicyContent.tsx
│
├── terms/                           # Terms & conditions
│   ├── page.tsx
│   ├── content.ts
│   └── TermsPolicyContent.tsx
│
├── warranty/                        # Warranty policy
│   ├── page.tsx
│   ├── content.ts
│   └── WarrantyPolicyContent.tsx
│
├── warranty-registration/           # Warranty registration
│   ├── page.tsx
│   ├── content.ts
│   └── WarrantyRegistrationContent.tsx
│
├── search/                          # Search page
│   ├── page.tsx
│   └── SearchPageContent.tsx
│
├── _our-policy/                     # Consolidated policy page
│   ├── page.tsx
│   ├── content.ts
│   └── OurPolicyContent.tsx
│
├── gift-cards/                      # Gift cards page
│   ├── page.tsx
│   └── GiftCartsContent.tsx
│
├── how-to/                          # How-to videos and guides
│   ├── page.tsx
│   └── HowToPageContent.tsx
│
└── refund-form/                     # Refund form page
    └── page.tsx

```

#### 2. **(admin)** - Administrative Routes

**Status**: 🚧 **PLACEHOLDER ONLY** - Future authentication implementation

```
src/app/(admin)/
├── layout.tsx                  # Admin-specific layout with sidebar
├── loading.tsx                 # Admin loading state
├── not-found.tsx              # Admin 404 page
└── admin-dashboard/
    ├── page.tsx               # Admin dashboard (/admin-dashboard)
    └── AdminPortalContent.tsx
```

**Important Note**: These routes are **placeholder implementations** for future authentication features. They are not currently used in the production e-commerce application but are prepared for when user authentication and role-based access control are implemented.

#### 3. **(customers)** - Customer Portal Routes

**Status**: 🚧 **PLACEHOLDER ONLY** - Future authentication implementation

```
src/app/(customers)/
├── layout.tsx                     # Customer-specific layout with sidebar
├── loading.tsx                    # Customer loading state
├── not-found.tsx                 # Customer 404 page
└── customer-dashboard/
    ├── page.tsx                  # Customer dashboard (/customer-dashboard)
    └── CustomerPortalContent.tsx
```

**Important Note**: Similar to admin routes, these are **placeholder implementations** for future customer account features like order history, profile management, and saved addresses.

### Route Group Benefits

1. **URL Structure**: Route groups `(folder)` don't affect URL paths
2. **Layout Isolation**: Each group can have its own layout
3. **Organization**: Clear separation of concerns
4. **Future-Proofing**: Prepared for authentication implementation

---

## Dynamic Routes

Dynamic routes use square brackets `[param]` to create parameterized URLs that can handle variable content.

### Dynamic Route Implementation

#### 1. Product Pages - `/shop/[slug]`

```typescript
// src/app/(public)/shop/[slug]/page.tsx
import { notFound } from "next/navigation";
import {
  fetchProductBySlug,
  fetchAllProductSlugs,
} from "@/services/productServices";

// Generate static params for SSG
export async function generateStaticParams() {
  try {
    const slugs = await fetchAllProductSlugs();
    return slugs.map((slug: string) => ({ slug }));
  } catch (error) {
    console.error("Error fetching product slugs:", error);
    return [];
  }
}

// Single product page component
const SingleProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const singleProduct = await fetchProductBySlug(slug);

  // Handle 404 with ISR
  if (!singleProduct) {
    notFound();
  }

  return <SingleProductContent product={singleProduct} />;
};

export default SingleProductPage;
```

#### 2. Blog Posts - `/blog/[slug]`

```typescript
// src/app/(public)/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import {
  fetchSinglePostBySlug,
  fetchAllPostSlugs,
} from "@/services/blogServices";

// Generate static params for SSG
export async function generateStaticParams() {
  const slugs = await fetchAllPostSlugs();
  return slugs.map((slug: string) => ({ slug }));
}

// Single post page component
const SinglePost = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const data = await fetchSinglePostBySlug(slug);
  const post = data.post;

  // Handle 404 with ISR
  if (!post) {
    notFound();
  }

  return <SinglePostContent post={post} />;
};

export default SinglePost;
```

#### 3. Category Pages - `/category/[catSlug]`

```typescript
// src/app/(public)/category/[catSlug]/page.tsx
const CategoryPage = async ({
  params,
}: {
  params: Promise<{ catSlug: string }>;
}) => {
  const { catSlug } = await params;

  // Fetch products by category slug
  const products = await fetchProductsByCategory(catSlug);

  return <CategoryPageContent products={products} categorySlug={catSlug} />;
};
```

### Parameter Access Patterns

#### Server Components (Recommended)

```typescript
// Async params in Server Components (Next.js 15+)
const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  // Use slug for data fetching
};
```

> Important: This codebase requires the Next.js 15 async route params pattern. Do not change pages to the older synchronous `{ params: { slug: string } }` signature, as it will break routing and data fetching.

#### Client Components

```typescript
// Using useParams hook in Client Components
"use client";
import { useParams } from "next/navigation";

const ClientComponent = () => {
  const params = useParams();
  const slug = params.slug as string;
  // Use slug in client-side logic
};
```

### Static Site Generation (SSG)

Dynamic routes use `generateStaticParams()` for pre-rendering:

1. **Build Time**: Generate static pages for known slugs
2. **ISR (Incremental Static Regeneration)**: Handle new slugs at runtime
3. **404 Handling**: Use `notFound()` for invalid slugs
4. **Performance**: Pre-rendered pages for faster loading

---

## Layouts and Templates

The application uses a hierarchical layout system to provide consistent UI across different sections.

### Layout Hierarchy

```
Root Layout (app/layout.tsx)
├── Global components (Navbar, Footer, CartSlide)
├── Theme providers and global styles
│
├── (public) routes
│   └── Inherits root layout directly
│
├── (admin) routes
│   └── Admin Layout (app/(admin)/layout.tsx)
│       └── Sidebar navigation + content area
│
└── (customers) routes
    └── Customer Layout (app/(customers)/layout.tsx)
        └── Sidebar navigation + content area
```

### Root Layout Implementation

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import Navbar from "@/components/global/Navbar";
import Main from "@/components/common/Main";
import Footer from "@/components/global/Footer";
import CartSlide from "@/components/cart/CartSlide";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dockbloxx - Premium Dock Hardware",
  description: "High-quality dock hardware and accessories",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Main className="flex flex-col">{children}</Main>
          <Footer />
          <CartSlide />
        </div>
      </body>
    </html>
  );
}
```

### Specialized Layouts

#### Admin/Customer Layout Pattern

```typescript
// src/app/(admin)/layout.tsx & src/app/(customers)/layout.tsx
"use client";

import { ReactNode } from "react";
import Navbar from "@/components/global/Navbar";
import Sidebar from "@/components/common/Sidebar";

interface LayoutProps {
  children: ReactNode;
}

const MemberLayout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex flex-1">
        <div className="hidden md:block h-auto flex-shrink-0 border-4 w-[25rem]">
          <Sidebar />
        </div>
        <div className="flex-grow">{children}</div>
      </section>
    </div>
  );
};

export default MemberLayout;
```

### Layout Features

1. **Nested Layouts**: Child layouts inherit from parent layouts
2. **Shared State**: Layouts persist across route changes
3. **Loading States**: Each layout level can have loading.tsx
4. **Error Boundaries**: Each layout level can have error.tsx
5. **Metadata**: SEO and document head management

---

## Navigation

The application uses Next.js navigation components and hooks for client-side routing.

### Navigation Patterns

#### 1. Link Component (Preferred)

```typescript
// Static navigation links
import Link from "next/link";

const Navigation = () => {
  return (
    <nav>
      <Link href="/shop" className="nav-link">
        Shop
      </Link>
      <Link href="/blog" className="nav-link">
        Blog
      </Link>
      <Link href="/about" className="nav-link">
        About
      </Link>
    </nav>
  );
};
```

#### 2. Dynamic Link Generation

```typescript
// Dynamic product links
import Link from "next/link";
import { Product } from "@/types/product";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="product-card">
      <Link href={`/shop/${product.slug}`}>
        <img src={product.image} alt={product.name} />
        <h3>{product.name}</h3>
        <p>${product.price}</p>
      </Link>
    </div>
  );
};
```

#### 3. Programmatic Navigation

```typescript
// Using useRouter for programmatic navigation
"use client";
import { useRouter } from "next/navigation";

const CheckoutForm = () => {
  const router = useRouter();

  const handleOrderComplete = async (orderId: string) => {
    // Process order...

    // Navigate to thank you page
    router.push(`/thankyou?order=${orderId}`);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <form onSubmit={handleOrderComplete}>
      {/* Form fields */}
      <button type="button" onClick={handleGoBack}>
        Go Back
      </button>
      <button type="submit">Complete Order</button>
    </form>
  );
};
```

### Navigation Usage Patterns

#### Common Navigation Scenarios:

1. **Header Navigation**: Global site navigation in `Navbar.tsx`
2. **Product Browsing**: Category filters and product cards
3. **Shopping Cart**: Cart slide-out with checkout navigation
4. **Checkout Flow**: Multi-step checkout with progress navigation
5. **Blog Navigation**: Post listings and pagination
6. **Breadcrumbs**: Category and product hierarchy navigation

#### Router Hook Usage:

```typescript
// Navigation hooks and their use cases
import {
  useRouter, // Programmatic navigation
  usePathname, // Current path detection
  useParams, // Dynamic route parameters
  useSearchParams, // URL search parameters
} from "next/navigation";

const NavigationExample = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  // Examples:
  // router.push('/shop')           - Navigate to shop
  // router.back()                  - Go back in history
  // pathname === '/shop'           - Check current route
  // params.slug                    - Get dynamic parameter
  // searchParams.get('category')   - Get query parameter
};
```

### Navigation Performance

1. **Prefetching**: Link components automatically prefetch routes
2. **Client-Side Routing**: Fast navigation without full page reloads
3. **Route Caching**: Previously visited routes are cached
4. **Optimistic Navigation**: UI updates before server confirmation

---

## API Routes

The application includes custom API endpoints for server-side functionality:

```
src/app/api/
├── create-payment-intent/      # Stripe payment processing
├── featured-products/          # Homepage featured products
├── get-coupon-by-code/        # Coupon validation
├── place-order/               # Order processing
├── products-by-category/      # Category-based product filtering
├── register-customer/         # Customer registration
└── update-order-status/       # Order status management
```

### API Route Example

```typescript
// src/app/api/featured-products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchFeaturedProducts } from "@/services/productServices";

export async function GET(request: NextRequest) {
  try {
    const products = await fetchFeaturedProducts();
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch featured products" },
      { status: 500 }
    );
  }
}
```

---

## Route Security and Access Control

### Current Implementation

- **Public Routes**: All `(public)` routes are accessible to everyone
- **No Authentication**: Current version doesn't implement user authentication
- **Placeholder Routes**: `(admin)` and `(customers)` routes are prepared for future auth

### Future Authentication Strategy

When authentication is implemented:

1. **Route Groups**: Will enable role-based access control
2. **Middleware**: Route protection at the middleware level
3. **Layout Guards**: Authentication checks in specialized layouts
4. **Redirect Logic**: Automatic redirects for unauthorized access

```typescript
// Future middleware implementation
// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin-dashboard")) {
    // Check admin authentication
    // Redirect if not authenticated
  }

  // Protect customer routes
  if (pathname.startsWith("/customer-dashboard")) {
    // Check customer authentication
    // Redirect if not authenticated
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(admin|customer)/:path*"],
};
```

---

This routing architecture provides a scalable foundation for the Dockbloxx e-commerce platform, with clear separation between public content, future admin functionality, and customer portal features. The file-system based routing combined with route groups creates an intuitive and maintainable structure for both current functionality and future enhancements.
