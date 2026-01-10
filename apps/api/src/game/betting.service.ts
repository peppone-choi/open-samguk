import { Injectable } from "@nestjs/common";
import { createPrismaClient, type PrismaClientType } from "@sammo/infra";

/** 베팅 정보 인터페이스 */
export interface BettingInfo {
  id: number;
  type: "bettingNation" | "tournament";
  name: string;
  candidates: BettingCandidate[];
  closeDate: Date;
  isFinished: boolean;
  reqInheritancePoint: boolean;
  minAmount: number;
  aux?: Record<string, unknown>;
}

export interface BettingCandidate {
  id: number;
  name: string;
  aux?: Record<string, unknown>;
}

export interface BettingDetail {
  bettingType: number[];
  amount: number;
}

const MIN_BET_AMOUNT = 10;

@Injectable()
export class BettingService {
  private readonly prisma: PrismaClientType = createPrismaClient();

  /**
   * 베팅 목록 조회
   */
  async getBettingList(type?: "bettingNation" | "tournament") {
    // 베팅 정보는 Storage에 저장됨 (namespace: 'betting')
    const bettingStorage = await this.prisma.storage.findMany({
      where: {
        namespace: "betting",
        ...(type ? {} : {}), // type 필터는 value에서 처리
      },
    });

    const gameEnv = await this.getGameEnv();

    const bettingList: Record<string, any> = {};

    for (const item of bettingStorage) {
      const bettingInfo = item.value as any;
      if (type && bettingInfo.type !== type) continue;

      // candidates 제외하고 반환
      const { candidates, ...rest } = bettingInfo;
      bettingList[bettingInfo.id] = {
        ...rest,
        totalAmount: 0,
      };
    }

    // 총 베팅액 조회
    if (Object.keys(bettingList).length > 0) {
      const bettingIds = Object.keys(bettingList).map(Number);
      const totals = await this.prisma.betting.groupBy({
        by: ["bettingId"],
        where: { bettingId: { in: bettingIds } },
        _sum: { amount: true },
      });

      for (const total of totals) {
        if (bettingList[total.bettingId]) {
          bettingList[total.bettingId].totalAmount = total._sum.amount || 0;
        }
      }
    }

    return {
      result: true,
      bettingList,
      year: gameEnv.year,
      month: gameEnv.month,
    };
  }

  /**
   * 베팅 상세 조회
   */
  async getBettingDetail(bettingId: number, userId: number) {
    // 베팅 정보 조회
    const bettingStorage = await this.prisma.storage.findFirst({
      where: {
        namespace: "betting",
        key: `id_${bettingId}`,
      },
    });

    if (!bettingStorage) {
      throw new Error("해당 베팅이 없습니다.");
    }

    const bettingInfo = bettingStorage.value as any;
    const gameEnv = await this.getGameEnv();

    // 각 후보별 베팅 현황
    const bettingDetailRaw = await this.prisma.betting.groupBy({
      by: ["bettingType"],
      where: { bettingId },
      _sum: { amount: true },
    });

    const bettingDetail = bettingDetailRaw.map((item: any) => [
      item.bettingType,
      item._sum.amount || 0,
    ]);

    // 내 베팅 현황
    const myBettingRaw = await this.prisma.betting.groupBy({
      by: ["bettingType"],
      where: { bettingId, userId },
      _sum: { amount: true },
    });

    const myBetting = myBettingRaw.map((item: any) => [item.bettingType, item._sum.amount || 0]);

    // 잔여 포인트/골드 조회
    let remainPoint = 0;
    if (bettingInfo.reqInheritancePoint) {
      const inheritStorage = await this.prisma.storage.findFirst({
        where: {
          namespace: `inheritance_${userId}`,
          key: "previous",
        },
      });
      const value = inheritStorage?.value as any;
      remainPoint = value?.[0] || 0;
    } else {
      const general = await this.prisma.general.findFirst({
        where: { owner: userId, npc: 0 },
        select: { gold: true },
      });
      remainPoint = general?.gold || 0;
    }

    return {
      result: true,
      bettingInfo,
      bettingDetail,
      myBetting,
      remainPoint,
      year: gameEnv.year,
      month: gameEnv.month,
    };
  }

  /**
   * 베팅하기
   */
  async bet(
    bettingId: number,
    generalId: number,
    userId: number,
    bettingType: number[],
    amount: number
  ) {
    if (amount < MIN_BET_AMOUNT) {
      throw new Error(`최소 베팅 금액은 ${MIN_BET_AMOUNT}입니다.`);
    }

    // 베팅 정보 조회
    const bettingStorage = await this.prisma.storage.findFirst({
      where: {
        namespace: "betting",
        key: `id_${bettingId}`,
      },
    });

    if (!bettingStorage) {
      throw new Error("해당 베팅이 없습니다.");
    }

    const bettingInfo = bettingStorage.value as any;

    // 베팅 마감 여부 확인
    if (bettingInfo.isFinished) {
      throw new Error("이미 마감된 베팅입니다.");
    }

    const closeDate = new Date(bettingInfo.closeDate);
    if (closeDate < new Date()) {
      throw new Error("베팅 기간이 종료되었습니다.");
    }

    // 후보 유효성 검사
    for (const typeId of bettingType) {
      const candidate = bettingInfo.candidates?.find((c: any) => c.id === typeId);
      if (!candidate) {
        throw new Error("유효하지 않은 베팅 대상입니다.");
      }
    }

    return (this.prisma as any).$transaction(async (tx: any) => {
      // 자원 차감
      if (bettingInfo.reqInheritancePoint) {
        // 상속 포인트 사용
        const inheritStorage = await tx.storage.findFirst({
          where: {
            namespace: `inheritance_${userId}`,
            key: "previous",
          },
        });
        const value = (inheritStorage?.value as any) || [0, 0];
        const currentPoints = value[0] || 0;

        if (currentPoints < amount) {
          throw new Error("상속 포인트가 부족합니다.");
        }

        await tx.storage.upsert({
          where: {
            namespace_key: {
              namespace: `inheritance_${userId}`,
              key: "previous",
            },
          },
          update: {
            value: [currentPoints - amount, value[1]],
          },
          create: {
            namespace: `inheritance_${userId}`,
            key: "previous",
            value: [currentPoints - amount, value[1]],
          },
        });
      } else {
        // 골드 사용
        const general = await tx.general.findUnique({
          where: { no: generalId },
        });
        if (!general || general.gold < amount) {
          throw new Error("금이 부족합니다.");
        }

        await tx.general.update({
          where: { no: generalId },
          data: { gold: { decrement: amount } },
        });
      }

      // 베팅 기록 생성
      await tx.betting.create({
        data: {
          bettingId,
          generalId,
          userId,
          bettingType: bettingType,
          amount,
        },
      });

      return { result: true };
    });
  }

  /**
   * 베팅 개설 (관리자/시스템용)
   */
  async openBetting(
    type: "bettingNation" | "tournament",
    name: string,
    candidates: BettingCandidate[],
    closeDateStr: string,
    reqInheritancePoint: boolean = false,
    minAmount: number = MIN_BET_AMOUNT
  ) {
    // 새 베팅 ID 생성
    const existingBettings = await this.prisma.storage.findMany({
      where: { namespace: "betting" },
    });
    const maxId = existingBettings.reduce((max: number, item: any) => {
      const id = (item.value as any).id || 0;
      return Math.max(max, id);
    }, 0);
    const newId = maxId + 1;

    const bettingInfo: BettingInfo = {
      id: newId,
      type,
      name,
      candidates,
      closeDate: new Date(closeDateStr),
      isFinished: false,
      reqInheritancePoint,
      minAmount,
    };

    await this.prisma.storage.create({
      data: {
        namespace: "betting",
        key: `id_${newId}`,
        value: bettingInfo as any,
      },
    });

    return { result: true, bettingId: newId };
  }

  /**
   * 베팅 마감 및 정산 (시스템용)
   */
  async finishBetting(bettingId: number, winnerType: number[]) {
    const bettingStorage = await this.prisma.storage.findFirst({
      where: {
        namespace: "betting",
        key: `id_${bettingId}`,
      },
    });

    if (!bettingStorage) {
      throw new Error("해당 베팅이 없습니다.");
    }

    const bettingInfo = bettingStorage.value as any;
    if (bettingInfo.isFinished) {
      throw new Error("이미 정산된 베팅입니다.");
    }

    // 총 베팅액 조회
    const totalBets = await this.prisma.betting.aggregate({
      where: { bettingId },
      _sum: { amount: true },
    });
    const totalAmount = totalBets._sum.amount || 0;

    // 당첨자 베팅액 조회
    const winnerBets = await this.prisma.betting.findMany({
      where: {
        bettingId,
        // bettingType이 winnerType과 일치하는 경우 (JSON 배열 비교)
      },
    });

    // 당첨자들에게 배당금 지급
    const winnerTotalAmount = winnerBets
      .filter((bet: any) => {
        const betType = bet.bettingType as number[];
        return winnerType.every((w) => betType.includes(w));
      })
      .reduce((sum: number, bet: any) => sum + bet.amount, 0);

    if (winnerTotalAmount > 0) {
      const multiplier = totalAmount / winnerTotalAmount;

      for (const bet of winnerBets) {
        const betType = bet.bettingType as number[];
        if (!winnerType.every((w) => betType.includes(w))) continue;

        const payout = Math.floor(bet.amount * multiplier);

        if (bettingInfo.reqInheritancePoint) {
          // 상속 포인트 지급
          const inheritStorage = await this.prisma.storage.findFirst({
            where: {
              namespace: `inheritance_${bet.userId}`,
              key: "previous",
            },
          });
          const value = (inheritStorage?.value as any) || [0, 0];
          await this.prisma.storage.upsert({
            where: {
              namespace_key: {
                namespace: `inheritance_${bet.userId}`,
                key: "previous",
              },
            },
            update: {
              value: [(value[0] || 0) + payout, value[1]],
            },
            create: {
              namespace: `inheritance_${bet.userId}`,
              key: "previous",
              value: [payout, 0],
            },
          });
        } else {
          // 골드 지급
          await this.prisma.general.update({
            where: { no: bet.generalId },
            data: { gold: { increment: payout } },
          });
        }
      }
    }

    // 베팅 정보 업데이트 (마감 처리)
    bettingInfo.isFinished = true;
    bettingInfo.winnerType = winnerType;
    await this.prisma.storage.update({
      where: {
        namespace_key: {
          namespace: "betting",
          key: `id_${bettingId}`,
        },
      },
      data: { value: bettingInfo },
    });

    return { result: true, totalAmount, winnerTotalAmount };
  }

  private async getGameEnv() {
    const storage = await this.prisma.storage.findMany({
      where: {
        namespace: "game_env",
        key: { in: ["year", "month"] },
      },
    });

    const year = (storage.find((s: any) => s.key === "year")?.value as number) || 184;
    const month = (storage.find((s: any) => s.key === "month")?.value as number) || 1;

    return { year, month };
  }
}
