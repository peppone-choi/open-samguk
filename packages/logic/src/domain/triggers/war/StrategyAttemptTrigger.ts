import type { WarUnit } from "../../specials/types.js";
import {
  PriorityWarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

/**
 * 계략 종류별 데미지 배수 테이블
 * 레거시: che_계략시도.php의 $tableToGeneral
 */
const MAGIC_TABLE_TO_GENERAL: Record<string, [number, number]> = {
  위보: [1.2, 1.1],
  매복: [1.4, 1.2],
  반목: [1.6, 1.3],
  화계: [1.8, 1.4],
  혼란: [2.0, 1.5],
};

/**
 * 도시 대상 계략 테이블
 * 레거시: che_계략시도.php의 $tableToCity
 */
const MAGIC_TABLE_TO_CITY: Record<string, [number, number]> = {
  급습: [1.2, 1.1],
  위보: [1.4, 1.2],
  혼란: [1.6, 1.3],
};

/**
 * 계략 시도 트리거
 * 레거시: legacy/hwe/sammo/WarUnitTrigger/che_계략시도.php
 *
 * - Priority: PRE + 300 (20300)
 * - 지력 기반 확률 계산
 * - 첫 페이즈에 지력 특화 장수면 확률 3배
 * - 계략 종류 랜덤 선택 후 성공/실패 판정
 */
export class StrategyAttemptTrigger implements PriorityWarUnitTrigger {
  readonly name = "계략시도";
  readonly priority = TriggerPriority.PRE + 300;
  readonly raiseType = RaiseType.NONE;

  private readonly baseSuccessProb: number;

  constructor(
    public readonly unit: WarUnit,
    baseSuccessProb: number = 0.7
  ) {
    this.baseSuccessProb = baseSuccessProb;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;
    const general = self.general;

    // 계략불가 스킬이 활성화되어 있으면 패스
    if (self.hasActivatedSkill("계략불가")) {
      return false;
    }

    // 이미 계략이 활성화되어 있으면 패스
    if (self.hasActivatedSkill("계략") || self.hasActivatedSkill("계략실패")) {
      return false;
    }

    // 지력 기반 계략 시도 확률 계산
    // 레거시: intel / 100 * crewType.magicCoef
    const intel = general.intel ?? 50;
    let magicTrialProb = intel / 100;

    // 첫 페이즈이고 지력 특화 장수면 확률 3배
    // 레거시: phase == 0 && rawIntel * 3 >= allStat
    if (ctx.phase === 0) {
      const leadership = general.leadership ?? 50;
      const strength = general.strength ?? 50;
      const allStat = leadership + strength + intel;
      if (intel * 3 >= allStat) {
        magicTrialProb *= 3;
      }
    }

    // 확률 체크
    if (!ctx.rand.nextBool(magicTrialProb)) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;

    // 상대가 도시인지 확인 (WarUnitCity 타입 체크)
    const isOpponentCity = !("general" in oppose);

    // 계략 종류 선택
    const magicTable = isOpponentCity ? MAGIC_TABLE_TO_CITY : MAGIC_TABLE_TO_GENERAL;
    const magicTypes = Object.keys(magicTable);
    const magic = ctx.rand.choice(magicTypes);
    const [successDamage, failDamage] = magicTable[magic];

    // 계략 성공 여부 판정
    const magicSuccessProb = this.baseSuccessProb;
    const success = ctx.rand.nextBool(magicSuccessProb);

    // 스킬 활성화
    self.activateSkill("계략시도");

    if (success) {
      self.activateSkill("계략");
      ctx.selfEnv["magic"] = [magic, successDamage];
    } else {
      self.activateSkill("계략실패");
      ctx.selfEnv["magic"] = [magic, failDamage];
    }

    // 전투 로그 추가
    if ("addBattleLog" in self) {
      (
        self as {
          addBattleLog: (entry: {
            phase: number;
            type: string;
            skillName: string;
            activated: boolean;
            magic?: string;
            success?: boolean;
          }) => void;
        }
      ).addBattleLog({
        phase: ctx.phase,
        type: "skill_attempt",
        skillName: "계략",
        activated: true,
        magic,
        success,
      });
    }

    const statusText = success ? "성공" : "실패";

    return {
      delta: {
        logs: {
          global: [`${self.general.name}의 ${magic} 계략 ${statusText}!`],
        },
      },
      continueExecution: true,
    };
  }
}
