# Development Workflow

This guide defines the recommended workflow for contributing to Dockbloxx. Follow these steps to keep changes consistent, reviewable, and high quality.

---

## Branching Strategy

- **Model: GitHub Flow**
  - **main**: always deployable; protected.
  - **Feature branches**: `feature/<short-slug>` for new features.
  - **Fix branches**: `fix/<short-slug>` for bug fixes; `chore/<short-slug>` for tooling/docs.
  - **Pull Requests**: open a PR from your branch into `main` when ready.
  - **Small, focused PRs**: easier to review and revert if needed.

Optional releases:
- Tag semver releases as needed: `vX.Y.Z`.

---

## Code Quality

- **ESLint** (Next.js built-in)
  - Run locally:
    ```bash
    npm run lint
    ```
  - Fix what can be autofixed, then address remaining warnings/errors.

- **Prettier** (formatting)
  - Recommended via your editor integration (VS Code extension).
  - If you want a one-off CLI check (assuming Prettier is installed in your environment):
    ```bash
    npx prettier --check .
    npx prettier --write .   # to auto-format
    ```

- **TypeScript**
  - Watch for TS errors in editor/terminal (`next dev` shows type issues in many cases).

- **Commit hygiene**
  - Clear, descriptive messages. Example: `feat(cart): add quantity setter` or `fix(checkout): preserve shipping with free_shipping coupon`.

---

## Testing

- **Current status**: No automated tests are implemented yet.
  - The team relies on manual verification (see checklist below) during code review.
  - A future initiative will add unit/integration tests using **Jest** and **React Testing Library**.

- **Existing scripts (stubbed)**
  - `npm test` and `npm run test:watch` are present, but will not run meaningful tests until test suites are added.

- **Manual verification (suggested)**
  - Smoke-test primary flows:
    - Home page renders featured products.
    - Shop/product details load (SSR), add-to-cart updates cart and persists.
    - Search returns results via `/api/search`.
    - Checkout totals recalc on shipping/coupon; place order flow via `/api/place-order` in dev (if backend is wired).

---

## Common Scripts

From `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

- **npm run dev** — Start Next.js in development mode (Turbopack).
- **npm run build** — Production build.
- **npm run start** — Start the production server (after build).
- **npm run lint** — Run ESLint checks.
- **npm test** — Execute Jest (no tests yet).
- **npm run test:watch** — Jest watch mode (no tests yet).

---

## Contributing Guidelines

- **Before you start**
  - Ensure a GitHub issue or task exists for the work.
  - Sync with `main`: `git pull origin main`.

- **Branching**
  - Create a focused branch: `feature/<slug>`, `fix/<slug>`, or `chore/<slug>`.

- **Coding**
  - Adhere to project patterns and folder structure.
  - Keep secrets out of code. Use env vars in `.env.local` (see `docs/guides/getting-started.md`).
  - Update centralized endpoints in `src/constants/apiEndpoints.ts` if adding backend calls.
  - Use Zustand stores thoughtfully; persist only what improves UX and mind hydration flags.

- **Docs**
  - If behavior/architecture changes, update the appropriate doc in `/docs/` (API routes, state, or guides).
  - Keep PRs self-explanatory with a short description and screenshots for UI changes.

- **Validation**
  - Run locally: `npm run lint` and manual smoke tests for key flows.
  - Verify SSR pages, API route responses (terminal output), and client hydration (no flicker where flags are used).

- **Pull Request**
  - Fill a clear description: what changed, why, and how to test.
  - Link to the related issue.
  - Request review from a teammate.

- **Merging**
  - Squash & merge after approvals and green checks.
  - Post-merge: delete your branch.

---

For environment setup, see `docs/guides/getting-started.md`. For state architecture, see `docs/state/zustand-stores.md` and `docs/state/data-persistence.md`. For API docs, see `docs/api/custom-endpoints.md`.
