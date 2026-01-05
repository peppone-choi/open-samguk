import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('login_token')
export class LoginTokenEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Column({ type: 'bigint' })
  member_id!: string;

  @Column({ type: 'text' })
  base_token!: string;

  @Column({ type: 'text' })
  reg_ip!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  reg_date!: Date;

  @Column({ type: 'timestamptz' })
  expire_date!: Date;
}
