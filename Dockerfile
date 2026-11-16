# syntax=docker/dockerfile:1

ARG NODE_VERSION=22

# ---------- base ----------
FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

# ---------- dependencies (all, incl. dev tools like drizzle-kit) ----------
FROM base AS deps-dev
COPY package.json package-lock.json ./
RUN npm ci

# ---------- dependencies (runtime only) ----------
FROM base AS deps-prod
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- development image ----------
FROM base AS development
ENV NODE_ENV=development
COPY --from=deps-dev --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN mkdir -p logs && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---------- production image ----------
FROM base AS production
ENV NODE_ENV=production
COPY --from=deps-prod --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
RUN mkdir -p logs && chown node:node logs
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/index.js"]
