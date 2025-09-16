FROM node:22-alpine

WORKDIR /app

COPY app/package*.json ./
COPY app/tsconfig*.json ./
COPY app/vite*.json ./

RUN npm ci --include dev

COPY app/ .

EXPOSE 5173

CMD ["npm", "run", "dev"]