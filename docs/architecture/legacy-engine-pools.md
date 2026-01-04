# 레거시 장수 풀/선택

장수 생성 풀과 토큰 기반 선택 흐름을 정리합니다.

## 레거시 위치

- `legacy/hwe/sammo/GeneralPool/*`
- `legacy/hwe/sammo/AbsGeneralPool.php`
- `legacy/hwe/sammo/AbsFromUserPool.php`

## 관련 테이블

- `select_pool`
- `select_npc_token`

## 테이블 필드 요약

`select_pool`:

- `unique_name`, `owner`, `general_id`
- `reserved_until`, `info`

`select_npc_token`:

- `owner`, `valid_until`, `pick_more_from`
- `pick_result` (JSON)
- `nonce`

## 흐름 요약

1) 이름 예약 (`select_pool`)
2) 후보 생성/선택 (`select_npc_token`)
3) 장수 생성 및 초기 배치

## 포팅 포인트

- 이름 중복 방지 및 예약 만료 정책 필요
- 메모리 상태에서 풀 관리
- 생성 결과는 즉시 영속화
