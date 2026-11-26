# syntax=docker/dockerfile:1
# Build context is the repository root (see docker-compose.yml).

# ---- Build the static site ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
# --ignore-scripts: no third-party install scripts run during the image build.
RUN npm ci --workspace apps/web --include-workspace-root --ignore-scripts
COPY apps/web apps/web
RUN npm run build --workspace apps/web

# ---- Serve it with nginx, which also forwards /api to the API container ----
FROM nginx:1.28-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
