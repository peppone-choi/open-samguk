import { Injectable } from "@nestjs/common";
import { createPrismaClient } from "@sammo/infra";

@Injectable()
export class GeneralService {
  private readonly prisma = createPrismaClient();

  /**
   * 장수 상세 정보 조회 (기존 GameService 로직 이동 권장)
   */
  async getGeneralDetail(generalId: number) {
    return this.prisma.general.findUnique({
      where: { no: generalId },
      include: {
        nation: true,
        city: true,
      },
    });
  }

  /**
   * 장수 로그(기록) 조회
   */
  async getGeneralLogs(generalId: number, limit: number = 50) {
    return this.prisma.generalRecord.findMany({
      where: { generalId },
      orderBy: [{ year: "desc" }, { month: "desc" }, { id: "desc" }],
      take: limit,
    });
  }

  /**
   * 아이템 장착 해제/버리기
   */
  async dropItem(generalId: number, itemType: "weapon" | "book" | "horse" | "item") {
    return this.prisma.general.update({
      where: { no: generalId },
      data: {
        [itemType]: "None",
      },
    });
  }

  /**
   * 국가 임관 (Join)
   */
  async joinNation(generalId: number, nationId: number) {
    // 1. 중립(방랑) 상태인지 확인 등 비즈니스 로직 필요
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });
    if (!general) throw new Error("장수가 없습니다.");
    if (general.nationId !== 0) throw new Error("이미 소속된 국가가 있습니다.");

    return this.prisma.general.update({
      where: { no: generalId },
      data: {
        nationId,
        officerLevel: 1, // 일반 장수
        belong: 1, // 호봉수 초기화
      },
    });
  }
}
