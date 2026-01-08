import type { WarUnit } from "../../specials/types.js";
import {
  WarUnitTrigger,
  WarUnitTriggerContext,
  WarUnitTriggerResult,
  RaiseType,
  RaiseTypeValue,
  TriggerPriority,
} from "../../WarUnitTriggerRegistry.js";

export class SniperAttemptTrigger implements WarUnitTrigger {
  readonly name = "저격시도";
  readonly priority = TriggerPriority.PRE + 100;
  readonly raiseType: RaiseTypeValue;

  private readonly ratio: number;
  private readonly woundMin: number;
  private readonly woundMax: number;
  private readonly addAtmos: number;

  constructor(
    public readonly unit: WarUnit,
    raiseType: RaiseTypeValue = RaiseType.NONE,
    ratio: number = 0.3,
    woundMin: number = 5,
    woundMax: number = 15,
    addAtmos: number = 20
  ) {
    this.raiseType = raiseType;
    this.ratio = ratio;
    this.woundMin = woundMin;
    this.woundMax = woundMax;
    this.addAtmos = addAtmos;
  }

  attempt(ctx: WarUnitTriggerContext): boolean {
    const self = ctx.self;
    const oppose = ctx.oppose;

    if (self.phase !== 0 && oppose.phase !== 0) {
      return false;
    }

    if (oppose.phase < 0) {
      return false;
    }

    if (self.hasActivatedSkill("저격")) {
      return false;
    }

    if (self.hasActivatedSkill("저격불가")) {
      return false;
    }

    if (!ctx.rand.nextBool(this.ratio)) {
      return false;
    }

    return true;
  }

  actionWar(ctx: WarUnitTriggerContext): WarUnitTriggerResult {
    const self = ctx.self;

    self.activateSkill("저격");

    ctx.selfEnv["저격발동자"] = this.raiseType;
    ctx.selfEnv["woundMin"] = this.woundMin;
    ctx.selfEnv["woundMax"] = this.woundMax;
    ctx.selfEnv["addAtmos"] = this.addAtmos;

    return {
      delta: {
        logs: {
          global: [`${self.general.name}의 저격 시도!`],
        },
      },
      continueExecution: true,
    };
  }
}
