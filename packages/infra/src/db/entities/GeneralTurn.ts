import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

/**
 * 장수 턴 예약 정보
 */
@Entity('general_turn')
@Unique(['general_id', 'turn_idx'])
export class GeneralTurn {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column('bigint')
  general_id!: string;

  @Column('int')
  turn_idx!: number;

  @Column('text')
  action!: string;

  @Column({ type: 'simple-json' })
  arg!: any;
}
