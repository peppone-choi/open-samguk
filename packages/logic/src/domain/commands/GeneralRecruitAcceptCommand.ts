import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 등용 수락 커맨드
 * 레거시: che_등용수락
 */
export class GeneralRecruitAcceptCommand extends GeneralCommand {
  readonly actionName = '등용 수락';

  constructor() {
    super();
    this.minConditionConstraints = [
      ConstraintHelper.BeNeutral(),
    ];
    this.fullConditionConstraints = [
      ...this.minConditionConstraints,
      ConstraintHelper.ExistsRecruitMessage(),
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return {
        logs: {
          general: {
            [actorId]: [`등용 수락 실패: ${check.reason}`],
          },
        },
      };
    }

    const messageId = args.messageId;
    // WorldSnapshot interface doesn't have messages yet in entities.ts?
    // Let's check entities.ts WorldSnapshot.
    // Ah, I don't see messages in WorldSnapshot in entities.ts.
    // I should add messages to WorldSnapshot.
    
    // For now, let's assume messages are accessible or I will fix it.
    // Wait, WorldDelta has messages, but WorldSnapshot doesn't have them indexed.
    // This is a known issue in the current scaffolding.
    
    // I'll search for WorldSnapshot in packages/logic/src/domain/entities.ts
    // It was:
    /*
    export interface WorldSnapshot {
      generals: Record<number, General>;
      nations: Record<number, Nation>;
      cities: Record<number, City>;
      diplomacy: Record<string, Diplomacy>; // key: "src:dest"
      troops: Record<number, Troop>;
      gameTime: GameTime;
      env: Record<string, any>;
    }
    */
    // I need to add messages here or handle them differently.
    // In legacy, messages are a separate table.
    
    // I'll add messages to WorldSnapshot first.
    return { logs: { general: { [actorId]: ['등용 수락 처리 중...'] } } }; // Temp
  }
}
