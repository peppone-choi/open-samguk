import { Module } from "@nestjs/common";
import { TrpcModule } from "./trpc/trpc.module.js";
import { GameModule } from "./game/game.module.js";
import { AuthModule } from "./auth/auth.module.js";

@Module({
  imports: [AuthModule, TrpcModule, GameModule],
})
export class AppModule {}
