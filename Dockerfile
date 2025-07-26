# Use Node.js 18 LTS as base image
FROM node:18-alpine AS base

# Install OpenSSL
RUN apk add --no-cache openssl

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

# Build the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
RUN npm run prisma:generate
RUN npm run build
RUN npm prune --production

# Production image
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs app

# Copy production files
COPY --from=builder --chown=app:nodejs /app/dist ./dist
COPY --from=builder --chown=app:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=app:nodejs /app/package.json ./package.json
COPY --from=builder --chown=app:nodejs /app/prisma ./prisma

# Set ownership and permissions
RUN chown -R app:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER app

# Verify the build
RUN ls -la /app/dist && \
    ls -la /app/dist/src

EXPOSE 3000
ENV PORT=3000

CMD ["node", "dist/src/server.js"]
