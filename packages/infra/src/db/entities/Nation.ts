import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('nation')
export class NationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  color!: string;

  @Column({ default: 0 })
  capital_city_id!: number;

  @Column({ default: 0 })
  gold!: number;

  @Column({ default: 0 })
  rice!: number;

  @Column({ type: 'real', default: 0 })
  tech!: number;

  @Column({ default: 0 })
  power!: number;

  @Column({ type: 'smallint', default: 1 })
  level!: number;

  @Column({ default: 'che_중립' })
  type_code!: string;

  @Column({ type: 'smallint', default: 0 })
  scout_level!: number;

  @Column({ type: 'smallint', default: 0 })
  war_state!: number;

  @Column({ type: 'smallint', default: 36 })
  strategic_cmd_limit!: number;

  @Column({ type: 'smallint', default: 72 })
  surrender_limit!: number;

  @Column({ type: 'jsonb', default: '{}' })
  spy!: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  meta!: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
