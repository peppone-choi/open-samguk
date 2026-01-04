# 목표 아키텍처 (변형 CQRS + 메모리 상태)

이 아키텍처는 레거시 엔티티를 기준으로 NestJS 백엔드와 Next.js 프론트엔드를 구성합니다. 커맨드/쿼리 분리를 유지하되, 모든 상태는 메모리에 유지하고 DB는 영속성만 보장하는 변형 CQRS를 채택합니다.

## 개요

```
[ Next.js ]
  | REST/JSON (Query, Command)
  | SSE (Global Streams)
  | WebSocket (Private/Nation Channels)
[ NestJS ]
  | Command API (쓰기 인터페이스)
  | Query API (읽기 인터페이스)
  | In-Memory State (단일 권위 상태)
  | Persistence Adapter (스냅샷/저널)
[ DB ]
  | 영속성 저장소
```

## 변형 CQRS 원칙

- 커맨드와 쿼리 경로를 분리하되, 읽기/쓰기는 동일한 메모리 상태를 참조
- DB는 상태의 권위 소스가 아니라, 재시작을 위한 영속 스냅샷 역할
- 시작 시 DB에서 메모리로 적재, 종료 시 메모리 상태를 DB로 저장
- 필요 시 주기적 스냅샷/저널링으로 장애 복구 시간을 단축

## 백엔드 모듈 (NestJS)

- Auth: `member`, `login_token`, `member_log`, `banned_member`
- General: `general`, `general_turn`, `general_record`, `general_access_log`
- Nation: `nation`, `nation_turn`, `nation_env`
- City: `city`
- Troop: `troop`
- Diplomacy: `diplomacy`, `ng_diplomacy`, `message`
- Message: `message`, `board`, `comment`
- Auction: `ng_auction`, `ng_auction_bid`
- Vote: `vote`, `vote_comment`
- History: `world_history`, `ng_history`, `statistic`, `hall`, `rank_data`
- Event: `event`, `plock`, `reserved_open`
- GameMeta: `ng_games`, `ng_old_nations`, `ng_old_generals`, `emperior`
- Observability: `api_log`, `err_log`

## 메모리 상태 관리

- 도메인 상태는 `In-Memory State`로 유지
- 커맨드 실행 시 메모리 상태를 갱신하고 영속화 큐에 기록
- 쿼리는 메모리 상태 또는 파생 읽기 모델에서 응답
- 종료 시 전체 스냅샷 저장, 시작 시 스냅샷 적재

## 실시간 채널 전략

SSE (단방향 스트림):
- 턴 틱, 월드 히스토리, 지도 스냅샷
- 공개 이벤트 및 랭킹 업데이트

WebSocket (양방향):
- 개인/국가 메시지
- 커맨드 검증 피드백
- 경매 실시간 입찰

## 프론트엔드 (Next.js)

- 로비/서버 선택
- 장수 대시보드(스탯/턴/히스토리)
- 국가 운영 UI(정책/명령/게시판)
- 지도/도시/외교/경매/투표/랭킹 뷰

## 데이터 적재/저장 흐름

- 시작: DB 스냅샷 로드 -> 메모리 상태 구성
- 운영: 커맨드 처리 -> 메모리 갱신 -> 영속화 기록
- 종료: 메모리 상태 스냅샷 저장
