import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";
import { WarStatHelper } from "../../WarStatHelper.js";

/**
 * 계략 종류별 데미지 배수 테이블
 */
const MAGIC_TABLE_TO_GENERAL: Record<string, [number, number]> = {
  위보: [1.2, 1.1],
  매복: [1.4, 1.2],
  반목: [1.6, 1.3],
  화계: [1.8, 1.4],
  혼란: [2.0, 1.5],
};

const MAGIC_TABLE_TO_CITY: Record<string, [number, number]> = {
  급습: [1.2, 1.1],
  위보: [1.4, 1.2],
  혼란: [1.6, 1.3],
};

/**
 * 계략 시도 트리거
 */
export class StrategyAttemptTrigger implements WarUnitTrigger {
  readonly name = "계략시도";
  readonly priority = TriggerPriority.PRE + 300;
  readonly raiseType = RaiseType.NONE;

  private readonly magicTrialProb: number | ((unit: WarUnit, ctx: WarUnitTriggerContext) => number);
  private readonly magicSuccessProb:
    | number
    | ((unit: WarUnit, ctx: WarUnitTriggerContext) => number);

  constructor(
    public readonly unit: WarUnit,
    magicTrialProb?: number | ((unit: WarUnit, ctx: WarUnitTriggerContext) => number),
    magicSuccessProb?: number | ((unit: WarUnit, ctx: WarUnitTriggerContext) => number)
  ) {
    this.magicTrialProb = magicTrialProb ?? ((u) => (u.getGeneral().intel ?? 50) / 100);
    this.magicSuccessProb = magicSuccessProb ?? 0.7;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;

    if (self.hasActivatedSkill("계략불가")) {
      return false;
    }

    if (self.hasActivatedSkill("계략") || self.hasActivatedSkill("계략실패")) {
      return false;
    }

    let trialProb =
      typeof this.magicTrialProb === "function"
        ? this.magicTrialProb(self, ctx)
        : this.magicTrialProb;

    // 첫 페이즈 지력 특화 보정
    if (ctx.phase === 0 && typeof this.magicTrialProb !== "function") {
      const general = self.getGeneral();
      const intel = general.intel ?? 50;
      const allStat = (general.leadership ?? 50) + (general.strength ?? 50) + intel;
      if (intel * 3 >= allStat) trialProb *= 3;
    }

    // 아이템 보정 적용 (계략 시도 확률)
    trialProb = WarStatHelper.calcStat(self, "warMagicTrialProb", trialProb, { phase: ctx.phase });

    if (!ctx.rand.nextBool(trialProb)) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;
    const oppose = ctx.oppose;
    const isOpponentCity = !("getGeneral" in oppose) || (oppose as any).city;

    const magicTable = isOpponentCity ? MAGIC_TABLE_TO_CITY : MAGIC_TABLE_TO_GENERAL;
    const magicTypes = Object.keys(magicTable);
    const magic = ctx.rand.choice(magicTypes);
    let [successDamage, failDamage] = magicTable[magic];

    let successProb =
      typeof this.magicSuccessProb === "function"
        ? this.magicSuccessProb(self, ctx)
        : this.magicSuccessProb;

    // 아이템 보정 적용 (계략 성공 확률 및 데미지)
    successProb = WarStatHelper.calcStat(self, "warMagicSuccessProb", successProb, {
      phase: ctx.phase,
    });
    successDamage = WarStatHelper.calcStat(self, "warMagicSuccessDamage", successDamage, {
      phase: ctx.phase,
    });
    failDamage = WarStatHelper.calcStat(self, "warMagicFailDamage", failDamage, {
      phase: ctx.phase,
    });

    const success = ctx.rand.nextBool(successProb);

    self.activateSkill("계략시도");

    if (success) {
      self.activateSkill("계략");
      ctx.selfEnv["magic"] = [magic, successDamage];
    } else {
      self.activateSkill("계략실패");
      ctx.selfEnv["magic"] = [magic, failDamage];
    }

    if ("addBattleLog" in self) {
      (self as any).addBattleLog({
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
