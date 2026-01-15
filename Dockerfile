# --- STAGE 1: DEPENDENCIES ---
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# --- STAGE 2: BUILDER (SSG happens here) ---
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Build-time values (passed in by Cloud Build)
ARG WOOCOM_CONSUMER_KEY
ARG WOOCOM_CONSUMER_SECRET
ARG STRIPE_SECRET_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Make them visible to Next.js during build
ENV WOOCOM_CONSUMER_KEY=${WOOCOM_CONSUMER_KEY}
ENV WOOCOM_CONSUMER_SECRET=${WOOCOM_CONSUMER_SECRET}
ENV STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}

RUN npm run build


# --- STAGE 3: RUNNER (clean runtime image) ---
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
