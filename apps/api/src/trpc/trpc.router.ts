import { Injectable, type OnModuleInit } from "@nestjs/common";
import { TrpcService } from "./trpc.service.js";
import { z } from "zod";

import { GameService } from "../game/game.service.js";
import { AuctionService } from "../game/auction.service.js";
import { GeneralService } from "../game/general.service.js";
import { NationService } from "../game/nation.service.js";
import { MessageService } from "../game/message.service.js";
import { TroopService } from "../game/troop.service.js";
import { DiplomacyService } from "../game/diplomacy.service.js";
import { HistoryService } from "../game/history.service.js";

@Injectable()
export class TrpcRouter implements OnModuleInit {
  public readonly appRouter: any;

  constructor(
    private readonly trpc: TrpcService,
    private readonly gameService: GameService,
    private readonly auctionService: AuctionService,
    private readonly generalService: GeneralService,
    private readonly nationService: NationService,
    private readonly messageService: MessageService,
    private readonly troopService: TroopService,
    private readonly diplomacyService: DiplomacyService,
    private readonly historyService: HistoryService
  ) {
    this.appRouter = this.createRouter();
  }

  private createRouter() {
    return this.trpc.router({
      health: this.trpc.procedure.query(() => {
        return { status: "ok", timestamp: new Date() };
      }),

      getGameState: this.trpc.procedure.query(async () => {
        return this.gameService.getGameState();
      }),

      setGeneralTurn: this.trpc.procedure
        .input(
          z.object({
            generalId: z.number(),
            turnIdx: z.number(),
            action: z.string(),
            arg: z.any().optional(),
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

      setGeneralTurns: this.trpc.procedure
        .input(
          z.object({
            generalId: z.number(),
            turns: z.array(
              z.object({
                turnIdx: z.number(),
                action: z.string(),
                arg: z.any().optional(),
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

      getGeneralLogs: this.trpc.procedure
        .input(z.object({ generalId: z.number(), limit: z.number().optional() }))
        .query(async ({ input }) => {
          return this.generalService.getGeneralLogs(input.generalId, input.limit);
        }),

      dropItem: this.trpc.procedure
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

      joinNation: this.trpc.procedure
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
        .input(z.object({ nationId: z.number() }))
        .query(async ({ input }) => {
          return this.nationService.getNationGeneralList(input.nationId);
        }),

      updateNationConfig: this.trpc.procedure
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

      setNationNotice: this.trpc.procedure
        .input(z.object({ nationId: z.number(), notice: z.string() }))
        .mutation(async ({ input }) => {
          await this.nationService.setNationNotice(input.nationId, input.notice);
          return { success: true };
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

      sendMessage: this.trpc.procedure
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

      bidAuction: this.trpc.procedure
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

      // Troop APIs
      getTroops: this.trpc.procedure
        .input(z.object({ nationId: z.number() }))
        .query(async ({ input }) => {
          return this.troopService.getTroopList(input.nationId);
        }),

      createTroop: this.trpc.procedure
        .input(z.object({ generalId: z.number(), name: z.string() }))
        .mutation(async ({ input }) => {
          return this.troopService.createTroop(input.generalId, input.name);
        }),

      joinTroop: this.trpc.procedure
        .input(z.object({ generalId: z.number(), troopLeaderId: z.number() }))
        .mutation(async ({ input }) => {
          return this.troopService.joinTroop(input.generalId, input.troopLeaderId);
        }),

      exitTroop: this.trpc.procedure
        .input(z.object({ generalId: z.number() }))
        .mutation(async ({ input }) => {
          return this.troopService.exitTroop(input.generalId);
        }),

      kickFromTroop: this.trpc.procedure
        .input(z.object({ leaderId: z.number(), targetGeneralId: z.number() }))
        .mutation(async ({ input }) => {
          return this.troopService.kickFromTroop(input.leaderId, input.targetGeneralId);
        }),

      setTroopName: this.trpc.procedure
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
    });
  }

  onModuleInit() {}
}

export type AppRouter = ReturnType<TrpcRouter["createRouter"]>;
