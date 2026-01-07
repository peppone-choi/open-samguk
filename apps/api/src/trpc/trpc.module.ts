import { Module, Global } from "@nestjs/common";
import { TrpcService } from "./trpc.service.js";
import { TrpcRouter } from "./trpc.router.js";

@Global()
@Module({
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcService],
})
export class TrpcModule {}
