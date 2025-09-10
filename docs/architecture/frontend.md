# Frontend Architecture

This document provides a comprehensive overview of the Dockbloxx frontend architecture, covering the core technologies, configuration, and development patterns used throughout the application.

---

## Next.js and TypeScript Setup

### Next.js Configuration

The application uses **Next.js 15** with the App Router architecture. The configuration is defined in `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "wordpress-1366765-5035928.cloudwaysapps.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dockbloxx.headless_site.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cyberizegroup.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "tailwindui.com",
        pathname: "/**",
      },
    ],
  },
  staticPageGenerationTimeout: 300, // Extended timeout for static generation
};

export default nextConfig;
```

Note: If you keep `./src/pages/**/*` in content globs for legacy reasons, it is harmless but not required for App Router-only projects.

#### Key Configuration Features:

1. **React Strict Mode**: Enabled for better development experience and future React compatibility
2. **Image Optimization**: Configured remote patterns for:
   - **Cloudinary**: Image hosting and optimization
   - **WordPress Backend**: Headless WordPress content images
   - **Staging Environment**: Development and testing images
   - **External Resources**: Third-party image sources
3. **Static Generation Timeout**: Extended to 300 seconds for complex page generation

### TypeScript Configuration

The project uses **TypeScript 5** with strict type checking enabled. Configuration in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "src/**/*.d.ts",
    "src/**/*.gql",
    "src/**/*.graphql"
  ],
  "exclude": ["node_modules"]
}
```

---

## Environment, Endpoints, and Images

- All WordPress/Woo/GraphQL endpoints are centralized in `src/constants/apiEndpoints.ts` via `getApiUrl()` using `NEXT_PUBLIC_BACKEND_URL` as the base. This is the single source of truth.
- Woo credentials (server-side): `WOOCOM_CONSUMER_KEY`, `WOOCOM_CONSUMER_SECRET`.
- Image `remotePatterns` hosts in `next.config.ts` are environment-specific. Use placeholders in docs and define actual hosts in `docs/deployment/environments.md`.


#### TypeScript Benefits in This Project:

1. **Type Safety**: Compile-time error detection for API responses, component props, and state management
2. **Developer Experience**: Enhanced IDE support with autocomplete, refactoring, and navigation
3. **Code Quality**: Enforced interfaces for WooCommerce, WordPress, and Stripe data structures
4. **Path Mapping**: `@/*` alias for clean import statements
5. **GraphQL Support**: Type definitions for `.gql` and `.graphql` files

---

## Core Libraries

### Data Fetching Strategy

The application uses **native `fetch` API** instead of external data fetching libraries like SWR or React Query. This approach was chosen for:

- **SSR Compatibility**: Works seamlessly with Next.js server-side rendering
- **Lightweight**: No additional bundle size from external libraries
- **Flexibility**: Direct control over caching and error handling
- **Simplicity**: Straightforward implementation for the project's needs

#### API Call Implementation:

```typescript
// Example from blogServices.ts
export const fetchBlogPosts = async (
  first: number,
  after: string | null
): Promise<BlogPostsResponse> => {
  const response = await fetch(WORDPRESS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY_GET_ALL_POSTS,
      variables: { first, after },
    }),
  });

  const data = await response.json();

  if (data.errors) {
    console.error("GraphQL Errors:", data.errors);
    throw new Error("Failed to fetch blog posts");
  }

  return {
    items: data.data.posts.nodes,
    hasNextPage: data.data.posts.pageInfo.hasNextPage,
    endCursor: data.data.posts.pageInfo.endCursor,
  };
};
```

### Alternative HTTP Client: Axios

For complex requests requiring advanced features, **Axios** is available as a secondary option:

```typescript
// Used for specific WooCommerce API calls requiring authentication
import axios from "axios";
import { WC_REST_URL } from "@/constants/apiEndpoints";

const wooCommerceClient = axios.create({
  baseURL: WC_REST_URL, // Derived from NEXT_PUBLIC_BACKEND_URL via getApiUrl()
  auth: {
    username: process.env.WOOCOM_CONSUMER_KEY!,
    password: process.env.WOOCOM_CONSUMER_SECRET!,
  },
});
```

---

## Component Structure

The component architecture follows a **hierarchical organization** with clear separation of concerns:

### Component Directory Structure

```
src/components/
├── ui/                          # Base UI primitives
│   ├── avatar.tsx
│   ├── button.tsx
│   ├── command.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   └── textarea.tsx
│
├── global/                      # Global layout/shell
│   ├── Footer-ORG.tsx
│   ├── Footer.tsx
│   ├── MobileNavItem.tsx
│   ├── MobileNavOverlay.tsx
│   ├── Navbar-org.tsx
│   ├── Navbar.module.scss
│   └── Navbar.tsx
│
├── common/                      # Cross-cutting components
│   ├── BackButton.tsx
│   ├── Box.tsx
│   ├── Container.tsx
│   ├── FeaturedProducts.tsx
│   ├── LoadMoreButton.tsx
│   ├── Main.tsx
│   ├── NumberedPagination.tsx
│   ├── Page.tsx
│   ├── Row.tsx
│   ├── Sidebar.tsx
│   ├── Spinner.tsx
│   ├── SpinnerLarge.tsx
│   └── SpinnerSmall.tsx
│
├── cart/                        # Cart UI
│   ├── CartImage.tsx
│   ├── CartSlide.tsx
│   └── cart-page/
│       └── CartItems.tsx
│
├── checkout/                    # Checkout flow
│   ├── left-pane/
│   │   ├── BillingForm.tsx
│   │   ├── ContactEmail.tsx
│   │   ├── LeftPane.tsx
│   │   ├── OrderValidation.tsx
│   │   ├── PaymentMethods.tsx
│   │   ├── ShippingForm.tsx
│   │   ├── ShippingInfo.tsx
│   │   ├── ShippingMethods.tsx
│   │   └── StateSelector.tsx
│   ├── payments/
│   │   ├── OrderInfoDialog.tsx
│   │   └── StripePaymentForm.tsx
│   └── right-pane/
│       ├── ApplyCoupon.tsx
│       ├── CheckoutCartItems.tsx
│       ├── CustomerComments.tsx
│       ├── OrderDetailsDesktop.tsx
│       ├── OrderDetailsMobile.tsx
│       └── RightPane.tsx
│
├── home/                        # Homepage sections
│   ├── Hero.tsx
│   ├── HomeProductList.tsx
│   ├── SectionFiveDockEssentials.tsx
│   ├── SectionFourSportsman.tsx
│   ├── SectionOneBestSellers.tsx
│   ├── SectionOneBestSellersProducts.tsx
│   ├── SectionThreeEntertainments.tsx
│   ├── SectionTwoWaterSports.tsx
│   ├── SectionTwoWaterSportsProducts.tsx
│   └── SubscribeNow.tsx
│
├── how-to/                      # How-to/product videos
│   ├── VideoSelector.tsx
│   └── _VideoSelect.tsx
│
├── search/                      # Search widgets
│   ├── SearchControls.tsx
│   ├── SearchPagination.tsx
│   └── SearchProductList.tsx
│
├── shop/                        # Browse/product components
│   ├── PriceDisplay.tsx
│   ├── ProductList.tsx
│   ├── ProductListItem.tsx
│   ├── ShopPageReset.tsx
│   ├── filters/
│   │   └── CategoryFilter.tsx
│   └── product-page/
│       ├── AddToCartButton.tsx
│       ├── AdditionalDetailsAccordion.tsx
│       ├── CurrentPriceDisplay.tsx
│       ├── DynamicProductUi.tsx
│       ├── InstallVideoBlock.tsx
│       ├── ManageQuantity.tsx
│       ├── ProductColorRadio.tsx
│       ├── ProductDescription.tsx
│       ├── ProductDetails.tsx
│       ├── ProductFaq.tsx
│       ├── ProductImageGallery.tsx
│       ├── ProductInfo.tsx
│       ├── ProductReviews.tsx
│       ├── ProductShortDescription.tsx
│       ├── RelatedProducts.tsx
│       ├── StaticLogoBlock.tsx
│       ├── mobile/
│       │   └── MobileProductSlider.tsx
│       └── variations/
│           ├── BloxxPricing.tsx
│           ├── BloxxPricingPoleStyles.tsx
│           ├── ComplexVariationPricing.tsx
│           ├── GiftcardPricing.tsx
│           ├── SimplePricing.tsx
│           └── SingleVariationPricing.tsx
│
├── about/                       # About page
│   ├── MeetTheTeam.tsx
│   └── VideoBlock.tsx
│
├── dealer/                      # Dealer-specific UI
│   ├── DealerCTA.tsx
│   └── DealerCouponClientBlock.tsx
│
├── contact/                     # Contact page
│   └── Faq.tsx
│
└── blog/                        # Blog listing/cards
    └── BlogPostItems.tsx
```

### Component Design Principles

1. **Single Responsibility**: Each component has a focused, specific purpose
2. **Reusability**: Base UI components are designed for reuse across the application
3. **Composition**: Complex components are built by composing simpler components
4. **Props Interface**: All components use TypeScript interfaces for props
5. **Domain Separation**: Components are organized by business domain (shop, checkout, blog)

### Example Component Structure

```typescript
// components/shop/ProductCard.tsx
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
  className?: string;
}

export function ProductCard({
  product,
  onAddToCart,
  className,
}: ProductCardProps) {
  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      <img src={product.images[0]?.src} alt={product.name} />
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-600">${product.price}</p>
      <Button onClick={() => onAddToCart(product.id)}>Add to Cart</Button>
    </div>
  );
}
```

---

## Styling Implementation

### Tailwind CSS Configuration

The application uses **Tailwind CSS 3.4.1** as the primary styling framework. Configuration in `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        lg: "1150px", // Custom breakpoint moved from 1024px
      },
      colors: {
        // Shadcn/ui color system
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // ... additional color definitions
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
} satisfies Config;
```

### Global Styles and Typography

Global styles are defined in `src/app/globals.scss`:

```scss
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap");

body {
  font-family: "Poppins", sans-serif;
  scroll-behavior: smooth;
}

@layer base {
  h1 {
    @apply text-4xl font-bold text-gray-900 dark:text-white;
  }

  h2 {
    @apply text-3xl font-bold text-gray-800 dark:text-white;
  }

  h3 {
    @apply text-2xl font-bold text-gray-700 dark:text-white;
  }

  // ... additional heading styles

  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    // ... CSS custom properties for theming
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    // ... dark mode color definitions
  }
}
```

### Styling Conventions and Best Practices

1. **Utility-First Approach**: Prefer Tailwind utility classes over custom CSS
2. **Component Variants**: Use `class-variance-authority` for component variations
3. **Responsive Design**: Mobile-first approach with custom breakpoints
4. **Dark Mode Support**: CSS custom properties with class-based dark mode
5. **Typography Scale**: Consistent heading styles defined globally
6. **Color System**: HSL-based color system for better theming support

#### Example Styling Pattern:

```typescript
// Using class-variance-authority for component variants
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

---

## Linting and Formatting

### ESLint Configuration

The project uses **ESLint 8** with Next.js-specific rules. Configuration is managed through `package.json`:

```json
{
  "devDependencies": {
    "eslint": "^8",
    "eslint-config-next": "15.0.3"
  },
  "scripts": {
    "lint": "next lint"
  }
}
```

#### ESLint Rules and Standards:

1. **Next.js Best Practices**: Enforced through `eslint-config-next`
2. **React Hooks Rules**: Proper hook usage and dependencies
3. **TypeScript Integration**: Type-aware linting rules
4. **Import Organization**: Consistent import ordering and grouping
5. **Accessibility**: Basic a11y rules for better user experience

### Code Quality Tools

#### Additional Development Dependencies:

```json
{
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/lodash": "^4.17.15",
    "typescript": "^5"
  }
}
```

### Development Workflow

1. **Pre-commit Checks**: ESLint runs on modified files
2. **Type Checking**: TypeScript compilation validates types
3. **Build Validation**: Next.js build process catches runtime issues
4. **Hot Reloading**: Turbopack provides fast development feedback

#### Development Commands:

```bash
# Development server with Turbopack
npm run dev

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Production build
npm run build
```

---

## Performance Optimizations

### Next.js Optimizations

1. **Image Optimization**: Next.js Image component with remote patterns
2. **Static Generation**: ISR for blog posts and product pages
3. **Code Splitting**: Automatic route-based code splitting
4. **Bundle Analysis**: Built-in bundle analyzer for optimization

### CSS Optimizations

1. **Tailwind Purging**: Unused CSS classes removed in production
2. **Critical CSS**: Above-the-fold styles inlined
3. **Font Optimization**: Google Fonts with `display=swap`
4. **SCSS Processing**: Optimized CSS compilation

### Development Experience

1. **Turbopack**: Fast bundler for development
2. **Hot Module Replacement**: Instant updates during development
3. **TypeScript Integration**: Real-time type checking
4. **Path Mapping**: Clean import statements with `@/*` alias

---

This frontend architecture provides a solid foundation for scalable, maintainable, and performant React development with Next.js. The combination of TypeScript, Tailwind CSS, and modern development tools ensures a productive development experience while maintaining code quality and performance standards.
