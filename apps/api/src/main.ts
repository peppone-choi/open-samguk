import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.enableCors();

  const port = process.env.PORT || 4000;
  await app.listen(port, "0.0.0.0");
  console.log(`@sammo/api is running on: http://localhost:${port}`);
}

bootstrap();
