import { Injectable, type OnModuleInit } from "@nestjs/common";
import { TrpcService } from "./trpc.service.js";
import { z } from "zod";

import { GameService } from "../game/game.service.js";
import { AuctionService } from "../game/auction.service.js";
import { BettingService } from "../game/betting.service.js";
import { GeneralService } from "../game/general.service.js";
import { NationService } from "../game/nation.service.js";
import { MessageService } from "../game/message.service.js";
import { TroopService } from "../game/troop.service.js";
import { DiplomacyService } from "../game/diplomacy.service.js";
import { HistoryService } from "../game/history.service.js";
import { VoteService } from "../game/vote.service.js";
import { InheritService } from "../game/inherit.service.js";
import { CommandService } from "../game/command.service.js";
import { AdminService } from "../game/admin.service.js";
import { BoardService } from "../game/board.service.js";
import { CityService } from "../game/city.service.js";
import { GlobalService } from "../game/global.service.js";
import { NationCommandService } from "../game/nationCommand.service.js";
import { AuthService } from "../auth/auth.service.js";
import { createAuthRouter } from "../auth/auth.router.js";
import { GameSessionService } from "../auth/game-session.service.js";
import { createGameSessionRouter } from "../auth/game-session.router.js";
import { NPCService } from "../game/npc.service.js";
import { TournamentService } from "../game/tournament.service.js";


@Injectable()
export class TrpcRouter implements OnModuleInit {
  public readonly appRouter: any;

  constructor(
    private readonly trpc: TrpcService,
    private readonly gameService: GameService,
    private readonly auctionService: AuctionService,
    private readonly bettingService: BettingService,
    private readonly generalService: GeneralService,
    private readonly nationService: NationService,
    private readonly messageService: MessageService,
    private readonly troopService: TroopService,
    private readonly diplomacyService: DiplomacyService,
    private readonly historyService: HistoryService,
    private readonly voteService: VoteService,
    private readonly inheritService: InheritService,
    private readonly commandService: CommandService,
    private readonly adminService: AdminService,
    private readonly boardService: BoardService,
    private readonly cityService: CityService,
    private readonly globalService: GlobalService,
    private readonly nationCommandService: NationCommandService,
    private readonly npcService: NPCService,
    private readonly tournamentService: TournamentService,
    private readonly authService: AuthService,
    private readonly gameSessionService: GameSessionService
  ) {
    this.appRouter = this.createRouter();
  }

  private createRouter() {
    const authRouter = createAuthRouter(this.trpc, this.authService);
    const gameSessionRouter = createGameSessionRouter(this.trpc, this.gameSessionService);

    return this.trpc.router({
      // Auth endpoints
      auth: authRouter,
      gameSession: gameSessionRouter,

      health: this.trpc.procedure.query(() => {
        return { status: "ok", timestamp: new Date() };
      }),

      getGameState: this.trpc.procedure.query(async () => {
        return this.gameService.getGameState();
      }),

      getServerList: this.trpc.protectedProcedure.query(async ({ ctx }) => {
        return this.gameService.getServerList(ctx.user.sub);
      }),

      setGeneralTurn: this.trpc.protectedProcedure
        .input(
          z.object({
            generalId: z.number(),
            turnIdx: z.number(),
            action: z.string(),
            arg: z.record(z.unknown()).optional(),
          })
        )
        .mutation(async ({ input }) => {
          await this.gameService.setGeneralTurn(
            input.generalId,
            input.turnIdx,
            input.action,
            input.arg
          );
          return { success: true };
        }),

      setGeneralTurns: this.trpc.protectedProcedure
        .input(
          z.object({
            generalId: z.number(),
            turns: z.array(
              z.object({
                turnIdx: z.number(),
                action: z.string(),
                arg: z.record(z.unknown()).optional(),
              })
            ),
          })
        )
        .mutation(async ({ input }) => {
          await this.gameService.setGeneralTurns(input.generalId, input.turns);
          return { success: true };
        }),

      getReservedTurns: this.trpc.procedure
        .input(z.object({ generalId: z.number() }))
        .query(async ({ input }) => {
          return this.gameService.getReservedTurns(input.generalId);
        }),

      getGeneralDetail: this.trpc.procedure
        .input(z.object({ generalId: z.number() }))
        .query(async ({ input }) => {
          return this.generalService.getGeneralDetail(input.generalId);
        }),

      createGeneral: this.trpc.protectedProcedure
        .input(
          z.object({
            name: z.string().min(2).max(20),
            picture: z.string(),
            nationId: z.number(),
            leadership: z.number().min(10).max(100),
            strength: z.number().min(10).max(100),
            intel: z.number().min(10).max(100),
            startAge: z.number().min(15).max(50).optional(),
            personal: z.string().optional(),
            special: z.string().optional(),
            inheritCity: z.number().optional(),
            inheritBonusStat: z.tuple([z.number(), z.number(), z.number()]).optional(),
            inheritSpecial: z.string().optional(),
            inheritTurntimeZone: z.number().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          return this.generalService.createGeneral({
            ...input,
            ownerId: ctx.user.sub,
          });
        }),

      getGeneralLogs: this.trpc.procedure
        .input(z.object({ generalId: z.number(), limit: z.number().optional() }))
        .query(async ({ input }) => {
          return this.generalService.getGeneralLogs(input.generalId, input.limit);
        }),

      getConnectedGenerals: this.trpc.procedure
        .input(z.object({ seconds: z.number().optional() }))
        .query(async ({ input }) => {
          return this.generalService.getConnectedGenerals(input.seconds);
        }),

      getGeneralList: this.trpc.procedure
        .input(
          z.object({
            nationId: z.number().optional(),
            npc: z.array(z.number()).optional(),
            orderBy: z.string().optional(),
            limit: z.number().optional(),
            offset: z.number().optional(),
          })
        )
        .query(async ({ input }) => {
          return this.generalService.getGeneralList(input);
        }),

      dropItem: this.trpc.protectedProcedure
        .input(
          z.object({
            generalId: z.number(),
            itemType: z.enum(["weapon", "book", "horse", "item"]),
          })
        )
        .mutation(async ({ input }) => {
          await this.generalService.dropItem(input.generalId, input.itemType);
          return { success: true };
        }),

      joinNation: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number(), nationId: z.number() }))
        .mutation(async ({ input }) => {
          await this.generalService.joinNation(input.generalId, input.nationId);
          return { success: true };
        }),

      getNations: this.trpc.procedure.query(async () => {
        return this.gameService.getNations();
      }),

      getNationInfo: this.trpc.procedure
        .input(z.object({ nationId: z.number() }))
        .query(async ({ input }) => {
          return this.nationService.getNationInfo(input.nationId);
        }),

      getNationGeneralList: this.trpc.procedure
        .input(z.object({ nationId: z.number(), generalId: z.number().optional() }))
        .query(async ({ input }) => {
          return this.nationService.getNationGeneralList(input.nationId, input.generalId);
        }),

      getCities: this.trpc.procedure.query(async () => {
        return this.gameService.getCities();
      }),

      getUnits: this.trpc.procedure.query(async () => {
        return this.gameService.getUnits();
      }),

      // Message APIs
      getRecentMessages: this.trpc.procedure
        .input(
          z.object({
            generalId: z.number(),
            nationId: z.number(),
            sequence: z.number().optional(),
          })
        )
        .query(async ({ input }) => {
          return this.messageService.getRecentMessages(
            input.generalId,
            input.nationId,
            input.sequence
          );
        }),

      sendMessage: this.trpc.protectedProcedure
        .input(
          z.object({
            srcGeneralId: z.number(),
            mailbox: z.number(),
            text: z.string(),
            type: z.enum(["public", "national", "private", "diplomacy"]),
          })
        )
        .mutation(async ({ input }) => {
          await this.messageService.sendMessage(
            input.srcGeneralId,
            input.mailbox,
            input.text,
            input.type
          );
          return { success: true };
        }),

      // Auction APIs
      getAuctions: this.trpc.procedure
        .input(z.object({ type: z.string().optional() }))
        .query(async ({ input }) => {
          return this.auctionService.getAuctions(input.type);
        }),

      getAuctionDetail: this.trpc.procedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          return this.auctionService.getAuctionDetail(input.id);
        }),

      bidAuction: this.trpc.protectedProcedure
        .input(
          z.object({
            auctionId: z.number(),
            generalId: z.number(),
            amount: z.number(),
            tryExtend: z.boolean().default(false),
          })
        )
        .mutation(async ({ input }) => {
          await this.auctionService.bid(
            input.auctionId,
            input.generalId,
            input.amount,
            input.tryExtend
          );
          return { success: true };
        }),

      getActiveResourceAuctionList: this.trpc.procedure.query(async () => {
        return this.auctionService.getActiveResourceAuctionList();
      }),

      openBuyRiceAuction: this.trpc.protectedProcedure
        .input(
          z.object({
            generalId: z.number(),
            amount: z.number(),
            closeTurnCnt: z.number(),
            startBidAmount: z.number(),
            finishBidAmount: z.number(),
          })
        )
        .mutation(async ({ input }) => {
          return this.auctionService.openBuyRiceAuction(
            input.generalId,
            input.amount,
            input.closeTurnCnt,
            input.startBidAmount,
            input.finishBidAmount
          );
        }),

      openSellRiceAuction: this.trpc.protectedProcedure
        .input(
          z.object({
            generalId: z.number(),
            amount: z.number(),
            closeTurnCnt: z.number(),
            startBidAmount: z.number(),
            finishBidAmount: z.number(),
          })
        )
        .mutation(async ({ input }) => {
          return this.auctionService.openSellRiceAuction(
            input.generalId,
            input.amount,
            input.closeTurnCnt,
            input.startBidAmount,
            input.finishBidAmount
          );
        }),

      getUniqueItemAuctionList: this.trpc.procedure.query(async () => {
        return this.auctionService.getUniqueItemAuctionList();
      }),

      getFinishedAuctions: this.trpc.procedure
        .input(z.object({ limit: z.number().optional() }))
        .query(async ({ input }) => {
          return this.auctionService.getFinishedAuctions(input.limit ?? 20);
        }),

      getUniqueItemAuctionDetail: this.trpc.procedure
        .input(z.object({ auctionId: z.number() }))
        .query(async ({ input }) => {
          return this.auctionService.getUniqueItemAuctionDetail(input.auctionId);
        }),

      openUniqueAuction: this.trpc.protectedProcedure
        .input(
          z.object({
            generalId: z.number(),
            itemId: z.string(),
            startBidAmount: z.number(),
          })
        )
        .mutation(async ({ input }) => {
          return this.auctionService.openUniqueAuction(
            input.generalId,
            input.itemId,
            input.startBidAmount
          );
        }),

      // Betting APIs
      getBettingList: this.trpc.procedure
        .input(z.object({ type: z.enum(["bettingNation", "tournament"]).optional() }))
        .query(async ({ input }) => {
          return this.bettingService.getBettingList(input.type);
        }),

      getBettingDetail: this.trpc.procedure
        .input(z.object({ bettingId: z.number(), userId: z.number() }))
        .query(async ({ input }) => {
          return this.bettingService.getBettingDetail(input.bettingId, input.userId);
        }),

      bet: this.trpc.protectedProcedure
        .input(
          z.object({
            bettingId: z.number(),
            generalId: z.number(),
            userId: z.number(),
            bettingType: z.array(z.number()),
            amount: z.number(),
          })
        )
        .mutation(async ({ input }) => {
          return this.bettingService.bet(
            input.bettingId,
            input.generalId,
            input.userId,
            input.bettingType,
            input.amount
          );
        }),

      // Troop APIs
      getTroops: this.trpc.procedure
        .input(z.object({ nationId: z.number() }))
        .query(async ({ input }) => {
          return this.troopService.getTroopList(input.nationId);
        }),

      createTroop: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number(), name: z.string() }))
        .mutation(async ({ input }) => {
          return this.troopService.createTroop(input.generalId, input.name);
        }),

      joinTroop: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number(), troopLeaderId: z.number() }))
        .mutation(async ({ input }) => {
          return this.troopService.joinTroop(input.generalId, input.troopLeaderId);
        }),

      exitTroop: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number() }))
        .mutation(async ({ input }) => {
          return this.troopService.exitTroop(input.generalId);
        }),

      kickFromTroop: this.trpc.protectedProcedure
        .input(z.object({ leaderId: z.number(), targetGeneralId: z.number() }))
        .mutation(async ({ input }) => {
          return this.troopService.kickFromTroop(input.leaderId, input.targetGeneralId);
        }),

      setTroopName: this.trpc.protectedProcedure
        .input(z.object({ leaderId: z.number(), name: z.string() }))
        .mutation(async ({ input }) => {
          return this.troopService.setTroopName(input.leaderId, input.name);
        }),

      // Diplomacy APIs
      getDiplomacyStatus: this.trpc.procedure
        .input(z.object({ viewerNationId: z.number() }))
        .query(async ({ input }) => {
          return this.diplomacyService.getDiplomacyStatus(input.viewerNationId);
        }),

      getDiplomacyBetween: this.trpc.procedure
        .input(z.object({ nationId1: z.number(), nationId2: z.number() }))
        .query(async ({ input }) => {
          return this.diplomacyService.getDiplomacyBetween(input.nationId1, input.nationId2);
        }),

      getDiplomacyProposals: this.trpc.procedure
        .input(z.object({ nationId: z.number() }))
        .query(async ({ input }) => {
          return this.diplomacyService.getDiplomacyProposals(input.nationId);
        }),

      // History APIs
      getWorldHistory: this.trpc.procedure
        .input(z.object({ limit: z.number().optional(), beforeId: z.number().optional() }))
        .query(async ({ input }) => {
          return this.historyService.getWorldHistory(input.limit, input.beforeId);
        }),

      getNationHistory: this.trpc.procedure
        .input(
          z.object({
            nationId: z.number(),
            limit: z.number().optional(),
            beforeId: z.number().optional(),
          })
        )
        .query(async ({ input }) => {
          return this.historyService.getNationHistory(input.nationId, input.limit, input.beforeId);
        }),

      getGlobalRecords: this.trpc.procedure
        .input(z.object({ limit: z.number().optional(), afterId: z.number().optional() }))
        .query(async ({ input }) => {
          return this.historyService.getGlobalRecords(input.limit, input.afterId);
        }),

      getRecentRecords: this.trpc.procedure
        .input(
          z.object({
            generalId: z.number(),
            lastGeneralRecordId: z.number().optional(),
            lastWorldHistoryId: z.number().optional(),
            limit: z.number().optional(),
          })
        )
        .query(async ({ input }) => {
          return this.historyService.getRecentRecords(
            input.generalId,
            input.lastGeneralRecordId,
            input.lastWorldHistoryId,
            input.limit
          );
        }),

      getRankings: this.trpc.procedure
        .input(z.object({ type: z.string(), limit: z.number().optional() }))
        .query(async ({ input }) => {
          return this.historyService.getRankings(input.type, input.limit);
        }),

      getStatistics: this.trpc.procedure.query(async () => {
        return this.historyService.getStatistics();
      }),

      getVoteList: this.trpc.procedure.query(async () => {
        return this.voteService.getVoteList();
      }),

      getVoteDetail: this.trpc.procedure
        .input(z.object({ voteId: z.number(), generalId: z.number().optional() }))
        .query(async ({ input }) => {
          return this.voteService.getVoteDetail(input.voteId, input.generalId);
        }),

      vote: this.trpc.protectedProcedure
        .input(
          z.object({
            voteId: z.number(),
            generalId: z.number(),
            selection: z.array(z.number()),
          })
        )
        .mutation(async ({ input }) => {
          return this.voteService.vote(input.voteId, input.generalId, input.selection);
        }),

      createVote: this.trpc.protectedProcedure
        .input(
          z.object({
            opener: z.string(),
            title: z.string(),
            options: z.array(z.string()),
            multipleOptions: z.number().optional(),
            endDate: z.string().optional(),
            keepOldVote: z.boolean().optional(),
          })
        )
        .mutation(async ({ input }) => {
          return this.voteService.createVote(
            input.opener,
            input.title,
            input.options,
            input.multipleOptions,
            input.endDate,
            input.keepOldVote
          );
        }),

      addVoteComment: this.trpc.protectedProcedure
        .input(
          z.object({
            voteId: z.number(),
            generalId: z.number(),
            text: z.string(),
          })
        )
        .mutation(async ({ input }) => {
          return this.voteService.addComment(input.voteId, input.generalId, input.text);
        }),

      getInheritPoints: this.trpc.procedure
        .input(z.object({ userId: z.number() }))
        .query(async ({ input }) => {
          return this.inheritService.getPoints(input.userId);
        }),

      buyRandomUnique: this.trpc.protectedProcedure
        .input(z.object({ userId: z.number(), generalId: z.number() }))
        .mutation(async ({ input }) => {
          return this.inheritService.buyRandomUnique(input.userId, input.generalId);
        }),

      buyHiddenBuff: this.trpc.protectedProcedure
        .input(
          z.object({
            userId: z.number(),
            generalId: z.number(),
            buffType: z.string(),
            level: z.number(),
          })
        )
        .mutation(async ({ input }) => {
          return this.inheritService.buyHiddenBuff(
            input.userId,
            input.generalId,
            input.buffType,
            input.level
          );
        }),

      resetSpecialWar: this.trpc.protectedProcedure
        .input(z.object({ userId: z.number(), generalId: z.number() }))
        .mutation(async ({ input }) => {
          return this.inheritService.resetSpecialWar(input.userId, input.generalId);
        }),

      setNextSpecialWar: this.trpc.protectedProcedure
        .input(
          z.object({
            userId: z.number(),
            generalId: z.number(),
            specialType: z.string(),
          })
        )
        .mutation(async ({ input }) => {
          return this.inheritService.setNextSpecialWar(
            input.userId,
            input.generalId,
            input.specialType
          );
        }),

      resetStat: this.trpc.protectedProcedure
        .input(
          z.object({
            userId: z.number(),
            generalId: z.number(),
            leadership: z.number(),
            strength: z.number(),
            intel: z.number(),
            inheritBonusStat: z.tuple([z.number(), z.number(), z.number()]).optional(),
          })
        )
        .mutation(async ({ input }) => {
          return this.inheritService.resetStat(
            input.userId,
            input.generalId,
            input.leadership,
            input.strength,
            input.intel,
            input.inheritBonusStat
          );
        }),

      resetTurnTime: this.trpc.protectedProcedure
        .input(z.object({ userId: z.number(), generalId: z.number() }))
        .mutation(async ({ input }) => {
          return this.inheritService.resetTurnTime(input.userId, input.generalId);
        }),

      getInheritHistory: this.trpc.procedure
        .input(z.object({ userId: z.number(), lastId: z.number().optional() }))
        .query(async ({ input }) => {
          return this.inheritService.getHistory(input.userId, input.lastId);
        }),

      checkOwner: this.trpc.protectedProcedure
        .input(
          z.object({
            userId: z.number(),
            generalId: z.number(),
            destGeneralId: z.number(),
          })
        )
        .mutation(async ({ input }) => {
          return this.inheritService.checkOwner(input.userId, input.generalId, input.destGeneralId);
        }),

      // Command APIs
      pushCommand: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number(), amount: z.number() }))
        .mutation(async ({ input }) => {
          return this.commandService.pushCommand(input.generalId, input.amount);
        }),

      repeatCommand: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number(), amount: z.number() }))
        .mutation(async ({ input }) => {
          return this.commandService.repeatCommand(input.generalId, input.amount);
        }),

      getReservedCommands: this.trpc.procedure
        .input(z.object({ generalId: z.number() }))
        .query(async ({ input }) => {
          return this.commandService.getReservedCommands(input.generalId);
        }),

      reserveCommand: this.trpc.protectedProcedure
        .input(
          z.object({
            generalId: z.number(),
            turnList: z.array(z.number()),
            action: z.string(),
            arg: z.record(z.unknown()).optional(),
          })
        )
        .mutation(async ({ input }) => {
          return this.commandService.reserveCommand(
            input.generalId,
            input.turnList,
            input.action,
            input.arg ?? {}
          );
        }),

      reserveBulkCommand: this.trpc.protectedProcedure
        .input(
          z.object({
            generalId: z.number(),
            commands: z.array(
              z.object({
                action: z.string(),
                turnList: z.array(z.number()),
                arg: z.record(z.unknown()).optional(),
              })
            ),
          })
        )
        .mutation(async ({ input }) => {
          return this.commandService.reserveBulkCommand(input.generalId, input.commands);
        }),

      // Admin APIs
      listScenarios: this.trpc.procedure.query(async () => {
        return this.adminService.listScenarios();
      }),

      initWorld: this.trpc.adminProcedure
        .input(z.object({ scenarioId: z.number() }))
        .mutation(async ({ input }) => {
          return this.adminService.initWorld(input.scenarioId);
        }),

      resetWorld: this.trpc.adminProcedure.mutation(async () => {
        return this.adminService.resetWorld();
      }),

      getGameEnv: this.trpc.procedure.query(async () => {
        return this.adminService.getGameEnv();
      }),

      // ===== Extended General APIs =====
      getFrontInfo: this.trpc.procedure
        .input(
          z.object({
            generalId: z.number(),
            lastRecordId: z.number().optional(),
            lastHistoryId: z.number().optional(),
          })
        )
        .query(async ({ input }) => {
          return this.generalService.getFrontInfo(input.generalId, {
            lastRecordId: input.lastRecordId,
            lastHistoryId: input.lastHistoryId,
          });
        }),

      getCommandTable: this.trpc.procedure
        .input(z.object({ generalId: z.number() }))
        .query(async ({ input }) => {
          return this.generalService.getCommandTable(input.generalId);
        }),

      instantRetreat: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number() }))
        .mutation(async ({ input }) => {
          return this.generalService.instantRetreat(input.generalId);
        }),

      buildNationCandidate: this.trpc.protectedProcedure
        .input(
          z.object({
            generalId: z.number(),
            nationName: z.string().min(1).max(20),
            nationColor: z.string(),
          })
        )
        .mutation(async ({ input }) => {
          return this.generalService.buildNationCandidate(
            input.generalId,
            input.nationName,
            input.nationColor
          );
        }),

      dieOnPrestart: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number() }))
        .mutation(async ({ input }) => {
          return this.generalService.dieOnPrestart(input.generalId);
        }),

      // ===== Extended Message APIs =====
      readLatestMessage: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number(), messageIds: z.array(z.number()) }))
        .mutation(async ({ input }) => {
          return this.messageService.readLatestMessage(input.generalId, input.messageIds);
        }),

      deleteMessage: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number(), messageId: z.number() }))
        .mutation(async ({ input }) => {
          return this.messageService.deleteMessage(input.generalId, input.messageId);
        }),

      getOldMessages: this.trpc.procedure
        .input(
          z.object({
            generalId: z.number(),
            nationId: z.number(),
            type: z.enum(["private", "public", "national", "diplomacy"]).optional(),
            limit: z.number().optional(),
            offset: z.number().optional(),
            beforeId: z.number().optional(),
          })
        )
        .query(async ({ input }) => {
          return this.messageService.getOldMessages(input.generalId, input.nationId, {
            type: input.type,
            limit: input.limit,
            offset: input.offset,
            beforeId: input.beforeId,
          });
        }),

      getContactList: this.trpc.procedure
        .input(z.object({ generalId: z.number() }))
        .query(async ({ input }) => {
          return this.messageService.getContactList(input.generalId);
        }),

      decideMessageResponse: this.trpc.protectedProcedure
        .input(
          z.object({
            generalId: z.number(),
            messageId: z.number(),
            decision: z.enum(["accept", "reject"]),
          })
        )
        .mutation(async ({ input }) => {
          return this.messageService.decideMessageResponse(
            input.generalId,
            input.messageId,
            input.decision
          );
        }),

      // ===== Extended Nation APIs =====
      setBlockWar: this.trpc.protectedProcedure
        .input(z.object({ nationId: z.number(), generalId: z.number(), block: z.boolean() }))
        .mutation(async ({ input }) => {
          return this.nationService.setBlockWar(input.nationId, input.generalId, input.block);
        }),

      setBlockScout: this.trpc.protectedProcedure
        .input(z.object({ nationId: z.number(), generalId: z.number(), block: z.boolean() }))
        .mutation(async ({ input }) => {
          return this.nationService.setBlockScout(input.nationId, input.generalId, input.block);
        }),

      setScoutMsg: this.trpc.protectedProcedure
        .input(z.object({ nationId: z.number(), generalId: z.number(), message: z.string() }))
        .mutation(async ({ input }) => {
          return this.nationService.setScoutMsg(input.nationId, input.generalId, input.message);
        }),

      setNationTroopName: this.trpc.protectedProcedure
        .input(
          z.object({
            nationId: z.number(),
            generalId: z.number(),
            troopId: z.number(),
            name: z.string(),
          })
        )
        .mutation(async ({ input }) => {
          return this.nationService.setTroopName(
            input.nationId,
            input.generalId,
            input.troopId,
            input.name
          );
        }),

      getNationStrategyInfo: this.trpc.protectedProcedure
        .input(z.object({ nationId: z.number(), generalId: z.number() }))
        .query(async ({ input }) => {
          return this.nationService.getNationStrategyInfo(input.nationId, input.generalId);
        }),

      updateNationConfig: this.trpc.protectedProcedure
        .input(
          z.object({
            nationId: z.number(),
            data: z.object({
              rate: z.number().optional(),
              bill: z.number().optional(),
              secretLimit: z.number().optional(),
            }),
          })
        )
        .mutation(async ({ input }) => {
          await this.nationService.updateNationConfig(input.nationId, input.data);
          return { success: true };
        }),

      setNationNotice: this.trpc.protectedProcedure
        .input(z.object({ nationId: z.number(), notice: z.string() }))
        .mutation(async ({ input }) => {
          await this.nationService.setNationNotice(input.nationId, input.notice);
          return { success: true };
        }),

      getNationLog: this.trpc.procedure
        .input(z.object({ nationId: z.number(), limit: z.number().optional() }))
        .query(async ({ input }) => {
          return this.nationService.getNationLog(input.nationId, input.limit);
        }),

      getNationGeneralLog: this.trpc.procedure
        .input(
          z.object({ nationId: z.number(), generalId: z.number(), limit: z.number().optional() })
        )
        .query(async ({ input }) => {
          return this.nationService.getGeneralLog(input.nationId, input.generalId, input.limit);
        }),

      // ===== Board APIs =====
      getBoardList: this.trpc.procedure
        .input(
          z.object({
            nationId: z.number(),
            type: z.enum(["public", "nation", "secret"]).default("nation"),
            limit: z.number().optional(),
            offset: z.number().optional(),
          })
        )
        .query(async ({ input }) => {
          return this.boardService.getBoardList({
            nationId: input.nationId,
            type: input.type,
            limit: input.limit,
            offset: input.offset,
          });
        }),

      getBoardDetail: this.trpc.procedure
        .input(z.object({ boardId: z.number() }))
        .query(async ({ input }) => {
          return this.boardService.getBoardDetail(input.boardId);
        }),

      createBoard: this.trpc.protectedProcedure
        .input(
          z.object({
            nationId: z.number(),
            generalId: z.number(),
            title: z.string().min(1).max(100),
            text: z.string().min(1),
            type: z.enum(["public", "nation", "secret"]).default("nation"),
          })
        )
        .mutation(async ({ input }) => {
          return this.boardService.createBoard({
            generalId: input.generalId,
            nationId: input.nationId,
            type: input.type,
            title: input.title,
            text: input.text,
          });
        }),

      updateBoard: this.trpc.protectedProcedure
        .input(
          z.object({
            boardId: z.number(),
            generalId: z.number(),
            title: z.string().min(1).max(100).optional(),
            text: z.string().min(1).optional(),
          })
        )
        .mutation(async ({ input }) => {
          return this.boardService.updateBoard({
            boardNo: input.boardId,
            generalId: input.generalId,
            title: input.title,
            text: input.text,
          });
        }),

      deleteBoard: this.trpc.protectedProcedure
        .input(z.object({ boardId: z.number(), generalId: z.number() }))
        .mutation(async ({ input }) => {
          return this.boardService.deleteBoard(input.boardId, input.generalId);
        }),

      addBoardComment: this.trpc.protectedProcedure
        .input(
          z.object({
            boardId: z.number(),
            generalId: z.number(),
            nationId: z.number(),
            text: z.string().min(1),
          })
        )
        .mutation(async ({ input }) => {
          return this.boardService.addComment({
            boardNo: input.boardId,
            generalId: input.generalId,
            nationId: input.nationId,
            text: input.text,
          });
        }),

      deleteBoardComment: this.trpc.protectedProcedure
        .input(z.object({ commentId: z.number(), generalId: z.number() }))
        .mutation(async ({ input }) => {
          return this.boardService.deleteComment(input.commentId, input.generalId);
        }),

      getRecentBoards: this.trpc.procedure
        .input(z.object({ limit: z.number().optional() }))
        .query(async ({ input }) => {
          return this.boardService.getRecentBoards(input.limit);
        }),

      // ===== City APIs =====
      getCityDetail: this.trpc.procedure
        .input(z.object({ cityId: z.number() }))
        .query(async ({ input }) => {
          return this.cityService.getCityDetail(input.cityId);
        }),

      getCityGenerals: this.trpc.procedure
        .input(z.object({ cityId: z.number() }))
        .query(async ({ input }) => {
          return this.cityService.getCityGenerals(input.cityId);
        }),

      getAllCities: this.trpc.procedure.query(async () => {
        return this.cityService.getAllCities();
      }),

      getNationCities: this.trpc.procedure
        .input(z.object({ nationId: z.number() }))
        .query(async ({ input }) => {
          return this.cityService.getNationCities(input.nationId);
        }),

      getAdjacentCities: this.trpc.procedure
        .input(z.object({ cityId: z.number() }))
        .query(async ({ input }) => {
          return this.cityService.getAdjacentCities(input.cityId);
        }),

      getRegionStats: this.trpc.procedure.query(async () => {
        return this.cityService.getRegionStats();
      }),

      // ===== Global APIs =====
      getGameConst: this.trpc.procedure.query(async () => {
        return this.globalService.getGameConst();
      }),

      getGlobalEnv: this.trpc.procedure.query(async () => {
        return this.globalService.getGameEnv();
      }),

      getGlobalMenu: this.trpc.procedure.query(async () => {
        return this.globalService.getGlobalMenu();
      }),

      getMap: this.trpc.procedure.query(async () => {
        return this.globalService.getMap();
      }),

      getMapData: this.trpc.procedure
        .input(z.object({ generalId: z.number().optional() }))
        .query(async ({ input }) => {
          return this.globalService.getMapData(input.generalId);
        }),

      getDiplomacyData: this.trpc.procedure
        .input(z.object({ generalId: z.number().optional() }))
        .query(async ({ input }) => {
          return this.globalService.getDiplomacyData(input.generalId);
        }),

      getCachedMap: this.trpc.procedure.query(async () => {
        return this.globalService.getCachedMap();
      }),

      getCurrentHistory: this.trpc.procedure.query(async () => {
        return this.globalService.getCurrentHistory();
      }),

      getGeneralListWithToken: this.trpc.procedure
        .input(z.object({ token: z.string() }))
        .query(async ({ input }) => {
          return this.globalService.getGeneralListWithToken(input.token);
        }),

      getGlobalDiplomacy: this.trpc.procedure.query(async () => {
        return this.globalService.getDiplomacy();
      }),

      getGlobalRecentRecord: this.trpc.procedure
        .input(
          z.object({
            generalId: z.number(),
            lastGeneralRecordId: z.number().optional(),
            lastWorldHistoryId: z.number().optional(),
          })
        )
        .query(async ({ input }) => {
          return this.globalService.getRecentRecord(
            input.generalId,
            input.lastGeneralRecordId,
            input.lastWorldHistoryId
          );
        }),

      getServerStats: this.trpc.procedure.query(async () => {
        return this.globalService.getServerStats();
      }),

      // ===== NPC APIs =====
      getNPCControl: this.trpc.protectedProcedure
        .input(z.object({ nationId: z.number() }))
        .query(async ({ input }) => {
          return this.npcService.getNPCControl(input.nationId);
        }),

      updateNPCControl: this.trpc.protectedProcedure
        .input(
          z.object({
            nationId: z.number(),
            generalId: z.number(),
            type: z.enum(["nationPolicy", "nationPriority", "generalPriority"]),
            data: z.union([
              z.record(z.number()), // NPCPolicy-like object for nationPolicy
              z.array(z.string()), // Priority list for nationPriority/generalPriority
            ]),
          })
        )
        .mutation(async ({ input }) => {
          const serviceData: {
            type: "nationPolicy" | "nationPriority" | "generalPriority";
            policies?: Record<string, number>;
            chiefPriorityList?: string[];
            generalPriorityList?: string[];
          } = { type: input.type };

          if (input.type === "nationPolicy" && !Array.isArray(input.data)) {
            serviceData.policies = input.data as Record<string, number>;
          } else if (input.type === "nationPriority" && Array.isArray(input.data)) {
            serviceData.chiefPriorityList = input.data as string[];
          } else if (input.type === "generalPriority" && Array.isArray(input.data)) {
            serviceData.generalPriorityList = input.data as string[];
          }

          return this.npcService.updateNPCControl(input.nationId, input.generalId, serviceData);
        }),

      // ===== NationCommand APIs =====
      getReservedNationCommand: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number() }))
        .query(async ({ input }) => {
          return this.nationCommandService.getReservedCommand(input.generalId);
        }),

      reserveNationCommand: this.trpc.protectedProcedure
        .input(
          z.object({
            generalId: z.number(),
            action: z.string(),
            turnList: z.array(z.number()),
            arg: z.record(z.unknown()).optional(),
          })
        )
        .mutation(async ({ input }) => {
          return this.nationCommandService.reserveCommand(input.generalId, {
            action: input.action,
            turnList: input.turnList,
            arg: input.arg,
          });
        }),

      reserveBulkNationCommand: this.trpc.protectedProcedure
        .input(
          z.object({
            generalId: z.number(),
            commands: z.array(
              z.object({
                action: z.string(),
                turnList: z.array(z.number()),
                arg: z.record(z.unknown()).optional(),
              })
            ),
          })
        )
        .mutation(async ({ input }) => {
          return this.nationCommandService.reserveBulkCommand(input.generalId, input.commands);
        }),

      repeatNationCommand: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number(), amount: z.number() }))
        .mutation(async ({ input }) => {
          return this.nationCommandService.repeatCommand(input.generalId, input.amount);
        }),

      pushNationCommand: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number(), amount: z.number() }))
        .mutation(async ({ input }) => {
          return this.nationCommandService.pushCommand(input.generalId, input.amount);
        }),

      clearNationCommand: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number(), turnList: z.array(z.number()) }))
        .mutation(async ({ input }) => {
          return this.nationCommandService.clearCommand(input.generalId, input.turnList);
        }),

      // ===== Tournament APIs =====
      getTournamentStatus: this.trpc.procedure.query(async () => {
        return this.tournamentService.getTournamentStatus();
      }),

      getTournamentBrackets: this.trpc.procedure.query(async () => {
        return this.tournamentService.getTournamentBrackets();
      }),

      getTournamentGroupStandings: this.trpc.procedure
        .input(z.object({ stage: z.enum(["preliminary", "main"]) }))
        .query(async ({ input }) => {
          return this.tournamentService.getGroupStandings(input.stage);
        }),

      joinTournament: this.trpc.protectedProcedure
        .input(z.object({ generalId: z.number() }))
        .mutation(async ({ input }) => {
          return this.tournamentService.joinTournament(input.generalId);
        }),

      getTournamentBettingOdds: this.trpc.procedure.query(async () => {
        return this.tournamentService.getBettingOdds();
      }),

      startTournament: this.trpc.adminProcedure
        .input(
          z.object({
            type: z.number().min(0).max(3),
            develcost: z.number().optional(),
          })
        )
        .mutation(async ({ input }) => {
          return this.tournamentService.startTournament(input.type, input.develcost);
        }),

      getTournamentHistory: this.trpc.procedure
        .input(z.object({ limit: z.number().optional() }))
        .query(async ({ input }) => {
          return this.tournamentService.getTournamentHistory(input.limit);
        }),
    });
  }

  onModuleInit() { }
}

export type AppRouter = ReturnType<TrpcRouter["createRouter"]>;
