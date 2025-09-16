FROM node:18

WORKDIR /app

COPY app/package*.json ./
RUN npm install

COPY app/ .

EXPOSE 8080

CMD ["pnpm", "run", "dev"]