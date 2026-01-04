import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

/**
 * 국가 턴 예약 정보
 */
@Entity('nation_turn')
@Unique(['nation_id', 'officer_level', 'turn_idx'])
export class NationTurn {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column('bigint')
  nation_id!: string;

  @Column('int')
  officer_level!: number; // 5: 군주, 4: 태수/사령관 등 (레거시 규칙)

  @Column('int')
  turn_idx!: number;

  @Column('text')
  action!: string;

  @Column({ type: 'simple-json' })
  arg!: any;
}
