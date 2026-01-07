import { Injectable } from "@nestjs/common";
import { createPrismaClient } from "@sammo/infra";

@Injectable()
export class AuctionService {
  private readonly prisma = createPrismaClient();

  /**
   * 진행 중인 경매 목록 조회
   */
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

  /**
   * 경매 상세 조회 (입찰 기록 포함)
   */
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

  /**
   * 입찰하기
   */
  async bid(auctionId: number, generalId: number, amount: number, tryExtend: boolean) {
    // 1. 경매 및 장수 데이터 로드
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });

    if (!auction || auction.finished) throw new Error("종료되었거나 존재하지 않는 경매입니다.");
    if (!general) throw new Error("장수 정보가 없습니다.");

    // 2. 비즈니스 로직 체크 (도메인 로직 활용 예정이나 여기서는 간단히 구현)
    const highestBid = await this.prisma.auctionBid.findFirst({
      where: { auctionId },
      orderBy: { amount: "desc" },
    });

    if (highestBid && amount <= highestBid.amount) {
      throw new Error("현재 최고 입찰가보다 높아야 합니다.");
    }

    // 3. 입찰 처리 (트랜잭션)
    return (this.prisma as any).$transaction(async (tx: any) => {
      // 유산 포인트(inheritancePoint) 또는 금/쌀 차감 로직 필요
      // 여기서는 단순 입찰 기록 생성만 예시로 작성
      const bid = await tx.auctionBid.create({
        data: {
          auctionId,
          generalId,
          amount,
          date: new Date(),
          aux: { tryExtendCloseDate: tryExtend } as any,
        },
      });

      // 종료 시간 연장 체크
      const now = new Date();
      if (auction.closeDate.getTime() - now.getTime() < 5 * 60 * 1000) {
        // 5분 미만 남았을 때
        const newCloseDate = new Date(auction.closeDate.getTime() + 5 * 60 * 1000); // 5분 연장
        await tx.auction.update({
          where: { id: auctionId },
          data: { closeDate: newCloseDate },
        });
      }

      return bid;
    });
  }
}
