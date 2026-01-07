import { GameEvent, EventTarget } from "../types.js";
import { WorldSnapshot, WorldDelta } from "../../entities.js";

/**
 * 이민족 자동 삭제 이벤트
 * 레거시: AutoDeleteInvader.php
 *
 * 전쟁 중이 아닌 이민족 국가를 해산합니다.
 */
export class AutoDeleteInvaderEvent implements GameEvent {
  public id = "auto_delete_invader_event";
  public name = "이민족 자동 삭제";
  public target = EventTarget.MONTH;
  public priority = 200;

  constructor(public nationId: number) {
    this.id = `auto_delete_invader_${nationId}`;
  }

  condition(snapshot: WorldSnapshot): boolean {
    const nation = snapshot.nations[this.nationId];
    if (!nation) return true; // 국가가 없으면 삭제(이벤트 해제) 대상

    // 외교 관계 확인 (전쟁 상태 0: 선전포고, 1: 교전)
    const diplomacy = Object.values(snapshot.diplomacy).filter(
      (d) =>
        (d.srcNationId === this.nationId || d.destNationId === this.nationId) &&
        (d.state === "declaration" || d.state === "war")
    );

    return diplomacy.length === 0;
  }

  action(snapshot: WorldSnapshot): WorldDelta {
    const nation = snapshot.nations[this.nationId];
    if (!nation) {
      return { deleteEvents: [this.id] };
    }

    // 국가 해산 로직
    // 1. 소속 장수들 재야로 변경 (또는 삭제?)
    // 레거시에서는 하야(che_방랑)를 시키거나 삭제함.
    const delta: WorldDelta = {
      nations: {},
      generals: {},
      deleteNations: [this.nationId],
      deleteEvents: [this.id],
      logs: {
        global: [
          `【공지】전쟁이 소강상태에 접어들어 【${nation.name}】족이 본국으로 철수했습니다.`,
        ],
      },
    };

    const generals = Object.values(snapshot.generals).filter((g) => g.nationId === this.nationId);
    for (const g of generals) {
      delta.generals![g.id] = { nationId: 0, cityId: 0, officerLevel: 0 };
    }

    return delta;
  }
}
