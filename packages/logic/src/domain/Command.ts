import { RandUtil } from "@sammo-ts/common";
import {
  Constraint,
  ConstraintContext,
  ConstraintResult,
  RequirementKey,
  StateView,
} from "./Constraint.js";
import { WorldSnapshot, WorldDelta } from "./entities.js";

// 기본 커맨드 인터페이스
export interface Command {
  readonly actionName: string;
  getConstraints(ctx: ConstraintContext): Constraint[];
  checkConstraints(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
    mode?: "full" | "precheck",
  ): ConstraintResult;
  run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
  ): WorldDelta;
}

/**
 * WorldSnapshot을 기반으로 한 StateView 구현체
 */
export class SnapshotStateView implements StateView {
  constructor(private snapshot: WorldSnapshot) {}

  has(req: RequirementKey): boolean {
    return this.get(req) !== null;
  }

  get(req: RequirementKey): any | null {
    switch (req.kind) {
      case "general":
      case "destGeneral":
        return this.snapshot.generals[req.id] || null;
      case "city":
      case "destCity":
        return this.snapshot.cities[req.id] || null;
      case "nation":
      case "destNation":
        return this.snapshot.nations[req.id] || null;
      default:
        return null;
    }
  }
}

// 장수 커맨드 베이스 클래스
export abstract class GeneralCommand implements Command {
  abstract readonly actionName: string;

  protected minConditionConstraints: Constraint[] = [];
  protected fullConditionConstraints: Constraint[] = [];

  getConstraints(ctx: ConstraintContext): Constraint[] {
    return ctx.mode === "full"
      ? this.fullConditionConstraints
      : this.minConditionConstraints;
  }

  /**
   * 제약 조건을 검사한다.
   */
  public checkConstraints(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
    mode: "full" | "precheck" = "full",
  ): ConstraintResult {
    const general = snapshot.generals[actorId];
    const ctx: ConstraintContext = {
      actorId,
      cityId: general?.cityId,
      nationId: general?.nationId,
      args,
      env: {}, // TODO: env 주입
      mode,
    };

    const view = new SnapshotStateView(snapshot);
    const constraints = this.getConstraints(ctx);

    for (const constraint of constraints) {
      const result = constraint.test(ctx, view);
      if (result.kind !== "allow") {
        return result;
      }
    }

    return { kind: "allow" };
  }

  abstract run(
    rng: RandUtil,
    snapshot: WorldSnapshot,
    actorId: number,
    args: Record<string, any>,
  ): WorldDelta;
}
