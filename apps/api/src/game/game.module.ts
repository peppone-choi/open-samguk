import { Module } from "@nestjs/common";
import { GameService } from "./game.service.js";
import { AuctionService } from "./auction.service.js";
import { GeneralService } from "./general.service.js";
import { NationService } from "./nation.service.js";
import { MessageService } from "./message.service.js";
import { TroopService } from "./troop.service.js";
import { DiplomacyService } from "./diplomacy.service.js";
import { HistoryService } from "./history.service.js";

@Module({
  providers: [
    GameService,
    AuctionService,
    GeneralService,
    NationService,
    MessageService,
    TroopService,
    DiplomacyService,
    HistoryService,
  ],
  exports: [
    GameService,
    AuctionService,
    GeneralService,
    NationService,
    MessageService,
    TroopService,
    DiplomacyService,
    HistoryService,
  ],
})
export class GameModule {}
