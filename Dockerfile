FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

FROM base AS deps
RUN corepack enable
COPY pnpm-lock.yaml ./
RUN pnpm fetch
COPY package.json  ./
RUN pnpm install --frozen-lockfile --offline

FROM deps AS builder
COPY . .
RUN pnpm run build

FROM deps AS prod-deps
RUN pnpm prune --prod && pnpm install --frozen-lockfile --offline --prod

FROM gcr.io/distroless/nodejs20-debian12:nonroot
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/build ./build
COPY --from=prod-deps /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000

CMD ["build/index.js"]
