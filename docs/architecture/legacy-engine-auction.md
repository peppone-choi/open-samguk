# 레거시 경매 엔진

경매/거래 시스템 구조와 포팅 기준을 정리합니다. 레거시 경매는 시간 기반이며, 마감 연장 규칙을 포함합니다.

## 레거시 위치

- `legacy/hwe/sammo/Auction.php`
- `legacy/hwe/sammo/AuctionBuyRice.php`
- `legacy/hwe/sammo/AuctionSellRice.php`
- `legacy/hwe/sammo/AuctionUniqueItem.php`
- DTO: `legacy/hwe/sammo/DTO/AuctionInfo*.php`

## 관련 테이블

- `ng_auction`
- `ng_auction_bid`

## DTO 구조

`AuctionInfo`:

- `id`, `type`, `finished`, `target`
- `hostGeneralID`, `reqResource`
- `openDate`, `closeDate`
- `detail` (JSON)

`AuctionInfoDetail`:

- `title`, `hostName`, `amount`
- `isReverse` (역경매 여부)
- `startBidAmount`, `finishBidAmount`
- `remainCloseDateExtensionCnt`
- `availableLatestBidCloseDate`

`AuctionBidItem`:

- `auctionID`, `generalID`, `amount`, `date`
- `aux.ownerName`, `aux.generalName`, `aux.tryExtendCloseDate`

## 주요 규칙

- 마감 시각(`closeDate`) 기준으로 종료
- 역경매는 `amount` 오름차순이 최고 입찰
- 입찰 시 마감 연장 가능 (조건부)
- 익명 표시를 위한 `genObfuscatedName()` 사용

## 포팅 포인트

- 활성 경매는 메모리 상태에 상주
- 입찰은 단일 쓰기 경로로 직렬화
- 마감 시간/연장 규칙을 명시적 상태로 보관
- WebSocket으로 실시간 입찰 이벤트 브로드캐스트
