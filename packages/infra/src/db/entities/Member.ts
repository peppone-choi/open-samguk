import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('member')
export class MemberEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'text', nullable: true })
  oauth_id?: string;

  @Column({ type: 'text', unique: true })
  username!: string;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text', default: 'NONE' })
  oauth_type!: string;

  @Column({ type: 'jsonb', nullable: true })
  oauth_info?: any;

  @Column({ type: 'timestamptz', nullable: true })
  token_valid_until?: Date;

  @Column({ type: 'text', nullable: true })
  password_hash?: string;

  @Column({ type: 'text', nullable: true })
  salt?: string;

  @Column({ type: 'jsonb', default: {} })
  meta!: any;

  @Column({ type: 'int', default: 0 })
  grade!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  reg_date!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}
