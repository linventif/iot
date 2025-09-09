# ---- Builder ----
FROM oven/bun:1.1.34-alpine AS builder
WORKDIR /app

# Copy monorepo (needed for workspace @schemas)
COPY . .

# Install deps for all workspaces
RUN bun install --ci

# Build API to dist
WORKDIR /app/apps/api
RUN bun run build

# ---- Runner ----
FROM oven/bun:1.1.34-alpine AS runner
WORKDIR /app

# Bring everything built from builder
COPY --from=builder /app /app

ENV NODE_ENV=production
EXPOSE 4001

# Run compiled output from root dist
CMD ["bun", "run", "dist/apps/api/index.js"]
