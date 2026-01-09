import { Module } from "@nestjs/common";
import { GameService } from "./game.service.js";
import { AuctionService } from "./auction.service.js";
import { BettingService } from "./betting.service.js";
import { GeneralService } from "./general.service.js";
import { NationService } from "./nation.service.js";
import { MessageService } from "./message.service.js";
import { TroopService } from "./troop.service.js";
import { DiplomacyService } from "./diplomacy.service.js";
import { HistoryService } from "./history.service.js";
import { VoteService } from "./vote.service.js";
import { InheritService } from "./inherit.service.js";
import { CommandService } from "./command.service.js";
import { AdminService } from "./admin.service.js";
import { BoardService } from "./board.service.js";
import { CityService } from "./city.service.js";
import { GlobalService } from "./global.service.js";
import { NationCommandService } from "./nationCommand.service.js";
import { NPCService } from "./npc.service.js";
import { TournamentService } from "./tournament.service.js";

@Module({
  providers: [
    GameService,
    AuctionService,
    BettingService,
    GeneralService,
    NationService,
    MessageService,
    TroopService,
    DiplomacyService,
    HistoryService,
    VoteService,
    InheritService,
    CommandService,
    AdminService,
    BoardService,
    CityService,
    GlobalService,
    NationCommandService,
    NPCService,
    TournamentService,
  ],
  exports: [
    GameService,
    AuctionService,
    BettingService,
    GeneralService,
    NationService,
    MessageService,
    TroopService,
    DiplomacyService,
    HistoryService,
    VoteService,
    InheritService,
    CommandService,
    AdminService,
    BoardService,
    CityService,
    GlobalService,
    NationCommandService,
    NPCService,
    TournamentService,
  ],
})
export class GameModule {}
