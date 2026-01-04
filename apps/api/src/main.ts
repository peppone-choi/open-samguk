import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { TrpcRouter } from './trpc/trpc.router.js';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  const trpcRouter = app.get(TrpcRouter);
  
  app.use('/trpc', trpcRouter.getMiddleware());

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`API started on port ${port}`);
}

bootstrap();
