import {
  Constraint,
  ConstraintContext,
  ConstraintResult,
  RequirementKey,
  StateView,
} from "./Constraint.js";
import { MapUtil } from "./MapData.js";
import { NotLordConstraint } from "./constraints/NotLordConstraint.js";
import { BeChiefConstraint } from "./constraints/BeChiefConstraint.js";
import { NotChiefConstraint } from "./constraints/NotChiefConstraint.js";
import { NotOccupiedCityConstraint } from "./constraints/NotOccupiedCityConstraint.js";
import { NeutralCityConstraint } from "./constraints/NeutralCityConstraint.js";
import { NotNeutralDestCityConstraint } from "./constraints/NotNeutralDestCityConstraint.js";
import { OccupiedDestCityConstraint } from "./constraints/OccupiedDestCityConstraint.js";
import { NotOccupiedDestCityConstraint } from "./constraints/NotOccupiedDestCityConstraint.js";
import { SuppliedDestCityConstraint } from "./constraints/SuppliedDestCityConstraint.js";
import { ReqGeneralValueConstraint } from "./constraints/ReqGeneralValueConstraint.js";
import { ReqNationValueConstraint } from "./constraints/ReqNationValueConstraint.js";
import { ReqCityValueConstraint } from "./constraints/ReqCityValueConstraint.js";
import { ReqDestCityValueConstraint } from "./constraints/ReqDestCityValueConstraint.js";
import { ReqDestNationValueConstraint } from "./constraints/ReqDestNationValueConstraint.js";
import { ReqNationGoldConstraint } from "./constraints/ReqNationGoldConstraint.js";
import { ReqNationRiceConstraint } from "./constraints/ReqNationRiceConstraint.js";
import { NotCapitalConstraint } from "./constraints/NotCapitalConstraint.js";
import { NotSameDestCityConstraint } from "./constraints/NotSameDestCityConstraint.js";
import { ExistsDestNationConstraint } from "./constraints/ExistsDestNationConstraint.js";
import { DifferentDestNationConstraint } from "./constraints/DifferentDestNationConstraint.js";
import { NearNationConstraint } from "./constraints/NearNationConstraint.js";
import { DisallowDiplomacyBetweenStatusConstraint } from "./constraints/DisallowDiplomacyBetweenStatusConstraint.js";
import { AllowDiplomacyBetweenStatusConstraint } from "./constraints/AllowDiplomacyBetweenStatusConstraint.js";
import { AllowDiplomacyStatusConstraint } from "./constraints/AllowDiplomacyStatusConstraint.js";
import { DisallowDiplomacyStatusConstraint } from "./constraints/DisallowDiplomacyStatusConstraint.js";
import { AllowDiplomacyWithTermConstraint } from "./constraints/AllowDiplomacyWithTermConstraint.js";
import { AllowJoinDestNationConstraint } from "./constraints/AllowJoinDestNationConstraint.js";
import { BattleGroundCityConstraint } from "./constraints/BattleGroundCityConstraint.js";
import { AllowRebellionConstraint } from "./constraints/AllowRebellionConstraint.js";
import { CheckNationNameDuplicateConstraint } from "./constraints/CheckNationNameDuplicateConstraint.js";
import { ExistsAllowJoinNationConstraint } from "./constraints/ExistsAllowJoinNationConstraint.js";
import { HasRouteConstraint } from "./constraints/HasRouteConstraint.js";
import { HasRouteWithEnemyConstraint } from "./constraints/HasRouteWithEnemyConstraint.js";
import { ReqGeneralCrewMarginConstraint } from "./constraints/ReqGeneralCrewMarginConstraint.js";
import { ReqTroopMembersConstraint } from "./constraints/ReqTroopMembersConstraint.js";
import { AllowStrategicCommandConstraint } from "./constraints/AllowStrategicCommandConstraint.js";
import { AvailableStrategicCommandConstraint } from "./constraints/AvailableStrategicCommandConstraint.js";
import { AdhocCallbackConstraint } from "./constraints/AdhocCallbackConstraint.js";
import { AvailableRecruitCrewTypeConstraint } from "./constraints/AvailableRecruitCrewTypeConstraint.js";
import { AvailableNationCommandConstraint } from "./constraints/AvailableNationCommandConstraint.js";
import { ReqEnvValueConstraint } from "./constraints/ReqEnvValueConstraint.js";
import { BeOpeningPartConstraint } from "./constraints/BeOpeningPartConstraint.js";
import { NotOpeningPartConstraint } from "./constraints/NotOpeningPartConstraint.js";
import { RemainCityTrustConstraint } from "./constraints/RemainCityTrustConstraint.js";
import { ReqCityTrustConstraint } from "./constraints/ReqCityTrustConstraint.js";
import { MustBeNPCConstraint } from "./constraints/MustBeNPCConstraint.js";
import { AllowWarConstraint } from "./constraints/AllowWarConstraint.js";
import { ReqNationAuxValueConstraint } from "./constraints/ReqNationAuxValueConstraint.js";
import { ReqCityTraderConstraint } from "./constraints/ReqCityTraderConstraint.js";
import { MustBeTroopLeaderConstraint } from "./constraints/MustBeTroopLeaderConstraint.js";
import { AllowJoinActionConstraint } from "./constraints/AllowJoinActionConstraint.js";
import { ReqCityCapacityConstraint } from "./constraints/ReqCityCapacityConstraint.js";

/**
 * 공통 제약 조건들을 생성하는 헬퍼 클래스
 */
export class ConstraintHelper {
  /**
   * 중립 상태가 아니어야 함
   */
  static NotBeNeutral(): Constraint {
    return {
      name: "NotBeNeutral",
      requires: (ctx) => [{ kind: "nation", id: ctx.nationId ?? 0 }],
      test: (ctx, view) => {
        const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });
        if (!nation || nation.id === 0) {
          return {
            kind: "deny",
            reason: "중립 세력은 이 명령을 수행할 수 없습니다.",
          };
        }
        return { kind: "allow" };
      },
    };
  }

  /**
   * 자금이 충분해야 함
   */
  static ReqGeneralGold(amount: number): Constraint {
    return {
      name: "ReqGeneralGold",
      requires: (ctx) => [{ kind: "general", id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: "general", id: ctx.actorId });
        if (!general || general.gold < amount) {
          return {
            kind: "deny",
            reason: `자금이 부족합니다. (필요: ${amount})`,
          };
        }
        return { kind: "allow" };
      },
    };
  }

  /**
   * 군량이 충분해야 함
   */
  static ReqGeneralRice(amount: number): Constraint {
    return {
      name: "ReqGeneralRice",
      requires: (ctx) => [{ kind: "general", id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: "general", id: ctx.actorId });
        if (!general || general.rice < amount) {
          return {
            kind: "deny",
            reason: `군량이 부족합니다. (필요: ${amount})`,
          };
        }
        return { kind: "allow" };
      },
    };
  }

  /**
   * 병사가 있어야 함
   */
  static ReqGeneralCrew(): Constraint {
    return {
      name: "ReqGeneralCrew",
      requires: (ctx) => [{ kind: "general", id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: "general", id: ctx.actorId });
        if (!general || general.crew <= 0) {
          return { kind: "deny", reason: "병사가 없습니다." };
        }
        return { kind: "allow" };
      },
    };
  }

  /**
   * 훈련도 여유가 있어야 함
   */
  static ReqGeneralTrainMargin(maxTrain: number): Constraint {
    return {
      name: "ReqGeneralTrainMargin",
      requires: (ctx) => [{ kind: "general", id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: "general", id: ctx.actorId });
        if (!general || general.train >= maxTrain) {
          return {
            kind: "deny",
            reason: `이미 최대 훈련도(${maxTrain})에 도달했습니다.`,
          };
        }
        return { kind: "allow" };
      },
    };
  }

  /**
   * 사기치 여유가 있어야 함
   */
  static ReqGeneralAtmosMargin(maxAtmos: number): Constraint {
    return {
      name: "ReqGeneralAtmosMargin",
      requires: (ctx) => [{ kind: "general", id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: "general", id: ctx.actorId });
        if (!general || general.atmos >= maxAtmos) {
          return {
            kind: "deny",
            reason: `이미 최대 사기치(${maxAtmos})에 도달했습니다.`,
          };
        }
        return { kind: "allow" };
      },
    };
  }

  /**
   * 페널티가 없어야 함
   */
  static NoPenalty(penaltyKey: string): Constraint {
    return {
      name: `NoPenalty:${penaltyKey}`,
      requires: (ctx) => [{ kind: "general", id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: "general", id: ctx.actorId });
        if (general?.penalty?.[penaltyKey]) {
          return {
            kind: "deny",
            reason: "제약 사항이 있어 명령을 수행할 수 없습니다.",
          };
        }
        return { kind: "allow" };
      },
    };
  }

  /**
   * 군주여야 함
   */
  static OccupiedCity(): Constraint {
    return {
      name: "OccupiedCity",
      requires: (ctx) => [{ kind: "city", id: ctx.cityId ?? 0 }],
      test: (ctx, view) => {
        const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });
        if (!city || city.nationId === 0) {
          return {
            kind: "deny",
            reason: "공백지에서는 이 명령을 수행할 수 없습니다.",
          };
        }
        return { kind: "allow" };
      },
    };
  }

  /**
   * 보급이 연결된 도시여야 함
   */
  static SuppliedCity(): Constraint {
    return {
      name: "SuppliedCity",
      requires: (ctx) => [{ kind: "city", id: ctx.cityId ?? 0 }],
      test: (ctx, view) => {
        const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });
        if (!city || city.supply !== 1) {
          return {
            kind: "deny",
            reason: "보급이 끊긴 도시에서는 이 명령을 수행할 수 없습니다.",
          };
        }
        return { kind: "allow" };
      },
    };
  }

  /**
   * 인접한 도시여야 함
   */
  static NearCity(distance: number = 1): Constraint {
    return {
      name: "NearCity",
      requires: (ctx) => [
        { kind: "city", id: ctx.cityId ?? 0 },
        { kind: "arg", key: "destCityId" },
      ],
      test: (ctx, view) => {
        const destCityId = ctx.args.destCityId;
        if (!destCityId) return { kind: "deny", reason: "목적지 도시가 지정되지 않았습니다." };
        if (ctx.cityId === destCityId)
          return {
            kind: "deny",
            reason: "현재 도시와 목적지 도시가 같습니다.",
          };

        if (distance === 1) {
          if (!MapUtil.areAdjacent(ctx.cityId ?? 0, destCityId)) {
            return { kind: "deny", reason: "인접한 도시가 아닙니다." };
          }
        } else {
          const dist = MapUtil.getDistance(ctx.cityId ?? 0, destCityId);
          if (dist > distance) {
            return {
              kind: "deny",
              reason: `거리가 너무 멉니다. (현재: ${dist}, 최대: ${distance})`,
            };
          }
        }

        return { kind: "allow" };
      },
    };
  }

  /**
   * 대상 장수가 존재해야 함
   */
  static ExistsDestGeneral(): Constraint {
    return {
      name: "ExistsDestGeneral",
      requires: (ctx) => [{ kind: "destGeneral", id: ctx.args.destGeneralId }],
      test: (ctx, view) => {
        const destGeneral = view.get({
          kind: "destGeneral",
          id: ctx.args.destGeneralId,
        });
        if (!destGeneral) {
          return { kind: "deny", reason: "대상 장수가 존재하지 않습니다." };
        }
        return { kind: "allow" };
      },
    };
  }

  /**
   * 대상 장수가 같은 국가 소속이어야 함
   */
  static FriendlyDestGeneral(): Constraint {
    return {
      name: "FriendlyDestGeneral",
      requires: (ctx) => [
        { kind: "general", id: ctx.actorId },
        { kind: "destGeneral", id: ctx.args.destGeneralId },
      ],
      test: (ctx, view) => {
        const general = view.get({ kind: "general", id: ctx.actorId });
        const destGeneral = view.get({
          kind: "destGeneral",
          id: ctx.args.destGeneralId,
        });
        if (!general || !destGeneral) return { kind: "allow" };

        if (general.nationId !== destGeneral.nationId) {
          return { kind: "deny", reason: "같은 국가 소속 장수가 아닙니다." };
        }
        return { kind: "allow" };
      },
    };
  }

  /**
   * 대상 장수가 다른 국가 소속이어야 함
   */
  static DifferentNationDestGeneral(): Constraint {
    return {
      name: "DifferentNationDestGeneral",
      requires: (ctx) => [
        { kind: "general", id: ctx.actorId },
        { kind: "destGeneral", id: ctx.args.destGeneralId },
      ],
      test: (ctx, view) => {
        const general = view.get({ kind: "general", id: ctx.actorId });
        const destGeneral = view.get({
          kind: "destGeneral",
          id: ctx.args.destGeneralId,
        });
        if (!general || !destGeneral) return { kind: "allow" };

        if (general.nationId === destGeneral.nationId) {
          return {
            kind: "deny",
            reason: "같은 국가 소속 장수는 등용할 수 없습니다.",
          };
        }
        return { kind: "allow" };
      },
    };
  }

  /**
   * 특정 관직 레벨 이상 요구
   */
  public static ReqOfficerLevel(minLevel: number): Constraint {
    return {
      name: "ReqOfficerLevel",
      requires: (ctx) => [{ kind: "general", id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: "general", id: ctx.actorId });
        if (!general) return { kind: "deny", reason: "장수를 찾을 수 없습니다." };
        if (general.officerLevel < minLevel) {
          return {
            kind: "deny",
            reason: `관직 레벨이 부족합니다. (요구: ${minLevel})`,
          };
        }
        return { kind: "allow" };
      },
    };
  }

  /**
   * 재야(중립) 상태여야 함
   */
  public static BeNeutral(): Constraint {
    return {
      name: "BeNeutral",
      requires: (ctx) => [{ kind: "general", id: ctx.actorId }],
      test: (ctx, view) => {
        const general = view.get({ kind: "general", id: ctx.actorId });
        if (!general) return { kind: "deny", reason: "장수를 찾을 수 없습니다." };
        if (general.nationId !== 0) {
          return { kind: "deny", reason: "이미 소속된 국가가 있습니다." };
        }
        return { kind: "allow" };
      },
    };
  }

  public static BeLord(): Constraint {
    return {
      name: "BeLord",
      requires: (ctx) => [
        { kind: "general", id: ctx.actorId },
        { kind: "nation", id: ctx.nationId ?? 0 },
      ],
      test: (ctx, view) => {
        const general = view.get({ kind: "general", id: ctx.actorId });
        const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });

        if (!general || !nation) return { kind: "deny", reason: "국가 정보를 찾을 수 없습니다." };
        if (nation.chiefGeneralId !== general.id) {
          return { kind: "deny", reason: "군주만 실행할 수 있습니다." };
        }
        return { kind: "allow" };
      },
    };
  }

  public static WanderingNation(): Constraint {
    return {
      name: "WanderingNation",
      requires: (ctx) => [{ kind: "nation", id: ctx.nationId ?? 0 }],
      test: (ctx, view) => {
        const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });
        if (!nation || nation.level !== 0) {
          return { kind: "deny", reason: "방랑군 상태여야 합니다." };
        }
        return { kind: "allow" };
      },
    };
  }

  public static NotWanderingNation(): Constraint {
    return {
      name: "NotWanderingNation",
      requires: (ctx) => [{ kind: "nation", id: ctx.nationId ?? 0 }],
      test: (ctx, view) => {
        const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });
        if (nation && nation.level === 0) {
          return {
            kind: "deny",
            reason: "방랑군은 이 명령을 수행할 수 없습니다.",
          };
        }
        return { kind: "allow" };
      },
    };
  }

  public static RemainCityCapacity(
    key: "agri" | "comm" | "secu" | "def" | "wall",
    actionName: string
  ): Constraint {
    return {
      name: "RemainCityCapacity",
      requires: (ctx) => [{ kind: "city", id: ctx.cityId ?? 0 }],
      test: (ctx, view) => {
        const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });
        if (!city) return { kind: "deny", reason: "도시 정보를 찾을 수 없습니다." };

        const current = city[key] ?? 0;
        const max = city[`${key}Max`] ?? 0;

        if (current >= max) {
          return {
            kind: "deny",
            reason: `이미 해당 도시의 ${actionName} 수치가 최대치에 도달했습니다.`,
          };
        }
        return { kind: "allow" };
      },
    };
  }

  public static ReqNationGeneralCount(minCount: number): Constraint {
    return {
      name: "ReqNationGeneralCount",
      requires: (ctx) => [{ kind: "nation", id: ctx.nationId ?? 0 }],
      test: (ctx, view) => {
        const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });
        if (!nation) return { kind: "deny", reason: "국가 정보를 찾을 수 없습니다." };
        if (nation.gennum < minCount) {
          return {
            kind: "deny",
            reason: `수하 장수가 ${minCount}명 이상이어야 합니다.`,
          };
        }
        return { kind: "allow" };
      },
    };
  }

  public static ExistsRecruitMessage(): Constraint {
    return {
      name: "ExistsRecruitMessage",
      requires: (ctx) => [
        { kind: "arg", key: "messageId" },
        { kind: "message", id: ctx.args.messageId },
      ],
      test: (ctx, view) => {
        const messageId = ctx.args.messageId;
        if (!messageId) return { kind: "deny", reason: "서신 ID가 지정되지 않았습니다." };
        const message = view.get({ kind: "message", id: messageId });
        if (!message) return { kind: "deny", reason: "해당 서신이 존재하지 않습니다." };
        if (message.meta?.type !== "recruit")
          return { kind: "deny", reason: "등용 권유 서신이 아닙니다." };
        if (message.destId !== ctx.actorId)
          return { kind: "deny", reason: "본인에게 온 서신이 아닙니다." };
        return { kind: "allow" };
      },
    };
  }

  public static ConstructableCity(): Constraint {
    return {
      name: "ConstructableCity",
      requires: (ctx) => [{ kind: "city", id: ctx.cityId ?? 0 }],
      test: (ctx, view) => {
        const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });
        if (!city || city.level < 5) {
          return { kind: "deny", reason: "건국할 수 없는 도시입니다." };
        }
        return { kind: "allow" };
      },
    };
  }

  public static ReqCitySecu(reqSecu: number): Constraint {
    return {
      name: "ReqCitySecu",
      requires: (ctx) => [{ kind: "city", id: ctx.cityId ?? 0 }],
      test: (ctx, view) => {
        const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });
        if (!city) return { kind: "deny", reason: "도시 정보를 찾을 수 없습니다." };
        if (city.secu < reqSecu) {
          return {
            kind: "deny",
            reason: `도시의 치안 수치가 부족합니다. (요구: ${reqSecu})`,
          };
        }
        return { kind: "allow" };
      },
    };
  }

  public static ReqCityTrader(npcType: number): Constraint {
    return {
      name: "ReqCityTrader",
      requires: (ctx) => [{ kind: "city", id: ctx.cityId ?? 0 }],
      test: (ctx, view) => {
        const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });
        if (!city) return { kind: "deny", reason: "도시 정보를 찾을 수 없습니다." };
        if (city.trade! < 10 && npcType === 0) {
          return { kind: "deny", reason: "상인이 없는 도시입니다." };
        }
        return { kind: "allow" };
      },
    };
  }

  public static AlwaysFail(reason: string): Constraint {
    return {
      name: "AlwaysFail",
      requires: () => [],
      test: () => ({ kind: "deny", reason }),
    };
  }

  public static ReqCityTrust(actionName: string): Constraint {
    return {
      name: "ReqCityTrust",
      requires: (ctx) => [{ kind: "city", id: ctx.cityId ?? 0 }],
      test: (ctx, view) => {
        const city = view.get({ kind: "city", id: ctx.cityId ?? 0 });
        if (!city) return { kind: "deny", reason: "도시 정보를 찾을 수 없습니다." };
        if (city.trust >= 100) {
          return {
            kind: "deny",
            reason: `이미 ${actionName} 수치가 최대치(100)에 도달했습니다.`,
          };
        }
        return { kind: "allow" };
      },
    };
  }

  public static ReqNationMeta(
    key: string,
    expectedValue: any,
    compare: "eq" | "gt" | "lt" | "ge" | "le" = "eq",
    reason?: string
  ): Constraint {
    return {
      name: "ReqNationMeta",
      requires: (ctx) => [{ kind: "nation", id: ctx.nationId ?? 0 }],
      test: (ctx, view) => {
        const nation = view.get({ kind: "nation", id: ctx.nationId ?? 0 });
        if (!nation) return { kind: "deny", reason: "국가 정보를 찾을 수 없습니다." };

        const value = nation.meta[key] ?? 0;
        let pass = false;
        switch (compare) {
          case "eq":
            pass = value === expectedValue;
            break;
          case "gt":
            pass = value > expectedValue;
            break;
          case "lt":
            pass = value < expectedValue;
            break;
          case "ge":
            pass = value >= expectedValue;
            break;
          case "le":
            pass = value <= expectedValue;
            break;
        }

        if (!pass) {
          return {
            kind: "deny",
            reason: reason ?? `국가 설정 조건(${key})을 만족하지 않습니다.`,
          };
        }
        return { kind: "allow" };
      },
    };
  }

  public static NotLord(): Constraint {
    return new NotLordConstraint();
  }

  public static BeChief(): Constraint {
    return new BeChiefConstraint();
  }

  public static NotChief(): Constraint {
    return new NotChiefConstraint();
  }

  public static NotOccupiedCity(): Constraint {
    return new NotOccupiedCityConstraint();
  }

  public static NeutralCity(): Constraint {
    return new NeutralCityConstraint();
  }

  public static NotNeutralDestCity(): Constraint {
    return new NotNeutralDestCityConstraint();
  }

  public static OccupiedDestCity(): Constraint {
    return new OccupiedDestCityConstraint();
  }

  public static NotOccupiedDestCity(): Constraint {
    return new NotOccupiedDestCityConstraint();
  }

  public static SuppliedDestCity(): Constraint {
    return new SuppliedDestCityConstraint();
  }

  public static ReqGeneralValue(
    key: string,
    keyNick: string,
    comp: ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==",
    reqVal: number,
    errMsg?: string
  ): Constraint {
    return new ReqGeneralValueConstraint(key, keyNick, comp, reqVal, errMsg);
  }

  public static ReqNationValue(
    key: string,
    keyNick: string,
    comp: ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==",
    reqVal: number | string,
    errMsg?: string
  ): Constraint {
    return new ReqNationValueConstraint(key, keyNick, comp, reqVal, errMsg);
  }

  public static ReqCityValue(
    key: string,
    keyNick: string,
    comp: ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==",
    reqVal: number | string,
    errMsg?: string
  ): Constraint {
    return new ReqCityValueConstraint(key, keyNick, comp, reqVal, errMsg);
  }

  public static ReqDestCityValue(
    key: string,
    keyNick: string,
    comp: ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==",
    reqVal: number | string,
    errMsg?: string
  ): Constraint {
    return new ReqDestCityValueConstraint(key, keyNick, comp, reqVal, errMsg);
  }

  public static ReqDestNationValue(
    key: string,
    keyNick: string,
    comp: ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==",
    reqVal: number | string,
    errMsg?: string
  ): Constraint {
    return new ReqDestNationValueConstraint(key, keyNick, comp, reqVal, errMsg);
  }

  public static ReqNationGold(amount: number): Constraint {
    return new ReqNationGoldConstraint(amount);
  }

  public static ReqNationRice(amount: number): Constraint {
    return new ReqNationRiceConstraint(amount);
  }

  public static NotCapital(allowChief: boolean = false): Constraint {
    return new NotCapitalConstraint(allowChief);
  }

  public static NotSameDestCity(): Constraint {
    return new NotSameDestCityConstraint();
  }

  public static ExistsDestNation(): Constraint {
    return new ExistsDestNationConstraint();
  }

  public static DifferentDestNation(): Constraint {
    return new DifferentDestNationConstraint();
  }

  public static AllowDiplomacyStatus(allowStatus: string[], errorMessage: string): Constraint {
    return new AllowDiplomacyStatusConstraint(allowStatus, errorMessage);
  }

  public static DisallowDiplomacyStatus(disallowStatus: Record<string, string>): Constraint {
    return new DisallowDiplomacyStatusConstraint(disallowStatus);
  }

  public static AllowDiplomacyWithTerm(
    allowDipCode: string,
    allowMinTerm: number,
    errorMessage: string
  ): Constraint {
    return new AllowDiplomacyWithTermConstraint(allowDipCode, allowMinTerm, errorMessage);
  }

  public static AllowJoinDestNation(relYear: number): Constraint {
    return new AllowJoinDestNationConstraint(relYear);
  }

  public static BattleGroundCity(): Constraint {
    return new BattleGroundCityConstraint();
  }

  public static AllowRebellion(): Constraint {
    return new AllowRebellionConstraint();
  }

  public static CheckNationNameDuplicate(targetName: string): Constraint {
    return new CheckNationNameDuplicateConstraint(targetName);
  }

  public static ExistsAllowJoinNation(relYear: number, excludeList: number[]): Constraint {
    return new ExistsAllowJoinNationConstraint(relYear, excludeList);
  }

  public static HasRoute(): Constraint {
    return new HasRouteConstraint();
  }

  public static HasRouteWithEnemy(): Constraint {
    return new HasRouteWithEnemyConstraint();
  }

  public static ReqGeneralCrewMargin(targetCrewType: number): Constraint {
    return new ReqGeneralCrewMarginConstraint(targetCrewType);
  }

  public static ReqTroopMembers(): Constraint {
    return new ReqTroopMembersConstraint();
  }

  public static AllowStrategicCommand(): Constraint {
    return new AllowStrategicCommandConstraint();
  }

  public static AvailableStrategicCommand(turnLimit: number): Constraint {
    return new AvailableStrategicCommandConstraint(turnLimit);
  }

  public static AdhocCallback(
    callback: (ctx: ConstraintContext, view: StateView) => string | null
  ): Constraint {
    return new AdhocCallbackConstraint(callback);
  }

  public static AvailableRecruitCrewType(crewType: number): Constraint {
    return new AvailableRecruitCrewTypeConstraint(crewType);
  }

  public static AvailableNationCommand(commandClassName: string): Constraint {
    return new AvailableNationCommandConstraint(commandClassName);
  }

  public static NearNation(): Constraint {
    return new NearNationConstraint();
  }

  public static DisallowDiplomacyBetweenStatus(disallowStatus: Record<string, string>): Constraint {
    return new DisallowDiplomacyBetweenStatusConstraint(disallowStatus);
  }

  public static AllowDiplomacyBetweenStatus(allowStatus: string[], errorMsg: string): Constraint {
    return new AllowDiplomacyBetweenStatusConstraint(allowStatus, errorMsg);
  }

  public static ReqEnvValue(
    key: string,
    op: ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==",
    value: number,
    errorMsg: string
  ): Constraint {
    return new ReqEnvValueConstraint(key, op, value, errorMsg);
  }

  public static BeOpeningPart(): Constraint {
    return new BeOpeningPartConstraint();
  }

  public static NotOpeningPart(): Constraint {
    return new NotOpeningPartConstraint();
  }

  public static RemainCityTrust(actionName: string): Constraint {
    return new RemainCityTrustConstraint(actionName);
  }

  public static MustBeNPC(): Constraint {
    return new MustBeNPCConstraint();
  }

  public static AllowWar(): Constraint {
    return new AllowWarConstraint();
  }

  public static ReqNationAuxValue(
    key: string,
    keyNick: string,
    comp: ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==",
    reqVal: number | string,
    errMsg?: string
  ): Constraint {
    return new ReqNationAuxValueConstraint(key, keyNick, comp, reqVal, errMsg);
  }

  public static MustBeTroopLeader(): Constraint {
    return new MustBeTroopLeaderConstraint();
  }

  public static AllowJoinAction(): Constraint {
    return new AllowJoinActionConstraint();
  }

  public static ReqCityCapacity(key: string, keyNick: string, reqVal: number | string): Constraint {
    return new ReqCityCapacityConstraint(key, keyNick, reqVal);
  }
}
