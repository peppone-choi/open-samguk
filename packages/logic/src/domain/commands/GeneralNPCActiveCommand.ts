import { RandUtil } from '@sammo-ts/common';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * NPC 능동 커맨드
 * 레거시: che_NPC능동
 */
export class GeneralNPCActiveCommand extends GeneralCommand {
    readonly actionName = 'NPC능동';

    constructor() {
        super();
        this.minConditionConstraints = [];
    }

    override execute(world: WorldSnapshot, generalId: number, args: Record<string, unknown>, rng: RandUtil): WorldDelta {
        // TODO: NPC 능동 커맨드 구현
        return { mutations: [] };
    }
}
