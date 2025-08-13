# Styling Conventions

This document is the single source of truth for how we style Dockbloxx. It covers Tailwind CSS configuration, utility usage, component patterns with CVA, and best practices for consistency.

---

## Core Technology

- **Tailwind CSS** is the primary styling framework.
- **SCSS** is used sparingly for global layers and tokens in `src/app/globals.scss`.
- **Dark mode** is class-based: `darkMode: ["class"]` in `tailwind.config.ts`. Toggle by setting a `dark` class on `html` or `body`.

---

## Tailwind Configuration

Location: `tailwind.config.ts`

- **Content paths**: `src/app/**`, `src/pages/**`, `src/components/**`.
- **Dark mode**: `class` strategy.
- **Custom breakpoint**:
  - `lg: "1150px"` (moved up from the default 1024px to better match our layout).
- **Design tokens** (via CSS variables in HSL):
  - Colors under `theme.extend.colors` map to CSS vars defined in `src/app/globals.scss` (`:root` and `.dark`).
  - Keys include: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `card`, `popover`, `border`, `input`, `ring`, `chart.{1..5}`.
- **Radius scale**: `--radius` drives `lg`, `md`, `sm` under `theme.extend.borderRadius`.
- **Plugins**:
  - `@tailwindcss/typography`
  - `@tailwindcss/aspect-ratio`
  - `@shrutibalasa/tailwind-grid-auto-fit`
  - `tailwindcss-animate`

Global base styles and variables live in `src/app/globals.scss`:
- Imports the **Poppins** font and sets `body` font.
- Defines light/dark CSS variables for all theme colors and `--radius`.
- Provides base typography with `@layer base` for `h1..h6`.

---

## Utility Classes vs. Component Classes

- **Utility-first default**: Prefer composing Tailwind utilities directly in JSX for most UI.
- **When to create component recipes**:
  - Repeated patterns with variants (e.g., size, intent, state).
  - Complex elements that require consistent, type-safe props.
  - Shared primitives (buttons, inputs, badges) used across pages.
- **Avoid custom global classes** unless:
  - You are setting global base styles (`@layer base`).
  - You need one-off keyframes or plugin-style definitions.
  - You are wrapping 3rd-party content (e.g., `.strapiMarkdownRichText`).

---

## Best Practices

- **Class order convention** (readability; not enforced):
  1) layout/display (e.g., `container`, `flex`, `grid`, `contents`)
  2) position/overflow (e.g., `relative`, `z-10`, `overflow-hidden`)
  3) box model (e.g., `w-`, `h-`, `p-`, `m-`, `gap-`, `space-`)
  4) typography (e.g., `font-`, `text-`, `leading-`, `tracking-`)
  5) visuals (e.g., `bg-`, `from-`, `to-`, `border-`, `shadow-`, `ring-`)
  6) effects/animation (e.g., `transition-`, `duration-`, `ease-`, `animate-`)
  7) state/variant modifiers last (e.g., `aria-pressed:`, `data-[state=open]:`, `hover:`, `focus:`)
  8) responsive modifiers appended by size (see below)

- **Responsive conventions**:
  - Mobile-first: write unprefixed classes for base, then add `sm: md: lg: xl:` as needed.
  - Because `lg` is 1150px, verify layouts at `md` (768px) and `lg` breakpoints.

- **Dark mode**:
  - Prefer token-based colors, e.g., `bg-background text-foreground`, so themes switch automatically.
  - When needed, add dark variants: `dark:bg-secondary dark:text-secondary-foreground`.

- **Spacing and sizing**:
  - Use Tailwind scales where possible; only use arbitrary values (`[12px]`) when necessary.

- **Composition**:
  - Extract repeated patterns with CVA (see below) or small component wrappers.
  - When composing dynamic class strings, prefer `tailwind-merge` to resolve conflicts.

Example ordering:
```tsx
<button
  className="inline-flex items-center justify-center relative select-none
             w-full sm:w-auto px-4 py-2 gap-2
             text-sm font-medium
             bg-primary text-primary-foreground hover:bg-primary/90
             rounded-md border border-border shadow-sm
             transition-colors
             disabled:opacity-50 disabled:pointer-events-none
             md:px-5 md:py-2.5"
>
  Continue
</button>
```

---

## The Role of CVA (Class Variance Authority)

We use **class-variance-authority** (`cva`) to build reusable, type-safe UI primitives with variants (e.g., `intent`, `size`, `state`). This keeps JSX clean and centralizes styling decisions.

- Libraries in use: `class-variance-authority`, `tailwind-merge`, and component patterns compatible with shadcn/ui.

Button example:
```ts
// src/components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn"; // wrapper around tailwind-merge + clsx
import * as React from "react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap select-none\n   text-sm font-medium rounded-md border border-border shadow-sm\n   transition-colors disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      intent: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        ghost: "bg-transparent hover:bg-accent",
      },
      size: {
        sm: "h-8 px-3",
        md: "h-9 px-4",
        lg: "h-10 px-5",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ intent, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
```

Usage:
```tsx
<Button intent="secondary" size="lg">Add to cart</Button>
```

Guidelines:
- Keep CVA recipes small and focused; avoid giant variant matrices.
- Use tokenized colors (`bg-primary`, `text-foreground`) to inherit theming.
- Co-locate the recipe with the component under `src/components/ui/`.

---

## Global Layers and Tokens

- Base typography (`h1..h6`) and color variables are defined in `src/app/globals.scss` using `@layer base`.
- Avoid overriding Tailwind defaults globally unless it is a deliberate design token.
- Prefer semantic tokens (`bg-background`, `text-foreground`, `border-border`) over raw color utilities where possible.

---

## Plugins and Utilities

- **Typography**: Use `prose` classes for rich text areas; keep overrides minimal.
- **Aspect Ratio**: Use `aspect-[w/h]` or plugin classes for media and cards.
- **Grid Auto Fit**: `@shrutibalasa/tailwind-grid-auto-fit` enables responsive auto-fit grids.
- **Animate**: `tailwindcss-animate` for lightweight animation utilities. Prefer transitions for simple effects.

---

## Do/Don’t Checklist

- **Do** use utilities in JSX; **don’t** introduce ad-hoc global classes.
- **Do** use CVA for reusable primitives with variants.
- **Do** rely on tokens and dark mode variables.
- **Don’t** hardcode hex colors; prefer semantic tokens.
- **Don’t** duplicate layout rules; extract with components or CVA.

