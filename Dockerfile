FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml ./
RUN pnpm fetch
COPY package.json  ./
RUN pnpm install --frozen-lockfile --offline

FROM deps AS builder
COPY . .
RUN pnpm run build

FROM deps AS prod-deps
RUN pnpm prune --prod && pnpm install --frozen-lockfile --offline --prod

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 remixjs

COPY --from=builder /app/build ./build
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json ./

USER remixjs

EXPOSE 3000

CMD ["node", "build/index.js"]
