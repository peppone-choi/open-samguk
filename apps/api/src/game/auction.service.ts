import { Injectable, type OnModuleInit } from "@nestjs/common";
import { createPrismaClient, type PrismaClientType } from "@sammo/infra";
import { AuctionFactory, getItemRegistry, BaseAuction, GameConst } from "@sammo/logic";
import { InheritService } from "./inherit.service.js";

const AUCTION_OPEN_MIN_MONTHS = 3;
const RICE_AUCTION_MIN_AMOUNT = 100;
const RICE_AUCTION_MAX_AMOUNT = 10000;
const UNIQUE_AUCTION_MIN_POINT = 1000;
const CLOSE_TURN_CNT_MIN = 6;
const CLOSE_TURN_CNT_MAX = 72;
// @ts-ignore
const AUCTION_EXTENSION_MINUTES = 5;

@Injectable()
export class AuctionService implements OnModuleInit {
  private readonly prisma: PrismaClientType = createPrismaClient();

  constructor(private readonly inheritService: InheritService) { }

  onModuleInit() {
    // 경매 정산 프로세스 시작 (1분마다 실행)
    setInterval(() => {
      this.processFinishedAuctions().catch((err) => {
        console.error("Auction settlement error:", err);
      });
    }, 60 * 1000);
  }

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

  async getFinishedAuctions(limit: number = 20) {
    return this.prisma.auction.findMany({
      where: { finished: true },
      orderBy: { closeDate: "desc" },
      take: limit,
      include: {
        hostGeneral: {
          select: {
            no: true,
            name: true,
          },
        },
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
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
    const prismaAuction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
        },
      },
    });
    const prismaGeneral = await this.prisma.general.findUnique({ where: { no: generalId } });

    if (!prismaAuction || prismaAuction.finished)
      throw new Error("종료되었거나 존재하지 않는 경매입니다.");
    if (!prismaGeneral) throw new Error("장수 정보가 없습니다.");

    // Domain 객체로 변환
    const auctionInfo = this.mapToAuctionInfo(prismaAuction);
    const general = this.mapToGeneral(prismaGeneral);

    const auction = AuctionFactory.create(auctionInfo, general);

    // 최고 입찰자 정보 설정
    if (prismaAuction.bids.length > 0) {
      const highest = prismaAuction.bids[0];
      auction.setHighestBid({
        id: highest.no,
        auctionId: highest.auctionId,
        userId: String(highest.owner),
        generalId: highest.generalId,
        amount: highest.amount,
        bidDate: highest.date,
        aux: highest.aux as any,
      });
    }

    // 도메인 로직 호출 - _bid는 protected이므로 public 접근을 위해 약간의 우회 또는 bid() 활용
    // 여기서는 Service가 _bid의 결과인 BidResult를 필요로 하므로,
    // BaseAuction에 public helper를 추가했어야 함. 일단 bid()를 통해 검증만 하거나,
    // AuctionService에서 직접 계산 (중복 로직이지만 Prisma 트랜잭션 때문)

    // TODO: BaseAuction._bid를 public으로 바꾸거나 별도 유틸리티화 필요.
    // 일단 여기서는 AuctionService에서 BidResult 로직을 직접 수행하고 도메인 클래스는 검증용으로 사용.
    const validationError = auction.bid(amount, tryExtend);
    if (validationError) throw new Error(validationError);

    return (this.prisma as any).$transaction(async (tx: any) => {
      // 1. 자원 체크 및 차감
      const resource = auctionInfo.reqResource;
      if (resource === "gold") {
        if (prismaGeneral.gold < amount) throw new Error("금이 부족합니다.");
        await tx.general.update({
          where: { no: generalId },
          data: { gold: { decrement: amount } },
        });
      } else if (resource === "rice") {
        if (prismaGeneral.rice < amount) throw new Error("쌀이 부족합니다.");
        await tx.general.update({
          where: { no: generalId },
          data: { rice: { decrement: amount } },
        });
      } else if (resource === "inheritancePoint") {
        const { points } = await this.inheritService.getPoints(prismaGeneral.owner);
        if (points < amount) throw new Error("유산 포인트가 부족합니다.");
        await this.inheritService.deductPoints(prismaGeneral.owner, amount);
        await this.inheritService.logInheritAction(
          prismaGeneral.owner,
          `경매 입찰: ${auctionInfo.id}번에 ${amount}포인트`
        );
      }

      // 2. 이전 입찰자 환불
      if (prismaAuction.bids.length > 0) {
        const prevBid = prismaAuction.bids[0];
        if (prevBid.generalId !== generalId) {
          if (resource === "gold") {
            await tx.general.update({
              where: { no: prevBid.generalId },
              data: { gold: { increment: prevBid.amount } },
            });
          } else if (resource === "rice") {
            await tx.general.update({
              where: { no: prevBid.generalId },
              data: { rice: { increment: prevBid.amount } },
            });
          } else if (resource === "inheritancePoint") {
            const prevGen = await tx.general.findUnique({ where: { no: prevBid.generalId } });
            if (prevGen) {
              await this.inheritService.deductPoints(prevGen.owner, -prevBid.amount); // refund
              await this.inheritService.logInheritAction(
                prevGen.owner,
                `경매 상위 입찰 발생으로 환불: ${auctionId}번에 ${prevBid.amount}포인트`
              );
            }
          }
        }
      }

      // 3. 입찰 기록 생성
      const bid = await tx.auctionBid.create({
        data: {
          auctionId,
          generalId,
          owner: prismaGeneral.owner,
          amount,
          date: new Date(),
          aux: {
            tryExtendCloseDate: tryExtend,
            userName: prismaGeneral.ownerName || "Unknown",
            obfuscatedName: BaseAuction.genObfuscatedName(
              generalId,
              String(auctionId),
              GameConst.namePoolRaw
            ),
          },
        },
      });

      // 4. 시간 연장
      const now = new Date();
      const extensionThresholdMs = 5 * 60 * 1000;
      if (prismaAuction.closeDate.getTime() - now.getTime() < extensionThresholdMs) {
        let newCloseDate = new Date(prismaAuction.closeDate.getTime() + extensionThresholdMs);
        const detail = prismaAuction.detail as any;
        if (detail.availableLatestBidCloseDate) {
          const limit = new Date(detail.availableLatestBidCloseDate);
          if (newCloseDate > limit) newCloseDate = limit;
        }

        await tx.auction.update({
          where: { id: auctionId },
          data: { closeDate: newCloseDate },
        });
      }

      return bid;
    });
  }

  private mapToAuctionInfo(p: any): any {
    return {
      id: p.id,
      type: p.type,
      finished: p.finished,
      target: p.target,
      hostGeneralId: p.hostGeneralId,
      reqResource: p.reqResource,
      openDate: p.openDate,
      closeDate: p.closeDate,
      detail: p.detail,
    };
  }

  private mapToGeneral(p: any): any {
    return {
      id: p.no,
      name: p.name,
      weapon: p.weapon,
      book: p.book,
      horse: p.horse,
      item: p.item,
      gold: p.gold,
      rice: p.rice,
      aux: p.aux,
    };
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

    return (this.prisma as any).$transaction(async (tx: any) => {
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

    return (this.prisma as any).$transaction(async (tx: any) => {
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
      const item = storage.find((storageItem: any) => storageItem.key === key);
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

  async processFinishedAuctions() {
    const now = new Date();
    const auctions = await this.prisma.auction.findMany({
      where: {
        finished: false,
        closeDate: { lte: now },
      },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
        },
      },
    });

    for (const pAuction of auctions) {
      await (this.prisma as any).$transaction(async (tx: any) => {
        // 도메인 객체로 변환 (낙찰자 입찰 정보 포함)
        const auctionInfo = this.mapToAuctionInfo(pAuction);

        let bidder: any = null;
        let highestBid: any = null;

        if (pAuction.bids.length > 0) {
          highestBid = pAuction.bids[0];
          bidder = await tx.general.findUnique({ where: { no: highestBid.generalId } });
        }

        const bidderGeneral = bidder ? this.mapToGeneral(bidder) : ({} as any);
        const auction = AuctionFactory.create(auctionInfo, bidderGeneral);

        if (highestBid) {
          auction.setHighestBid({
            id: highestBid.no,
            auctionId: highestBid.auctionId,
            userId: String(highestBid.owner),
            generalId: highestBid.generalId,
            amount: highestBid.amount,
            bidDate: highestBid.date,
            aux: highestBid.aux as any,
          });
        }

        if (!bidder) {
          // 유찰
          await tx.auction.update({
            where: { id: pAuction.id },
            data: { finished: true },
          });

          // Resource 반환 (host에게)
          if (pAuction.hostGeneralId !== 0) {
            const resource =
              pAuction.type === "BuyRice" ? "rice" : pAuction.type === "SellRice" ? "gold" : null;
            if (resource) {
              const amount = (pAuction.detail as any).amount;
              await this.incrementResource(tx, pAuction.hostGeneralId, resource, amount);
            }
          }
          return;
        }

        // 낙찰 처리
        const gameEnv = await this.getGameEnv();
        const relYear = gameEnv.year - gameEnv.initYear;
        const result = auction.finishAuction(auction.getHighestBid()!, bidder, relYear);

        if (result) {
          // 에러 시(예: 유니크 제한) 연장
          // domain logic (AuctionUniqueItem.ts) 에서 이미 연장 메시지를 리턴했수도 있으나
          // 여기서는 단순화해서 closeDate를 1시간 연장
          await tx.auction.update({
            where: { id: pAuction.id },
            data: { closeDate: new Date(pAuction.closeDate.getTime() + 60 * 60 * 1000) },
          });
          return;
        }

        // 성공 시 DB 반영
        if (pAuction.type === "UniqueItem") {
          const itemRegistry = getItemRegistry();
          const item = itemRegistry.create(pAuction.target!);
          if (item) {
            await tx.general.update({
              where: { no: bidder.no },
              data: { [item.type]: pAuction.target },
            });
          }
        } else {
          // 자원 경매
          const basicAuction = auction as any; // AuctionBasicResource
          const hostRes = basicAuction.getHostRes();
          const bidderRes = basicAuction.getBidderRes();
          const amount = (pAuction.detail as any).amount;

          // bidder에게 hostRes 지급 (bidderRes는 입찰 시 이미 차감됨)
          await this.incrementResource(tx, bidder.no, hostRes, amount);

          // host에게 bidderRes 지급 (bidderRes는 낙찰가)
          if (pAuction.hostGeneralId !== 0) {
            await this.incrementResource(tx, pAuction.hostGeneralId, bidderRes, highestBid.amount);
          }
        }

        await tx.auction.update({
          where: { id: pAuction.id },
          data: { finished: true },
        });

        // TODO: ActionLogger 등을 통한 로그 남기기
      });
    }
  }

  private calculateCloseDate(now: Date, closeTurnCnt: number): Date {
    const turnDurationMs = 10 * 60 * 1000;
    return new Date(now.getTime() + closeTurnCnt * turnDurationMs);
  }

  private async incrementResource(tx: any, generalId: number, resource: string, amount: number) {
    if (resource === "inheritancePoint") {
      const general = await tx.general.findUnique({ where: { no: generalId } });
      if (general) {
        await this.inheritService.deductPoints(general.owner, -amount); // increment
        await this.inheritService.logInheritAction(
          general.owner,
          `경매 정산 결과 환불/지급: ${amount}포인트`
        );
      }
    } else {
      await tx.general.update({
        where: { no: generalId },
        data: { [resource]: { increment: amount } },
      });
    }
  }

  /**
   * 활성화된 자원 경매 목록 조회 (BuyRice, SellRice)
   */
  async getActiveResourceAuctionList() {
    return this.prisma.auction.findMany({
      where: {
        finished: false,
        type: { in: ["BuyRice", "SellRice"] },
      },
      include: {
        hostGeneral: {
          select: {
            no: true,
            name: true,
            nationId: true,
          },
        },
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
          select: {
            amount: true,
            generalId: true,
            general: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { closeDate: "asc" },
    });
  }

  /**
   * 유니크 아이템 경매 목록 조회
   */
  async getUniqueItemAuctionList() {
    return this.prisma.auction.findMany({
      where: {
        finished: false,
        type: "UniqueItem",
      },
      include: {
        hostGeneral: {
          select: {
            no: true,
            name: true,
            nationId: true,
          },
        },
        bids: {
          orderBy: { amount: "desc" },
          take: 1,
          select: {
            amount: true,
            generalId: true,
            general: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { closeDate: "asc" },
    });
  }

  /**
   * 유니크 아이템 경매 상세 조회
   */
  async getUniqueItemAuctionDetail(auctionId: number) {
    return this.prisma.auction.findUnique({
      where: { id: auctionId, type: "UniqueItem" },
      include: {
        hostGeneral: {
          select: {
            no: true,
            name: true,
            nationId: true,
            picture: true,
            imgSvr: true,
          },
        },
        bids: {
          orderBy: { amount: "desc" },
          include: {
            general: {
              select: {
                no: true,
                name: true,
                picture: true,
                imgSvr: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 쌀 구매 경매 입찰 (BuyRice - 쌀 판매자에게 금으로 입찰)
   */
  async bidBuyRiceAuction(auctionId: number, generalId: number, amount: number) {
    return this.bid(auctionId, generalId, amount, false);
  }

  /**
   * 쌀 판매 경매 입찰 (SellRice - 쌀 구매자에게 쌀로 입찰)
   */
  async bidSellRiceAuction(auctionId: number, generalId: number, amount: number) {
    return this.bid(auctionId, generalId, amount, false);
  }

  /**
   * 유니크 아이템 경매 입찰
   */
  async bidUniqueAuction(
    auctionId: number,
    generalId: number,
    amount: number,
    tryExtend: boolean = true
  ) {
    return this.bid(auctionId, generalId, amount, tryExtend);
  }
}
