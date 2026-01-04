# 레거시 장수(General) 모델

장수 엔티티와 관련 로직을 상세히 정리합니다.

## 레거시 위치

- `legacy/hwe/sammo/General.php`
- `legacy/hwe/sammo/GeneralBase.php`
- `legacy/hwe/sammo/GeneralLite.php`
- `legacy/hwe/sammo/LazyVarUpdater.php`
- `legacy/hwe/sammo/LazyVarAndAuxUpdater.php`

## 주요 필드(요약)

- 소속/위치: `nation`, `city`, `troop`
- 자원/스탯: `gold`, `rice`, `leadership`, `strength`, `intel`
- 상태: `injury`, `turntime`, `recent_war`, `killturn`, `block`
- 메타: `last_turn`, `aux`, `penalty` (JSON)

## 내부 구조

- `General`은 DB 레코드와 계산 상태를 함께 보유
- `GeneralLite`는 경량 조회 전용 모델
- `LazyVarUpdater`는 변경된 필드만 업데이트

## 턴 시간 갱신 규칙(요약)

- `killturn` 0 이하: NPC 전환 또는 삭제
- 은퇴 연령 도달 시 리셋/기록
- `nextTurnTimeBase`가 있으면 보정 적용

## 포팅 포인트

- 장수는 메모리 상주 핵심 엔티티
- `aux`/`penalty` JSON 직렬화 규칙 통일
- Lazy update 패턴을 상태 변경 추적에 반영
