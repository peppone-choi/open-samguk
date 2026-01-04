# 레거시 AI

레거시 AI는 NPC 및 자동 운영 정책을 생성합니다. 포팅 시 AI 정책과 커맨드 선택 규칙을 동일하게 유지하는 것이 목표입니다.

## 레거시 위치

- `legacy/hwe/sammo/GeneralAI.php`
- `legacy/hwe/sammo/AutorunGeneralPolicy.php`
- `legacy/hwe/sammo/AutorunNationPolicy.php`

## 주요 책임

- NPC 장수 커맨드 선택
- 국가 운영 자동화
- 비활성 유저의 자동 행동

## 입력

- `general`, `nation`, `city` 상태
- `nation_env` 및 `game_env` 환경 값
- 결정론 RNG (시드: hiddenSeed + year/month + generalId)

## 내부 구조 (요약)

- `updateInstance()`
  - 도시/국가 상태 로드
  - 정책 로딩 (`npc_general_policy`, `npc_nation_policy`)
  - 외교 상태 계산
- 장수 유형 계산:
  - `t무장`, `t지장`, `t통솔장`
- 외교 단계:
  - `d평화`, `d선포`, `d징병`, `d직전`, `d전쟁`

## 출력

- `general_turn`, `nation_turn` 커맨드
- 로그/메시지 기록

## 포팅 포인트

- AI 선택 로직은 메모리 상태 기반으로 재구현
- RNG 시드는 명시적으로 관리
- AI 결정 로그를 남겨 디버깅 가능하게 유지
