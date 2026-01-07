import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  logger.log("Bootstrapping @sammo/engine (NestJS)...");

  const app = await NestFactory.createApplicationContext(AppModule);

  // 엔진은 HTTP 서버가 아니므로 ApplicationContext로 충분함
  // 하지만 향후 모니터링이나 헬스체크를 위해 필요하면 Standalone app으로 유지 가능

  process.on("SIGINT", async () => {
    await app.close();
    process.exit(0);
  });

  logger.log("Engine is running in the background.");
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
