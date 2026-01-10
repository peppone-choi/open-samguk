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
 * 공통 제약 조건 생성 헬퍼 클래스
 * 게임 내의 다양한 커맨드에서 공통적으로 사용되는 검사 로직(Constraint)을 생성하는 정적 메서드들을 제공합니다.
 */
export class ConstraintHelper {
  /**
   * 행위자가 중립(재야) 상태가 아니어야 함을 검사합니다.
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
   * 장수의 소지 자금(금)이 일정 금액 이상이어야 함을 검사합니다.
   * @param amount 요구 금액
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
   * 장수의 소지 군량(쌀)이 일정량 이상이어야 함을 검사합니다.
   * @param amount 요구 군량
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
   * 장수가 보유한 병사가 존재해야 함을 검사합니다.
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
   * 장수의 훈련도가 최대치에 도달하지 않았는지 확인합니다.
   * @param maxTrain 최대 훈련도
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
   * 장수의 사기치가 최대치에 도달하지 않았는지 확인합니다.
   * @param maxAtmos 최대 사기치
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
   * 장수에게 특정 페널티(예: 행동 불능 등)가 없는지 확인합니다.
   * @param penaltyKey 페널티 종류
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
   * 명령 수행 장소(도시)가 비어있는 공백지가 아닌지 확인합니다.
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
   * 도시의 보급 상태가 활성화(연결)되어 있는지 확인합니다.
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
   * 목적지 도시가 현재 위치에서 특정 거리 내에 있는지 확인합니다.
   * @param distance 최대 허용 거리 (기본 1)
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
   * 명령의 대상이 되는 장수(DestGeneral)가 실존하는지 확인합니다.
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
   * 대상 장수가 행위자와 동일한 국가 소속인지 확인합니다.
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
   * 대상 장수가 행위자와 다른 국가 소속인지 확인합니다.
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
   * 장수의 관직 레벨(OfficerLevel)이 일정 수준 이상인지 확인합니다.
   * @param minLevel 최소 요구 레벨
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
   * 행위자가 현재 어떤 국가에도 소속되지 않은 재야 상태인지 확인합니다.
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

  /**
   * 행위자가 해당 국가의 군주(Lord)인지 확인합니다.
   */
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

  /**
   * 소속 국가가 방랑군(Wandering) 상태인지 확인합니다.
   */
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

  /**
   * 소속 국가가 방랑군 상태가 아님을 확인합니다.
   */
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

  /**
   * 도시의 특정 내정 수치(농업, 상업 등)가 최대치에 도달하지 않았는지 확인합니다.
   * @param key 내정 종류 (agri, comm, secu, def, wall)
   * @param actionName 명령 이름 (에러 메시지용)
   */
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

  /**
   * 국가 소속 장수의 수가 일정 인원 이상인지 확인합니다.
   * @param minCount 최소 요구 인원
   */
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

  /**
   * 유효한 등용 권유 서신이 존재하는지 확인합니다.
   */
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

  /**
   * 해당 도시가 건국이 가능한 규모인지 확인합니다.
   */
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

  /**
   * 도시의 치안 수치가 일정 수준 이상인지 확인합니다.
   * @param reqSecu 최소 요구 치안
   */
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

  /**
   * 도시에 상인(Trader)이 존재하는지 확인합니다.
   * @param npcType NPC 타입 (필요한 경우)
   */
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

  /**
   * 무조건 실패하는 제약 조건을 생성합니다. (UI에서 특정 상황 비활성화용)
   * @param reason 실패 사유
   */
  public static AlwaysFail(reason: string): Constraint {
    return {
      name: "AlwaysFail",
      requires: () => [],
      test: () => ({ kind: "deny", reason }),
    };
  }

  /**
   * 도시의 민심(Trust) 수치가 최대치에 도달하지 않았는지 확인합니다.
   * @param actionName 명령 이름
   */
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

  /**
   * 국가의 메타 정보(Record) 기반 조건을 검사합니다.
   * @param key 메타 키
   * @param expectedValue 기대값
   * @param compare 비교 방식
   * @param reason 실패 사유
   */
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

  // --- 외부 클래스 기반 조건 래퍼들 ---

  /** 군주가 아니어야 함 */
  public static NotLord(): Constraint {
    return new NotLordConstraint();
  }

  /** 수뇌부(Lord/Chief)여야 함 */
  public static BeChief(): Constraint {
    return new BeChiefConstraint();
  }

  /** 수뇌부가 아니어야 함 */
  public static NotChief(): Constraint {
    return new NotChiefConstraint();
  }

  /** 공백지 상태여야 함 */
  public static NotOccupiedCity(): Constraint {
    return new NotOccupiedCityConstraint();
  }

  /** 중립 도시여야 함 */
  public static NeutralCity(): Constraint {
    return new NeutralCityConstraint();
  }

  /** 대상 도시가 중립 상태가 아니어야 함 */
  public static NotNeutralDestCity(): Constraint {
    return new NotNeutralDestCityConstraint();
  }

  /** 대상 도시가 점령된 상태여야 함 */
  public static OccupiedDestCity(): Constraint {
    return new OccupiedDestCityConstraint();
  }

  /** 대상 도시가 점령되지 않은 상태여야 함 */
  public static NotOccupiedDestCity(): Constraint {
    return new NotOccupiedDestCityConstraint();
  }

  /** 대상 도시가 보급 연결된 상태여야 함 */
  public static SuppliedDestCity(): Constraint {
    return new SuppliedDestCityConstraint();
  }

  /** 장수의 특정 스탯(Stat) 값을 요구함 */
  public static ReqGeneralValue(
    key: string,
    keyNick: string,
    comp: ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==",
    reqVal: number,
    errMsg?: string
  ): Constraint {
    return new ReqGeneralValueConstraint(key, keyNick, comp, reqVal, errMsg);
  }

  /** 국가의 특정 수치 값을 요구함 */
  public static ReqNationValue(
    key: string,
    keyNick: string,
    comp: ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==",
    reqVal: number | string,
    errMsg?: string
  ): Constraint {
    return new ReqNationValueConstraint(key, keyNick, comp, reqVal, errMsg);
  }

  /** 현재 도시의 특정 수치 값을 요구함 */
  public static ReqCityValue(
    key: string,
    keyNick: string,
    comp: ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==",
    reqVal: number | string,
    errMsg?: string
  ): Constraint {
    return new ReqCityValueConstraint(key, keyNick, comp, reqVal, errMsg);
  }

  /** 대상 도시의 특정 수치 값을 요구함 */
  public static ReqDestCityValue(
    key: string,
    keyNick: string,
    comp: ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==",
    reqVal: number | string,
    errMsg?: string
  ): Constraint {
    return new ReqDestCityValueConstraint(key, keyNick, comp, reqVal, errMsg);
  }

  /** 대상 국가의 특정 수치 값을 요구함 */
  public static ReqDestNationValue(
    key: string,
    keyNick: string,
    comp: ">" | ">=" | "==" | "<=" | "<" | "!=" | "===" | "!==",
    reqVal: number | string,
    errMsg?: string
  ): Constraint {
    return new ReqDestNationValueConstraint(key, keyNick, comp, reqVal, errMsg);
  }

  /** 국가 자금(Gold) 요구 */
  public static ReqNationGold(amount: number): Constraint {
    return new ReqNationGoldConstraint(amount);
  }

  /** 국가 군량(Rice) 요구 */
  public static ReqNationRice(amount: number): Constraint {
    return new ReqNationRiceConstraint(amount);
  }

  /** 수도가 아니어야 함 */
  public static NotCapital(allowChief: boolean = false): Constraint {
    return new NotCapitalConstraint(allowChief);
  }

  /** 현재 도시와 대상 도시가 달라야 함 */
  public static NotSameDestCity(): Constraint {
    return new NotSameDestCityConstraint();
  }

  /** 대상 국가가 실존해야 함 */
  public static ExistsDestNation(): Constraint {
    return new ExistsDestNationConstraint();
  }

  /** 대상 국가가 행위자의 소속 국가와 달라야 함 */
  public static DifferentDestNation(): Constraint {
    return new DifferentDestNationConstraint();
  }

  /** 허용된 외교 관계 상태여야 함 */
  public static AllowDiplomacyStatus(allowStatus: string[], errorMessage: string): Constraint {
    return new AllowDiplomacyStatusConstraint(allowStatus, errorMessage);
  }

  /** 금지된 외교 관계 상태가 아니어야 함 */
  public static DisallowDiplomacyStatus(disallowStatus: Record<string, string>): Constraint {
    return new DisallowDiplomacyStatusConstraint(disallowStatus);
  }

  /** 특정 기간(Term) 이상의 외교 관계를 요구함 */
  public static AllowDiplomacyWithTerm(
    allowDipCode: string,
    allowMinTerm: number,
    errorMessage: string
  ): Constraint {
    return new AllowDiplomacyWithTermConstraint(allowDipCode, allowMinTerm, errorMessage);
  }

  /** 임관 허용 기간/조건을 확인 */
  public static AllowJoinDestNation(relYear: number): Constraint {
    return new AllowJoinDestNationConstraint(relYear);
  }

  /** 교전 중인 도시인지 확인 */
  public static BattleGroundCity(): Constraint {
    return new BattleGroundCityConstraint();
  }

  /** 반란 가능 여부 확인 */
  public static AllowRebellion(): Constraint {
    return new AllowRebellionConstraint();
  }

  /** 국가명 중복 여부 확인 */
  public static CheckNationNameDuplicate(targetName: string): Constraint {
    return new CheckNationNameDuplicateConstraint(targetName);
  }

  /** 임관 가능한 국가가 존재하는지 확인 */
  public static ExistsAllowJoinNation(relYear: number, excludeList: number[]): Constraint {
    return new ExistsAllowJoinNationConstraint(relYear, excludeList);
  }

  /** 본국과 연결된 경로가 존재하는지 확인 */
  public static HasRoute(): Constraint {
    return new HasRouteConstraint();
  }

  /** 적국을 거쳐서라도 경로가 존재하는지 확인 */
  public static HasRouteWithEnemy(): Constraint {
    return new HasRouteWithEnemyConstraint();
  }

  /** 장수의 병사 수 여유분 확인 */
  public static ReqGeneralCrewMargin(targetCrewType: number): Constraint {
    return new ReqGeneralCrewMarginConstraint(targetCrewType);
  }

  /** 부대원 수 요구 사항 확인 */
  public static ReqTroopMembers(): Constraint {
    return new ReqTroopMembersConstraint();
  }

  /** 전략 명령 가능 여부 확인 */
  public static AllowStrategicCommand(): Constraint {
    return new AllowStrategicCommandConstraint();
  }

  /** 전략 명령의 턴 리미트 확인 */
  public static AvailableStrategicCommand(turnLimit: number): Constraint {
    return new AvailableStrategicCommandConstraint(turnLimit);
  }

  /** 커스텀 콜백 기반 조건 확인 */
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
    return new ReqNationAuxValueConstraint(
      key,
      keyNick,
      comp,
      reqVal,
      errMsg ?? `${keyNick} 조건이 맞지 않습니다.`
    );
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
