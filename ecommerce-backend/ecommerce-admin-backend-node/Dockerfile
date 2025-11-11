FROM node:18-alpine AS builder

WORKDIR /app

# Install build tools for native modules like bcrypt on Alpine (musl)
RUN apk add --no-cache python3 make g++ libc6-compat

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

FROM node:18-alpine AS runtime
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV ADMIN_NODE_PORT=3001

COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./package.json
COPY src ./src

EXPOSE 3001

CMD ["node", "src/app.js"]


