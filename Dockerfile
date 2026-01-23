# Stage 1: Build the static site
FROM node:20-alpine AS builder

WORKDIR /app

# Copy source files
COPY . .

# Build the pre-rendered static site
RUN node build.js --update-sitemap

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx config for SPA routing (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the pre-rendered static site from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
