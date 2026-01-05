import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('err_log')
export class ErrLogEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint', nullable: true })
  member_id?: string;

  @Column({ type: 'text' })
  type!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'text', nullable: true })
  stack?: string;

  @Column({ type: 'jsonb', nullable: true })
  context?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}
