# LeGuard-AI Multi-stage Dockerfile
# Stage 1: Base - install dependencies
FROM node:20-alpine AS base
WORKDIR /app

# Install only production dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Stage 2: Builder - compile Next.js application
FROM node:20-alpine AS builder
WORKDIR /app

# Install all dependencies (including dev) for build
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Load environment variables for build (DATABASE_URL may be needed for some build-time checks)
# Note: Secrets should not be baked into the image; only non-secret build env is passed
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Build Next.js standalone output
RUN npm run build

# Stage 3: Runner - minimal production image
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for running the application
RUN addgroup --system --gid 1001 leguard && \
    adduser --system --uid 1001 leguard

# Set production environment
ENV NODE_ENV=production

# Copy standalone output from builder
COPY --from=builder --chown=leguard:leguard /app/.next/standalone ./
COPY --from=builder --chown=leguard:leguard /app/.next/static ./.next/static
COPY --from=builder --chown=leguard:leguard /app/public ./public

# Copy scripts needed for runtime DB operations (migrations, backup)
COPY --from=builder --chown=leguard:leguard /app/migrations ./migrations
COPY --from=builder --chown=leguard:leguard /app/scripts ./scripts

# Switch to non-root user
USER leguard

# Expose application port
EXPOSE 3000

# Health check: verify the app responds
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health/live || exit 1

# Start the standalone Next.js server
CMD ["node", "--env-file-if-exists=.env.local", ".next/standalone/server.js"]
