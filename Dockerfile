FROM node:22-alpine AS base
RUN npm install -g pnpm@10


FROM base AS builder
WORKDIR /usr/src/app
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build


FROM base AS runner
WORKDIR /usr/src/app
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 3333
CMD ["node", "dist/server.cjs"]
