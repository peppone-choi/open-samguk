import { Module, Global } from "@nestjs/common";
import { TrpcService } from "./trpc.service.js";
import { TrpcRouter } from "./trpc.router.js";
import { AuthModule } from "../auth/auth.module.js";
import { GameModule } from "../game/game.module.js";

@Global()
@Module({
  imports: [AuthModule, GameModule],
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcService],
})
export class TrpcModule {}
