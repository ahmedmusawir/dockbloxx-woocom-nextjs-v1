# Design System

This document is a living reference for Dockbloxx’s core design elements: typography, color, spacing, and component foundations. It complements `docs/ui-ux/styling-conventions.md` by describing the tokens and primitives that ensure visual consistency across the app.

---

## Purpose and Relationship to shadcn/ui

- **Purpose**: Provide a consistent, token-driven foundation for building UI at scale. Designers and developers share the same source of truth for colors, type, spacing, and component behaviors.
- **shadcn/ui relationship**: We follow shadcn-style primitives (composition over monolithic UI kits). Components are built with **Tailwind** + **CVA** for typed variants and rely on our design tokens (color, radius, spacing) defined in CSS variables and Tailwind theme extensions.

References:
- Tokens: `src/app/globals.scss`
- Tailwind theme: `tailwind.config.ts`
- CVA usage: `docs/ui-ux/styling-conventions.md`

---

## Typography

- **Font family**: `Poppins`, sans-serif (declared in `src/app/globals.scss`).
- **Base text**: Inherits Tailwind defaults with semantic tokens for color: `text-foreground` on `body`.
- **Headings** (via `@layer base` in `globals.scss`):
  - `h1`: `text-4xl font-bold`
  - `h2`: `text-3xl font-bold`
  - `h3`: `text-2xl font-bold`
  - `h4`: `text-xl font-bold`
  - `h5`: `text-lg font-bold`
  - `h6`: `text-base font-bold`
- **Color**: Headings use `text-gray-…` in light mode and `dark:text-white` overrides, while the global `body` uses `text-foreground`. Prefer semantic tokens (`text-foreground`) in components.
- **Line height and tracking**: Default Tailwind leading/tracking unless a component specifies otherwise.

Rich text (Markdown/Strapi) wrapper: `.strapiMarkdownRichText` adjusts margins and list styles for content blocks.

---

## Color Palette

Color tokens are defined as CSS variables (HSL) in `globals.scss` and surfaced to Tailwind via `theme.extend.colors` in `tailwind.config.ts`. Dark mode values are provided under the `.dark` scope.

- **Semantic tokens**
  - `background`, `foreground`
  - `card`, `card-foreground`
  - `popover`, `popover-foreground`
  - `primary`, `primary-foreground`
  - `secondary`, `secondary-foreground`
  - `muted`, `muted-foreground`
  - `accent`, `accent-foreground`
  - `destructive`, `destructive-foreground` (error/destructive intent)
  - `border`, `input`, `ring`

- **Data visualization**
  - `chart-1` … `chart-5`: preset hues for charts/metrics.

- **Classes**
  - Backgrounds: `bg-background`, `bg-card`, `bg-popover`, `bg-primary`, `bg-secondary`, `bg-accent`, `bg-muted`, `bg-destructive`
  - Text: `text-foreground`, `text-card-foreground`, `text-primary-foreground`, etc.
  - Borders: `border-border`, inputs: `bg-input`, focus rings: `ring-ring`

- **States and theming**
  - Use semantic tokens in components to automatically honor dark mode.
  - If you need additional semantic intents (e.g., success/warning/info), compose via existing tokens (e.g., `accent`) or extend `tailwind.config.ts` with new variables in `globals.scss`.

---

## Spacing and Layout

- **Spacing scale**: Tailwind default spacing scale (no custom extension). Prefer standard utilities: `p-*`, `m-*`, `space-*`, `gap-*`.
- **Layout primitives**: `container`, `flex`, `grid`, `auto-fit` grids via `@shrutibalasa/tailwind-grid-auto-fit` plugin.
- **Breakpoints**: Default Tailwind breakpoints with a custom `lg` override:
  - `lg: "1150px"` (see `tailwind.config.ts`). Validate layout at `md` and `lg`.
- **Radius**: Token-driven via `--radius` with Tailwind mappings:
  - `rounded-lg`, `rounded-md`, `rounded-sm` map to `var(--radius)` adjustments.

Guidelines:
- Mobile-first. Add `sm: md: lg: xl:` progressively.
- Prefer responsive utilities over custom media queries.
- Use semantic spacing patterns in components (e.g., consistent `gap-*` across similar layouts).

---

## Component Foundation (shadcn-style primitives)

- **Atomic building blocks**: Buttons, inputs, badges, cards, sheets, dialogs, etc., are composed from Tailwind utilities and wrapped with **CVA** recipes for variants (e.g., `intent`, `size`).
- **Tokens first**: Components use `bg-primary`, `text-foreground`, `border-border`, etc., to inherit theming.
- **Variants**: Keep CVA recipes focused. Default to a small set of intents (`primary`, `secondary`, `ghost`) and sizes (`sm`, `md`, `lg`).
- **Placement**: Co-locate UI primitives under `src/components/ui/` (or the project’s chosen UI folder) with their CVA recipe and tests (future).

Usage example (see styling guide for full snippet):
```tsx
<Button intent="primary" size="md">Continue</Button>
```

---

## Practical Examples

- **Primary call-to-action**
  - Background: `bg-primary` / `hover:bg-primary/90`
  - Text: `text-primary-foreground`
  - Radius: `rounded-md` (token-driven)
  - Focus: `ring-2 ring-ring ring-offset-2`

- **Card**
  - Container: `bg-card text-card-foreground rounded-lg border border-border`
  - Inner spacing: `p-4 sm:p-6`

- **Section background**
  - `bg-background` or a subtle `bg-muted` for contrast blocks

---

## Extending the System

- Add new semantic colors by defining HSL variables in `globals.scss` and mapping them in `tailwind.config.ts` `theme.extend.colors`.
- Consider adding `success`, `warning`, and `info` tokens if the project requires explicit status palettes.
- Keep additions minimal and documented here to avoid drift.

---

For implementation details and class ordering, see `docs/ui-ux/styling-conventions.md`.
