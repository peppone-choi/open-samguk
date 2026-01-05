import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('general')
export class GeneralEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  owner_id!: number;

  @Column()
  name!: string;

  @Column({ default: 0 })
  nation_id!: number;

  @Column({ default: 0 })
  city_id!: number;

  @Column({ default: 0 })
  troop_id!: number;

  @Column({ default: 1000 })
  gold!: number;

  @Column({ default: 1000 })
  rice!: number;

  @Column({ type: 'smallint', default: 50 })
  leadership!: number;

  @Column({ default: 0 })
  leadership_exp!: number;

  @Column({ type: 'smallint', default: 50 })
  strength!: number;

  @Column({ default: 0 })
  strength_exp!: number;

  @Column({ type: 'smallint', default: 50 })
  intel!: number;

  @Column({ default: 0 })
  intel_exp!: number;

  @Column({ type: 'smallint', default: 50 })
  politics!: number;

  @Column({ default: 0 })
  politics_exp!: number;

  @Column({ type: 'smallint', default: 50 })
  charm!: number;

  @Column({ default: 0 })
  charm_exp!: number;

  @Column({ type: 'smallint', default: 0 })
  injury!: number;

  @Column({ default: 0 })
  experience!: number;

  @Column({ default: 0 })
  dedication!: number;

  @Column({ type: 'smallint', default: 0 })
  officer_level!: number;

  @Column({ type: 'integer', default: 0 })
  officer_city!: number;

  @Column({ default: 0 })
  recent_war!: number;

  @Column({ default: 0 })
  crew!: number;

  @Column({ type: 'smallint', default: 0 })
  crew_type!: number;

  @Column({ type: 'smallint', default: 0 })
  train!: number;

  @Column({ type: 'smallint', default: 0 })
  atmos!: number;

  @Column({ type: 'jsonb', default: '{}' })
  dex!: Record<number, number>;

  @Column({ type: 'smallint', default: 20 })
  age!: number;

  @Column({ type: 'smallint', default: 180 })
  born_year!: number;

  @Column({ type: 'smallint', default: 300 })
  dead_year!: number;

  @Column({ default: 'None' })
  special!: string;

  @Column({ type: 'smallint', default: 0 })
  spec_age!: number;

  @Column({ default: 'None' })
  special2!: string;

  @Column({ type: 'smallint', default: 0 })
  spec_age2!: number;

  @Column({ default: 'None' })
  weapon!: string;

  @Column({ default: 'None' })
  book!: string;

  @Column({ default: 'None' })
  horse!: string;

  @Column({ default: 'None' })
  item!: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  turn_time!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  recent_war_time!: Date | null;

  @Column({ type: 'smallint', default: 0 })
  make_limit!: number;

  @Column({ type: 'smallint', default: 0 })
  kill_turn!: number;

  @Column({ type: 'smallint', default: 0 })
  block!: number;

  @Column({ type: 'smallint', default: 80 })
  defence_train!: number;

  @Column({ type: 'smallint', default: 0 })
  tournament_state!: number;

  @Column({ type: 'jsonb', default: '{}' })
  last_turn!: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  meta!: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  penalty!: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
