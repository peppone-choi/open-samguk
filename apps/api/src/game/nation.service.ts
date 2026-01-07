import { Injectable } from "@nestjs/common";
import { createPrismaClient } from "@sammo/infra";

@Injectable()
export class NationService {
  private readonly prisma = createPrismaClient();

  /**
   * 국가 상세 정보 조회
   */
  async getNationInfo(nationId: number) {
    return this.prisma.nation.findUnique({
      where: { nation: nationId },
      include: {
        cities: {
          select: { city: true, name: true, level: true },
        },
      },
    });
  }

  /**
   * 국가 소속 장수 목록 조회
   */
  async getNationGeneralList(nationId: number) {
    return this.prisma.general.findMany({
      where: { nationId },
      select: {
        no: true,
        name: true,
        officerLevel: true,
        gold: true,
        rice: true,
        leadership: true,
        strength: true,
        intel: true,
        experience: true,
        dedication: true,
        picture: true,
        imgSvr: true,
      },
      orderBy: { officerLevel: "desc" },
    });
  }

  /**
   * 국가 설정 업데이트 (군주/수뇌부용)
   */
  async updateNationConfig(
    nationId: number,
    data: { rate?: number; bill?: number; secretLimit?: number }
  ) {
    return this.prisma.nation.update({
      where: { nation: nationId },
      data: {
        ...(data.rate !== undefined ? { rate: data.rate } : {}),
        ...(data.bill !== undefined ? { bill: data.bill } : {}),
        ...(data.secretLimit !== undefined ? { secretLimit: data.secretLimit } : {}),
      },
    });
  }

  /**
   * 국가 공지사항 설정
   */
  async setNationNotice(nationId: number, notice: string) {
    // legacy에서는 aux 필드나 별도 컬럼에 저장함. 여기선 aux.notice에 저장한다고 가정
    const nation = await this.prisma.nation.findUnique({ where: { nation: nationId } });
    const aux = (nation?.aux as any) || {};
    aux.notice = notice;

    return this.prisma.nation.update({
      where: { nation: nationId },
      data: { aux },
    });
  }
}
