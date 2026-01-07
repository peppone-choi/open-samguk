import { JosaUtil, RandUtil, LiteHashDRBG } from "@sammo/common";
import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";
import { SpecialityHelper } from "../../specials/SpecialityHelper.js";

/**
 * 장수 특기 할당 이벤트
 * 레거시: AssignGeneralSpeciality.php
 *
 * 특정 나이에 도달한 장수들에게 자동으로 내정/전투 특기를 부여합니다.
 */
export class AssignGeneralSpecialityEvent implements GameEvent {
  public id = "assign_general_speciality_event";
  public name = "장수 특기 할당";
  public target = EventTarget.MONTH;
  public priority = 70;

  condition(snapshot: WorldSnapshot): boolean {
    const startYear = snapshot.env["startyear"] || 184;
    const currentYear = snapshot.gameTime.year;
    // 시나리오 시작 3년 후부터 발생
    return currentYear >= startYear + 3;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const { year, month } = snapshot.gameTime;
    const rng = new RandUtil(new LiteHashDRBG(`AssignGeneralSpeciality:${year}:${month}`));

    const delta: WorldDelta = {
      generals: {},
      logs: {
        general: {},
      },
    };

    const dGenerals = delta.generals!;
    const dLogs = delta.logs!;

    // 1. 내정 특기 할당 (special)
    for (const general of Object.values(snapshot.generals)) {
      // 아직 특기가 없고(NoSpecialDomestic), 특기를 배울 나이(specAge)가 되었을 때
      if (general.special === "NoSpecialDomestic" && general.specAge <= general.age) {
        const prevTypes = (general.meta as any)?.prev_types_special || [];
        const newSpecial = SpecialityHelper.pickSpecialDomestic(rng, general, prevTypes);

        const specialObj = SpecialityHelper.getDomesticSpecial(newSpecial);
        const specialName = specialObj.getName();
        const josaUl = JosaUtil.pick(specialName, "을");

        if (!dGenerals[general.id]) dGenerals[general.id] = {};
        dGenerals[general.id].special = newSpecial;

        if (!dLogs.general![general.id]) dLogs.general![general.id] = [];
        dLogs.general![general.id]!.push(
          `특기 【<b><L>${specialName}</></b>】${josaUl} 익혔습니다!`
        );
      }

      // 2. 전투 특기 할당 (special2)
      if (general.special2 === "NoSpecialWar" && general.specAge2 <= general.age) {
        const generalMeta = general.meta as any;
        let newSpecial2: string;

        if (generalMeta?.inheritSpecificSpecialWar) {
          newSpecial2 = generalMeta.inheritSpecificSpecialWar;
          // meta에서 해당 데이터 제거 (나중에 delta로 반영)
          if (!dGenerals[general.id]) dGenerals[general.id] = {};
          const newMeta = { ...generalMeta };
          delete newMeta.inheritSpecificSpecialWar;
          (dGenerals[general.id] as any).meta = newMeta;
        } else {
          const prevTypes2 = generalMeta?.prev_types_special2 || [];
          newSpecial2 = SpecialityHelper.pickSpecialWar(rng, general, prevTypes2);
        }

        const specialObj2 = SpecialityHelper.getWarSpecial(newSpecial2);
        const specialName2 = specialObj2.getName();
        const josaUl2 = JosaUtil.pick(specialName2, "을");

        if (!dGenerals[general.id]) dGenerals[general.id] = {};
        dGenerals[general.id].special2 = newSpecial2;

        if (!dLogs.general![general.id]) dLogs.general![general.id] = [];
        dLogs.general![general.id]!.push(
          `특기 【<b><L>${specialName2}</></b>】${josaUl2} 익혔습니다!`
        );
      }
    }

    return delta;
  }
}
