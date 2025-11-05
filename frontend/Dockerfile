# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# 创建非 root 用户（nginx 镜像已有 nginx 用户，但需要确保配置正确）
# nginx:alpine 默认以 nginx 用户运行，但需要确保文件权限正确

# Copy built app to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 确保文件权限正确（nginx 用户需要读取权限）
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx/conf.d

# nginx:alpine 默认以 nginx 用户运行，无需显式切换

# Expose port
EXPOSE 80

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
