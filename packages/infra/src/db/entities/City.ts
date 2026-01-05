import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('city')
export class CityEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ default: 0 })
  nation_id!: number;

  @Column({ type: 'smallint', default: 1 })
  level!: number;

  @Column({ type: 'smallint', default: 1 })
  supply!: number;

  @Column({ type: 'smallint', default: 0 })
  front!: number;

  @Column({ default: 0 })
  pop!: number;

  @Column({ default: 0 })
  pop_max!: number;

  @Column({ default: 0 })
  agri!: number;

  @Column({ default: 0 })
  agri_max!: number;

  @Column({ default: 0 })
  comm!: number;

  @Column({ default: 0 })
  comm_max!: number;

  @Column({ default: 0 })
  secu!: number;

  @Column({ default: 0 })
  secu_max!: number;

  @Column({ default: 0 })
  def!: number;

  @Column({ default: 0 })
  def_max!: number;

  @Column({ default: 0 })
  wall!: number;

  @Column({ default: 0 })
  wall_max!: number;

  @Column({ default: 0 })
  trust!: number;

  @Column({ default: 0 })
  gold!: number;

  @Column({ default: 0 })
  rice!: number;

  @Column({ type: 'smallint', default: 0 })
  region!: number;

  @Column({ type: 'smallint', default: 0 })
  state!: number;

  @Column({ type: 'smallint', default: 0 })
  term!: number;

  @Column({ type: 'jsonb', default: '{}' })
  conflict!: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  meta!: Record<string, any>;
}
