import { RandUtil, JosaUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import {
  WorldSnapshot,
  WorldDelta,
  Delta,
  General as IGeneral,
} from "../entities.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { GameConst } from "../GameConst.js";

/**
 * 해산 커맨드 - 방랑 국가를 해산
 * 레거시: che_해산
 *
 * 조건: 군주 + 방랑 세력(level 0) + 초기 턴 이후
 * 효과: 모든 장수 재야 전환, 자원 기본값으로 제한
 */
export class GeneralDisbandCommand extends GeneralCommand {
  readonly actionName = "해산";

  constructor() {
    super();
    this.fullConditionConstraints = [
      ConstraintHelper.BeLord(),
      ConstraintHelper.WanderingNation(),
    ];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, unknown>,
  ): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: {
          general: {
            [actorId]: [`해산 실패: ${check.reason}`],
          },
        },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    const iNation = snapshot.nations[iGeneral.nationId];

    if (!iGeneral || !iNation) {
      return {
        logs: {
          general: { [actorId]: ["해산 실패: 정보를 찾을 수 없습니다."] },
        },
      };
    }

    // 초기 턴 체크
    const initYear =
      (snapshot.env["init_year"] as number) ?? snapshot.gameTime.year;
    const initMonth = (snapshot.env["init_month"] as number) ?? 1;
    const initYearMonth = initYear * 12 + initMonth;
    const currentYearMonth =
      snapshot.gameTime.year * 12 + snapshot.gameTime.month;

    if (currentYearMonth <= initYearMonth) {
      return {
        logs: {
          general: { [actorId]: ["다음 턴부터 해산할 수 있습니다."] },
        },
      };
    }

    const generalName = iGeneral.name;
    const nationName = iNation.name;
    const nationId = iGeneral.nationId;

    const josaYi = JosaUtil.pick(generalName, "이");
    const josaUl = JosaUtil.pick(nationName, "을");

    // 국가 소속 장수들을 모두 재야로 전환
    const nationGenerals = Object.values(snapshot.generals).filter(
      (g) => g.nationId === nationId,
    );

    const generalUpdates: Record<number, Delta<IGeneral>> = {};
    for (const g of nationGenerals) {
      generalUpdates[g.id] = {
        nationId: 0,
        officerLevel: 0,
        officerCity: 0,
        gold: Math.min(g.gold, GameConst.defaultGold),
        rice: Math.min(g.rice, GameConst.defaultRice),
      };
    }

    // 군주는 건국 제한 해제
    generalUpdates[actorId] = {
      ...generalUpdates[actorId],
      makeLimit: 12, // 건국 가능
    };

    return {
      generals: generalUpdates,
      nations: {
        [nationId]: {
          level: -1, // 멸망 표시
          gennum: 0,
        },
      },
      logs: {
        general: {
          [actorId]: ["세력을 해산했습니다."],
        },
        global: [`${generalName}${josaYi} 세력을 해산했습니다.`],
      },
    };
  }
}
