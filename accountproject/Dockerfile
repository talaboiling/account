FROM node:22-bookworm-slim AS client
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY public ./public
COPY src ./src
RUN npm run build

FROM node:22-bookworm-slim AS server-deps
# Fallback toolchain in case no better-sqlite3 prebuild matches this platform.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=client /app/build ./build
COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server/package.json ./server/
COPY server/src ./server/src
WORKDIR /app/server
EXPOSE 4001
CMD ["node", "src/index.js"]
