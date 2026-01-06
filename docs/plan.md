# 포팅 계획 (레거시 -> NestJS + Next.js)

이 계획은 엔티티 상호작용을 기준으로 진행되며, 변형 CQRS와 메모리 상태 중심 운영을 전제로 합니다.

## Phase 0 - 분석 및 매핑

산출물:

- 엔티티 카탈로그 및 관계도
- 핵심 상호작용 흐름 정리
- 레거시 API/커맨드 목록화 (`docs/architecture/legacy-api.md`, `docs/architecture/legacy-commands.md`)

완료 기준:

- 핵심 게임 루프가 문서화됨

## Phase 1 - 기반 구조

범위:

- NestJS/Next.js 프로젝트 스캐폴딩
- 스캐폴딩 위치: `apps/api`(NestJS), `apps/web`(Next.js)
- REST API 구조 정의 및 라우팅 표준 확정
- TypeORM 기반 DB 연결/엔티티 설계 착수
- 인증/세션(`member`, `login_token`, `member_log`)
- 기본 DB 스키마 및 마이그레이션
- 관측/로깅(`api_log`, `err_log`)

완료 기준:

- 기본 인증과 서버 로비 진입 가능

## Phase 2 - 메모리 상태 + 영속성 파이프라인

범위:

- In-Memory State Manager 도입
- 커맨드/쿼리 분리 인터페이스 정의
- 시작 적재/종료 저장 플로우 구현
- 스냅샷/저널링 구조 설계 및 최소 구현

완료 기준:

- 재시작 시 상태 복원 가능
- 메모리 변경이 영속화됨

## Phase 3 - 핵심 게임 루프

범위:

- `general`, `nation`, `city`, `troop` 모듈
- 턴 예약/처리(`general_turn`, `nation_turn`)
- 이벤트 처리(`event`, `plock`)
- 기록 생성(`general_record`, `world_history`)

완료 기준:

- 턴 예약과 처리 결과가 일관됨

## Phase 4 - 실시간 및 커뮤니케이션

범위:

- 메시지/게시판(`message`, `board`, `comment`)
- WebSocket/SSE 채널 구축
- 알림/피드 스트림 구현

완료 기준:

- 실시간 알림이 UX에 반영됨

## Phase 5 - 외교/경제/투표

범위:

- 외교(`ng_diplomacy`, `diplomacy`)
- 경매(`ng_auction`, `ng_auction_bid`)
- 투표(`vote`, `vote_comment`)
- 랭킹/통계(`rank_data`, `hall`, `statistic`)

완료 기준:

- 주요 사회/경제 기능 동작

## Phase 6 - 마이그레이션 및 론칭

범위:

- 레거시 스냅샷 이관(`ng_games`, `ng_old_nations`, `ng_old_generals`, `emperior`)
- 데이터 정합성 검증
- 롤백/재시작 시나리오 확정

완료 기준:

- 데이터 카운트/체크섬 일치
- 운영 전환 계획 확정

## 위험 요소

- 메모리 상태와 영속화 지연 간의 일관성
- 턴 처리 락과 재시작 복구 전략
- 실시간 스트림의 과부하와 순서 보장
