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
   * 국가 소속 장수 목록 조회 (상세 정보 포함)
   */
  async getNationGeneralList(nationId: number, viewerGeneralId?: number) {
    const viewer = viewerGeneralId
      ? await this.prisma.general.findUnique({ where: { no: viewerGeneralId } })
      : null;

    const envData = await this.prisma.storage.findMany({
      where: { namespace: "game_env" },
    });
    const env: any = {};
    for (const item of envData) {
      env[item.key] = item.value;
    }

    const permission =
      viewer && viewer.nationId === nationId ? (viewer.officerLevel >= 5 ? 2 : 1) : 0;

    const generals = await this.prisma.general.findMany({
      where: { nationId },
      include: {
        accessLog: true,
        turns: {
          orderBy: { turnIdx: "asc" },
          take: 3,
        },
        nation: {
          select: { level: true },
        },
      },
      orderBy: { officerLevel: "desc" },
    });

    const troops = await this.prisma.troop.findMany({
      where: { nationId },
    });

    const resultList = generals.map((gen) => {
      const base: any = {
        no: gen.no,
        name: gen.name,
        nation: gen.nationId,
        npc: gen.npc,
        injury: gen.injury,
        leadership: gen.leadership,
        strength: gen.strength,
        intel: gen.intel,
        explevel: gen.expLevel,
        dedlevel: gen.dedLevel,
        gold: gen.gold,
        rice: gen.rice,
        killturn: gen.killTurn ?? 0,
        picture: gen.picture,
        imgsvr: gen.imgSvr as 0 | 1,
        age: gen.age,
        specialDomestic: gen.special,
        specialWar: gen.special2,
        personal: gen.personal,
        belong: gen.belong,
        refreshScoreTotal: gen.accessLog?.refreshScoreTotal ?? null,
        officerLevel: gen.officerLevel,
        officerLevelText: this.getOfficerLevelText(gen.officerLevel, gen.nation?.level ?? 0),
        lbonus: 0,
        ownerName: gen.ownerName,
        honorText: "무관",
        dedLevelText: `계급 ${gen.dedLevel}`,
        bill: 100,
        reservedCommand: null,
        autorun_limit: 0,
        city: gen.cityId,
        troop: gen.troopId,
        st0: true,
        st1: false,
        st2: false,
        permission: 0,
      };

      if (permission >= 1) {
        Object.assign(base, {
          st1: true,
          permission: 1,
          refreshScore: gen.accessLog?.refreshScore ?? null,
          specage: gen.specAge,
          specage2: gen.specAge2,
          leadership_exp: gen.leadershipExp,
          strength_exp: gen.strengthExp,
          intel_exp: gen.intelExp,
          dex1: gen.dex1,
          dex2: gen.dex2,
          dex3: gen.dex3,
          dex4: gen.dex4,
          dex5: gen.dex5,
          experience: gen.experience,
          dedication: gen.dedication,
          officer_level: gen.officerLevel,
          officer_city: gen.officerCity,
          defence_train: gen.defenceTrain,
          crewtype: String(gen.crewType),
          crew: gen.crew,
          train: gen.train,
          atmos: gen.atmos,
          turntime: gen.turnTime.toISOString(),
          recent_war: gen.recentWar?.toISOString() ?? "",
          horse: gen.horse,
          weapon: gen.weapon,
          book: gen.book,
          item: gen.item,
          warnum: 0,
          killnum: 0,
          deathnum: 0,
          killcrew: 0,
          deathcrew: 0,
          firenum: 0,
        });
      }

      if (permission >= 2) {
        Object.assign(base, {
          st2: true,
          permission: 2,
          reservedCommand: gen.turns.map((t) => ({
            action: t.action,
            brief: t.brief ?? t.action,
            arg: t.arg ?? {},
          })),
        });
      }

      return base;
    });

    return {
      list: resultList,
      troops: troops.map((t) => ({ id: t.troopLeader, name: t.name })),
      env: {
        year: env.year,
        month: env.month,
        turntime: env.turntime,
        turnterm: env.turnterm,
        killturn: env.killturn ?? 80,
      },
      permission,
    };
  }

  private getOfficerLevelText(officerLevel: number, _nationLevel?: number): string {
    const officerNames: Record<number, string> = {
      12: "군주",
      11: "승상",
      10: "참모",
      9: "장군",
      8: "군사",
      7: "시중",
      6: "태수",
      5: "장관",
    };
    return officerNames[officerLevel] || `레벨${officerLevel}`;
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

  /**
   * 전쟁 차단 설정 (공격 받지 않음)
   */
  async setBlockWar(nationId: number, generalId: number, block: boolean) {
    // 권한 확인 (군주만 가능)
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });
    if (!general || general.nationId !== nationId) {
      throw new Error("해당 국가 소속이 아닙니다.");
    }
    if (general.officerLevel < 12) {
      throw new Error("군주만 전쟁 차단을 설정할 수 있습니다.");
    }

    return this.prisma.nation.update({
      where: { nation: nationId },
      data: { war: block ? 1 : 0 },
    });
  }

  /**
   * 정찰 차단 설정
   */
  async setBlockScout(nationId: number, generalId: number, block: boolean) {
    // 권한 확인 (수뇌부 이상)
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });
    if (!general || general.nationId !== nationId) {
      throw new Error("해당 국가 소속이 아닙니다.");
    }
    if (general.officerLevel < 5) {
      throw new Error("수뇌부 이상만 정찰 차단을 설정할 수 있습니다.");
    }

    return this.prisma.nation.update({
      where: { nation: nationId },
      data: { scout: block ? 1 : 0 },
    });
  }

  /**
   * 정찰 메시지 설정 (정찰 당할 때 보이는 메시지)
   */
  async setScoutMsg(nationId: number, generalId: number, message: string) {
    // 권한 확인
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });
    if (!general || general.nationId !== nationId) {
      throw new Error("해당 국가 소속이 아닙니다.");
    }
    if (general.officerLevel < 5) {
      throw new Error("수뇌부 이상만 정찰 메시지를 설정할 수 있습니다.");
    }

    const nation = await this.prisma.nation.findUnique({ where: { nation: nationId } });
    const aux = (nation?.aux as any) || {};
    aux.scoutMsg = message;

    return this.prisma.nation.update({
      where: { nation: nationId },
      data: { aux },
    });
  }

  /**
   * 부대 이름 설정 (국가 레벨에서)
   */
  async setTroopName(nationId: number, generalId: number, troopId: number, name: string) {
    // 권한 확인 (부대장 또는 수뇌부)
    const general = await this.prisma.general.findUnique({ where: { no: generalId } });
    if (!general || general.nationId !== nationId) {
      throw new Error("해당 국가 소속이 아닙니다.");
    }

    const troop = await this.prisma.troop.findUnique({
      where: { troopLeader: troopId },
    });

    if (!troop || troop.nationId !== nationId) {
      throw new Error("해당 부대가 없습니다.");
    }

    // 부대장이거나 수뇌부인지 확인
    if (troop.troopLeader !== generalId && general.officerLevel < 5) {
      throw new Error("부대장 또는 수뇌부만 부대 이름을 변경할 수 있습니다.");
    }

    return this.prisma.troop.update({
      where: { troopLeader: troopId },
      data: { name },
    });
  }

  /**
   * 국가 로그 조회
   */
  async getNationLog(nationId: number, limit: number = 50) {
    return this.prisma.worldHistory.findMany({
      where: { nationId },
      orderBy: [{ year: "desc" }, { month: "desc" }, { id: "desc" }],
      take: limit,
    });
  }

  /**
   * 국가 장수 로그 조회
   */
  async getGeneralLog(nationId: number, generalId: number, limit: number = 50) {
    // 해당 국가 소속 확인
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { nationId: true },
    });

    if (!general) {
      throw new Error("장수 정보가 없습니다.");
    }

    // 같은 국가거나 재야(0)인 경우만 조회 가능
    if (general.nationId !== nationId && general.nationId !== 0) {
      throw new Error("해당 국가 소속 장수가 아닙니다.");
    }

    return this.prisma.generalRecord.findMany({
      where: { generalId },
      orderBy: [{ year: "desc" }, { month: "desc" }, { id: "desc" }],
      take: limit,
    });
  }
  /**
   * 국가 내정/전략 정보 조회 (PageNationStratFinan용)
   */
  async getNationStrategyInfo(nationId: number, generalId: number) {
    const nation = await this.prisma.nation.findUnique({
      where: { nation: nationId },
    });
    if (!nation) throw new Error("국가 정보가 없습니다.");

    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { officerLevel: true },
    });
    if (!general) throw new Error("장수 정보가 없습니다.");

    // 게임 환경 정보 (년/월)
    const gameEnvStorage = await this.prisma.storage.findMany({
      where: { namespace: "game_env", key: { in: ["year", "month"] } },
    });
    const gameEnv: Record<string, any> = {};
    for (const item of gameEnvStorage) {
      gameEnv[item.key] = item.value;
    }

    // 다른 국가 목록 및 외교 관계
    const nations = await this.prisma.nation.findMany({
      where: { level: { gt: 0 } },
      select: {
        nation: true,
        name: true,
        color: true,
        power: true,
        gennum: true,
        _count: {
          select: { cities: true },
        },
      },
      orderBy: { power: "desc" },
    });

    const diplomacyList = await this.prisma.diplomacy.findMany({
      where: { meId: nationId },
    });
    const diplomacyMap = new Map<number, { state: number; term: number }>();
    for (const d of diplomacyList) {
      diplomacyMap.set(d.youId, { state: d.state, term: d.term });
    }

    const nationsList = nations.map((n) => ({
      nation: n.nation,
      name: n.name,
      color: n.color,
      power: n.power,
      gennum: n.gennum,
      cityCnt: n._count.cities,
      diplomacy: diplomacyMap.get(n.nation) ?? { state: 2, term: 0 }, // 기본 통상(2)
    }));

    // 수입/지출 계산 (간소화된 로직)
    const cities = await this.prisma.city.findMany({
      where: { nationId },
      select: { pop: true, trust: true, agri: true, comm: true, wall: true },
    });

    let incomeGoldCity = 0;
    let incomeRiceCity = 0;
    let incomeRiceWall = 0;

    for (const city of cities) {
      // 1000명당 수익 가정
      const popRate = city.pop / 1000;
      incomeGoldCity += popRate * (city.comm / 20) * (city.trust / 100);
      incomeRiceCity += popRate * (city.agri / 20);
      incomeRiceWall += (city.wall / 100) * 50;
    }

    // Outcome: Officer salary (간소화)
    const generals = await this.prisma.general.findMany({
      where: { nationId },
      select: { officerLevel: true },
    });
    const outcome = generals.reduce((sum, g) => sum + (g.officerLevel * 100 + 100), 0);

    // aux parsing
    const aux = (nation.aux as any) || {};

    // 전쟁 설정 카운트 (Mock)
    // 실제로는 aux 나 nation_env에 저장됨
    const warSettingCnt = { remain: 5, inc: 1, max: 10 };

    return {
      nationID: nation.nation,
      year: gameEnv.year ?? 184,
      month: gameEnv.month ?? 1,
      gold: nation.gold,
      rice: nation.rice,
      nationMsg: aux.notice ?? "",
      scoutMsg: aux.scoutMsg ?? "",
      policy: {
        rate: nation.rate,
        bill: nation.bill,
        secretLimit: nation.secretLimit,
        blockScout: nation.scout === 1,
        blockWar: nation.war === 1,
      },
      nationsList,
      income: {
        gold: { city: Math.floor(incomeGoldCity), war: 0 },
        rice: { city: Math.floor(incomeRiceCity), wall: Math.floor(incomeRiceWall) },
      },
      outcome: Math.floor(outcome),
      warSettingCnt,
      editable: general.officerLevel >= 5, // 수뇌부 이상
      officerLevel: general.officerLevel,
    };
  }

  /**
   * NPC 컨트롤 정보 조회
   */
  async getNpcControl(nationId: number) {
    const nation = await this.prisma.nation.findUnique({
      where: { nation: nationId },
      select: { aux: true },
    });
    if (!nation) throw new Error("국가 정보가 없습니다.");

    const aux = (nation.aux as any) || {};
    return {
      policies: aux.nationPolicy || null,
      chiefPriorityList: aux.chiefPriority || null,
      generalPriorityList: aux.generalPriority || null,
      lastSetters: aux.lastSetters || {
        policy: { setter: null, date: null },
        nation: { setter: null, date: null },
        general: { setter: null, date: null },
      },
    };
  }

  /**
   * NPC 컨트롤 정보 설정
   */
  async setNpcControl(
    nationId: number,
    generalId: number,
    type: "nationPolicy" | "nationPriority" | "generalPriority",
    data: any
  ) {
    // 권한 확인 (수뇌부 이상)
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { nationId: true, officerLevel: true, name: true },
    });
    if (!general || general.nationId !== nationId) {
      throw new Error("해당 국가 소속이 아닙니다.");
    }
    if (general.officerLevel < 5) {
      throw new Error("수뇌부 이상만 NPC 정책을 설정할 수 있습니다.");
    }

    const nation = await this.prisma.nation.findUnique({
      where: { nation: nationId },
      select: { aux: true },
    });
    const aux = (nation?.aux as any) || {};

    if (!aux.lastSetters) {
      aux.lastSetters = {
        policy: { setter: null, date: null },
        nation: { setter: null, date: null },
        general: { setter: null, date: null },
      };
    }

    const now = new Date().toISOString().replace("T", " ").split(".")[0];
    const setterName = general.name;

    if (type === "nationPolicy") {
      aux.nationPolicy = data;
      aux.lastSetters.policy = { setter: setterName, date: now };
    } else if (type === "nationPriority") {
      aux.chiefPriority = data;
      aux.lastSetters.nation = { setter: setterName, date: now };
    } else if (type === "generalPriority") {
      aux.generalPriority = data;
      aux.lastSetters.general = { setter: setterName, date: now };
    }

    return this.prisma.nation.update({
      where: { nation: nationId },
      data: { aux },
    });
  }
}
