# 엔티티 상호작용 흐름

이 문서는 핵심 게임 흐름을 엔티티 중심으로 정리합니다. 모든 읽기/쓰기는 메모리 상태 기준으로 처리되며, DB에는 영속성만 반영됩니다.

## 공통 규칙

- 커맨드는 메모리 상태에 적용 후 저널 기록
- 쿼리는 메모리 상태에서 응답
- 결과는 WS/SSE로 브로드캐스트

## 1) 로그인 및 세션

대상 엔티티: `member`, `login_token`, `member_log`

흐름:

1. 인증 성공 -> 세션 발급
2. `member_log` 기록
3. 세션 상태를 메모리에 캐시

## 2) 서버 입장 및 장수 생성

대상 엔티티: `select_pool`, `select_npc_token`, `general`, `general_turn`, `nation`, `city`

흐름:

1. 이름 예약 (`select_pool`)
2. 후보 생성/선택 (`select_npc_token`)
3. `general` 생성 및 초기 턴 예약
4. 소속 국가/도시 배치

## 3) 턴 예약 및 처리

대상 엔티티: `general_turn`, `nation_turn`, `general`, `nation`, `city`, `troop`, `general_record`, `world_history`, `event`, `plock`

흐름:

1. 커맨드 예약 -> 턴 큐 적재
2. 데몬이 turntime 순서로 실행
3. 상태 변경 및 기록 생성

## 4) 국가 운영 및 정책

대상 엔티티: `nation`, `nation_turn`, `board`, `comment`, `message`

흐름:

1. 국가 명령 큐 적재
2. 정책 변경 반영
3. 게시판/메시지 기록

## 5) 외교 제안 및 체결

대상 엔티티: `ng_diplomacy`, `diplomacy`, `message`

흐름:

1. 외교 문서 생성
2. 메시지 알림
3. 수락 시 상태 전이 및 기록

## 6) 메시지 및 게시판

대상 엔티티: `message`, `board`, `comment`

흐름:

- 개인/국가/공개 메시지 작성
- 메시지 박스 인덱스 갱신

## 7) 경매와 경제

대상 엔티티: `ng_auction`, `ng_auction_bid`, `general`, `nation`

흐름:

- 경매 생성/입찰 -> 마감 -> 정산

## 8) 투표/설문

대상 엔티티: `vote`, `vote_comment`

흐름:

- 선택/댓글 기록 -> 결과 집계

## 9) 기록/랭킹/통계

대상 엔티티: `general_record`, `world_history`, `rank_data`, `hall`, `statistic`

흐름:

- 턴 처리 결과 기록 -> 랭킹/통계 산출

## 실시간 채널

- WebSocket: 개인/국가 메시지, 커맨드 즉시 결과
- SSE: 턴 틱, 히스토리, 공개 이벤트
