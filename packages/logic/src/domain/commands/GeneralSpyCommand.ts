import { RandUtil, JosaUtil } from "@sammo-ts/common";
import { GeneralCommand } from "../Command.js";
import { WorldSnapshot, WorldDelta } from "../entities.js";
import { General } from "../models/General.js";
import { ConstraintHelper } from "../ConstraintHelper.js";
import { MapUtil } from "../MapData.js";

/**
 * 첩보 커맨드
 * 레거시: che_첩보
 */
export class GeneralSpyCommand extends GeneralCommand {
  readonly actionName = "첩보";

  constructor() {
    super();
    // 비용은 엔진에서 env를 주입받아 동적으로 계산해야 하지만,
    // 여기서는 레거시의 develcost * 3을 기준으로 함.
    // TODO: env 주입 방식 확정 후 수정 필요
    this.minConditionConstraints = [ConstraintHelper.NotBeNeutral()];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      // 아국이 아닌 도시여야 함 (NotOccupiedDestCity)
      {
        name: "NotOccupiedDestCity",
        requires: (ctx) => [
          { kind: "general", id: ctx.actorId },
          { kind: "arg", key: "destCityId" },
          { kind: "destCity", id: ctx.args.destCityId },
        ],
        test: (ctx, view) => {
          const general = view.get({ kind: "general", id: ctx.actorId });
          const destCity = view.get({
            kind: "destCity",
            id: ctx.args.destCityId,
          });
          if (!general || !destCity)
            return { kind: "deny", reason: "정보를 불러올 수 없습니다." };
          if (general.nationId === destCity.nationId) {
            return { kind: "deny", reason: "아국입니다." };
          }
          return { kind: "allow" };
        },
      },
    ];
  }

  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
  ): WorldDelta {
    // 비용 계산 (develcost * 3)
    const develcost = snapshot.env.develcost ?? 100;
    const reqGold = develcost * 3;
    const reqRice = develcost * 3;

    // 추가 제약 조건 (비용)
    const check = this.checkConstraints(rng, snapshot, actorId, args, "full");
    if (check.kind === "deny") {
      return {
        logs: { general: { [actorId]: [`첩보 실패: ${check.reason}`] } },
      };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);
    if (iGeneral.gold < reqGold || iGeneral.rice < reqRice) {
      return {
        logs: {
          general: { [actorId]: [`첩보 실패: 자금이나 군량이 부족합니다.`] },
        },
      };
    }

    const destCityId = args.destCityId;
    const destCity = snapshot.cities[destCityId];
    if (!destCity)
      return {
        logs: {
          general: { [actorId]: [`첩보 실패: 대상 도시를 찾을 수 없습니다.`] },
        },
      };

    const dist = MapUtil.getDistance(iGeneral.cityId, destCityId);

    // 대상 도시 장수 및 병력 정보 수집
    const cityGenerals = Object.values(snapshot.generals).filter(
      (g) => g.cityId === destCityId && g.nationId === destCity.nationId,
    );
    const totalCrew = cityGenerals.reduce((sum, g) => sum + g.crew, 0);
    const totalGenCnt = cityGenerals.length;

    const popText = destCity.pop.toLocaleString();
    const trustText = destCity.trust.toFixed(1);

    const cityBrief = `【${destCity.name}】주민:${popText}, 민심:${trustText}, 장수:${totalGenCnt}, 병력:${totalCrew}`;
    const generalLogs: string[] = [];
    const globalLogs: string[] = [];

    const josaUl = JosaUtil.pick(destCity.name, "을");
    globalLogs.push(
      `누군가가 【${destCity.name}】${josaUl} 살피는 것 같습니다.`,
    );

    if (dist <= 1) {
      generalLogs.push(`【${destCity.name}】의 정보를 많이 얻었습니다.`);
      generalLogs.push(cityBrief);
      const agriText = destCity.agri.toLocaleString();
      const commText = destCity.comm.toLocaleString();
      const secuText = destCity.secu.toLocaleString();
      const defText = destCity.def.toLocaleString();
      const wallText = destCity.wall.toLocaleString();
      generalLogs.push(
        `【첩보】농업:${agriText}, 상업:${commText}, 치안:${secuText}, 수비:${defText}, 성벽:${wallText}`,
      );

      // 병종 정보 (단순화)
      const crewTypes: Record<number, number> = {};
      for (const g of cityGenerals) {
        crewTypes[g.crewType] = (crewTypes[g.crewType] || 0) + 1;
      }
      const crewTypeText = Object.entries(crewTypes)
        .map(([type, count]) => `병종${type}:${count}`)
        .join(" ");
      generalLogs.push(`【병종】 ${crewTypeText}`);

      // 기술 비교 (임시)
      const myNation = snapshot.nations[iGeneral.nationId];
      const destNation = snapshot.nations[destCity.nationId];
      if (myNation && destNation) {
        const techDiff = destNation.tech - myNation.tech;
        let techText = "대등";
        if (techDiff >= 1000) techText = "압도";
        else if (techDiff >= 250) techText = "우위";
        else if (techDiff <= -1000) techText = "미미";
        else if (techDiff <= -250) techText = "열위";
        generalLogs.push(`【${destNation.name}】아국대비기술:${techText}`);
      }
    } else if (dist === 2) {
      generalLogs.push(`【${destCity.name}】의 정보를 어느 정도 얻었습니다.`);
      generalLogs.push(cityBrief);
      const agriText = destCity.agri.toLocaleString();
      const commText = destCity.comm.toLocaleString();
      const secuText = destCity.secu.toLocaleString();
      const defText = destCity.def.toLocaleString();
      const wallText = destCity.wall.toLocaleString();
      generalLogs.push(
        `【첩보】농업:${agriText}, 상업:${commText}, 치안:${secuText}, 수비:${defText}, 성벽:${wallText}`,
      );
    } else {
      generalLogs.push(`【${destCity.name}】의 소문만 들을 수 있었습니다.`);
      generalLogs.push(cityBrief);
    }

    // 국가 첩보 정보 업데이트
    const nationDelta: any = {};
    if (iGeneral.nationId !== 0) {
      const nation = snapshot.nations[iGeneral.nationId];
      if (nation) {
        const newSpy = { ...nation.spy, [destCityId]: 3 };
        nationDelta[iGeneral.nationId] = { spy: newSpy };
      }
    }

    const general = new General(iGeneral);
    const expGain = rng.nextRangeInt(1, 100);
    const dedGain = rng.nextRangeInt(1, 70);

    general.addExperience(expGain);
    general.addDedication(dedGain);
    general.addStatExp("leadershipExp", 1);
    general.addGold(-reqGold);
    general.addRice(-reqRice);

    return {
      generals: { [actorId]: general.toJSON() },
      nations: nationDelta,
      logs: {
        general: { [actorId]: generalLogs },
        global: globalLogs,
      },
    };
  }
}
