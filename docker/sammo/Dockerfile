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

FROM base AS prod-deps
COPY . /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS api
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/package.json /app/package.json
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json
COPY --from=build /app/packages /app/packages
# 진입점 스크립트 복사 및 권한 설정
COPY docker/sammo/api/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["/app/entrypoint.sh"]

FROM base AS engine
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/package.json /app/package.json
COPY --from=build /app/apps/engine/dist /app/apps/engine/dist
COPY --from=build /app/apps/engine/package.json /app/apps/engine/package.json
COPY --from=build /app/packages /app/packages
CMD [ "pnpm", "--filter", "@sammo/engine", "start" ]

FROM base AS web
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/package.json /app/package.json
COPY --from=build /app/apps/web/.next /app/apps/web/.next
COPY --from=build /app/apps/web/public /app/apps/web/public
COPY --from=build /app/apps/web/package.json /app/apps/web/package.json
COPY --from=build /app/packages /app/packages
EXPOSE 3000
CMD [ "pnpm", "--filter", "@sammo/web", "start" ]
FROM base AS setup
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/package.json /app/package.json
COPY --from=build /app/packages /app/packages
COPY docker/sammo/install/setup.sh /app/setup.sh
RUN chmod +x /app/setup.sh
ENTRYPOINT ["/app/setup.sh"]
