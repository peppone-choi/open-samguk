import { createPrismaClient, type PrismaClientType } from "@sammo/infra";
import {
  WorldSnapshot,
  General,
  Nation,
  City,
  Diplomacy,
  WorldDelta,
  ReservedTurn,
} from "../domain/entities.js";

/**
 * WorldSnapshot을 Prisma DB와 동기화하는 리포지토리
 */
export class SnapshotRepository {
  constructor(private readonly prisma: PrismaClientType) {}

  /**
   * DB에서 generalTurns만 다시 로드 (턴 실행 전 최신 명령 반영용)
   */
  async loadGeneralTurns(): Promise<Record<number, ReservedTurn[]>> {
    const dbTurns = await this.prisma.generalTurn.findMany();

    const generalTurns: Record<number, ReservedTurn[]> = {};
    for (const t of dbTurns) {
      if (!generalTurns[t.generalId]) generalTurns[t.generalId] = [];
      generalTurns[t.generalId].push({
        generalId: t.generalId,
        turnIdx: t.turnIdx,
        action: t.action,
        arg: t.arg as Record<string, any>,
      });
    }
    // sort by turnIdx
    for (const id in generalTurns) {
      generalTurns[id].sort((a, b) => a.turnIdx - b.turnIdx);
    }

    return generalTurns;
  }

  /**
   * DB에서 현재 게임 상태를 로드하여 Snapshot 생성
   */
  async load(): Promise<WorldSnapshot> {
    const [dbGenerals, dbNations, dbCities, dbDiplomacy, dbStorage, dbTurns] = await Promise.all([
      this.prisma.general.findMany(),
      this.prisma.nation.findMany(),
      this.prisma.city.findMany(),
      this.prisma.diplomacy.findMany(),
      this.prisma.storage.findMany({ where: { namespace: "game" } }),
      this.prisma.generalTurn.findMany(),
    ]);

    const generals: Record<number, General> = {};
    for (const g of dbGenerals) {
      generals[g.no] = {
        id: g.no,
        name: g.name,
        ownerId: g.owner,
        nationId: g.nationId,
        cityId: g.cityId,
        npc: g.npc,
        troopId: g.troopId,
        gold: g.gold,
        rice: g.rice,
        leadership: g.leadership,
        leadershipExp: g.leadershipExp,
        strength: g.strength,
        strengthExp: g.strengthExp,
        intel: g.intel,
        intelExp: g.intelExp,
        politics: (g as any).politics || 50,
        politicsExp: (g as any).politicsExp || 0,
        charm: (g as any).charm || 50,
        charmExp: (g as any).charmExp || 0,
        injury: g.injury,
        experience: g.experience,
        dedication: g.dedication,
        officerLevel: g.officerLevel,
        officerCity: g.officerCity,
        recentWar: g.recentWar ? g.recentWar.getTime() : 0,
        crew: g.crew,
        crewType: g.crewType,
        train: g.train,
        atmos: g.atmos,
        dex: {
          1: g.dex1,
          2: g.dex2,
          3: g.dex3,
          4: g.dex4,
          5: g.dex5,
        },
        age: g.age,
        startAge: g.startAge,
        belong: g.belong,
        betray: g.betray,
        dedLevel: g.dedLevel,
        expLevel: g.expLevel,
        bornYear: g.bornYear,
        deadYear: g.deadYear,
        special: g.special,
        specAge: g.specAge,
        special2: g.special2,
        specAge2: g.specAge2,
        weapon: g.weapon,
        book: g.book,
        horse: g.horse,
        item: g.item,
        turnTime: g.turnTime,
        recentWarTime: g.recentWar,
        makeLimit: g.makeLimit,
        killTurn: g.killTurn || 0,
        block: g.block,
        defenceTrain: g.defenceTrain,
        tournamentState: g.tnmt,
        lastTurn: g.lastTurn as Record<string, any>,
        meta: g.aux as Record<string, any>,
        penalty: g.penalty as Record<string, any>,
        officerLock: (g as any).officerLock || 0,
      };
    }

    const nations: Record<number, Nation> = {};
    for (const n of dbNations) {
      nations[n.nation] = {
        id: n.nation,
        name: n.name,
        color: n.color,
        chiefGeneralId: n.chiefSet,
        capitalCityId: n.capital,
        gold: n.gold,
        rice: n.rice,
        rate: n.rate,
        rateTmp: n.rateTmp,
        tech: n.tech,
        power: n.power,
        level: n.level,
        gennum: n.gennum,
        typeCode: n.type,
        scoutLevel: n.scout,
        warState: n.war,
        strategicCmdLimit: n.strategicCmdLimit,
        surrenderLimit: n.surLimit,
        spy: n.spy as Record<string, any>,
        aux: n.aux as Record<string, any>,
        meta: {},
      };
    }

    const cities: Record<number, City> = {};
    for (const c of dbCities) {
      cities[c.city] = {
        id: c.city,
        name: c.name,
        nationId: c.nationId,
        level: c.level,
        supply: c.supply,
        front: c.front,
        pop: c.pop,
        popMax: c.popMax,
        agri: c.agri,
        agriMax: c.agriMax,
        comm: c.comm,
        commMax: c.commMax,
        secu: c.secu,
        secuMax: c.secuMax,
        def: c.def,
        defMax: c.defMax,
        wall: c.wall,
        wallMax: c.wallMax,
        trust: c.trust,
        trade: c.trade,
        region: c.region,
        state: c.state,
        term: c.term,
        conflict: c.conflict as Record<string, any>,
        meta: {},
        dead: c.dead,
      };
    }

    const diplomacy: Record<string, Diplomacy> = {};
    for (const d of dbDiplomacy) {
      const key = `${d.meId}:${d.youId}`;
      diplomacy[key] = {
        id: d.no,
        srcNationId: d.meId,
        destNationId: d.youId,
        state: d.state.toString(),
        term: d.term,
        meta: {},
      };
    }

    const year = (dbStorage.find((s: any) => s.key === "year")?.value as number) || 184;
    const month = (dbStorage.find((s: any) => s.key === "month")?.value as number) || 1;

    const generalTurns: Record<number, ReservedTurn[]> = {};
    for (const t of dbTurns) {
      if (!generalTurns[t.generalId]) generalTurns[t.generalId] = [];
      generalTurns[t.generalId].push({
        generalId: t.generalId,
        turnIdx: t.turnIdx,
        action: t.action,
        arg: t.arg as Record<string, any>,
      });
    }
    // sort by turnIdx
    for (const id in generalTurns) {
      generalTurns[id].sort((a, b) => a.turnIdx - b.turnIdx);
    }

    return {
      generals,
      nations,
      cities,
      diplomacy,
      troops: {},
      messages: {},
      gameTime: { year, month },
      env: {},
      generalTurns,
    };
  }

  /**
   * Snapshot 전체를 DB에 저장 (초기화용)
   */
  async saveAll(snapshot: WorldSnapshot): Promise<void> {
    await this.prisma.$transaction(async (tx: any) => {
      // 1. 기존 데이터 삭제
      await tx.general.deleteMany();
      await tx.city.deleteMany();
      await tx.nation.deleteMany();
      await tx.diplomacy.deleteMany();
      await tx.storage.deleteMany({ where: { namespace: "game" } });

      // 2. 도시 저장
      for (const city of Object.values(snapshot.cities)) {
        await tx.city.create({
          data: {
            city: city.id,
            name: city.name,
            level: city.level,
            nationId: city.nationId,
            supply: city.supply,
            front: city.front,
            pop: city.pop,
            popMax: city.popMax,
            agri: city.agri,
            agriMax: city.agriMax,
            comm: city.comm,
            commMax: city.commMax,
            secu: city.secu,
            secuMax: city.secuMax,
            def: city.def,
            defMax: city.defMax,
            wall: city.wall,
            wallMax: city.wallMax,
            trust: city.trust,
            trade: city.trade,
            region: city.region,
            state: city.state,
            term: city.term,
            conflict: city.conflict,
            dead: city.dead,
          },
        });
      }

      // 3. 국가 저장
      for (const nation of Object.values(snapshot.nations)) {
        await tx.nation.create({
          data: {
            nation: nation.id,
            name: nation.name,
            color: nation.color,
            chiefSet: nation.chiefGeneralId,
            capital: nation.capitalCityId,
            gold: nation.gold,
            rice: nation.rice,
            rate: nation.rate,
            rateTmp: nation.rateTmp,
            tech: nation.tech,
            power: nation.power,
            level: nation.level,
            gennum: nation.gennum,
            type: nation.typeCode,
            scout: nation.scoutLevel,
            war: nation.warState,
            strategicCmdLimit: nation.strategicCmdLimit,
            surLimit: nation.surrenderLimit,
            spy: nation.spy,
            aux: nation.aux,
          },
        });
      }

      // 4. 장수 저장
      for (const general of Object.values(snapshot.generals)) {
        await tx.general.create({
          data: {
            no: general.id,
            owner: general.ownerId,
            name: general.name,
            nationId: general.nationId || 0,
            cityId: general.cityId,
            npc: general.npc,
            troopId: general.troopId,
            gold: general.gold,
            rice: general.rice,
            leadership: general.leadership,
            leadershipExp: general.leadershipExp,
            strength: general.strength,
            strengthExp: general.strengthExp,
            intel: general.intel,
            intelExp: general.intelExp,
            injury: general.injury,
            experience: general.experience,
            dedication: general.dedication,
            officerLevel: general.officerLevel,
            officerCity: general.officerCity,
            recentWar: general.recentWarTime,
            crew: general.crew,
            crewType: general.crewType,
            train: general.train,
            atmos: general.atmos,
            dex1: general.dex[1] || 0,
            dex2: general.dex[2] || 0,
            dex3: general.dex[3] || 0,
            dex4: general.dex[4] || 0,
            dex5: general.dex[5] || 0,
            age: general.age,
            startAge: general.startAge,
            belong: general.belong,
            betray: general.betray,
            dedLevel: general.dedLevel,
            expLevel: general.expLevel,
            bornYear: general.bornYear,
            deadYear: general.deadYear,
            special: general.special,
            specAge: general.specAge,
            special2: general.special2,
            specAge2: general.specAge2,
            weapon: general.weapon,
            book: general.book,
            horse: general.horse,
            item: general.item,
            turnTime: general.turnTime,
            makeLimit: general.makeLimit,
            killTurn: general.killTurn,
            block: general.block,
            defenceTrain: general.defenceTrain,
            tnmt: general.tournamentState,
            lastTurn: general.lastTurn,
            aux: general.meta,
            penalty: general.penalty,
            picture: "default.jpg",
          },
        });
      }

      // 5. 게임 시간 저장
      await tx.storage.upsert({
        where: { namespace_key: { namespace: "game", key: "year" } },
        update: { value: snapshot.gameTime.year },
        create: { namespace: "game", key: "year", value: snapshot.gameTime.year },
      });
      await tx.storage.upsert({
        where: { namespace_key: { namespace: "game", key: "month" } },
        update: { value: snapshot.gameTime.month },
        create: { namespace: "game", key: "month", value: snapshot.gameTime.month },
      });
    });
  }
  /**
   * Delta를 DB에 적용 (턴 진행 결과 반영)
   */
  async applyDelta(delta: WorldDelta): Promise<void> {
    await this.prisma.$transaction(async (tx: any) => {
      // 1. 장수 업데이트
      if (delta.generals) {
        for (const [id, gDelta] of Object.entries(delta.generals)) {
          await tx.general.update({
            where: { no: parseInt(id) },
            data: this.mapGeneralDelta(gDelta),
          });
        }
      }

      // 2. 국가 업데이트
      if (delta.nations) {
        for (const [id, nDelta] of Object.entries(delta.nations)) {
          await tx.nation.update({
            where: { nation: parseInt(id) },
            data: this.mapNationDelta(nDelta),
          });
        }
      }

      // 3. 도시 업데이트
      if (delta.cities) {
        for (const [id, cDelta] of Object.entries(delta.cities)) {
          await tx.city.update({
            where: { city: parseInt(id) },
            data: this.mapCityDelta(cDelta),
          });
        }
      }

      // 4. 게임 시간 업데이트
      if (delta.gameTime) {
        if (delta.gameTime.year) {
          await tx.storage.upsert({
            where: { namespace_key: { namespace: "game", key: "year" } },
            update: { value: delta.gameTime.year },
            create: { namespace: "game", key: "year", value: delta.gameTime.year },
          });
        }
        if (delta.gameTime.month) {
          await tx.storage.upsert({
            where: { namespace_key: { namespace: "game", key: "month" } },
            update: { value: delta.gameTime.month },
            create: { namespace: "game", key: "month", value: delta.gameTime.month },
          });
        }
      }

      // 5. 실행된 턴 삭제
      if (delta.deleteGeneralTurns) {
        for (const { generalId, turnIdx } of delta.deleteGeneralTurns) {
          await tx.generalTurn.delete({
            where: { generalId_turnIdx: { generalId, turnIdx } },
          });
        }
      }
    });
  }

  private mapGeneralDelta(gDelta: Partial<General>): any {
    const data: any = {};
    if (gDelta.name !== undefined) data.name = gDelta.name;
    if (gDelta.nationId !== undefined) data.nationId = gDelta.nationId;
    if (gDelta.cityId !== undefined) data.cityId = gDelta.cityId;
    if (gDelta.gold !== undefined) data.gold = gDelta.gold;
    if (gDelta.rice !== undefined) data.rice = gDelta.rice;
    if (gDelta.leadership !== undefined) data.leadership = gDelta.leadership;
    if (gDelta.strength !== undefined) data.strength = gDelta.strength;
    if (gDelta.intel !== undefined) data.intel = gDelta.intel;
    if (gDelta.age !== undefined) data.age = gDelta.age;
    if (gDelta.belong !== undefined) data.belong = gDelta.belong;
    if (gDelta.injury !== undefined) data.injury = gDelta.injury;
    if (gDelta.experience !== undefined) data.experience = gDelta.experience;
    if (gDelta.dedication !== undefined) data.dedication = gDelta.dedication;
    if (gDelta.crew !== undefined) data.crew = gDelta.crew;
    if (gDelta.train !== undefined) data.train = gDelta.train;
    if (gDelta.atmos !== undefined) data.atmos = gDelta.atmos;
    if (gDelta.dex !== undefined) {
      if (gDelta.dex[1] !== undefined) data.dex1 = gDelta.dex[1];
      if (gDelta.dex[2] !== undefined) data.dex2 = gDelta.dex[2];
      if (gDelta.dex[3] !== undefined) data.dex3 = gDelta.dex[3];
      if (gDelta.dex[4] !== undefined) data.dex4 = gDelta.dex[4];
      if (gDelta.dex[5] !== undefined) data.dex5 = gDelta.dex[5];
    }
    return data;
  }

  private mapNationDelta(nDelta: Partial<Nation>): any {
    const data: any = {};
    if (nDelta.gold !== undefined) data.gold = nDelta.gold;
    if (nDelta.rice !== undefined) data.rice = nDelta.rice;
    if (nDelta.level !== undefined) data.level = nDelta.level;
    if (nDelta.tech !== undefined) data.tech = nDelta.tech;
    if (nDelta.gennum !== undefined) data.gennum = nDelta.gennum;
    return data;
  }

  private mapCityDelta(cDelta: Partial<City>): any {
    const data: any = {};
    if (cDelta.pop !== undefined) data.pop = cDelta.pop;
    if (cDelta.agri !== undefined) data.agri = cDelta.agri;
    if (cDelta.comm !== undefined) data.comm = cDelta.comm;
    if (cDelta.secu !== undefined) data.secu = cDelta.secu;
    if (cDelta.def !== undefined) data.def = cDelta.def;
    if (cDelta.wall !== undefined) data.wall = cDelta.wall;
    if (cDelta.state !== undefined) data.state = cDelta.state;
    return data;
  }
}
