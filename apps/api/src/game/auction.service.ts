import { Injectable } from "@nestjs/common";
import { createPrismaClient, type PrismaClientType } from "@sammo/infra";

const AUCTION_OPEN_MIN_MONTHS = 3;
const RICE_AUCTION_MIN_AMOUNT = 100;
const RICE_AUCTION_MAX_AMOUNT = 10000;
const UNIQUE_AUCTION_MIN_POINT = 1000;
const CLOSE_TURN_CNT_MIN = 6;
const CLOSE_TURN_CNT_MAX = 72;
const AUCTION_EXTENSION_MINUTES = 5;

@Injectable()
export class AuctionService {
  private readonly prisma: PrismaClientType = createPrismaClient();

  async getAuctions(type?: string) {
    return this.prisma.auction.findMany({
      where: {
        finished: false,
        ...(type ? { type } : {}),
      },
      include: {
        hostGeneral: {
          select: {
            no: true,
            name: true,
            nationId: true,
          },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { closeDate: "asc" },
    });
  }

  async getAuctionDetail(id: number) {
    return this.prisma.auction.findUnique({
      where: { id },
      include: {
        hostGeneral: true,
        bids: {
          orderBy: { amount: "desc" },
          include: {
            general: {
              select: {
                no: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async bid(auctionId: number, generalId: number, amount: number, tryExtend: boolean) {
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });

    if (!auction || auction.finished) throw new Error("종료되었거나 존재하지 않는 경매입니다.");
    if (!general) throw new Error("장수 정보가 없습니다.");

    const highestBid = await this.prisma.auctionBid.findFirst({
      where: { auctionId },
      orderBy: { amount: "desc" },
    });

    if (highestBid && amount <= highestBid.amount) {
      throw new Error("현재 최고 입찰가보다 높아야 합니다.");
    }

    return this.prisma.$transaction(async (tx) => {
      const bid = await tx.auctionBid.create({
        data: {
          auctionId,
          generalId,
          amount,
          date: new Date(),
          aux: { tryExtendCloseDate: tryExtend },
        },
      });

      const now = new Date();
      const extensionThreshold = AUCTION_EXTENSION_MINUTES * 60 * 1000;
      if (auction.closeDate.getTime() - now.getTime() < extensionThreshold) {
        const newCloseDate = new Date(auction.closeDate.getTime() + extensionThreshold);
        await tx.auction.update({
          where: { id: auctionId },
          data: { closeDate: newCloseDate },
        });
      }

      return bid;
    });
  }

  async openUniqueAuction(generalId: number, itemId: string, startBidAmount: number) {
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });
    if (!general) throw new Error("장수 정보가 없습니다.");

    const gameEnv = await this.getGameEnv();
    if (!this.canOpenAuction(gameEnv)) {
      throw new Error("시작 후 3개월이 지나야 경매를 열 수 있습니다.");
    }

    if (startBidAmount < UNIQUE_AUCTION_MIN_POINT) {
      throw new Error(`최소 시작가는 ${UNIQUE_AUCTION_MIN_POINT} 포인트입니다.`);
    }

    const hasItem = [general.weapon, general.book, general.horse, general.item].includes(itemId);
    if (!hasItem) {
      throw new Error("해당 아이템을 보유하고 있지 않습니다.");
    }

    const now = new Date();
    const closeDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return this.prisma.auction.create({
      data: {
        type: "UniqueItem",
        finished: false,
        target: itemId,
        hostGeneralId: generalId,
        reqResource: "inheritancePoint",
        openDate: now,
        closeDate,
        detail: {
          title: `유니크 아이템 경매`,
          hostName: general.name,
          remainCloseDateExtensionCnt: 24,
          isReverse: false,
          startBidAmount,
          finishBidAmount: null,
          amount: null,
          availableLatestBidCloseDate: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        },
      },
    });
  }

  async openBuyRiceAuction(
    generalId: number,
    amount: number,
    closeTurnCnt: number,
    startBidAmount: number,
    finishBidAmount: number
  ) {
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });
    if (!general) throw new Error("장수 정보가 없습니다.");

    const gameEnv = await this.getGameEnv();
    if (!this.canOpenAuction(gameEnv)) {
      throw new Error("시작 후 3개월이 지나야 경매를 열 수 있습니다.");
    }

    this.validateResourceAuctionParams(amount, closeTurnCnt, startBidAmount, finishBidAmount);

    if (general.rice < amount) {
      throw new Error("쌀이 부족합니다.");
    }

    const now = new Date();
    const closeDate = this.calculateCloseDate(now, closeTurnCnt);

    return this.prisma.$transaction(async (tx) => {
      await tx.general.update({
        where: { no: generalId },
        data: { rice: { decrement: amount } },
      });

      return tx.auction.create({
        data: {
          type: "BuyRice",
          finished: false,
          target: "rice",
          hostGeneralId: generalId,
          reqResource: "gold",
          openDate: now,
          closeDate,
          detail: {
            title: `쌀 ${amount}석 판매`,
            hostName: general.name,
            remainCloseDateExtensionCnt: null,
            isReverse: false,
            startBidAmount,
            finishBidAmount,
            amount,
            availableLatestBidCloseDate: null,
          },
        },
      });
    });
  }

  async openSellRiceAuction(
    generalId: number,
    amount: number,
    closeTurnCnt: number,
    startBidAmount: number,
    finishBidAmount: number
  ) {
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });
    if (!general) throw new Error("장수 정보가 없습니다.");

    const gameEnv = await this.getGameEnv();
    if (!this.canOpenAuction(gameEnv)) {
      throw new Error("시작 후 3개월이 지나야 경매를 열 수 있습니다.");
    }

    this.validateResourceAuctionParams(amount, closeTurnCnt, startBidAmount, finishBidAmount);

    if (general.gold < startBidAmount) {
      throw new Error("금이 부족합니다.");
    }

    const now = new Date();
    const closeDate = this.calculateCloseDate(now, closeTurnCnt);

    return this.prisma.$transaction(async (tx) => {
      await tx.general.update({
        where: { no: generalId },
        data: { gold: { decrement: startBidAmount } },
      });

      return tx.auction.create({
        data: {
          type: "SellRice",
          finished: false,
          target: "rice",
          hostGeneralId: generalId,
          reqResource: "rice",
          openDate: now,
          closeDate,
          detail: {
            title: `쌀 ${amount}석 구매`,
            hostName: general.name,
            remainCloseDateExtensionCnt: null,
            isReverse: true,
            startBidAmount,
            finishBidAmount,
            amount,
            availableLatestBidCloseDate: null,
          },
        },
      });
    });
  }

  private async getGameEnv(): Promise<{
    initYear: number;
    initMonth: number;
    year: number;
    month: number;
  }> {
    const storage = await this.prisma.storage.findMany({
      where: {
        namespace: "game_env",
        key: { in: ["init_year", "init_month", "year", "month"] },
      },
    });

    const getValue = (key: string): number => {
      const item = storage.find((storageItem) => storageItem.key === key);
      return item ? (item.value as number) : 0;
    };

    return {
      initYear: getValue("init_year"),
      initMonth: getValue("init_month"),
      year: getValue("year"),
      month: getValue("month"),
    };
  }

  private canOpenAuction(env: {
    initYear: number;
    initMonth: number;
    year: number;
    month: number;
  }): boolean {
    const initYearMonth = env.initYear * 12 + env.initMonth;
    const currentYearMonth = env.year * 12 + env.month;
    return currentYearMonth >= initYearMonth + AUCTION_OPEN_MIN_MONTHS;
  }

  private validateResourceAuctionParams(
    amount: number,
    closeTurnCnt: number,
    startBidAmount: number,
    finishBidAmount: number
  ): void {
    if (amount < RICE_AUCTION_MIN_AMOUNT || amount > RICE_AUCTION_MAX_AMOUNT) {
      throw new Error(
        `거래량은 ${RICE_AUCTION_MIN_AMOUNT}~${RICE_AUCTION_MAX_AMOUNT} 사이여야 합니다.`
      );
    }
    if (closeTurnCnt < CLOSE_TURN_CNT_MIN || closeTurnCnt > CLOSE_TURN_CNT_MAX) {
      throw new Error(`종료 턴은 ${CLOSE_TURN_CNT_MIN}~${CLOSE_TURN_CNT_MAX} 사이여야 합니다.`);
    }
    if (startBidAmount <= 0) {
      throw new Error("시작가는 0보다 커야 합니다.");
    }
    if (finishBidAmount <= startBidAmount) {
      throw new Error("즉시 낙찰가는 시작가보다 커야 합니다.");
    }
  }

  private calculateCloseDate(now: Date, closeTurnCnt: number): Date {
    const turnDurationMs = 10 * 60 * 1000;
    return new Date(now.getTime() + closeTurnCnt * turnDurationMs);
  }
}
