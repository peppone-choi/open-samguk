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
# Root workspace files
COPY --from=prod-deps /app/package.json /app/package.json
COPY --from=prod-deps /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=prod-deps /app/node_modules /app/node_modules
# All apps package.json (for workspace resolution)
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json
COPY --from=build /app/apps/engine/package.json /app/apps/engine/package.json
COPY --from=build /app/apps/web/package.json /app/apps/web/package.json
# Packages (dist + package.json + node_modules)
COPY --from=build /app/packages/common/dist /app/packages/common/dist
COPY --from=build /app/packages/common/package.json /app/packages/common/package.json
COPY --from=prod-deps /app/packages/common/node_modules /app/packages/common/node_modules
COPY --from=build /app/packages/infra/dist /app/packages/infra/dist
COPY --from=build /app/packages/infra/package.json /app/packages/infra/package.json
COPY --from=build /app/packages/infra/prisma /app/packages/infra/prisma
COPY --from=prod-deps /app/packages/infra/node_modules /app/packages/infra/node_modules
COPY --from=build /app/packages/logic/dist /app/packages/logic/dist
COPY --from=build /app/packages/logic/package.json /app/packages/logic/package.json
COPY --from=prod-deps /app/packages/logic/node_modules /app/packages/logic/node_modules
# App specific
COPY --from=build /app/apps/api/dist /app/apps/api/dist
COPY --from=prod-deps /app/apps/api/node_modules /app/apps/api/node_modules
# Entrypoint
COPY docker/sammo/api/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["/app/entrypoint.sh"]

FROM base AS engine
# Root workspace files
COPY --from=prod-deps /app/package.json /app/package.json
COPY --from=prod-deps /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=prod-deps /app/node_modules /app/node_modules
# All apps package.json (for workspace resolution)
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json
COPY --from=build /app/apps/engine/package.json /app/apps/engine/package.json
COPY --from=build /app/apps/web/package.json /app/apps/web/package.json
# Packages (dist + package.json + node_modules)
COPY --from=build /app/packages/common/dist /app/packages/common/dist
COPY --from=build /app/packages/common/package.json /app/packages/common/package.json
COPY --from=prod-deps /app/packages/common/node_modules /app/packages/common/node_modules
COPY --from=build /app/packages/infra/dist /app/packages/infra/dist
COPY --from=build /app/packages/infra/package.json /app/packages/infra/package.json
COPY --from=build /app/packages/infra/prisma /app/packages/infra/prisma
COPY --from=prod-deps /app/packages/infra/node_modules /app/packages/infra/node_modules
COPY --from=build /app/packages/logic/dist /app/packages/logic/dist
COPY --from=build /app/packages/logic/package.json /app/packages/logic/package.json
COPY --from=prod-deps /app/packages/logic/node_modules /app/packages/logic/node_modules
# App specific
COPY --from=build /app/apps/engine/dist /app/apps/engine/dist
COPY --from=prod-deps /app/apps/engine/node_modules /app/apps/engine/node_modules
CMD [ "pnpm", "--filter", "@sammo/engine", "start" ]

FROM base AS web
# Root workspace files
COPY --from=prod-deps /app/package.json /app/package.json
COPY --from=prod-deps /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=prod-deps /app/node_modules /app/node_modules
# All apps package.json (for workspace resolution)
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json
COPY --from=build /app/apps/engine/package.json /app/apps/engine/package.json
COPY --from=build /app/apps/web/package.json /app/apps/web/package.json
# Packages (dist + package.json + node_modules)
COPY --from=build /app/packages/common/dist /app/packages/common/dist
COPY --from=build /app/packages/common/package.json /app/packages/common/package.json
COPY --from=prod-deps /app/packages/common/node_modules /app/packages/common/node_modules
COPY --from=build /app/packages/infra/dist /app/packages/infra/dist
COPY --from=build /app/packages/infra/package.json /app/packages/infra/package.json
COPY --from=build /app/packages/infra/prisma /app/packages/infra/prisma
COPY --from=prod-deps /app/packages/infra/node_modules /app/packages/infra/node_modules
COPY --from=build /app/packages/logic/dist /app/packages/logic/dist
COPY --from=build /app/packages/logic/package.json /app/packages/logic/package.json
COPY --from=prod-deps /app/packages/logic/node_modules /app/packages/logic/node_modules
# App specific
COPY --from=build /app/apps/web/.next /app/apps/web/.next
COPY --from=build /app/apps/web/public /app/apps/web/public
COPY --from=prod-deps /app/apps/web/node_modules /app/apps/web/node_modules
EXPOSE 3000
CMD [ "pnpm", "--filter", "@sammo/web", "start" ]

FROM base AS setup
# Root workspace files
COPY --from=prod-deps /app/package.json /app/package.json
COPY --from=prod-deps /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=prod-deps /app/node_modules /app/node_modules
# All apps package.json (for workspace resolution)
COPY --from=build /app/apps/api/package.json /app/apps/api/package.json
COPY --from=build /app/apps/engine/package.json /app/apps/engine/package.json
COPY --from=build /app/apps/web/package.json /app/apps/web/package.json
# Packages (dist + package.json + node_modules)
COPY --from=build /app/packages/common/dist /app/packages/common/dist
COPY --from=build /app/packages/common/package.json /app/packages/common/package.json
COPY --from=prod-deps /app/packages/common/node_modules /app/packages/common/node_modules
COPY --from=build /app/packages/infra/dist /app/packages/infra/dist
COPY --from=build /app/packages/infra/package.json /app/packages/infra/package.json
COPY --from=build /app/packages/infra/prisma /app/packages/infra/prisma
COPY --from=prod-deps /app/packages/infra/node_modules /app/packages/infra/node_modules
COPY --from=build /app/packages/logic/dist /app/packages/logic/dist
COPY --from=build /app/packages/logic/package.json /app/packages/logic/package.json
COPY --from=prod-deps /app/packages/logic/node_modules /app/packages/logic/node_modules
# Setup script
COPY docker/sammo/install/setup.sh /app/setup.sh
RUN chmod +x /app/setup.sh
ENTRYPOINT ["/app/setup.sh"]
