FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build
RUN pnpm --filter @sammo/api deploy --prod /deploy/api
RUN pnpm --filter @sammo/engine deploy --prod /deploy/engine
RUN cp -r /app/packages/infra/prisma /deploy/api/prisma
RUN cp -r /app/packages/infra/prisma /deploy/engine/prisma

FROM node:20-slim AS api
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /deploy/api .
COPY docker/sammo/api/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENV NODE_ENV=production
EXPOSE 4000
ENTRYPOINT ["/app/entrypoint.sh"]

FROM node:20-slim AS engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /deploy/engine .
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

FROM node:20-slim AS web
WORKDIR /app
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./.next/static
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/apps/web/public ./apps/web/public
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

FROM base AS setup
COPY --from=build /deploy/api .
COPY docker/sammo/install/setup.sh /app/setup.sh
RUN chmod +x /app/setup.sh
ENTRYPOINT ["/app/setup.sh"]
