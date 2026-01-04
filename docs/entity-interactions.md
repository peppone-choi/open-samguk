# 엔티티 상호작용 흐름

이 문서는 레거시 엔티티를 중심으로 한 핵심 흐름을 정의합니다. 모든 읽기/쓰기 요청은 백엔드 메모리 상태에서 처리되며, DB는 영속성 보장만 담당합니다. 시작 시 DB에서 적재, 종료 시 메모리 상태를 저장하는 흐름을 전제로 합니다.

## 1) 로그인 및 세션

대상 엔티티: `member`, `login_token`, `member_log`

흐름:
- 계정 인증 후 메모리 상태에 세션 생성
- `login_token`과 `member_log`를 영속화 큐에 기록

실시간:
- 필요 없음 (응답으로 UI 갱신)

## 2) 서버 입장 및 장수 생성

대상 엔티티: `select_pool`, `select_npc_token`, `general`, `general_turn`, `nation`, `city`, `member_log`

흐름:
- `select_pool` 예약 후 후보를 `select_npc_token`으로 생성
- `general` 생성 및 초기 `general_turn` 큐 구성
- 초기 소속 `nation`, `city` 할당
- 생성 결과를 메모리 상태에 반영 후 영속화

실시간:
- SSE로 서버 입장 대기/현황 제공

## 3) 턴 예약 및 처리

대상 엔티티: `general_turn`, `nation_turn`, `general`, `nation`, `city`, `troop`, `world_history`, `general_record`, `event`, `plock`

흐름:
- 커맨드 예약은 `general_turn`/`nation_turn`에 누적
- 턴 처리 시 `plock`으로 락 후 메모리 상태 갱신
- 결과를 `general_record`/`world_history`로 기록하고 영속화
- `event` 조건 검사 및 추가 상태 갱신

실시간:
- WebSocket: 즉시 커맨드 검증/결과 알림
- SSE: 턴 틱/월드 히스토리 스트림

## 4) 국가 운영 및 정책

대상 엔티티: `nation`, `nation_turn`, `board`, `comment`, `message`

흐름:
- 운영 명령은 `nation_turn`에 큐잉
- 메모리 상태에서 정책 변경 후 영속화
- 공지/토론은 `board`/`comment`로 기록

실시간:
- WebSocket: 국가 채널 메시지
- SSE: 국가 공개 업데이트

## 5) 외교 제안 및 체결

대상 엔티티: `ng_diplomacy`, `diplomacy`, `message`, `general`, `nation`

흐름:
- 제안 생성 시 `ng_diplomacy` 기록
- 상대 국가에 `message`로 알림
- 수락 시 `diplomacy` 상태 갱신 및 문서 상태 변경

실시간:
- WebSocket: 서명/상태 변경 알림
- SSE: 공개 외교 상태 업데이트

## 6) 메시지 및 게시판

대상 엔티티: `message`, `board`, `comment`, `general`, `nation`

흐름:
- 메모리 상태에서 메시지/게시글 작성 후 영속화
- 공개/비밀 여부에 따른 접근 통제

실시간:
- WebSocket: 개인/국가 메시지
- SSE: 공개 피드

## 7) 경매와 경제

대상 엔티티: `ng_auction`, `ng_auction_bid`, `general`, `nation`, `storage`

흐름:
- 경매 생성과 입찰을 메모리 상태에 반영
- 종료 시 자원 정산 및 상태 확정 후 영속화

실시간:
- WebSocket: 입찰 실시간 갱신
- SSE: 경매 목록/종료 이벤트

## 8) 투표/설문

대상 엔티티: `vote`, `vote_comment`, `general`, `nation`

흐름:
- 투표 선택과 댓글을 메모리 상태에 반영
- 집계 결과를 읽기 모델로 제공

실시간:
- SSE: 결과 갱신 스트림

## 9) 기록/랭킹/통계

대상 엔티티: `general_record`, `world_history`, `rank_data`, `hall`, `statistic`, `ng_history`

흐름:
- 턴 처리 결과에 따라 기록을 생성
- 랭킹/통계 스냅샷을 주기적으로 생성

실시간:
- SSE: 히스토리/랭킹 피드

## 10) 토너먼트

대상 엔티티: `tournament`, `general`, `nation`

흐름:
- 참가자 시드 구성 후 토너먼트 진행
- 결과를 기록하고 보상 처리

실시간:
- WebSocket: 대진/결과 알림
- SSE: 최종 결과 공지
