import { Module } from "@nestjs/common";
import { TrpcModule } from "./trpc/trpc.module.js";
import { GameModule } from "./game/game.module.js";

@Module({
  imports: [TrpcModule, GameModule],
})
export class AppModule {}
