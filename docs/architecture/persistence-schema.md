# 영속성 스키마 (상세)

DB는 메모리 상태를 복구하기 위한 스냅샷과 변경 저널만 보장합니다. 이 문서는 영속성 테이블의 목적과 저장/복구 절차를 정의합니다.

## 설계 원칙

- 메모리 상태가 권위, DB는 복구용
- 변경 사항은 저널에 먼저 기록
- 스냅샷은 주기적 생성
- 스냅샷 + 저널 조합으로 복구

## 테이블 구성

### snapshot_meta

- 프로필별 최신 스냅샷 메타

필드:

- `snapshot_id` (uuid)
- `profile` (text)
- `created_at` (timestamptz)
- `turn_time` (timestamptz)
- `checksum` (text)
- `version` (int)

### snapshot_blob

- 스냅샷 본문 (압축 JSON 또는 바이너리)

필드:

- `snapshot_id` (uuid)
- `chunk_idx` (int)
- `payload` (bytea)

### journal

- 변경 이벤트 로그 (append-only)

필드:

- `journal_id` (bigserial)
- `profile` (text)
- `seq` (bigint)
- `type` (text)
- `payload` (jsonb)
- `created_at` (timestamptz)

### journal_offset

- 프로필별 마지막 적용 시퀀스

필드:

- `profile` (text)
- `last_seq` (bigint)
- `applied_at` (timestamptz)

## 저장 절차

1. 커맨드 적용 후 변경 이벤트를 `journal`에 기록
2. 일정 주기로 스냅샷을 생성하고 `snapshot_meta` 갱신
3. 스냅샷 생성 직후 `journal_offset` 업데이트

저널 기록은 커맨드 적용과 같은 트랜잭션에서 수행합니다.

## 복구 절차

1. `snapshot_meta`에서 최신 스냅샷 조회
2. `snapshot_blob` 조합 -> 메모리 상태 복원
3. `journal_offset` 이후의 `journal`을 재생

## 체크섬/버전

- `checksum`은 스냅샷 무결성 확인용
- `version`으로 스냅샷 포맷 버전 관리

## 보존 정책

- 스냅샷은 최근 N개 보관
- 저널은 마지막 스냅샷 이후 구간만 유지
- 오래된 저널은 컴팩션 또는 삭제
