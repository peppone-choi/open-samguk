import { Injectable } from "@nestjs/common";
import { createPrismaClient } from "@sammo/infra";

/** 장수 생성 입력 DTO */
export interface CreateGeneralInput {
  /** 유저 ID (member.id) */
  ownerId: number;
  /** 장수 이름 */
  name: string;
  /** 초상화 파일명 */
  picture: string;
  /** 가입할 국가 ID (0 = 재야) */
  nationId: number;
  /** 통솔 */
  leadership: number;
  /** 무력 */
  strength: number;
  /** 지력 */
  intel: number;
  /** 시작 나이 (기본 20) */
  startAge?: number;
  /** 성격 특성 */
  personal?: string;
  /** 특기 */
  special?: string;
}

/** 장수 생성 결과 */
export interface CreateGeneralResult {
  success: boolean;
  generalId?: number;
  error?: string;
}

const STAT_SUM_LIMIT = 180;
const STAT_MIN = 10;
const STAT_MAX = 100;
const INITIAL_GOLD = 1000;
const INITIAL_RICE = 1000;

@Injectable()
export class GeneralService {
  private readonly prisma = createPrismaClient();

  /**
   * 장수 생성 (신규 가입)
   */
  async createGeneral(input: CreateGeneralInput): Promise<CreateGeneralResult> {
    const { ownerId, name, picture, nationId, leadership, strength, intel } = input;
    const startAge = input.startAge ?? 20;
    const personal = input.personal ?? "None";
    const special = input.special ?? "None";

    // 1. 스탯 유효성 검증
    const statSum = leadership + strength + intel;
    if (statSum > STAT_SUM_LIMIT) {
      return {
        success: false,
        error: `스탯 합계가 ${STAT_SUM_LIMIT}을 초과합니다 (현재: ${statSum})`,
      };
    }
    if (leadership < STAT_MIN || leadership > STAT_MAX) {
      return { success: false, error: `통솔은 ${STAT_MIN}~${STAT_MAX} 범위여야 합니다` };
    }
    if (strength < STAT_MIN || strength > STAT_MAX) {
      return { success: false, error: `무력은 ${STAT_MIN}~${STAT_MAX} 범위여야 합니다` };
    }
    if (intel < STAT_MIN || intel > STAT_MAX) {
      return { success: false, error: `지력은 ${STAT_MIN}~${STAT_MAX} 범위여야 합니다` };
    }

    // 2. 이름 중복 검사
    const existingByName = await this.prisma.general.findFirst({
      where: { name },
    });
    if (existingByName) {
      return { success: false, error: "이미 사용 중인 장수 이름입니다" };
    }

    // 3. 유저가 이미 장수를 보유 중인지 검사
    const existingByOwner = await this.prisma.general.findFirst({
      where: { owner: ownerId, npc: 0 },
    });
    if (existingByOwner) {
      return { success: false, error: "이미 장수를 보유하고 있습니다" };
    }

    // 4. 국가 존재 여부 및 시작 도시 결정
    let cityId = 3; // 기본 도시 (낙양)
    if (nationId > 0) {
      const nation = await this.prisma.nation.findUnique({
        where: { nation: nationId },
        include: { cities: { take: 1 } },
      });
      if (!nation) {
        return { success: false, error: "존재하지 않는 국가입니다" };
      }
      // 국가의 수도 또는 첫 번째 도시
      cityId = nation.capital || nation.cities[0]?.city || cityId;
    }

    // 5. 현재 게임 턴 시간 가져오기 (game_env에서)
    const turnTimeEnv = await this.prisma.storage.findFirst({
      where: { namespace: "game_env", key: "turntime" },
    });
    const turnTime = turnTimeEnv?.value ? new Date(turnTimeEnv.value as string) : new Date();

    // 6. 유저 정보 가져오기 (ownerName용)
    const member = await this.prisma.member.findUnique({
      where: { id: ownerId },
    });
    const ownerName = member?.name ?? null;

    // 7. 장수 생성
    const general = await this.prisma.general.create({
      data: {
        owner: ownerId,
        ownerName,
        name,
        picture,
        nationId,
        cityId,
        leadership,
        leadershipExp: 0,
        strength,
        strengthExp: 0,
        intel,
        intelExp: 0,
        gold: INITIAL_GOLD,
        rice: INITIAL_RICE,
        crew: 0,
        crewType: 0,
        train: 0,
        atmos: 0,
        age: startAge,
        startAge,
        bornYear: 184 - startAge, // 기본 시나리오 기준
        personal,
        special,
        turnTime,
        npc: 0,
        npcOrg: 0,
        officerLevel: nationId > 0 ? 1 : 0,
        belong: 1,
      },
    });

    // 8. 접근 로그 생성
    await this.prisma.generalAccessLog.create({
      data: {
        generalId: general.no,
        userId: ownerId,
        lastRefresh: new Date(),
      },
    });

    return { success: true, generalId: general.no };
  }

  /**
   * 장수 상세 정보 조회
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
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });
    if (!general) throw new Error("장수가 없습니다.");
    if (general.nationId !== 0) throw new Error("이미 소속된 국가가 있습니다.");

    return this.prisma.general.update({
      where: { no: generalId },
      data: {
        nationId,
        officerLevel: 1,
        belong: 1,
      },
    });
  }

  /**
   * 접속 중인 장수 목록 (최근 10분)
   */
  async getConnectedGenerals(seconds: number = 600) {
    const threshold = new Date(Date.now() - seconds * 1000);
    return this.prisma.general.findMany({
      where: {
        npc: 0,
        accessLog: {
          lastRefresh: { gte: threshold },
        },
      },
      select: {
        no: true,
        name: true,
        nationId: true,
        nation: { select: { name: true, color: true } },
        accessLog: { select: { lastRefresh: true } },
      },
      orderBy: { accessLog: { lastRefresh: "desc" } },
    });
  }

  /**
   * 장수 목록 조회 (필터링 및 정렬)
   */
  async getGeneralList(params: {
    nationId?: number;
    npc?: number[];
    orderBy?: string;
    limit?: number;
    offset?: number;
  }) {
    const { nationId, npc, orderBy = "experience", limit = 100, offset = 0 } = params;

    const where: any = {};
    if (nationId !== undefined) where.nationId = nationId;
    if (npc !== undefined) where.npc = { in: npc };

    let order: any = { [orderBy]: "desc" };
    if (orderBy === "statSum") {
      order = { experience: "desc" };
    }

    return this.prisma.general.findMany({
      where,
      orderBy: order,
      take: limit,
      skip: offset,
      include: {
        nation: { select: { name: true, color: true } },
        city: { select: { name: true } },
      },
    });
  }
}
