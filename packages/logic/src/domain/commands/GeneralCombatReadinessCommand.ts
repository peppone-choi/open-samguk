import { RandUtil } from '@sammo-ts/common';
import { GameConst } from '../GameConst.js';
import { GeneralCommand } from '../Command.js';
import { WorldSnapshot, WorldDelta } from '../entities.js';
import { General } from '../models/General.js';
import { ConstraintHelper } from '../ConstraintHelper.js';

/**
 * 전투태세 커맨드 (3턴 연속)
 * 레거시: che_전투태세
 */
export class GeneralCombatReadinessCommand extends GeneralCommand {
  readonly actionName = '전투태세';

  constructor() {
    super();
    this.fullConditionConstraints = [
      ConstraintHelper.NotBeNeutral(),
      ConstraintHelper.NotWanderingNation(),
      ConstraintHelper.OccupiedCity(),
      ConstraintHelper.ReqGeneralCrew(),
      ConstraintHelper.ReqGeneralTrainMargin(GameConst.maxTrainByCommand - 10),
      ConstraintHelper.ReqGeneralAtmosMargin(GameConst.maxAtmosByCommand - 10),
    ];
  }

  run(rng: RandUtil, snapshot: WorldSnapshot, actorId: number, args: Record<string, any>): WorldDelta {
    const check = this.checkConstraints(rng, snapshot, actorId, args, 'full');
    if (check.kind === 'deny') {
      return { logs: { general: { [actorId]: [`전투태세 실패: ${check.reason}`] } } };
    }

    const iGeneral = snapshot.generals[actorId];
    if (!iGeneral) throw new Error(`장수 ${actorId}를 찾을 수 없습니다.`);

    const iNation = snapshot.nations[iGeneral.nationId];
    if (!iNation) throw new Error(`국가 ${iGeneral.nationId}를 찾을 수 없습니다.`);

    // Check last turn to determine progress
    const lastTurn = iGeneral.lastTurn || {};
    const lastCommand = lastTurn.command;
    const lastTerm = lastTurn.term || 0;

    let currentTerm = 1;
    if (lastCommand === this.actionName && lastTerm < 3) {
      currentTerm = lastTerm + 1;
    }

    const reqTurn = 3;

    // Training in progress
    if (currentTerm < reqTurn) {
      return {
        generals: {
          [actorId]: {
            lastTurn: {
              command: this.actionName,
              term: currentTerm,
              args: args,
            },
          },
        },
        logs: {
          general: { [actorId]: [`병사들을 열심히 훈련중... (${currentTerm}/3)`] },
        },
      };
    }

    // Training complete (term = 3)
    const general = new General(iGeneral);
    const crew = iGeneral.crew ?? 0;

    // Calculate tech cost multiplier
    const techCost = 1 + (iNation.tech ?? 0) * 0.01;
    const goldCost = Math.round((crew / 100) * 3 * techCost);

    // Increase train and atmos
    const maxTrain = GameConst.maxTrainByCommand - 5; // 95
    const maxAtmos = GameConst.maxAtmosByCommand - 5; // 95

    const newTrain = Math.max(iGeneral.train ?? 0, maxTrain);
    const newAtmos = Math.max(iGeneral.atmos ?? 0, maxAtmos);

    // Increase dex (crew type proficiency)
    const crewType = iGeneral.crewType ?? 0;
    const dexIncrease = Math.round((crew / 100) * 3);
    const currentDex = (iGeneral.dex ?? {})[crewType] || 0;

    const exp = 100 * 3;
    const ded = 70 * 3;

    const generalDelta = {
      experience: (iGeneral.experience ?? 0) + exp,
      dedication: (iGeneral.dedication ?? 0) + ded,
      train: newTrain,
      atmos: newAtmos,
      gold: (iGeneral.gold ?? 0) - goldCost,
      dex: {
        ...iGeneral.dex,
        [crewType]: currentDex + dexIncrease,
      },
      leadershipExp: (iGeneral.leadershipExp ?? 0) + 3,
      lastTurn: {
        command: this.actionName,
        term: currentTerm,
        args: args,
      },
    };

    return {
      generals: { [actorId]: generalDelta },
      logs: {
        general: { [actorId]: [`전투태세 완료! (${currentTerm}/3)`] },
      },
    };
  }
}
