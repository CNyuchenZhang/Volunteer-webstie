FROM node:18

WORKDIR /app

COPY app/package*.json ./
RUN npm install

COPY app/ .

EXPOSE 8081

CMD ["pnpm", "run", "dev"]