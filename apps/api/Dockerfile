# syntax=docker/dockerfile:1
# Build context is the repository root (see docker-compose.yml).

# ---- Build: install dependencies and compile TypeScript ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
# --ignore-scripts: no third-party install scripts run during the image build.
RUN npm ci --workspace apps/api --include-workspace-root --ignore-scripts
COPY apps/api apps/api
RUN npm run build --workspace apps/api

# ---- Runtime: production dependencies and compiled JavaScript only ----
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --workspace apps/api --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=build /app/apps/api/dist apps/api/dist

USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "apps/api/dist/server.js"]
