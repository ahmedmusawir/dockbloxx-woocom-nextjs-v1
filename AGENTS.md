# Repository Guidelines

## Project Structure & Module Organization
- `src/` – application code (app routes, components, hooks, services, rest-api, lib, constants).
- `public/` – static assets.
- `tests/` – unit/integration tests.
- `docs/` – internal documentation.
- Config: `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`.
- Build output: `.next/` (do not commit).

## Build, Test, and Development Commands
- `npm run dev` – start Next.js dev server with Turbopack.
- `npm run build` – create production build.
- `npm start` – run the built app.
- `npm test` / `npm run test:watch` – run Jest tests.
- `npm run lint` – run Next/ESLint rules.

## Coding Style & Naming Conventions
- TypeScript throughout; 2‑space indentation.
- Components: PascalCase in `src/components/*` (e.g., `ProductCard.tsx`).
- Hooks: `useXxx` in `src/hooks/*` (e.g., `useCheckoutTracking.ts`).
- Services/REST helpers: nouns + verb (e.g., `orderServices.ts`, `rest-api/products.ts`).
- Prefer named exports; avoid default unless a file has a single export.
- Lint via `eslint-config-next`; UI uses Tailwind + shadcn.

## Testing Guidelines
- Framework: Jest + Testing Library (`jest-environment-jsdom`).
- Place tests in `tests/` mirroring source paths; name `*.test.ts(x)`.
- Keep tests deterministic; mock network calls to WooCommerce/WordPress/Stripe.
- Run locally with `npm test`; add failing test first when fixing bugs.

## Commit & Pull Request Guidelines
- Commits: short imperative summary (≤72 chars), body for rationale when needed.
- Scope by area prefix when helpful (e.g., `hooks:`, `services:`, `rest-api:`).
- PRs: include purpose, linked issues, screenshots for UI, and test coverage notes.
- Ensure `npm run build` and `npm test` pass before request review.

## Security & Configuration Tips
- Never commit secrets. Use `.env.local` for local dev; production uses platform secrets.
- Required env: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_BACKEND_URL`, WooCommerce keys, Stripe keys.
- Be cautious with server/client boundaries; keep secrets in server code only.
