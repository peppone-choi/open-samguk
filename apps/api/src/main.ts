import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { AppModule } from "./app.module.js";
import { TrpcRouter } from "./trpc/trpc.router.js";
import { AuthService } from "./auth/auth.service.js";
import { createContext } from "./trpc/trpc.service.js";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.enableCors();

  // Get the Fastify instance and required services
  const fastify = app.getHttpAdapter().getInstance();
  const trpcRouter = app.get(TrpcRouter);
  const authService = app.get(AuthService);

  // Register tRPC plugin with Fastify
  await fastify.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: trpcRouter.appRouter,
      createContext: createContext(authService),
    },
  });

  const port = process.env.GAME_PORT || process.env.PORT || 4000;
  await app.listen(port, "0.0.0.0");
  console.log(`@sammo/api is running on: http://localhost:${port}`);
  console.log(`tRPC endpoint: http://localhost:${port}/trpc`);
}

bootstrap();
