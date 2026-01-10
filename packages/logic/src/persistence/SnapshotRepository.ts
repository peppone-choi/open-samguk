import { createPrismaClient, type PrismaClientType } from "@sammo/infra";
import {
  WorldSnapshot,
  General,
  Nation,
  City,
  Diplomacy,
  Troop,
  WorldDelta,
  ReservedTurn,
} from "../domain/entities.js";

/**
 * WorldSnapshot을 Prisma DB와 동기화하는 리포지토리
 */
export class SnapshotRepository {
  constructor(private readonly prisma: PrismaClientType) { }

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
    const [dbGenerals, dbNations, dbCities, dbDiplomacy, dbStorage, dbTurns, dbRankData] =
      await Promise.all([
        this.prisma.general.findMany(),
        this.prisma.nation.findMany(),
        this.prisma.city.findMany(),
        this.prisma.diplomacy.findMany(),
        this.prisma.storage.findMany({ where: { namespace: "game_env" } }),
        this.prisma.generalTurn.findMany(),
        this.prisma.rankData.findMany({ where: { type: "killnum" } }),
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
        killnum: dbRankData.find((r: any) => r.generalId === g.no)?.value || 0,
        block: g.block,
        defenceTrain: g.defenceTrain,
        tournamentState: g.tnmt,
        lastTurn: g.lastTurn as Record<string, any>,
        meta: g.aux as Record<string, any>,
        penalty: g.penalty as Record<string, any>,
        officerLock: (g as any).officerLock || 0,
        affinity: (g as any).affinity || 500,
        personal: (g as any).personal || "None",
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
      env: dbStorage.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {}),
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
      await tx.storage.deleteMany({ where: { namespace: "game_env" } });

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
        where: { namespace_key: { namespace: "game_env", key: "year" } },
        update: { value: snapshot.gameTime.year },
        create: { namespace: "game_env", key: "year", value: snapshot.gameTime.year },
      });
      await tx.storage.upsert({
        where: { namespace_key: { namespace: "game_env", key: "month" } },
        update: { value: snapshot.gameTime.month },
        create: { namespace: "game_env", key: "month", value: snapshot.gameTime.month },
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
          const no = parseInt(id);
          const existing = await tx.general.findUnique({ where: { no } });
          const mappedData = this.mapGeneralDelta(gDelta);
          if (existing) {
            await tx.general.update({
              where: { no },
              data: mappedData,
            });
          } else {
            // 새 장수 생성 (전체 데이터가 있어야 함)
            // events(RaiseInvader, RaiseNPCNation 등)는 전체 데이터를 넘겨줌
            await tx.general.create({
              data: {
                no,
                ...mappedData,
                picture: (gDelta as any).picture || "default.jpg",
                turnTime: (gDelta as any).turnTime || new Date(),
                // 나머지 필드는 DB default값 사용
              },
            });
          }
        }
      }

      // 2. 국가 업데이트
      if (delta.nations) {
        for (const [id, nDelta] of Object.entries(delta.nations)) {
          const nationId = parseInt(id);
          const existing = await tx.nation.findUnique({ where: { nation: nationId } });
          const mappedData = this.mapNationDelta(nDelta);
          if (existing) {
            await tx.nation.update({
              where: { nation: nationId },
              data: mappedData,
            });
          } else {
            // 새 국가 생성
            await tx.nation.create({
              data: {
                nation: nationId,
                name: nDelta.name || `Nation ${nationId}`,
                color: nDelta.color || "#ffffff",
                ...mappedData,
              },
            });
          }
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
            where: { namespace_key: { namespace: "game_env", key: "year" } },
            update: { value: delta.gameTime.year },
            create: { namespace: "game_env", key: "year", value: delta.gameTime.year },
          });
        }
        if (delta.gameTime.month) {
          await tx.storage.upsert({
            where: { namespace_key: { namespace: "game_env", key: "month" } },
            update: { value: delta.gameTime.month },
            create: { namespace: "game_env", key: "month", value: delta.gameTime.month },
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

      // 6. 환경 변수 업데이트 (game_env 스토리지)
      if (delta.env) {
        for (const [key, value] of Object.entries(delta.env)) {
          await tx.storage.upsert({
            where: { namespace_key: { namespace: "game_env", key } },
            update: { value },
            create: { namespace: "game_env", key, value },
          });
        }
      }

      // 7. 외교 관계 업데이트
      if (delta.diplomacy) {
        for (const [key, dDelta] of Object.entries(delta.diplomacy)) {
          const [meId, youId] = key.split(":").map(Number);
          await tx.diplomacy.upsert({
            where: { meId_youId: { meId, youId } },
            update: this.mapDiplomacyDelta(dDelta),
            create: {
              meId,
              youId,
              state: parseInt(dDelta.state || "0"),
              term: dDelta.term || 0,
            },
          });
        }
      }

      // 8. 부대 업데이트
      if (delta.troops) {
        for (const [id, tDelta] of Object.entries(delta.troops)) {
          const troopLeader = parseInt(id);
          const existing = await tx.troop.findUnique({ where: { troopLeader } });
          if (existing) {
            await tx.troop.update({
              where: { troopLeader },
              data: this.mapTroopDelta(tDelta),
            });
          } else if (tDelta.nationId !== undefined && tDelta.name !== undefined) {
            await tx.troop.create({
              data: {
                troopLeader,
                nationId: tDelta.nationId,
                name: tDelta.name,
              },
            });
          }
        }
      }

      // 9. 메시지 저장
      if (delta.messages && delta.messages.length > 0) {
        for (const msg of delta.messages) {
          await tx.message.create({
            data: {
              mailbox: typeof msg.mailbox === "number" ? msg.mailbox : 0,
              type: msg.meta?.type || "general",
              srcId: msg.srcId || 0,
              destId: msg.destId || 0,
              time: msg.sentAt,
              message: { text: msg.text, ...msg.meta },
            },
          });
        }
      }

      // 10. 장수 삭제 (사망/은퇴)
      if (delta.deleteGenerals && delta.deleteGenerals.length > 0) {
        for (const generalId of delta.deleteGenerals) {
          await tx.generalTurn.deleteMany({ where: { generalId } });
          await tx.generalAccessLog.deleteMany({ where: { generalId } });
          await tx.generalRecord.deleteMany({ where: { generalId } });
          await tx.general.delete({ where: { no: generalId } });
        }
      }

      // 11. 국가 삭제 (멸망)
      if (delta.deleteNations && delta.deleteNations.length > 0) {
        for (const nationId of delta.deleteNations) {
          await tx.diplomacy.deleteMany({
            where: { OR: [{ meId: nationId }, { youId: nationId }] },
          });
          await tx.troop.deleteMany({ where: { nationId } });
          await tx.nation.delete({ where: { nation: nationId } });
        }
      }

      // 12. 로그 저장
      if (delta.logs) {
        const { year, month } = await this.getGameTime(tx);

        if (delta.logs.general) {
          for (const [generalId, texts] of Object.entries(delta.logs.general)) {
            for (const text of texts) {
              await tx.generalRecord.create({
                data: {
                  generalId: parseInt(generalId),
                  logType: "general",
                  year,
                  month,
                  text,
                },
              });
            }
          }
        }

        if (delta.logs.nation) {
          for (const [nationId, texts] of Object.entries(delta.logs.nation)) {
            for (const text of texts) {
              await tx.worldHistory.create({
                data: {
                  nationId: parseInt(nationId),
                  year,
                  month,
                  text,
                },
              });
            }
          }
        }

        if (delta.logs.global && delta.logs.global.length > 0) {
          for (const text of delta.logs.global) {
            await tx.worldHistory.create({
              data: {
                nationId: 0,
                year,
                month,
                text,
              },
            });
          }
        }
      }
    });
  }

  private async getGameTime(tx: any): Promise<{ year: number; month: number }> {
    const yearRow = await tx.storage.findFirst({
      where: { namespace: "game_env", key: "year" },
    });
    const monthRow = await tx.storage.findFirst({
      where: { namespace: "game_env", key: "month" },
    });
    return {
      year: (yearRow?.value as number) || 184,
      month: (monthRow?.value as number) || 1,
    };
  }

  private mapGeneralDelta(gDelta: Partial<General>): any {
    const data: any = {};
    if (gDelta.name !== undefined) data.name = gDelta.name;
    if (gDelta.ownerId !== undefined) data.owner = gDelta.ownerId;
    if (gDelta.nationId !== undefined) data.nationId = gDelta.nationId;
    if (gDelta.cityId !== undefined) data.cityId = gDelta.cityId;
    if (gDelta.npc !== undefined) data.npc = gDelta.npc;
    if (gDelta.gold !== undefined) data.gold = gDelta.gold;
    if (gDelta.rice !== undefined) data.rice = gDelta.rice;
    if (gDelta.leadership !== undefined) data.leadership = gDelta.leadership;
    if (gDelta.leadershipExp !== undefined) data.leadershipExp = gDelta.leadershipExp;
    if (gDelta.strength !== undefined) data.strength = gDelta.strength;
    if (gDelta.strengthExp !== undefined) data.strengthExp = gDelta.strengthExp;
    if (gDelta.intel !== undefined) data.intel = gDelta.intel;
    if (gDelta.intelExp !== undefined) data.intelExp = gDelta.intelExp;
    if (gDelta.age !== undefined) data.age = gDelta.age;
    if (gDelta.bornYear !== undefined) data.bornYear = gDelta.bornYear;
    if (gDelta.deadYear !== undefined) data.deadYear = gDelta.deadYear;
    if (gDelta.belong !== undefined) data.belong = gDelta.belong;
    if (gDelta.injury !== undefined) data.injury = gDelta.injury;
    if (gDelta.experience !== undefined) data.experience = gDelta.experience;
    if (gDelta.dedication !== undefined) data.dedication = gDelta.dedication;
    if (gDelta.officerLevel !== undefined) data.officerLevel = gDelta.officerLevel;
    if (gDelta.officerCity !== undefined) data.officerCity = gDelta.officerCity;
    if (gDelta.crew !== undefined) data.crew = gDelta.crew;
    if (gDelta.crewType !== undefined) data.crewType = gDelta.crewType;
    if (gDelta.train !== undefined) data.train = gDelta.train;
    if (gDelta.atmos !== undefined) data.atmos = gDelta.atmos;
    if (gDelta.turnTime !== undefined) data.turnTime = gDelta.turnTime;
    if (gDelta.recentWarTime !== undefined) data.recentWar = gDelta.recentWarTime;
    if (gDelta.dex !== undefined) {
      if (gDelta.dex[1] !== undefined) data.dex1 = gDelta.dex[1];
      if (gDelta.dex[2] !== undefined) data.dex2 = gDelta.dex[2];
      if (gDelta.dex[3] !== undefined) data.dex3 = gDelta.dex[3];
      if (gDelta.dex[4] !== undefined) data.dex4 = gDelta.dex[4];
      if (gDelta.dex[5] !== undefined) data.dex5 = gDelta.dex[5];
    }
    if (gDelta.special !== undefined) data.special = gDelta.special;
    if (gDelta.special2 !== undefined) data.special2 = gDelta.special2;
    if (gDelta.personal !== undefined) data.personal = gDelta.personal;
    if (gDelta.meta !== undefined) data.aux = gDelta.meta;
    return data;
  }

  private mapNationDelta(nDelta: Partial<Nation>): any {
    const data: any = {};
    if (nDelta.name !== undefined) data.name = nDelta.name;
    if (nDelta.color !== undefined) data.color = nDelta.color;
    if (nDelta.gold !== undefined) data.gold = nDelta.gold;
    if (nDelta.rice !== undefined) data.rice = nDelta.rice;
    if (nDelta.level !== undefined) data.level = nDelta.level;
    if (nDelta.tech !== undefined) data.tech = nDelta.tech;
    if (nDelta.gennum !== undefined) data.gennum = nDelta.gennum;
    if (nDelta.chiefGeneralId !== undefined) data.chiefSet = nDelta.chiefGeneralId;
    if (nDelta.capitalCityId !== undefined) data.capital = nDelta.capitalCityId;
    if (nDelta.typeCode !== undefined) data.type = nDelta.typeCode;
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
    if (cDelta.nationId !== undefined) data.nationId = cDelta.nationId;
    if (cDelta.trust !== undefined) data.trust = cDelta.trust;
    return data;
  }

  private mapDiplomacyDelta(dDelta: Partial<Diplomacy>): any {
    const data: any = {};
    if (dDelta.state !== undefined) data.state = parseInt(dDelta.state);
    if (dDelta.term !== undefined) data.term = dDelta.term;
    return data;
  }

  private mapTroopDelta(tDelta: Partial<Troop>): any {
    const data: any = {};
    if (tDelta.name !== undefined) data.name = tDelta.name;
    if (tDelta.nationId !== undefined) data.nationId = tDelta.nationId;
    return data;
  }
}
