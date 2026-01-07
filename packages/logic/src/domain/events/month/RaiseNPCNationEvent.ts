import { JosaUtil, RandUtil, LiteHashDRBG } from "@sammo/common";
import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta, Nation, General } from "../../entities.js";
import { GeneralHelper } from "../../utils/GeneralHelper.js";
import { GameConst } from "../../GameConst.js";
import { MapUtil } from "../../MapData.js";

/**
 * NPC 국가 거병 이벤트
 * 레거시: RaiseNPCNation.php
 *
 * 공백지(레벨 5-6)에 NPC 국가가 거병합니다.
 */
export class RaiseNPCNationEvent implements GameEvent {
  public id = "raise_npc_nation_event";
  public name = "NPC 국가 거병";
  public target = EventTarget.MONTH;
  public priority = 60;

  condition(snapshot: WorldSnapshot): boolean {
    const { month } = snapshot.gameTime;
    // 보통 1월, 7월에 발생 (환경에 따라 다를 수 있으나 기본값)
    return month === 1 || month === 7;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const { year, month } = snapshot.gameTime;
    const rng = new RandUtil(new LiteHashDRBG(`RaiseNPCNation:${year}:${month}`));

    // 1. 공백지(레벨 5-6) 검색
    const emptyCities = Object.values(snapshot.cities).filter(
      (c) => c.nationId === 0 && (c.level === 5 || c.level === 6)
    );
    if (emptyCities.length === 0) return {};

    // 2. 기존 국가와의 거리 확인을 위해 점유도시 목록 추출
    const occupiedCities = Object.values(snapshot.cities).filter((c) => c.nationId !== 0);

    const createdNations: Record<number, Nation> = {};
    const createdGenerals: Record<number, General> = {};
    const cityUpdates: Record<number, any> = {};
    const globalLogs: string[] = [];

    let currentNextNationId = Math.max(0, ...Object.keys(snapshot.nations).map(Number)) + 1;
    let currentNextGeneralId = Math.max(0, ...Object.keys(snapshot.generals).map(Number)) + 1;

    const MIN_DIST_USERNATION = 3;
    const npcCitiesID: number[] = [];

    // 섞기
    const candidates = [...emptyCities];
    rng.shuffle(candidates);

    for (const emptyCity of candidates) {
      // 기존 국가와의 최소 거리 확인
      let minDist = 999;
      for (const occCity of occupiedCities) {
        const d = MapUtil.getDistance(emptyCity.id, occCity.id);
        if (d < minDist) minDist = d;
        if (minDist < MIN_DIST_USERNATION) break;
      }
      if (minDist < MIN_DIST_USERNATION) continue;

      // 이미 생성된 NPC 국가와의 거리 확인
      let minNpcDist = 999;
      for (const npcCityId of npcCitiesID) {
        const d = MapUtil.getDistance(emptyCity.id, npcCityId);
        if (d < minNpcDist) minNpcDist = d;
        if (minNpcDist < 2) break;
      }
      if (minNpcDist < 2) continue;

      // 거병 가능!
      const nationId = currentNextNationId++;
      const nationName = `ⓤ${emptyCity.name}`;
      const color = rng.choice([...GameConst.nationColors]);
      const chiefId = currentNextGeneralId++;

      createdNations[nationId] = {
        id: nationId,
        name: nationName,
        color,
        chiefGeneralId: chiefId,
        capitalCityId: emptyCity.id,
        gold: 10000,
        rice: 10000,
        rate: 20,
        rateTmp: 0,
        tech: 0,
        power: 0,
        level: 1,
        gennum: 1,
        typeCode: "che_국가",
        scoutLevel: 0,
        warState: 0,
        strategicCmdLimit: 0,
        surrenderLimit: 0,
        spy: {},
        meta: {},
        aux: {},
      };

      createdGenerals[chiefId] = {
        ...GeneralHelper.createEmptyGeneral(chiefId, `${emptyCity.name}태수`),
        nationId,
        cityId: emptyCity.id,
        npc: 6,
        gold: 1000,
        rice: 1000,
        leadership: rng.nextRangeInt(60, 80),
        strength: rng.nextRangeInt(60, 80),
        intel: rng.nextRangeInt(60, 80),
        politics: 60,
        charm: 60,
        experience: 1000,
        dedication: 1000,
        officerLevel: 12,
        officerCity: emptyCity.id,
        crew: 0,
        crewType: 1100,
        train: 80,
        atmos: 80,
        age: 30,
        bornYear: year - 30,
        deadYear: year + 50,
      };

      cityUpdates[emptyCity.id] = { nationId };
      npcCitiesID.push(emptyCity.id);
    }

    if (Object.keys(createdNations).length > 0) {
      globalLogs.push("<L><b>【공지】</b></>공백지에 임의의 국가가 생성되었습니다.");
    }

    return {
      nations: createdNations,
      generals: createdGenerals,
      cities: cityUpdates,
      logs: { global: globalLogs },
    };
  }
}
