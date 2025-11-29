# Frontend Dockerfile: build Vite/React app and serve with nginx
# Works on amd64 and arm64 (including Raspberry Pi 4+)

FROM node:22-alpine AS build
WORKDIR /app

COPY Frontend/package.json Frontend/package-lock.json* ./
RUN npm install

COPY Frontend/. ./
RUN npm run build

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static content
RUN rm -rf ./*

# Copy built assets
COPY --from=build /app/dist ./

# Minimal nginx config (single-page app)
COPY Frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
