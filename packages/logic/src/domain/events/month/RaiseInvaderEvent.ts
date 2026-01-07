import { JosaUtil, RandUtil, LiteHashDRBG } from "@sammo/common";
import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta, Nation, General } from "../../entities.js";
import { GeneralHelper } from "../../utils/GeneralHelper.js";
import { GameConst } from "../../GameConst.js";

/**
 * 이민족 침입 이벤트
 * 레거시: RaiseInvader.php
 *
 * 192년 이후 매년 1월, 50% 확률로 4레벨 도시(이)에서 이민족이 거병합니다.
 */
export class RaiseInvaderEvent implements GameEvent {
  public id = "raise_invader_event";
  public name = "이민족 침입";
  public target = EventTarget.MONTH;
  public priority = 50;

  condition(snapshot: WorldSnapshot): boolean {
    const { year, month } = snapshot.gameTime;
    // 192년 이후 매년 1월에 발생
    if (month !== 1 || year < 192) {
      return false;
    }

    // 50% 확률 (결정론적 RNG 필요하므로 action에서 처리하거나 여기서 SeedGenerator 사용)
    // MonthlyPipeline에서 실행할 때 RNG가 주입되지 않으므로,
    // snapshot의 시드나 gameTime을 시드로 사용하는 RandUtil이 필요함.
    // 현재 GameEvent 인터페이스에 RNG 주입이 없으므로 action 내부에서 Snapshot 기반 RNG 생성
    return true;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const { year, month } = snapshot.gameTime;
    // 결정론적 RNG 생성을 위해 gameTime과 고유 키 사용
    const rng = new RandUtil(new LiteHashDRBG(`RaiseInvader:${year}:${month}`));

    if (rng.nextRangeInt(0, 99) < 50) {
      return {}; // 50% 확률로 미발생
    }

    // 4레벨 도시(이) 검색
    const invaderCities = Object.values(snapshot.cities).filter((c) => c.level === 4);
    if (invaderCities.length === 0) return {};

    const targetCity = rng.choice(invaderCities);

    // 거병 로직 (매우 복잡하므로 단순화하여 1단계 구현)
    // 1. 새 국가 ID 생성
    const nextNationId = Math.max(0, ...Object.keys(snapshot.nations).map(Number)) + 1;
    const nextGeneralId = Math.max(0, ...Object.keys(snapshot.generals).map(Number)) + 1;

    // 2. 국가 생성
    const invaderName = `${targetCity.name}족`;
    const color = rng.choice([...GameConst.nationColors]);
    const newNation: Nation = {
      id: nextNationId,
      name: invaderName,
      color: color,
      chiefGeneralId: nextGeneralId,
      capitalCityId: targetCity.id,
      gold: 10000,
      rice: 10000,
      rate: 20,
      rateTmp: 0,
      tech: 0,
      power: 0,
      level: 1,
      gennum: 1,
      typeCode: "che_이민족",
      scoutLevel: 0,
      warState: 0,
      strategicCmdLimit: 0,
      surrenderLimit: 0,
      spy: {},
      meta: {},
      aux: {},
    };

    // 3. 군주 생성
    const josaYi = JosaUtil.pick(invaderName, "이");
    const newGeneral: General = {
      ...GeneralHelper.createEmptyGeneral(nextGeneralId, `${targetCity.name}왕`),
      nationId: nextNationId,
      cityId: targetCity.id,
      npc: 6, // NPC 타입
      gold: 1000,
      rice: 1000,
      leadership: rng.nextRangeInt(70, 90),
      strength: rng.nextRangeInt(70, 90),
      intel: rng.nextRangeInt(50, 70),
      politics: 50,
      charm: 60,
      experience: 5000,
      dedication: 5000,
      officerLevel: 12, // 군주
      officerCity: targetCity.id,
      crew: 0,
      crewType: 1100, // 보병
      train: 80,
      atmos: 80,
      age: 30,
      bornYear: year - 30,
      deadYear: year + 50,
      special: "None",
      special2: "None",
    };

    return {
      nations: { [nextNationId]: newNation },
      generals: { [nextGeneralId]: newGeneral },
      cities: { [targetCity.id]: { nationId: nextNationId } },
      logs: {
        global: [
          `【공지】${targetCity.name}에 이민족인 【${invaderName}】${josaYi} 침입하였습니다!`,
        ],
      },
    };
  }
}
