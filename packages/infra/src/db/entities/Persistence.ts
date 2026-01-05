import { Entity, PrimaryColumn, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 스냅샷 메타데이터
 */
@Entity('snapshot_meta')
export class SnapshotMeta {
  @PrimaryColumn('uuid')
  snapshot_id!: string;

  @Column('text')
  profile!: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date;

  @Column({ type: 'datetime' })
  turn_time!: Date;

  @Column('text')
  checksum!: string;

  @Column('int')
  version!: number;
}

/**
 * 스냅샷 실제 데이터 (바이너리 블롭)
 */
@Entity('snapshot_blob')
export class SnapshotBlob {
  @PrimaryColumn('uuid')
  snapshot_id!: string;

  @PrimaryColumn('int')
  chunk_idx!: number;

  @Column({ type: 'blob', nullable: true })
  payload!: Buffer;
}

/**
 * 변경 저널 (Append-only)
 */
@Entity('journal')
export class Journal {
  @PrimaryGeneratedColumn('increment')
  journal_id!: number;

  @Column('text')
  profile!: string;

  @Column({ type: 'bigint' })
  seq!: string;

  @Column('text')
  type!: string;

  @Column({ type: 'simple-json' })
  payload!: any;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}

/**
 * 저널 오프셋 (복구 지점 추적)
 */
@Entity('journal_offset')
export class JournalOffset {
  @PrimaryColumn('text')
  profile!: string;

  @Column({ type: 'bigint' })
  last_seq!: string;

  @Column({ type: 'timestamp' })
  applied_at!: Date;
}
