# 도메인 엔티티 (레거시 기준)

다음 카탈로그는 레거시 스키마에서 추출되었습니다.
- `legacy/hwe/sql/schema.sql`
- `legacy/f_install/sql/common_schema.sql`
- `legacy/f_install/sql/api_log.sql`
- `legacy/f_install/sql/err_log.sql`

표기된 엔티티 이름은 레거시 테이블명을 기준으로 합니다.

## 계정 및 접근

- `system`: 서비스 전역 플래그(가입/로그인/공지)
- `member`: 계정/프로필/권한
- `member_log`: 계정 활동 로그
- `login_token`: 세션 토큰
- `banned_member`: 해시된 이메일 차단 목록

## 핵심 게임

- `general`: 장수(플레이어/NPC), 스탯/자원/소속
- `general_turn`: 장수 턴 큐
- `general_access_log`: 장수 접속/갱신 로그
- `nation`: 국가 상태 및 정책
- `nation_turn`: 국가 레벨 턴 큐
- `city`: 도시(경제/방어/소속)
- `troop`: 부대(장수 리더)
- `plock`: 전역 처리 락

## 커뮤니케이션

- `message`: 개인/국가/공개/외교 메시지
- `board`: 국가 게시글
- `comment`: 게시글 댓글

## 외교

- `diplomacy`: 국가 간 관계
- `ng_diplomacy`: 외교 문서(제안/체결/취소)

## 기록과 히스토리

- `hall`: 명전 기록
- `ng_games`: 서버/시즌 메타
- `ng_old_nations`: 종료된 국가 스냅샷
- `ng_old_generals`: 종료된 장수 스냅샷
- `emperior`: 왕조/시즌 요약
- `statistic`: 통계 스냅샷
- `ng_history`: 턴별 히스토리
- `world_history`: 국가 히스토리
- `general_record`: 장수 행동 기록
- `user_record`: 유저 로그

## 경제/시장/랭킹

- `storage`: 전역 KV(JSON)
- `nation_env`: 국가 스코프 KV(JSON)
- `rank_data`: 랭킹 데이터
- `ng_auction`: 경매/거래
- `ng_auction_bid`: 경매 입찰
- `ng_betting`: 베팅

## 선택 및 라이프사이클

- `reserved_open`: 예약 오픈
- `select_npc_token`: NPC 선택 토큰
- `select_pool`: 장수 생성 풀
- `inheritance_result`: 계승 결과

## 관측/로깅

- `api_log` (SQLite): API 로그
- `err_log` (SQLite): 에러 로그

## 핵심 관계

- `member` 1:N `general` (`general.owner`)
- `general` N:1 `nation` (`general.nation`)
- `general` N:1 `city` (`general.city`)
- `general` 1:1 `troop` (`troop.troop_leader`)
- `nation` 1:N `city` (`city.nation`)
- `nation` 1:N `board` / `comment` (`nation_no`)
- `general` 1:N `board` / `comment` (`general_no`)
- `nation` N:N `nation` (`diplomacy`, `ng_diplomacy`)
- `general` 1:N `message` (`src`, `dest`)
- `general` 1:N `general_turn`, `general_record`
- `nation` 1:N `nation_turn`, `world_history`
- `general` 1:N `ng_auction`, `ng_auction_bid`
- `general` 1:N `vote`, `vote_comment`
- `member` 1:N `member_log`, `user_record`, `ng_betting`
