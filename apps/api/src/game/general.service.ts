import { Injectable } from "@nestjs/common";
import { createPrismaClient } from "@sammo/infra";
import { InheritService, INHERIT_CONSTANTS } from "./inherit.service.js";

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
  /** 유산 시작 도시 */
  inheritCity?: number;
  /** 유산 보너스 스탯 */
  inheritBonusStat?: [number, number, number];
  /** 유산 시작 특기 */
  inheritSpecial?: string;
  /** 유산 턴 시간 오프셋 (초) */
  inheritTurntimeZone?: number;
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

  constructor(private readonly inheritService: InheritService) {}

  /**
   * 장수 생성 (신규 가입)
   */
  async createGeneral(input: CreateGeneralInput): Promise<CreateGeneralResult> {
    const { ownerId, name, picture, nationId, leadership, strength, intel } = input;
    const startAge = input.startAge ?? 20;
    const personal = input.personal ?? "None";
    let special = input.special ?? "None";

    // 유산 보너스 스탯 적용
    let appliedLeadership = leadership;
    let appliedStrength = strength;
    let appliedIntel = intel;

    if (input.inheritBonusStat) {
      appliedLeadership += input.inheritBonusStat[0];
      appliedStrength += input.inheritBonusStat[1];
      appliedIntel += input.inheritBonusStat[2];
    }

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
    let cityId = input.inheritCity || 3; // 기본 도시 (낙양)
    if (nationId > 0) {
      const nation = await this.prisma.nation.findUnique({
        where: { nation: nationId },
        include: { cities: { take: 1 } },
      });
      if (!nation) {
        return { success: false, error: "존재하지 않는 국가입니다" };
      }
      // 유산 도시가 있으면 그것을 우선, 없으면 국가의 첫 도시
      cityId = input.inheritCity || nation.capital || nation.cities[0]?.city || cityId;
    }

    // 5. 유산 포인트 검증 및 차감
    let requiredPoints = 0;
    const logs: string[] = [];

    if (input.inheritCity) {
      requiredPoints += INHERIT_CONSTANTS.inheritBornCityPoint;
      logs.push(`시작 도시 지정 (${input.inheritCity})`);
    }
    if (input.inheritBonusStat && input.inheritBonusStat.reduce((a, b) => a + b, 0) > 0) {
      requiredPoints += INHERIT_CONSTANTS.inheritBornStatPointCost;
      logs.push(`보너스 스탯 적용 ([${input.inheritBonusStat.join(",")}])`);
    }
    if (input.inheritSpecial && input.inheritSpecial !== "None") {
      requiredPoints += INHERIT_CONSTANTS.inheritBornSpecialPoint;
      special = input.inheritSpecial;
      logs.push(`시작 특기 지정 (${special})`);
    }
    if (input.inheritTurntimeZone !== undefined) {
      requiredPoints += INHERIT_CONSTANTS.inheritBornTurntimePoint;
      logs.push(`턴 시간대 지정 (${input.inheritTurntimeZone}초)`);
    }

    if (requiredPoints > 0) {
      const { points } = await this.inheritService.getPoints(ownerId);
      if (points < requiredPoints) {
        return { success: false, error: "유산 포인트가 부족합니다." };
      }
      await this.inheritService.deductPoints(ownerId, requiredPoints);
      await this.inheritService.logInheritAction(
        ownerId,
        `장수 생성 유산 사용: ${logs.join(", ")}`
      );
    }

    // 6. 현재 게임 턴 시간 정보 가져오기
    const turnTermEntry = await this.prisma.storage.findUnique({
      where: { namespace_key: { namespace: "game_env", key: "turnterm" } },
    });
    const turnTerm = (turnTermEntry?.value as number) ?? 10;
    const turnTimeOffset = input.inheritTurntimeZone ?? Math.floor(Math.random() * turnTerm * 60);

    const turnTimeEnv = await this.prisma.storage.findFirst({
      where: { namespace: "game_env", key: "turntime" },
    });
    const baseTurnTime = turnTimeEnv?.value ? new Date(turnTimeEnv.value as string) : new Date();

    // 7. 유저 정보 가져오기
    const member = await this.prisma.member.findUnique({
      where: { id: ownerId },
    });
    const ownerName = member?.name ?? null;

    // 8. 장수 생성
    const general = await this.prisma.general.create({
      data: {
        owner: ownerId,
        ownerName,
        name,
        picture,
        nationId,
        cityId,
        leadership: appliedLeadership,
        leadershipExp: 0,
        strength: appliedStrength,
        strengthExp: 0,
        intel: appliedIntel,
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
        special2: special,
        turnTime: new Date(baseTurnTime.getTime() + turnTimeOffset * 1000),
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

  /**
   * 메인 페이지 전방 정보 조회 (GetFrontInfo)
   * 장수, 국가, 도시, 글로벌 정보를 종합 반환
   */
  async getFrontInfo(
    generalId: number,
    options?: { lastRecordId?: number; lastHistoryId?: number }
  ) {
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      include: {
        nation: true,
        city: {
          include: {
            nation: { select: { name: true, color: true } },
          },
        },
        accessLog: true,
      },
    });

    if (!general) throw new Error("장수 정보가 없습니다.");

    // 게임 환경 정보
    const gameEnvStorage = await this.prisma.storage.findMany({
      where: { namespace: "game_env" },
    });
    const gameEnv: Record<string, any> = {};
    for (const item of gameEnvStorage) {
      gameEnv[item.key] = item.value;
    }

    // 최근 기록 조회
    const lastRecordId = options?.lastRecordId ?? 0;
    const lastHistoryId = options?.lastHistoryId ?? 0;

    const [generalRecords, globalRecords, worldHistory] = await Promise.all([
      // 장수 개인 기록
      this.prisma.generalRecord.findMany({
        where: {
          generalId,
          logType: "action",
          ...(lastRecordId > 0 ? { id: { gt: lastRecordId } } : {}),
        },
        orderBy: { id: "desc" },
        take: 15,
      }),
      // 전역 기록
      this.prisma.generalRecord.findMany({
        where: {
          generalId: 0,
          logType: "history",
          ...(lastRecordId > 0 ? { id: { gt: lastRecordId } } : {}),
        },
        orderBy: { id: "desc" },
        take: 15,
      }),
      // 세계 역사
      this.prisma.worldHistory.findMany({
        where: {
          nationId: 0,
          ...(lastHistoryId > 0 ? { id: { gt: lastHistoryId } } : {}),
        },
        orderBy: { id: "desc" },
        take: 15,
      }),
    ]);

    // 국가 정보 (소속 국가가 있는 경우)
    let nationInfo: any = null;
    if (general.nationId > 0 && general.nation) {
      const [nationPopulation, nationCrew, topChiefs] = await Promise.all([
        this.prisma.city.aggregate({
          where: { nationId: general.nationId },
          _count: { city: true },
          _sum: { pop: true, popMax: true },
        }),
        this.prisma.general.aggregate({
          where: { nationId: general.nationId, npc: { not: 5 } },
          _count: { no: true },
          _sum: { crew: true, leadership: true },
        }),
        this.prisma.general.findMany({
          where: { nationId: general.nationId, officerLevel: { gte: 11 } },
          select: { no: true, name: true, officerLevel: true, npc: true },
        }),
      ]);

      nationInfo = {
        id: general.nationId,
        name: general.nation.name,
        color: general.nation.color,
        level: general.nation.level,
        capital: general.nation.capital,
        gold: general.nation.gold,
        rice: general.nation.rice,
        tech: general.nation.tech,
        population: {
          cityCnt: nationPopulation._count.city,
          now: nationPopulation._sum.pop ?? 0,
          max: nationPopulation._sum.popMax ?? 0,
        },
        crew: {
          generalCnt: nationCrew._count.no,
          now: nationCrew._sum.crew ?? 0,
          max: (nationCrew._sum.leadership ?? 0) * 100,
        },
        topChiefs,
        bill: general.nation.bill,
        taxRate: general.nation.rate,
        prohibitScout: general.nation.scout,
        prohibitWar: general.nation.war,
      };
    }

    // 도시 정보
    const cityInfo = general.city
      ? {
          id: general.city.city,
          name: general.city.name,
          level: general.city.level,
          trust: general.city.trust,
          pop: [general.city.pop, general.city.popMax],
          agri: [general.city.agri, general.city.agriMax],
          comm: [general.city.comm, general.city.commMax],
          secu: [general.city.secu, general.city.secuMax],
          def: [general.city.def, general.city.defMax],
          wall: [general.city.wall, general.city.wallMax],
          trade: general.city.trade,
          nationInfo: general.city.nation
            ? {
                id: general.city.nationId,
                name: general.city.nation.name,
                color: general.city.nation.color,
              }
            : null,
        }
      : null;

    // 경매 수, 토너먼트 상태 등 글로벌 정보
    const auctionCount = await this.prisma.auction.count({ where: { finished: false } });

    return {
      result: true,
      general: {
        no: general.no,
        name: general.name,
        nation: general.nationId,
        npc: general.npc,
        injury: general.injury,
        leadership: general.leadership,
        strength: general.strength,
        intel: general.intel,
        gold: general.gold,
        rice: general.rice,
        killturn: general.killTurn,
        picture: general.picture,
        imgsvr: general.imgSvr,
        age: general.age,
        specialDomestic: general.special,
        specialWar: general.special2,
        personal: general.personal,
        belong: general.belong,
        officerLevel: general.officerLevel,
        city: general.cityId,
        troop: general.troopId,
        crew: general.crew,
        crewtype: general.crewType,
        train: general.train,
        atmos: general.atmos,
        turntime: general.turnTime,
        horse: general.horse,
        weapon: general.weapon,
        book: general.book,
        item: general.item,
      },
      nation: nationInfo,
      city: cityInfo,
      global: {
        year: gameEnv.year,
        month: gameEnv.month,
        startyear: gameEnv.startyear ?? gameEnv.init_year,
        turnterm: gameEnv.turnterm,
        lastExecuted: gameEnv.turntime,
        auctionCount,
        isTournamentActive: (gameEnv.tournament ?? 0) > 0,
        isLocked: false,
      },
      recentRecord: {
        general: generalRecords,
        global: globalRecords,
        history: worldHistory,
      },
    };
  }

  /**
   * 장수 커맨드 테이블 조회 (사용 가능한 커맨드 목록)
   */
  async getCommandTable(generalId: number) {
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      include: { nation: true, city: true },
    });

    if (!general) throw new Error("장수 정보가 없습니다.");

    // 게임 환경
    const gameEnvStorage = await this.prisma.storage.findMany({
      where: { namespace: "game_env" },
    });
    const gameEnv: Record<string, any> = {};
    for (const item of gameEnvStorage) {
      gameEnv[item.key] = item.value;
    }

    // 예약된 커맨드 조회
    const reservedCommands = await this.prisma.generalTurn.findMany({
      where: { generalId },
      orderBy: { turnIdx: "asc" },
      take: 12,
    });

    // TODO: 실제 커맨드 가용성 검사 로직 (logic 패키지의 CommandFactory 활용)
    // 현재는 기본 커맨드 목록만 반환

    return {
      result: true,
      general: {
        no: general.no,
        name: general.name,
        nationId: general.nationId,
        cityId: general.cityId,
        officerLevel: general.officerLevel,
        gold: general.gold,
        rice: general.rice,
        crew: general.crew,
      },
      reservedCommands: reservedCommands.map((cmd) => ({
        turnIdx: cmd.turnIdx,
        action: cmd.action,
        arg: cmd.arg,
        brief: cmd.brief,
      })),
      gameEnv: {
        year: gameEnv.year,
        month: gameEnv.month,
        turnterm: gameEnv.turnterm,
      },
    };
  }

  /**
   * 즉시 퇴각 (전투 중 퇴각)
   */
  async instantRetreat(generalId: number) {
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });
    if (!general) throw new Error("장수 정보가 없습니다.");

    // 전투 중인지 확인 (aux.combat 등)
    const aux = (general.aux as any) || {};
    if (!aux.inCombat) {
      throw new Error("전투 중이 아닙니다.");
    }

    // 퇴각 처리: 병력 손실, 사기/훈련 감소
    const crewLoss = Math.floor(general.crew * 0.1);
    const atmosLoss = Math.floor(general.atmos * 0.2);
    const trainLoss = Math.floor(general.train * 0.1);

    return this.prisma.general.update({
      where: { no: generalId },
      data: {
        crew: { decrement: crewLoss },
        atmos: Math.max(0, general.atmos - atmosLoss),
        train: Math.max(0, general.train - trainLoss),
        aux: {
          ...aux,
          inCombat: false,
          retreated: true,
        },
      },
    });
  }

  /**
   * 국가 건국 후보 등록 (재야 상태에서)
   */
  async buildNationCandidate(generalId: number, nationName: string, nationColor: string) {
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });
    if (!general) throw new Error("장수 정보가 없습니다.");
    if (general.nationId !== 0) throw new Error("이미 소속된 국가가 있습니다.");

    // 건국 후보 등록 (aux에 저장)
    const aux = (general.aux as any) || {};
    aux.nationCandidate = {
      name: nationName,
      color: nationColor,
      registeredAt: new Date().toISOString(),
    };

    return this.prisma.general.update({
      where: { no: generalId },
      data: { aux },
    });
  }

  /**
   * 게임 시작 전 사망 (Prestart 상태에서 장수 삭제)
   */
  async dieOnPrestart(generalId: number) {
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });
    if (!general) throw new Error("장수 정보가 없습니다.");

    // 게임 시작 전인지 확인
    const gameEnv = await this.prisma.storage.findFirst({
      where: { namespace: "game_env", key: "isrunning" },
    });
    const isRunning = gameEnv?.value as boolean;

    if (isRunning) {
      throw new Error("게임이 이미 시작되었습니다. 일반 하야 절차를 이용하세요.");
    }

    // 장수 삭제 (관련 데이터도 함께)
    await this.prisma.$transaction([
      this.prisma.generalTurn.deleteMany({ where: { generalId } }),
      this.prisma.generalRecord.deleteMany({ where: { generalId } }),
      this.prisma.generalAccessLog.deleteMany({ where: { generalId } }),
      this.prisma.general.delete({ where: { no: generalId } }),
    ]);

    return { success: true, message: "장수가 삭제되었습니다." };
  }
}
