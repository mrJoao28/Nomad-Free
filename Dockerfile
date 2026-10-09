# syntax=docker/dockerfile:1.7
# Estágios: deps -> dev (desenvolvimento) | builder -> runner (produção)

ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-bookworm-slim AS base
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

# ---------- Desenvolvimento (usado pelo docker-compose.yml) ----------
FROM deps AS dev
ENV NODE_ENV=development NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npx prisma generate
EXPOSE 3000
COPY docker/entrypoint-dev.sh /usr/local/bin/entrypoint-dev.sh
RUN chmod +x /usr/local/bin/entrypoint-dev.sh
CMD ["entrypoint-dev.sh"]

# ---------- Produção ----------
FROM deps AS builder
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_OUTPUT=standalone
COPY . .
RUN npx prisma generate && npm run build

FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
