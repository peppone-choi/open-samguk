# REST API Endpoints 명세서

> **Legacy API 분석 결과**
>
> 이 문서는 `legacy/hwe/sammo/API/` 디렉토리의 PHP 클래스를 분석하여 `apps/api`에 구현해야 할 REST 엔드포인트 목록을 정리한 것입니다.

---

## 목차

1. [API 개요](#api-개요)
2. [인증 방식](#인증-방식)
3. [Auction API](#auction-api-경매)
4. [Betting API](#betting-api-베팅)
5. [Command API](#command-api-장수-커맨드)
6. [General API](#general-api-장수)
7. [Global API](#global-api-전역)
8. [InheritAction API](#inheritaction-api-유산)
9. [Message API](#message-api-메시지)
10. [Misc API](#misc-api-기타)
11. [Nation API](#nation-api-국가)
12. [NationCommand API](#nationcommand-api-국가-커맨드)
13. [Troop API](#troop-api-부대)
14. [Vote API](#vote-api-투표)
15. [우선순위 요약](#우선순위-요약)

---

## API 개요

### 총 엔드포인트 수: 58개

| 모듈 | 엔드포인트 수 | 우선순위 |
|------|-------------|---------|
| Auction | 9 | P1 |
| Betting | 3 | P2 |
| Command | 5 | P0 |
| General | 7 | P0 |
| Global | 12 | P0 |
| InheritAction | 8 | P1 |
| Message | 7 | P0 |
| Misc | 1 | P2 |
| Nation | 11 | P0/P1 |
| NationCommand | 5 | P0 |
| Troop | 5 | P1 |
| Vote | 5 | P2 |

---

## 인증 방식

Legacy 시스템은 다음 세션 모드를 사용합니다:

| 모드 | 상수 | 설명 |
|------|------|------|
| `REQ_LOGIN` | 로그인 필요 | 기본 인증만 필요 |
| `REQ_GAME_LOGIN` | 게임 로그인 필요 | 장수 생성 후 게임 참여 상태 |
| `REQ_READ_ONLY` | 읽기 전용 | DB 쓰기 없음 (캐싱 가능) |

---

## Auction API (경매)

### 우선순위: P1 (중요)

경매 시스템 관련 API. 유니크 아이템 및 자원 거래 기능.

| 파일 | 메서드 | 경로 | 입력 파라미터 | 출력 | 인증 |
|------|--------|------|--------------|------|------|
| `GetUniqueItemAuctionList.php` | GET | `/auction/unique` | - | `{result, list: AuctionItem[]}` | O |
| `GetUniqueItemAuctionDetail.php` | GET | `/auction/unique/:auctionID` | `auctionID: int` | `{result, auction: AuctionDetail}` | O |
| `OpenUniqueAuction.php` | POST | `/auction/unique` | `itemType: string` (weapon\|book\|horse\|item) | `{result}` | O |
| `BidUniqueAuction.php` | POST | `/auction/unique/:auctionID/bid` | `auctionID: int, amount: int` | `{result}` | O |
| `GetActiveResourceAuctionList.php` | GET | `/auction/resource` | - | `{result, buyRice: [], sellRice: []}` | O |
| `OpenBuyRiceAuction.php` | POST | `/auction/resource/buy-rice` | `amount: int, price: int` | `{result}` | O |
| `OpenSellRiceAuction.php` | POST | `/auction/resource/sell-rice` | `amount: int, price: int` | `{result}` | O |
| `BidBuyRiceAuction.php` | POST | `/auction/resource/buy-rice/:auctionID/bid` | `auctionID: int, amount: int` | `{result}` | O |
| `BidSellRiceAuction.php` | POST | `/auction/resource/sell-rice/:auctionID/bid` | `auctionID: int, amount: int` | `{result}` | O |

### 비즈니스 로직 주요 사항
- 경매 입찰 금액 검증
- 자원 경매의 금/쌀 교환 비율 계산
- 경매 종료 시 자동 처리 (엔진에서 수행)

---

## Betting API (베팅)

### 우선순위: P2 (낮음)

전투 예측 베팅 시스템.

| 파일 | 메서드 | 경로 | 입력 파라미터 | 출력 | 인증 |
|------|--------|------|--------------|------|------|
| `GetBettingList.php` | GET | `/betting` | - | `{result, list: Betting[]}` | O |
| `GetBettingDetail.php` | GET | `/betting/:bettingID` | `bettingID: int` | `{result, betting: BettingDetail}` | O |
| `Bet.php` | POST | `/betting/:bettingID/bet` | `bettingID: int, bettingType: string, amount: int` | `{result}` | O |

---

## Command API (장수 커맨드)

### 우선순위: P0 (필수)

장수의 턴 커맨드 예약 및 조회 기능. 게임 핵심 시스템.

| 파일 | 메서드 | 경로 | 입력 파라미터 | 출력 | 인증 |
|------|--------|------|--------------|------|------|
| `GetReservedCommand.php` | GET | `/commands/reserved` | - | `{result, turn: TurnInfo[], commandList, env}` | O |
| `ReserveCommand.php` | POST | `/commands/reserve` | `action: string, turnList: int[], arg?: object` | `{result, brief}` | O |
| `ReserveBulkCommand.php` | POST | `/commands/reserve/bulk` | `[{action, turnList, arg?}]` | `{result, briefList}` | O |
| `PushCommand.php` | POST | `/commands/push` | `amount: int` (-12~12) | `{result}` | O |
| `RepeatCommand.php` | POST | `/commands/repeat` | `amount: int` (1~12) | `{result}` | O |

### 비즈니스 로직 주요 사항
- 커맨드 검증 (`GameConst::$defaultCommand` 참조)
- 턴 인덱스 범위 검증 (0~`GameConst::$maxTurn`)
- 커맨드 인자(`arg`) 타입 및 값 검증

---

## General API (장수)

### 우선순위: P0 (필수)

장수 정보 및 행동 관련 API.

| 파일 | 메서드 | 경로 | 입력 파라미터 | 출력 | 인증 |
|------|--------|------|--------------|------|------|
| `GetFrontInfo.php` | GET | `/general/front-info` | - | `{result, general, nation, env, ...}` | O |
| `GetCommandTable.php` | GET | `/general/command-table` | - | `{result, commandList, env}` | O |
| `GetGeneralLog.php` | GET | `/general/log` | `generalID?: int, logType?: string, lastID?: int` | `{result, log: LogEntry[]}` | O |
| `Join.php` | POST | `/general/join` | `nationID: int` | `{result}` | O |
| `DropItem.php` | POST | `/general/drop-item` | `itemType: string` (weapon\|book\|horse\|item) | `{result}` | O |
| `InstantRetreat.php` | POST | `/general/instant-retreat` | - | `{result}` | O |
| `DieOnPrestart.php` | POST | `/general/die-prestart` | - | `{result}` | O |
| `BuildNationCandidate.php` | POST | `/general/build-nation-candidate` | `cityID: int, nationName: string, color: string, nationTyp: int` | `{result}` | O |

### 비즈니스 로직 주요 사항
- `GetFrontInfo`: 장수 메인 화면에 필요한 모든 정보 통합 반환
- 임관 조건 검증 (국가 임관 허용 여부, 국가 인원 제한 등)
- 아이템 드롭 시 랜덤 유니크 복권 처리

---

## Global API (전역)

### 우선순위: P0 (필수)

게임 전역 정보 조회 API.

| 파일 | 메서드 | 경로 | 입력 파라미터 | 출력 | 인증 |
|------|--------|------|--------------|------|------|
| `GetConst.php` | GET | `/global/const` | - | `{result, gameConst: GameConst}` | X |
| `GetGlobalMenu.php` | GET | `/global/menu` | - | `{result, menu: MenuInfo}` | △ |
| `GetNationList.php` | GET | `/global/nations` | - | `{result, nations: Nation[]}` | X |
| `GetMap.php` | GET | `/global/map` | - | `{result, cities: City[], diplomacy}` | O |
| `GetCachedMap.php` | GET | `/global/map/cached` | - | `{result, cities: City[]}` | O |
| `GetDiplomacy.php` | GET | `/global/diplomacy` | - | `{result, diplomacy: Diplomacy[][]}` | O |
| `GetHistory.php` | GET | `/global/history` | `historyNo?: int` | `{result, history: History[]}` | X |
| `GetCurrentHistory.php` | GET | `/global/history/current` | - | `{result, history: History[]}` | O |
| `GetRecentRecord.php` | GET | `/global/records/recent` | - | `{result, records: Record[]}` | X |
| `GeneralList.php` | GET | `/global/generals` | - | `{result, column, list: General[][]}` | O |
| `GeneralListWithToken.php` | GET | `/global/generals/token` | - | `{result, column, list: General[][]}` | O |
| `ExecuteEngine.php` | POST | `/global/engine/execute` | - | `{result}` | O (Admin) |

### 비즈니스 로직 주요 사항
- `GetConst`: 클라이언트가 캐시해야 할 게임 상수 반환
- `GetMap`: 맵 정보 + 외교 상태 통합 반환
- `GeneralList`: 권한에 따라 노출 컬럼 제어 (`permission` 기반)

---

## InheritAction API (유산)

### 우선순위: P1 (중요)

유산 포인트 사용 관련 API. 장수 강화 시스템.

| 파일 | 메서드 | 경로 | 입력 파라미터 | 출력 | 인증 |
|------|--------|------|--------------|------|------|
| `BuyRandomUnique.php` | POST | `/inherit/buy-random-unique` | - | `{result}` | O |
| `BuyHiddenBuff.php` | POST | `/inherit/buy-buff` | `type: string, level: int` (1~5) | `{result}` | O |
| `ResetStat.php` | POST | `/inherit/reset-stat` | `leadership: int, strength: int, intel: int, inheritBonusStat?: int[]` | `{result}` | O |
| `ResetSpecialWar.php` | POST | `/inherit/reset-special-war` | - | `{result}` | O |
| `SetNextSpecialWar.php` | POST | `/inherit/set-special-war` | `type: string` | `{result}` | O |
| `ResetTurnTime.php` | POST | `/inherit/reset-turn-time` | - | `{result}` | O |
| `CheckOwner.php` | POST | `/inherit/check-owner` | `destGeneralID: int` | `{result}` | O |
| `GetMoreLog.php` | GET | `/inherit/log` | `lastID?: int` | `{result, log: InheritLog[]}` | O |

### 비즈니스 로직 주요 사항
- 유산 포인트 잔액 검증
- 피보나치 수열 기반 비용 증가 (`GameConst::$inheritResetAttrPointBase`)
- 능력치 총합 검증 (`GameConst::$defaultStatTotal`)

---

## Message API (메시지)

### 우선순위: P0 (필수)

게임 내 메시지 시스템. 개인/국가/외교/공개 메시지 지원.

| 파일 | 메서드 | 경로 | 입력 파라미터 | 출력 | 인증 |
|------|--------|------|--------------|------|------|
| `GetContactList.php` | GET | `/messages/contacts` | - | `{nation: Contact[]}` | O |
| `GetRecentMessage.php` | GET | `/messages/recent` | `sequence?: int` | `{result, private, public, national, diplomacy, sequence}` | O |
| `GetOldMessage.php` | GET | `/messages/old` | `to: int, type: string` (private\|public\|national\|diplomacy) | `{result, [type]: Message[]}` | O |
| `SendMessage.php` | POST | `/messages/send` | `mailbox: int, text: string` | `{msgType, msgID}` | O |
| `DeleteMessage.php` | DELETE | `/messages/:msgID` | `msgID: int` | `{result}` | O |
| `DecideMessageResponse.php` | POST | `/messages/:msgID/respond` | `msgID: int, response: boolean` | `{result, reason}` | O |
| `ReadLatestMessage.php` | POST | `/messages/read-latest` | `type: string, msgID: int` | `null` | O |

### 비즈니스 로직 주요 사항
- 메시지 타입별 권한 검증 (외교 메시지는 외교권자만)
- Rate limiting (개인 메시지 2초 간격)
- 메시지 타입: `public`, `private`, `national`, `diplomacy`
- Mailbox 상수: `MAILBOX_PUBLIC = 0`, `MAILBOX_NATIONAL = 10000 + nationID`

---

## Misc API (기타)

### 우선순위: P2 (낮음)

기타 유틸리티 API.

| 파일 | 메서드 | 경로 | 입력 파라미터 | 출력 | 인증 |
|------|--------|------|--------------|------|------|
| `UploadImage.php` | POST | `/misc/upload-image` | `imageData: base64string` | `{result, path}` | O |

### 비즈니스 로직 주요 사항
- 이미지 크기 제한 (1MB)
- 허용 확장자: png, jpeg, jpg, gif, webp, avif
- MD5 해시 기반 중복 방지

---

## Nation API (국가)

### 우선순위: P0/P1 (필수/중요)

국가 정보 조회 및 설정 API.

| 파일 | 메서드 | 경로 | 입력 파라미터 | 출력 | 인증 | 권한 |
|------|--------|------|--------------|------|------|------|
| `GetNationInfo.php` | GET | `/nation/info` | `full?: boolean` | `{result, nation, troops?, ...}` | O | - |
| `GeneralList.php` | GET | `/nation/generals` | - | `{result, column, list, troops, env}` | O | - |
| `GetGeneralLog.php` | GET | `/nation/general-log` | `generalID: int, reqType: string, reqTo?: int` | `{result, log}` | O | 수뇌부 |
| `SetRate.php` | POST | `/nation/rate` | `amount: int` (5~30) | `{result}` | O | 수뇌/외교 |
| `SetBill.php` | POST | `/nation/bill` | `amount: int` (20~200) | `{result}` | O | 수뇌/외교 |
| `SetSecretLimit.php` | POST | `/nation/secret-limit` | `amount: int` (1~99) | `{result}` | O | 수뇌/외교 |
| `SetNotice.php` | POST | `/nation/notice` | `msg: string` (max 16384) | `{result}` | O | 수뇌/외교 |
| `SetScoutMsg.php` | POST | `/nation/scout-msg` | `msg: string` (max 1000) | `{result}` | O | 수뇌/외교 |
| `SetBlockScout.php` | POST | `/nation/block-scout` | `value: boolean` | `{result}` | O | 수뇌/외교 |
| `SetBlockWar.php` | POST | `/nation/block-war` | `value: boolean` | `{result, availableCnt}` | O | 수뇌/외교 |
| `SetTroopName.php` | PUT | `/nation/troop/:troopID/name` | `troopID: int, troopName: string` | `null` | O | 부대장/외교 |

### 권한 체계 (`checkSecretPermission`)
- `permission < 0`: 국가 미소속
- `permission >= 1`: 수뇌부 또는 사관년도 충족
- `permission >= 2`: 수뇌 (officer_level >= 5)
- `permission == 4`: 외교권자

---

## NationCommand API (국가 커맨드)

### 우선순위: P0 (필수)

국가 수뇌부 커맨드 예약 및 조회 기능.

| 파일 | 메서드 | 경로 | 입력 파라미터 | 출력 | 인증 | 권한 |
|------|--------|------|--------------|------|------|------|
| `GetReservedCommand.php` | GET | `/nation-commands/reserved` | - | `{result, chiefList, commandList, troopList, ...}` | O | 수뇌부 |
| `ReserveCommand.php` | POST | `/nation-commands/reserve` | `action: string, turnList: int[], arg?: object` | `{result, brief}` | O | 수뇌 |
| `ReserveBulkCommand.php` | POST | `/nation-commands/reserve/bulk` | `[{action, turnList, arg?}]` | `{result, briefList}` | O | 수뇌 |
| `PushCommand.php` | POST | `/nation-commands/push` | `amount: int` (-12~12) | `{result}` | O | 수뇌 |
| `RepeatCommand.php` | POST | `/nation-commands/repeat` | `amount: int` (1~12) | `{result}` | O | 수뇌 |

### 비즈니스 로직 주요 사항
- `GameConst::$availableChiefCommand` 기반 커맨드 검증
- `officer_level` 별 커맨드 분리 관리
- 턴 인덱스 범위: 0~`GameConst::$maxChiefTurn`

---

## Troop API (부대)

### 우선순위: P1 (중요)

부대 생성/가입/탈퇴/관리 API.

| 파일 | 메서드 | 경로 | 입력 파라미터 | 출력 | 인증 |
|------|--------|------|--------------|------|------|
| `NewTroop.php` | POST | `/troops` | `troopName: string` (1~18자) | `null` | O |
| `JoinTroop.php` | POST | `/troops/:troopID/join` | `troopID: int` | `null` | O |
| `ExitTroop.php` | POST | `/troops/exit` | - | `null` | O |
| `KickFromTroop.php` | POST | `/troops/:troopID/kick` | `troopID: int, generalID: int` | `null` | O |
| `SetTroopName.php` | PUT | `/troops/:troopID/name` | `troopID: int, troopName: string` | `null` | O |

### 비즈니스 로직 주요 사항
- 부대장 탈퇴 시 부대 해산 및 전체 멤버 탈퇴 처리
- 부대명 변경은 부대장 또는 외교권자(permission >= 4)만 가능
- 같은 국가 내에서만 부대 가입 가능

---

## Vote API (투표)

### 우선순위: P2 (낮음)

게임 내 설문조사 시스템.

| 파일 | 메서드 | 경로 | 입력 파라미터 | 출력 | 인증 | 권한 |
|------|--------|------|--------------|------|------|------|
| `GetVoteList.php` | GET | `/votes` | - | `{result, votes: VoteInfo[]}` | O (로그인) | - |
| `GetVoteDetail.php` | GET | `/votes/:voteID` | `voteID: int` | `{result, voteInfo, votes, comments, myVote}` | O (로그인) | - |
| `NewVote.php` | POST | `/votes` | `title: string, options: string[], multipleOptions?: int, endDate?: date, keepOldVote?: boolean` | `{result}` | O | Admin |
| `Vote.php` | POST | `/votes/:voteID/vote` | `voteID: int, selection: int[]` | `{result, wonLottery}` | O (게임) | - |
| `AddComment.php` | POST | `/votes/:voteID/comments` | `voteID: int, text: string` (max 200) | `null` | O (게임) | - |

### 비즈니스 로직 주요 사항
- 투표 완료 시 금 보상 + 유니크 아이템 복권
- 복수 선택 제한 (`multipleOptions`)
- 투표 권한: `userGrade >= 5` 또는 `vote` ACL

---

## 우선순위 요약

### P0 (필수) - 게임 핵심 기능

| 모듈 | 엔드포인트 | 설명 |
|------|-----------|------|
| Command | 5개 | 장수 턴 커맨드 (핵심) |
| General | 7개 | 장수 정보/행동 |
| Global | 12개 | 게임 전역 정보 |
| Message | 7개 | 메시지 시스템 |
| Nation | 11개 | 국가 정보/설정 |
| NationCommand | 5개 | 국가 커맨드 (핵심) |

**소계: 47개**

### P1 (중요) - 주요 기능

| 모듈 | 엔드포인트 | 설명 |
|------|-----------|------|
| Auction | 9개 | 경매 시스템 |
| InheritAction | 8개 | 유산 포인트 시스템 |
| Troop | 5개 | 부대 관리 |

**소계: 22개**

### P2 (낮음) - 부가 기능

| 모듈 | 엔드포인트 | 설명 |
|------|-----------|------|
| Betting | 3개 | 베팅 시스템 |
| Misc | 1개 | 이미지 업로드 |
| Vote | 5개 | 투표 시스템 |

**소계: 9개**

---

## NestJS 모듈 구조 제안

```
apps/api/src/
├── modules/
│   ├── auction/
│   │   ├── auction.controller.ts
│   │   ├── auction.service.ts
│   │   └── dto/
│   ├── betting/
│   ├── command/
│   ├── general/
│   ├── global/
│   ├── inherit/
│   ├── message/
│   ├── misc/
│   ├── nation/
│   ├── nation-command/
│   ├── troop/
│   └── vote/
├── common/
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   ├── game-auth.guard.ts
│   │   └── permission.guard.ts
│   ├── decorators/
│   │   └── permission.decorator.ts
│   └── interceptors/
│       └── refresh-limit.interceptor.ts
└── shared/
    └── types/
```

---

## 다음 단계

1. **P0 엔드포인트 우선 구현**
   - Command API, General API, Global API 순으로 진행
   - 각 API의 비즈니스 로직은 `packages/logic`에 위치

2. **인증/인가 시스템 구축**
   - JWT 기반 인증
   - `permission` 기반 역할 관리
   - Refresh score 기반 rate limiting

3. **DTO 및 Validation**
   - class-validator 활용
   - Legacy `Validator` 클래스 로직 마이그레이션

---

## 변경 이력

| 날짜 | 버전 | 내용 |
|------|------|------|
| 2026-01-05 | 1.0 | 최초 작성 - Legacy API 분석 완료 |
