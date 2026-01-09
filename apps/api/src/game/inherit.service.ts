import { Injectable } from "@nestjs/common";
import { createPrismaClient } from "@sammo/infra";

export const INHERIT_CONSTANTS = {
  inheritItemRandomPoint: 600,
  inheritBuffPoints: [0, 100, 300, 600, 1000],
  inheritResetAttrPointBase: [100, 200, 300, 500, 800, 1300, 2100],
  inheritSpecificSpecialPoint: 800,
  inheritBornStatPoint: 300,
  inheritCheckOwnerPoint: 1000,
  defaultStatMin: 10,
  defaultStatMax: 100,
  defaultStatTotal: 160,
  availableSpecialWar: ["None", "chungBo", "gungSin", "geukNobi", "changGi", "gungSu", "saBok"],
  buffKeyText: {
    leadership: "통솔",
    strength: "무력",
    intel: "지력",
    dex: "숙련도",
    warMastery: "전투 숙련",
  } as Record<string, string>,
  maxBuffStep: 4,
  inheritBornCityPoint: 100,
  inheritBornSpecialPoint: 300,
  inheritBornTurntimePoint: 50,
  inheritBornStatPointCost: 100, // Cost per bonus stat? Or total? Let's say total for 3-5 stats
};

interface GeneralAux {
  inheritRandomUnique?: string;
  inheritBuff?: Record<string, number>;
  inheritResetSpecialWar?: number;
  inheritSpecificSpecialWar?: string;
  inheritResetTurnTime?: number;
  prev_types_special2?: string[];
  nextTurnTimeBase?: number;
  [key: string]: unknown;
}

interface UserStorageValue {
  last_stat_reset?: number[];
  [key: string]: unknown;
}

interface InheritLogEntry {
  id: number;
  serverId: string;
  year: number;
  month: number;
  date: Date | null;
  text: string;
}

@Injectable()
export class InheritService {
  private readonly prisma = createPrismaClient();

  async getPoints(userId: number): Promise<{ points: number; extra: unknown }> {
    const storageEntry = await this.prisma.storage.findUnique({
      where: {
        namespace_key: { namespace: `inheritance_${userId}`, key: "previous" },
      },
    });

    if (!storageEntry) {
      return { points: 0, extra: null };
    }

    const value = storageEntry.value as unknown as [number, unknown];
    return { points: value[0] ?? 0, extra: value[1] ?? null };
  }

  async buyRandomUnique(
    userId: number,
    generalId: number
  ): Promise<{ success: boolean; message?: string }> {
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { owner: true, aux: true },
    });

    if (!general) {
      return { success: false, message: "General not found" };
    }

    if (general.owner !== userId) {
      return {
        success: false,
        message: "로그인 상태가 이상합니다. 다시 로그인해 주세요.",
      };
    }

    const aux = general.aux as unknown as GeneralAux;
    if (aux.inheritRandomUnique !== undefined && aux.inheritRandomUnique !== null) {
      return {
        success: false,
        message: "이미 구입 명령을 내렸습니다. 다음 턴까지 기다려주세요.",
      };
    }

    const isUnited = await this.checkGameUnited();
    if (isUnited) {
      return { success: false, message: "이미 천하가 통일되었습니다." };
    }

    const inheritPoints = await this.getPoints(userId);
    const reqAmount = INHERIT_CONSTANTS.inheritItemRandomPoint;

    if (inheritPoints.points < reqAmount) {
      return {
        success: false,
        message: "충분한 유산 포인트를 가지고 있지 않습니다.",
      };
    }

    await this.logInheritAction(userId, `${reqAmount} 포인트로 랜덤 유니크 구입`);

    const newAux = { ...aux, inheritRandomUnique: new Date().toISOString() };
    await this.prisma.general.update({
      where: { no: generalId },
      data: { aux: newAux as object },
    });

    await this.deductPoints(userId, reqAmount);
    await this.incrementRankData(generalId, "inherit_point_spent_dynamic", reqAmount);

    return { success: true };
  }

  async buyHiddenBuff(
    userId: number,
    generalId: number,
    buffType: string,
    level: number
  ): Promise<{ success: boolean; message?: string }> {
    if (level < 1 || level > INHERIT_CONSTANTS.maxBuffStep) {
      return { success: false, message: "Invalid buff level" };
    }

    if (!INHERIT_CONSTANTS.buffKeyText[buffType]) {
      return { success: false, message: "Invalid buff type" };
    }

    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { owner: true, aux: true },
    });

    if (!general) {
      return { success: false, message: "General not found" };
    }

    if (general.owner !== userId) {
      return {
        success: false,
        message: "로그인 상태가 이상합니다. 다시 로그인해 주세요.",
      };
    }

    const aux = general.aux as unknown as GeneralAux;
    const inheritBuffList = aux.inheritBuff ?? {};
    const prevLevel = inheritBuffList[buffType] ?? 0;

    if (prevLevel === level) {
      return { success: false, message: "이미 구입했습니다." };
    }

    if (prevLevel > level) {
      return { success: false, message: "이미 더 높은 등급을 구입했습니다." };
    }

    const isUnited = await this.checkGameUnited();
    if (isUnited) {
      return { success: false, message: "이미 천하가 통일되었습니다." };
    }

    const reqAmount =
      INHERIT_CONSTANTS.inheritBuffPoints[level] - INHERIT_CONSTANTS.inheritBuffPoints[prevLevel];

    const inheritPoints = await this.getPoints(userId);
    if (inheritPoints.points < reqAmount) {
      return {
        success: false,
        message: "충분한 유산 포인트를 가지고 있지 않습니다.",
      };
    }

    const buffTypeText = INHERIT_CONSTANTS.buffKeyText[buffType];
    const moreText = prevLevel > 0 ? "추가" : "";
    await this.logInheritAction(
      userId,
      `${reqAmount} 포인트로 ${buffTypeText} ${level} 단계 ${moreText}구입`
    );

    const newInheritBuffList = { ...inheritBuffList, [buffType]: level };
    const newAux = { ...aux, inheritBuff: newInheritBuffList };
    await this.prisma.general.update({
      where: { no: generalId },
      data: { aux: newAux as object },
    });

    await this.deductPoints(userId, reqAmount);
    await this.incrementRankData(generalId, "inherit_point_spent_dynamic", reqAmount);

    return { success: true };
  }

  async resetSpecialWar(
    userId: number,
    generalId: number
  ): Promise<{ success: boolean; message?: string }> {
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { owner: true, special2: true, aux: true },
    });

    if (!general) {
      return { success: false, message: "General not found" };
    }

    if (general.owner !== userId) {
      return {
        success: false,
        message: "로그인 상태가 이상합니다. 다시 로그인해 주세요.",
      };
    }

    if (!general.special2 || general.special2 === "None") {
      return { success: false, message: "이미 전투 특기가 공란입니다." };
    }

    const aux = general.aux as unknown as GeneralAux;
    const currentLevel = aux.inheritResetSpecialWar ?? -1;
    const nextLevel = currentLevel + 1;

    const reqPoint = this.getResetAttrPointCost(nextLevel);

    const isUnited = await this.checkGameUnited();
    if (isUnited) {
      return { success: false, message: "이미 천하가 통일되었습니다." };
    }

    const inheritPoints = await this.getPoints(userId);
    if (inheritPoints.points < reqPoint) {
      return {
        success: false,
        message: "충분한 유산 포인트를 가지고 있지 않습니다.",
      };
    }

    await this.logInheritAction(userId, `${reqPoint} 포인트로 전투 특기 초기화`);

    const oldSpecialList = aux.prev_types_special2 ?? [];
    oldSpecialList.push(general.special2);

    const newAux = {
      ...aux,
      prev_types_special2: oldSpecialList,
      inheritResetSpecialWar: nextLevel,
    };

    await this.prisma.general.update({
      where: { no: generalId },
      data: {
        special2: "None",
        aux: newAux as object,
      },
    });

    await this.deductPoints(userId, reqPoint);
    await this.incrementRankData(generalId, "inherit_point_spent_dynamic", reqPoint);

    return { success: true };
  }

  async setNextSpecialWar(
    userId: number,
    generalId: number,
    specialType: string
  ): Promise<{ success: boolean; message?: string }> {
    if (!INHERIT_CONSTANTS.availableSpecialWar.includes(specialType)) {
      return { success: false, message: "Invalid special war type" };
    }

    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { owner: true, special2: true, aux: true },
    });

    if (!general) {
      return { success: false, message: "General not found" };
    }

    if (general.owner !== userId) {
      return {
        success: false,
        message: "로그인 상태가 이상합니다. 다시 로그인해 주세요.",
      };
    }

    const aux = general.aux as unknown as GeneralAux;
    const inheritSpecificSpecialWar = aux.inheritSpecificSpecialWar;

    if (general.special2 === specialType) {
      return { success: false, message: "이미 그 특기를 보유하고 있습니다." };
    }

    if (inheritSpecificSpecialWar === specialType) {
      return { success: false, message: "이미 그 특기를 예약하였습니다." };
    }

    if (inheritSpecificSpecialWar !== undefined && inheritSpecificSpecialWar !== null) {
      return { success: false, message: "이미 예약한 특기가 있습니다." };
    }

    const isUnited = await this.checkGameUnited();
    if (isUnited) {
      return { success: false, message: "이미 천하가 통일되었습니다." };
    }

    const reqAmount = INHERIT_CONSTANTS.inheritSpecificSpecialPoint;
    const inheritPoints = await this.getPoints(userId);
    if (inheritPoints.points < reqAmount) {
      return {
        success: false,
        message: "충분한 유산 포인트를 가지고 있지 않습니다.",
      };
    }

    await this.logInheritAction(
      userId,
      `${reqAmount} 포인트로 다음 전투 특기로 ${specialType} 지정`
    );

    const newAux = { ...aux, inheritSpecificSpecialWar: specialType };
    await this.prisma.general.update({
      where: { no: generalId },
      data: { aux: newAux as object },
    });

    await this.deductPoints(userId, reqAmount);
    await this.incrementRankData(generalId, "inherit_point_spent_dynamic", reqAmount);

    return { success: true };
  }

  async resetStat(
    userId: number,
    generalId: number,
    leadership: number,
    strength: number,
    intel: number,
    inheritBonusStat?: number[]
  ): Promise<{ success: boolean; message?: string }> {
    if (
      leadership < INHERIT_CONSTANTS.defaultStatMin ||
      leadership > INHERIT_CONSTANTS.defaultStatMax ||
      strength < INHERIT_CONSTANTS.defaultStatMin ||
      strength > INHERIT_CONSTANTS.defaultStatMax ||
      intel < INHERIT_CONSTANTS.defaultStatMin ||
      intel > INHERIT_CONSTANTS.defaultStatMax
    ) {
      return { success: false, message: "Invalid stat values" };
    }

    if (leadership + strength + intel !== INHERIT_CONSTANTS.defaultStatTotal) {
      return {
        success: false,
        message: `능력치 총합이 ${INHERIT_CONSTANTS.defaultStatTotal}이 아닙니다. 다시 입력해주세요!`,
      };
    }

    if (inheritBonusStat) {
      if (inheritBonusStat.length !== 3) {
        return {
          success: false,
          message: "보너스 능력치가 잘못 지정되었습니다. 다시 입력해주세요!",
        };
      }
      for (const stat of inheritBonusStat) {
        if (stat < 0) {
          return {
            success: false,
            message: "보너스 능력치가 음수입니다. 다시 입력해주세요!",
          };
        }
      }
      const sum = inheritBonusStat.reduce((a: number, b: number) => a + b, 0);
      if (sum === 0) {
        inheritBonusStat = undefined;
      } else if (sum < 3 || sum > 5) {
        return {
          success: false,
          message: "보너스 능력치 합이 잘못 지정되었습니다. 다시 입력해주세요!",
        };
      }
    }

    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { owner: true, npc: true },
    });

    if (!general) {
      return { success: false, message: "General not found" };
    }

    if (general.owner !== userId) {
      return {
        success: false,
        message: "로그인 상태가 이상합니다. 다시 로그인해 주세요.",
      };
    }

    if (general.npc !== 0) {
      return {
        success: false,
        message: "NPC는 능력치 초기화를 할 수 없습니다.",
      };
    }

    const isUnited = await this.checkGameUnited();
    if (isUnited) {
      return { success: false, message: "이미 천하가 통일되었습니다." };
    }

    const gameSeason = await this.getGameSeason();
    const userStorage = await this.getUserStorage(userId);
    const lastStatReset = userStorage.last_stat_reset ?? [];

    if (lastStatReset.includes(gameSeason)) {
      return {
        success: false,
        message: "이번 시즌에 이미 능력치를 초기화하셨습니다.",
      };
    }

    let reqAmount = 0;
    if (inheritBonusStat !== undefined) {
      reqAmount += INHERIT_CONSTANTS.inheritBornStatPoint;
    }

    const inheritPoints = await this.getPoints(userId);
    if (inheritPoints.points < reqAmount) {
      return {
        success: false,
        message: "충분한 유산 포인트를 가지고 있지 않습니다.",
      };
    }

    await this.logInheritAction(
      userId,
      `통솔 ${leadership}, 무력 ${strength}, 지력 ${intel} 스탯 재설정`
    );

    let pleadership = 0;
    let pstrength = 0;
    let pintel = 0;

    if (inheritBonusStat) {
      pleadership = inheritBonusStat[0] ?? 0;
      pstrength = inheritBonusStat[1] ?? 0;
      pintel = inheritBonusStat[2] ?? 0;
      await this.logInheritAction(
        userId,
        `${reqAmount}로 통솔 ${pleadership}, 무력 ${pstrength}, 지력 ${pintel} 보너스 능력치 적용`
      );
    } else {
      const bonusCount = 3 + Math.floor(Math.random() * 3);
      const weights = [leadership, strength, intel];
      const total = weights.reduce((a: number, b: number) => a + b, 0);

      for (let i = 0; i < bonusCount; i++) {
        const rand = Math.random() * total;
        let cumulative = 0;
        for (let j = 0; j < weights.length; j++) {
          cumulative += weights[j];
          if (rand < cumulative) {
            if (j === 0) pleadership++;
            else if (j === 1) pstrength++;
            else pintel++;
            break;
          }
        }
      }
      await this.logInheritAction(
        userId,
        `통솔 ${pleadership}, 무력 ${pstrength}, 지력 ${pintel} 보너스 능력치 적용`
      );
    }

    const finalLeadership = leadership + pleadership;
    const finalStrength = strength + pstrength;
    const finalIntel = intel + pintel;

    await this.prisma.general.update({
      where: { no: generalId },
      data: {
        leadership: finalLeadership,
        strength: finalStrength,
        intel: finalIntel,
      },
    });

    const newLastStatReset = [...lastStatReset, gameSeason];
    await this.setUserStorage(userId, { ...userStorage, last_stat_reset: newLastStatReset });

    if (reqAmount > 0) {
      await this.deductPoints(userId, reqAmount);
      await this.incrementRankData(generalId, "inherit_point_spent_dynamic", reqAmount);
    }

    return { success: true };
  }

  async resetTurnTime(
    userId: number,
    generalId: number
  ): Promise<{ success: boolean; message?: string; newTurnOffset?: number }> {
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { owner: true, turnTime: true, aux: true },
    });

    if (!general) {
      return { success: false, message: "General not found" };
    }

    if (general.owner !== userId) {
      return {
        success: false,
        message: "로그인 상태가 이상합니다. 다시 로그인해 주세요.",
      };
    }

    const aux = general.aux as unknown as GeneralAux;
    const currentLevel = aux.inheritResetTurnTime ?? -1;
    const nextLevel = currentLevel + 1;

    const reqPoint = this.getResetAttrPointCost(nextLevel);

    const isUnited = await this.checkGameUnited();
    if (isUnited) {
      return { success: false, message: "이미 천하가 통일되었습니다." };
    }

    const inheritPoints = await this.getPoints(userId);
    if (inheritPoints.points < reqPoint) {
      return {
        success: false,
        message: "충분한 유산 포인트를 가지고 있지 않습니다.",
      };
    }

    const turnTermEntry = await this.prisma.storage.findUnique({
      where: {
        namespace_key: { namespace: "game_env", key: "turnterm" },
      },
    });
    const turnTerm = (turnTermEntry?.value as number) ?? 10;

    const afterTurn = Math.random() * turnTerm * 60;
    const minutes = Math.floor(afterTurn / 60);
    const seconds = Math.floor(afterTurn % 60);

    await this.logInheritAction(
      userId,
      `${reqPoint} 포인트로 턴 시간을 바꾸어 다다음 턴부터 ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} 적용`
    );

    const newAux = {
      ...aux,
      inheritResetTurnTime: nextLevel,
      nextTurnTimeBase: afterTurn,
    };
    await this.prisma.general.update({
      where: { no: generalId },
      data: { aux: newAux as object },
    });

    await this.deductPoints(userId, reqPoint);
    await this.incrementRankData(generalId, "inherit_point_spent_dynamic", reqPoint);

    return { success: true, newTurnOffset: afterTurn };
  }

  async getHistory(userId: number, lastId?: number): Promise<{ logs: InheritLogEntry[] }> {
    const whereClause: Record<string, unknown> = {
      userId,
      logType: "inheritPoint",
    };

    if (lastId !== undefined) {
      whereClause.id = { lt: lastId };
    }

    const logs = await this.prisma.userRecord.findMany({
      where: whereClause,
      orderBy: { id: "desc" },
      take: 30,
      select: {
        id: true,
        serverId: true,
        year: true,
        month: true,
        date: true,
        text: true,
      },
    });

    return { logs };
  }

  async checkOwner(
    userId: number,
    generalId: number,
    destGeneralId: number
  ): Promise<{ success: boolean; message?: string; ownerName?: string }> {
    if (generalId === destGeneralId) {
      return { success: false, message: "자신의 정보는 확인할 수 없습니다." };
    }

    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { owner: true, name: true, nationId: true, imgSvr: true, picture: true },
    });

    if (!general) {
      return { success: false, message: "General not found" };
    }

    if (general.owner !== userId) {
      return {
        success: false,
        message: "로그인 상태가 이상합니다. 다시 로그인해 주세요.",
      };
    }

    const destGeneral = await this.prisma.general.findUnique({
      where: { no: destGeneralId },
      select: {
        name: true,
        nationId: true,
        owner: true,
        ownerName: true,
        imgSvr: true,
        picture: true,
      },
    });

    if (!destGeneral) {
      return { success: false, message: "대상 장수가 존재하지 않습니다." };
    }

    if (!destGeneral.owner) {
      return { success: false, message: "대상 장수는 NPC입니다." };
    }

    const isUnited = await this.checkGameUnited();
    if (isUnited) {
      return { success: false, message: "이미 천하가 통일되었습니다." };
    }

    const reqPoint = INHERIT_CONSTANTS.inheritCheckOwnerPoint;
    const inheritPoints = await this.getPoints(userId);
    if (inheritPoints.points < reqPoint) {
      return {
        success: false,
        message: "충분한 유산 포인트를 가지고 있지 않습니다.",
      };
    }

    await this.logInheritAction(userId, `${reqPoint} 포인트로 장수 소유자 확인`);

    let ownerName = destGeneral.ownerName;
    if (!ownerName && destGeneral.owner) {
      const member = await this.prisma.member.findUnique({
        where: { id: destGeneral.owner },
        select: { name: true },
      });
      ownerName = member?.name ?? "알수없음";
    }

    await this.deductPoints(userId, reqPoint);
    await this.incrementRankData(generalId, "inherit_point_spent_dynamic", reqPoint);

    return { success: true, ownerName: ownerName ?? "알수없음" };
  }

  private async checkGameUnited(): Promise<boolean> {
    const entry = await this.prisma.storage.findUnique({
      where: {
        namespace_key: { namespace: "game_env", key: "isunited" },
      },
    });
    return (entry?.value as boolean) ?? false;
  }

  private async getGameSeason(): Promise<number> {
    const entry = await this.prisma.storage.findUnique({
      where: {
        namespace_key: { namespace: "game_env", key: "season" },
      },
    });
    return (entry?.value as number) ?? 1;
  }

  private async getUserStorage(userId: number): Promise<UserStorageValue> {
    const entry = await this.prisma.storage.findUnique({
      where: {
        namespace_key: { namespace: `user_${userId}`, key: "data" },
      },
    });
    return (entry?.value as unknown as UserStorageValue) ?? {};
  }

  private async setUserStorage(userId: number, data: UserStorageValue): Promise<void> {
    await this.prisma.storage.upsert({
      where: {
        namespace_key: { namespace: `user_${userId}`, key: "data" },
      },
      update: { value: data as object },
      create: { namespace: `user_${userId}`, key: "data", value: data as object },
    });
  }

  public async deductPoints(userId: number, amount: number): Promise<void> {
    const currentPoints = await this.getPoints(userId);
    const newPoints = currentPoints.points - amount;

    await this.prisma.storage.upsert({
      where: {
        namespace_key: { namespace: `inheritance_${userId}`, key: "previous" },
      },
      update: { value: [newPoints, null] },
      create: {
        namespace: `inheritance_${userId}`,
        key: "previous",
        value: [newPoints, null],
      },
    });
  }

  public async logInheritAction(userId: number, text: string): Promise<void> {
    const yearEntry = await this.prisma.storage.findUnique({
      where: { namespace_key: { namespace: "game_env", key: "year" } },
    });
    const monthEntry = await this.prisma.storage.findUnique({
      where: { namespace_key: { namespace: "game_env", key: "month" } },
    });

    const year = (yearEntry?.value as number) ?? 200;
    const month = (monthEntry?.value as number) ?? 1;

    await this.prisma.userRecord.create({
      data: {
        userId,
        serverId: "default",
        logType: "inheritPoint",
        year,
        month,
        date: new Date(),
        text,
      },
    });
  }

  private async incrementRankData(generalId: number, type: string, amount: number): Promise<void> {
    const existing = await this.prisma.rankData.findUnique({
      where: { generalId_type: { generalId, type } },
    });

    if (existing) {
      await this.prisma.rankData.update({
        where: { generalId_type: { generalId, type } },
        data: { value: { increment: amount } },
      });
    } else {
      const general = await this.prisma.general.findUnique({
        where: { no: generalId },
        select: { nationId: true },
      });

      await this.prisma.rankData.create({
        data: {
          generalId,
          nationId: general?.nationId ?? 0,
          type,
          value: amount,
        },
      });
    }
  }

  private getResetAttrPointCost(level: number): number {
    const base = INHERIT_CONSTANTS.inheritResetAttrPointBase;
    while (base.length <= level) {
      const len = base.length;
      base.push(base[len - 1] + base[len - 2]);
    }
    return base[level];
  }
}
