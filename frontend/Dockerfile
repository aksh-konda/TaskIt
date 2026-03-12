# =============================================================================
# STAGE 1 — BUILD
# Uses Node.js to install dependencies and run the Vite build.
# Outputs a 'dist/' folder of compiled static files (HTML, CSS, JS bundles).
# Node and node_modules are NOT included in the final image.
# =============================================================================
FROM node:20-alpine AS build
WORKDIR /app

# Copy package manifests first to leverage Docker layer caching.
# npm install only re-runs when package.json or package-lock.json change.
COPY package*.json ./

# 'npm ci' installs exact versions from package-lock.json — faster and
# more reproducible than 'npm install' for CI/CD and Docker builds.
RUN npm ci

# Copy all remaining source files and run the Vite production build.
# Output is written to /app/dist.
COPY . .
RUN npm run build

# =============================================================================
# STAGE 2 — SERVE
# Uses a minimal nginx image to serve the compiled static files.
# No Node.js runtime is needed to serve a built React app.
# The final image is ~45MB vs ~400MB if Node were kept.
# =============================================================================
FROM nginx:alpine

# Copy only the compiled static output from the build stage.
COPY --from=build /app/dist /usr/share/nginx/html

# Replace the default nginx config with our custom one that handles
# SPA client-side routing and proxies /tasks API calls to the backend.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Inform Docker (and docker-compose) that nginx listens on port 80.
EXPOSE 80
