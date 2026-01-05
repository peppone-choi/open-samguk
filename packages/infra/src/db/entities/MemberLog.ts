import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('member_log')
export class MemberLogEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint' })
  member_id!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  date!: Date;

  @Column({ type: 'text' })
  action_type!: string;

  @Column({ type: 'text' })
  action!: string;
}
