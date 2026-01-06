# 레거시 API 인벤토리

이 문서는 포팅 대상인 레거시 API의 엔드포인트 목록과 호출 규칙을 정리합니다. 실제 사용 목록은 `legacy/hwe/ts/SammoAPI.ts`와 `legacy/hwe/ts/SammoRootAPI.ts`를 기준으로 합니다.

요청/응답 스키마 표준은 `docs/architecture/api-contract.md`를 참고합니다.

## 엔트리포인트 & 라우팅 규칙

- 게임 API: `legacy/hwe/api.php`
  - 클래스 위치: `legacy/hwe/sammo/API/*`
- 게이트웨이/로그인 API: `legacy/api.php`
  - 클래스 위치: `legacy/src/sammo/API/*`

공통 규칙:

- 요청은 `path` 쿼리 파라미터로 라우팅됨 (예: `path=Global/GetMap`).
- `sammo\API\<Category>\<Action>` 네임스페이스/클래스로 매핑됨.
- GET은 쿼리 파라미터로, 그 외 메서드는 JSON 바디로 인자 전달.
- 응답은 `{ result: true }` 또는 `{ result: false, reason, recovery? }` 형식.

## 게이트웨이/로그인 API (legacy/api.php)

- `POST Admin/BanEmailAddress` `{ email }`
- `POST Login/LoginByID` `{ username, password }`
- `POST Login/LoginByToken` `{ hashedToken, token_id }`
- `GET Login/ReqNonce`

## 게임 API (legacy/hwe/api.php)

Auction:

- `PUT Auction/BidBuyRiceAuction` `{ auctionID, amount }`
- `PUT Auction/BidSellRiceAuction` `{ auctionID, amount }`
- `GET Auction/GetActiveResourceAuctionList`
- `POST Auction/OpenBuyRiceAuction` `{ amount, closeTurnCnt, startBidAmount, finishBidAmount }`
- `POST Auction/OpenSellRiceAuction` `{ amount, closeTurnCnt, startBidAmount, finishBidAmount }`
- `PUT Auction/BidUniqueAuction` `{ auctionID, amount }`
- `GET Auction/GetUniqueItemAuctionDetail` `{ auctionID }`
- `GET Auction/GetUniqueItemAuctionList`
- `POST Auction/OpenUniqueAuction` `{ itemID, amount }`

Betting:

- `PUT Betting/Bet` `{ bettingID, bettingType[], amount }`
- `GET Betting/GetBettingDetail` `{ betting_id }`
- `GET Betting/GetBettingList` `{ req? }`

Command:

- `GET Command/GetReservedCommand`
- `PUT Command/PushCommand` `{ amount }`
- `PUT Command/RepeatCommand` `{ amount }`
- `PUT Command/ReserveCommand` `{ turnList[], action, arg? }`
- `PUT Command/ReserveBulkCommand` `[{ turnList[], action, arg? }, ...]`

General:

- `POST General/Join` `{ ... }`
- `GET General/GetGeneralLog` `{ reqType, reqTo? }`
- `PUT General/DropItem` `{ itemType }`
- `POST General/DieOnPrestart`
- `POST General/InstantRetreat`
- `POST General/BuildNationCandidate`
- `GET General/GetCommandTable`
- `GET General/GetFrontInfo` `{ lastNationNoticeDate?, lastGeneralRecordID?, lastWorldHistoryID? }`

Global:

- `GET Global/GeneralList`
- `GET Global/GeneralListWithToken`
- `GET Global/GetConst`
- `GET Global/GetHistory` `{ serverID, year, month }`
- `GET Global/GetCurrentHistory`
- `GET Global/GetMap` `{ neutralView?, showMe? }`
- `GET Global/GetCachedMap`
- `GET Global/GetDiplomacy`
- `POST Global/ExecuteEngine` `{ serverID? }`
- `GET Global/GetGlobalMenu`

InheritAction:

- `PUT InheritAction/BuyHiddenBuff` `{ type, level }`
- `PUT InheritAction/BuyRandomUnique`
- `PUT InheritAction/ResetSpecialWar`
- `PUT InheritAction/ResetTurnTime`
- `PUT InheritAction/SetNextSpecialWar` `{ type }`
- `GET InheritAction/GetMoreLog` `{ lastID }`
- `PUT InheritAction/CheckOwner` `{ destGeneralID }`
- `PUT InheritAction/ResetStat` `{ ... }`

Message:

- `PATCH Message/DeleteMessage` `{ msgID }`
- `POST Message/DecideMessageResponse` `{ msgID, response }`
- `GET Message/GetContactList`
- `GET Message/GetRecentMessage` `{ sequence? }`
- `GET Message/GetOldMessage` `{ to, type }`
- `POST Message/SendMessage` `{ mailbox, text }`
- `PATCH Message/ReadLatestMessage` `{ type, msgID }`

Misc:

- `POST Misc/UploadImage` `{ imageData }`

NationCommand:

- `GET NationCommand/GetReservedCommand`
- `PUT NationCommand/PushCommand` `{ amount }`
- `PUT NationCommand/RepeatCommand` `{ amount }`
- `PUT NationCommand/ReserveCommand` `{ turnList[], action, arg? }`
- `PUT NationCommand/ReserveBulkCommand` `[{ turnList[], action, arg? }, ...]`

Nation:

- `GET Nation/GeneralList`
- `PUT Nation/SetNotice` `{ msg }`
- `PUT Nation/SetScoutMsg` `{ msg }`
- `PATCH Nation/SetBill` `{ amount }`
- `PATCH Nation/SetRate` `{ amount }`
- `PATCH Nation/SetSecretLimit` `{ amount }`
- `PATCH Nation/SetBlockWar` `{ value }`
- `PATCH Nation/SetBlockScout` `{ value }`
- `GET Nation/GetGeneralLog` `{ generalID, reqType, reqTo? }`
- `PATCH Nation/SetTroopName` `{ troopID, troopName }` (deprecated)
- `GET Nation/GetNationInfo` `{ full? }`

Troop:

- `POST Troop/NewTroop` `{ troopName }`
- `PATCH Troop/JoinTroop` `{ troopID }`
- `PATCH Troop/ExitTroop`
- `PATCH Troop/SetTroopName` `{ troopID, troopName }`
- `PATCH Troop/KickFromTroop` `{ troopID, generalID }`

Vote:

- `POST Vote/AddComment` `{ voteID, text }`
- `GET Vote/GetVoteList`
- `GET Vote/GetVoteDetail` `{ voteID }`
- `POST Vote/NewVote` `{ title, multipleOptions?, endDate?, options[], keepOldVote? }`
- `POST Vote/Vote` `{ voteID, selection[] }`

## 기타 OAuth 엔드포인트

카카오 OAuth 흐름은 별도 스크립트를 사용합니다:

- `legacy/oauth_kakao/j_login_oauth.php`, `legacy/oauth_kakao/j_change_pw.php`, `legacy/oauth_kakao/j_join_process.php` 등
