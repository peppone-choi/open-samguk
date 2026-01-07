FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS api
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/packages/infra/dist /app/packages/infra/dist
EXPOSE 3000
CMD [ "pnpm", "--filter", "@sammo/api", "start:prod" ]

FROM base AS engine
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/apps/engine/dist /app/apps/engine/dist
COPY --from=build /app/packages/infra/dist /app/packages/infra/dist
CMD [ "pnpm", "--filter", "@sammo/engine", "start" ]

FROM base AS web
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/apps/web/.next /app/apps/web/.next
COPY --from=build /app/apps/web/public /app/apps/web/public
EXPOSE 3001
CMD [ "pnpm", "--filter", "@sammo/web", "start" ]
