import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('api_log')
export class ApiLogEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint', nullable: true })
  member_id?: string;

  @Column({ type: 'text' })
  method!: string;

  @Column({ type: 'text' })
  path!: string;

  @Column({ type: 'jsonb', nullable: true })
  query?: any;

  @Column({ type: 'jsonb', nullable: true })
  body?: any;

  @Column({ type: 'int' })
  status_code!: number;

  @Column({ type: 'int' })
  response_time!: number;

  @Column({ type: 'text', nullable: true })
  ip?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
