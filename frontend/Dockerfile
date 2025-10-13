FROM node:22-alpine

WORKDIR /app

COPY app/package*.json ./
COPY app/tsconfig*.json ./
COPY app/vite*.ts ./

RUN npm ci --include dev

COPY app/ .

EXPOSE 8080

CMD ["npm", "run", "dev"]