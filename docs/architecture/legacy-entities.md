# 레거시 엔티티 개요

레거시 스키마를 기준으로 핵심 엔티티와 관계를 요약합니다. 포팅 구현에서 메모리 상태 모델과 인덱스 설계를 직접 도출할 수 있도록 내부 구조와 필드를 구체화합니다.

## 데이터 소스

- 스키마: `legacy/hwe/sql/schema.sql`
- 계정 스키마: `legacy/f_install/sql/common_schema.sql`

## 메모리 상태 모델 (권장)

```txt
WorldState
  - generals: Map<generalId, GeneralState>
  - nations: Map<nationId, NationState>
  - cities: Map<cityId, CityState>
  - troops: Map<generalId, TroopState>
  - diplomacy: Map<(nationId,nationId), DiplomacyState>
  - messages: MailboxIndex
  - auctions: AuctionState
  - events: EventState
  - env: GameEnvState
  - indexes: derived indices
```

필수 인덱스:

- `generalsByNation`, `generalsByCity`
- `citiesByNation`, `frontCities`, `supplyCities`
- `turnQueue` (turntime 정렬)

## 엔티티 상세

### General (장수)

주요 테이블:

- `general`, `general_turn`, `general_access_log`, `rank_data`

핵심 필드(요약):

- 소속/위치: `nation`, `city`, `troop`
- 자원/스탯: `gold`, `rice`, `leadership`, `strength`, `intel`
- 상태: `injury`, `turntime`, `recent_war`, `killturn`, `block`
- 메타: `last_turn`, `aux`, `penalty` (JSON)

메모리 구조 권장:

- `GeneralState`는 raw 필드 + 계산 필드 분리
- `last_turn`은 턴 예약/대체 커맨드 결정에 사용

### Nation (국가)

주요 테이블:

- `nation`, `nation_turn`, `nation_env`

핵심 필드(요약):

- 재정/정책: `gold`, `rice`, `bill`, `rate`, `secretlimit`
- 상태: `war`, `tech`, `power`, `level`
- 메타: `spy`, `aux` (JSON)

메모리 구조 권장:

- `NationState`는 경제/정책/전쟁 상태를 포함
- `nation_env`는 정책/AI 상태 저장소

### City (도시)

주요 테이블:

- `city`

핵심 필드(요약):

- 경제/인구: `pop`, `agri`, `comm`, `secu`, `trade`
- 방어: `def`, `wall`
- 상태: `nation`, `front`, `state`, `term`
- 메타: `conflict` (JSON)

메모리 구조 권장:

- 국가별 도시 목록 인덱스 유지
- 전선/공급 도시 인덱스 유지

### Troop (부대)

주요 테이블:

- `troop`

핵심 필드(요약):

- `troop_leader`, `nation`, `name`

메모리 구조 권장:

- 리더 ID 기준 단일 인덱스

### Diplomacy (외교)

주요 테이블:

- `diplomacy`, `ng_diplomacy`

핵심 필드(요약):

- 관계 상태: `state`, `term`, `dead`
- 문서 상태: `state`(proposed/activated/cancelled)

### Messaging (메시지/게시판)

주요 테이블:

- `message`, `board`, `comment`

메모리 구조 권장:

- Mailbox 타입별 인덱스
- 최근 N개 캐시

### Economy/Market (경제)

주요 테이블:

- `ng_auction`, `ng_auction_bid`, `ng_betting`, `storage`, `nation_env`

메모리 구조 권장:

- 활성 경매만 메모리 상주
- 거래/정산은 턴 루프 또는 스케줄러와 연결

### History/Record (기록)

주요 테이블:

- `general_record`, `world_history`, `rank_data`, `hall`, `statistic`

메모리 구조 권장:

- append-only 로그, 필요한 경우 읽기 모델로 제공

## 관계 요약

- `member` 1:N `general`
- `general` N:1 `nation`, `city`
- `nation` 1:N `city`
- `general` 1:1 `troop`
- `nation` N:N `nation` (`diplomacy`, `ng_diplomacy`)
- `general` 1:N `message`, `general_turn`, `general_record`
- `nation` 1:N `nation_turn`, `world_history`
