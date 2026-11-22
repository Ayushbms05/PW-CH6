# Production Nginx image serving AeroHaven pre-built SPA
FROM nginx:alpine

# Copy built production assets
COPY dist /usr/share/nginx/html

# Copy Cloud Run Nginx configuration ($PORT 8080 routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
