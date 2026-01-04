import { DataSource } from 'typeorm';
import { ITurnRepository } from '@sammo-ts/logic';
import { GeneralTurn } from '../entities/GeneralTurn.js';
import { NationTurn } from '../entities/NationTurn.js';

/**
 * TypeORM 기반 턴 레포지토리 (Adapter)
 */
export class TypeOrmTurnRepository implements ITurnRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getNextTurn(generalId: number): Promise<{ action: string; arg: any } | null> {
    const repository = this.dataSource.getRepository(GeneralTurn);
    const turn = await repository.findOne({
      where: { general_id: generalId.toString() },
      order: { turn_idx: 'ASC' },
    });

    if (!turn) return null;
    return { action: turn.action, arg: turn.arg };
  }

  async consumeTurn(generalId: number): Promise<void> {
    const repository = this.dataSource.getRepository(GeneralTurn);
    const turn = await repository.findOne({
      where: { general_id: generalId.toString() },
      order: { turn_idx: 'ASC' },
    });

    if (turn) {
      await repository.remove(turn);
    }
  }

  async getNextNationTurn(nationId: number, officerLevel: number): Promise<{ action: string; arg: any } | null> {
    const repository = this.dataSource.getRepository(NationTurn);
    const turn = await repository.findOne({
      where: { nation_id: nationId.toString(), officer_level: officerLevel },
      order: { turn_idx: 'ASC' },
    });

    if (!turn) return null;
    return { action: turn.action, arg: turn.arg };
  }

  async consumeNationTurn(nationId: number, officerLevel: number): Promise<void> {
    const repository = this.dataSource.getRepository(NationTurn);
    const turn = await repository.findOne({
      where: { nation_id: nationId.toString(), officer_level: officerLevel },
      order: { turn_idx: 'ASC' },
    });

    if (turn) {
      await repository.remove(turn);
    }
  }
}
