# Web Session 1: REST API 분석

## 목표

legacy/hwe/sammo/API/ 폴더의 모든 API를 분석하고, apps/api에 구현해야 할 REST 엔드포인트 목록을 정리합니다.

## 분석 대상 경로

```
legacy/hwe/sammo/API/
├── Auction/      # 경매 API
├── Betting/      # 베팅 API
├── Command/      # 커맨드 API
├── General/      # 장수 API
├── Global/       # 글로벌 API
├── InheritAction/# 상속 API
├── Message/      # 메시지 API
├── Misc/         # 기타 API
├── Nation/       # 국가 API
├── NationCommand/# 국가 커맨드 API
├── Troop/        # 부대 API
└── Vote/         # 투표 API
```

## 수행 작업

### 1. 각 API 모듈별로 다음을 정리:

- 파일명
- HTTP 메서드 (GET/POST/PUT/DELETE)
- 엔드포인트 경로
- 입력 파라미터 (타입 포함)
- 출력 형식
- 인증 필요 여부

### 2. 출력 형식 (마크다운 테이블)

```markdown
## Auction API

| 파일                         | 메서드 | 경로                | 입력            | 출력          | 인증 |
| ---------------------------- | ------ | ------------------- | --------------- | ------------- | ---- |
| GetUniqueItemAuctionList.php | GET    | /auction/unique     | -               | AuctionItem[] | O    |
| BidUniqueAuction.php         | POST   | /auction/unique/bid | {itemId, price} | Result        | O    |
```

### 3. 우선순위 분류

- **P0 (필수)**: 게임 핵심 기능
- **P1 (중요)**: 주요 기능
- **P2 (낮음)**: 부가 기능

## 참고 문서

- docs/architecture/legacy-api.md
- docs/architecture/api-contract.md

## 최종 산출물

`docs/architecture/api-endpoints.md` 파일에 정리된 전체 API 목록
