import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { EngineService } from './engine.service.js';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.createApplicationContext(AppModule);
  const engineService = app.get(EngineService);

  logger.log(`Engine started. Initial status: ${engineService.getStatus()}`);

  // D2: Simple internal test
  setTimeout(async () => {
    await engineService.handleCommand({
      type: 'run',
      reason: 'manual',
      requestId: 'init-test',
    });
  }, 2000);

  // Keep alive
  process.stdin.resume();
}

bootstrap();
