# Frontend Components 분석

> legacy/hwe/ts/ Vue 컴포넌트 분석 및 apps/web React 컴포넌트 마이그레이션 계획

## 목차

1. [페이지 컴포넌트 분석](#1-페이지-컴포넌트-분석)
2. [공통 컴포넌트 분석](#2-공통-컴포넌트-분석)
3. [shadcn/ui 매핑](#3-shadcnui-매핑)
4. [라우팅 구조](#4-라우팅-구조)
5. [스타일 시스템](#5-스타일-시스템)
6. [API 및 상태 관리](#6-api-및-상태-관리)

---

## 1. 페이지 컴포넌트 분석

### 1.1 PageFront.vue (메인 대시보드)

**경로**: `legacy/hwe/ts/PageFront.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 메인 게임 화면, 턴 정보, 장수 상태, 명령 입력 |
| **UI 구성** | 상단 메뉴, 지도, 명령 패널, 메시지 목록, 하단 바 |
| **API 호출** | `SammoAPI.General.*`, `SammoAPI.Global.GetMap` |
| **상태 관리** | GameConstStore (provide/inject) |
| **React 라우트** | `/game` |

**주요 하위 컴포넌트**:
- MainControlBar (명령 컨트롤)
- MapViewer (지도)
- MessagePanel (메시지)
- GameBottomBar (하단 정보)

---

### 1.2 PageJoin.vue (장수 생성)

**경로**: `legacy/hwe/ts/PageJoin.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 새 장수 생성, 능력치 분배, 특성 선택 |
| **UI 구성** | 폼 입력, 능력치 슬라이더, 국가 선택 |
| **API 호출** | `SammoAPI.Join.*` |
| **상태 관리** | 로컬 상태 (reactive) |
| **React 라우트** | `/join` |

**사용자 인터랙션**:
- 능력치 포인트 분배 (통/무/지)
- 성격, 내정특기, 전투특기 선택
- 가입할 국가 선택

---

### 1.3 PageAuction.vue (경매장)

**경로**: `legacy/hwe/ts/PageAuction.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 자원/유니크 아이템 경매 |
| **UI 구성** | 경매 목록, 입찰 폼, 상세 정보 |
| **API 호출** | `SammoAPI.Auction.*` |
| **상태 관리** | 로컬 상태 |
| **React 라우트** | `/auction` |

**하위 컴포넌트**:
- AuctionResource (자원 경매)
- AuctionUniqueItem (유니크 경매)
- NumberInputWithInfo (입찰가 입력)

---

### 1.4 PageBattleCenter.vue (감찰부)

**경로**: `legacy/hwe/ts/PageBattleCenter.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 장수 상세 정보 조회, 프로필 수정 |
| **UI 구성** | 장수 카드, 상세 정보 탭 |
| **API 호출** | `SammoAPI.General.GetGeneralDetail` |
| **상태 관리** | GameConstStore |
| **React 라우트** | `/general/:id` 또는 `/battle-center` |

**하위 컴포넌트**:
- GeneralBasicCard
- GeneralSupplementCard

---

### 1.5 PageNationGeneral.vue (세력 장수 목록)

**경로**: `legacy/hwe/ts/PageNationGeneral.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 소속 세력 장수 목록 조회 |
| **UI 구성** | AG Grid 테이블, 필터링, 정렬 |
| **API 호출** | `SammoAPI.Nation.GetGeneralList` |
| **상태 관리** | GameConstStore, GridDisplaySetting (localStorage) |
| **React 라우트** | `/nation/generals` |

**핵심 컴포넌트**:
- GeneralList (AG Grid 기반 고급 테이블)

---

### 1.6 PageTroop.vue (부대 편성)

**경로**: `legacy/hwe/ts/PageTroop.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 부대 생성, 편성, 해산 |
| **UI 구성** | 부대 목록, 장수 드래그&드롭 |
| **API 호출** | `SammoAPI.Troop.*` |
| **상태 관리** | 로컬 상태 |
| **React 라우트** | `/troop` |

**사용자 인터랙션**:
- 부대 생성/해산
- 장수 부대 배치

---

### 1.7 PageVote.vue (설문/투표)

**경로**: `legacy/hwe/ts/PageVote.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 게임 내 투표/설문 참여 |
| **UI 구성** | 투표 목록, 참여 폼 |
| **API 호출** | `SammoAPI.Vote.*` |
| **상태 관리** | 로컬 상태 |
| **React 라우트** | `/vote` |

---

### 1.8 PageHistory.vue (연감)

**경로**: `legacy/hwe/ts/PageHistory.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 게임 역사 기록 조회 |
| **UI 구성** | 타임라인, 이벤트 목록 |
| **API 호출** | `SammoAPI.History.*` |
| **상태 관리** | 로컬 상태 |
| **React 라우트** | `/history` |

---

### 1.9 PageBoard.vue (게시판)

**경로**: `legacy/hwe/ts/PageBoard.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 회의실, 기밀실 게시판 |
| **UI 구성** | 글 목록, 글 작성/수정, 댓글 |
| **API 호출** | `SammoAPI.Board.*` |
| **상태 관리** | 로컬 상태 |
| **React 라우트** | `/board/:type` |

**하위 컴포넌트**:
- BoardArticle (게시글)
- BoardComment (댓글)
- TipTap (에디터)

---

### 1.10 PageChiefCenter.vue (사령부)

**경로**: `legacy/hwe/ts/PageChiefCenter.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 사령부 명령 예약, 부대 관리 |
| **UI 구성** | 명령 예약 테이블, 장수 목록 |
| **API 호출** | `SammoAPI.Chief.*` |
| **상태 관리** | 로컬 상태 |
| **React 라우트** | `/chief` |

**권한**: 수뇌부 (officerLevel >= 5) 전용

---

### 1.11 PageNPCControl.vue (NPC 정책)

**경로**: `legacy/hwe/ts/PageNPCControl.vue`

| 항목 | 내용 |
|------|------|
| **기능** | NPC 장수 자동 행동 설정 |
| **UI 구성** | NPC 목록, 정책 설정 폼 |
| **API 호출** | `SammoAPI.NPC.*` |
| **상태 관리** | 로컬 상태 |
| **React 라우트** | `/npc-control` |

---

### 1.12 PageNationBetting.vue (국가 베팅장)

**경로**: `legacy/hwe/ts/PageNationBetting.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 베팅 목록 조회, 베팅 참여 |
| **UI 구성** | 베팅 목록, 베팅 상세 |
| **API 호출** | `SammoAPI.Betting.*` |
| **상태 관리** | 로컬 상태 |
| **React 라우트** | `/betting` |

**하위 컴포넌트**:
- BettingDetail (베팅 상세/참여)

---

### 1.13 PageGlobalDiplomacy.vue (중원 정보)

**경로**: `legacy/hwe/ts/PageGlobalDiplomacy.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 외교 현황, 분쟁 현황, 전체 지도 |
| **UI 구성** | 외교 매트릭스 테이블, 지도 |
| **API 호출** | `SammoAPI.Global.GetDiplomacy`, `GetMap` |
| **상태 관리** | GameConstStore |
| **React 라우트** | `/diplomacy` |

**하위 컴포넌트**:
- MapViewer
- SimpleNationList

---

### 1.14 PageNationStratFinan.vue (내무부)

**경로**: `legacy/hwe/ts/PageNationStratFinan.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 국가 예산, 정책 설정, 국가 방침 |
| **UI 구성** | 외교 테이블, 예산 표시, 정책 폼 |
| **API 호출** | `SammoAPI.Nation.*` |
| **상태 관리** | 로컬 상태 (reactive) |
| **React 라우트** | `/nation/finance` |

**주요 기능**:
- 세율/지급률 조정
- 국가 방침 편집 (TipTap 에디터)
- 임관 권유문 편집
- 전쟁/임관 금지 설정

---

### 1.15 PageInheritPoint.vue (유산 관리)

**경로**: `legacy/hwe/ts/PageInheritPoint.vue`

| 항목 | 내용 |
|------|------|
| **기능** | 유산 포인트 조회/사용 |
| **UI 구성** | 포인트 현황, 구매 옵션, 로그 |
| **API 호출** | `SammoAPI.InheritAction.*` |
| **상태 관리** | 로컬 상태 |
| **React 라우트** | `/inherit` |

**주요 기능**:
- 유산 버프 구매
- 전투 특기 선택
- 유니크 경매 시작
- 능력치 초기화

---

## 2. 공통 컴포넌트 분석

### 2.1 레이아웃 컴포넌트

| Vue 컴포넌트 | 설명 | React 대응 |
|-------------|------|-----------|
| `TopBackBar.vue` | 상단 네비게이션 바 (뒤로가기, 제목) | `<Header />` |
| `BottomBar.vue` | 하단 정보 바 | `<Footer />` |
| `GlobalMenu.vue` | 글로벌 메뉴 (버튼 그리드) | `<Navigation />` |
| `GlobalMenuDropdown.vue` | 드롭다운 메뉴 | shadcn DropdownMenu |

### 2.2 데이터 표시 컴포넌트

| Vue 컴포넌트 | 설명 | React 대응 |
|-------------|------|-----------|
| `MapViewer.vue` | 게임 지도 (SVG/Canvas) | `<MapViewer />` (custom) |
| `MapCityBasic.vue` | 기본 도시 표시 | 내부 컴포넌트 |
| `MapCityDetail.vue` | 상세 도시 표시 | 내부 컴포넌트 |
| `GeneralList.vue` | 장수 목록 (AG Grid) | TanStack Table 또는 AG Grid |
| `SimpleNationList.vue` | 간단 국가 목록 | `<NationList />` |

### 2.3 카드 컴포넌트

| Vue 컴포넌트 | 설명 | React 대응 |
|-------------|------|-----------|
| `GeneralBasicCard.vue` | 장수 기본 정보 카드 | `<GeneralCard />` |
| `GeneralLiteCard.vue` | 장수 간략 카드 | `<GeneralCardLite />` |
| `GeneralSupplementCard.vue` | 장수 보조 정보 | `<GeneralCardSupplement />` |
| `CityBasicCard.vue` | 도시 정보 카드 | `<CityCard />` |
| `NationBasicCard.vue` | 국가 정보 카드 | `<NationCard />` |

### 2.4 폼/입력 컴포넌트

| Vue 컴포넌트 | 설명 | React 대응 |
|-------------|------|-----------|
| `CommandSelectForm.vue` | 명령 선택 폼 | `<CommandForm />` |
| `NumberInputWithInfo.vue` | 숫자 입력 + 설명 | shadcn Input + Label |
| `TipTap.vue` | 리치 텍스트 에디터 | TipTap React |
| `DragSelect.vue` | 드래그 선택 | react-dnd |

### 2.5 메시지/알림 컴포넌트

| Vue 컴포넌트 | 설명 | React 대응 |
|-------------|------|-----------|
| `MessagePanel.vue` | 메시지 목록 패널 | `<MessagePanel />` |
| `MessagePlate.vue` | 개별 메시지 | `<Message />` |

### 2.6 게시판 컴포넌트

| Vue 컴포넌트 | 설명 | React 대응 |
|-------------|------|-----------|
| `BoardArticle.vue` | 게시글 표시 | `<Article />` |
| `BoardComment.vue` | 댓글 표시 | `<Comment />` |

### 2.7 경매/베팅 컴포넌트

| Vue 컴포넌트 | 설명 | React 대응 |
|-------------|------|-----------|
| `AuctionResource.vue` | 자원 경매 항목 | `<AuctionItem />` |
| `AuctionUniqueItem.vue` | 유니크 경매 항목 | `<AuctionUniqueItem />` |
| `BettingDetail.vue` | 베팅 상세 | `<BettingDetail />` |

### 2.8 게임 UI 컴포넌트

| Vue 컴포넌트 | 설명 | React 대응 |
|-------------|------|-----------|
| `MainControlBar.vue` | 메인 컨트롤 바 | `<ControlBar />` |
| `MainControlDropdown.vue` | 컨트롤 드롭다운 | shadcn DropdownMenu |
| `GameInfo.vue` | 게임 정보 표시 | `<GameInfo />` |
| `GameBottomBar.vue` | 게임 하단 바 | `<GameFooter />` |
| `SammoBar.vue` | 진행 바 | shadcn Progress |
| `SimpleClock.vue` | 실시간 시계 | `<Clock />` |
| `AutorunInfo.vue` | 자율행동 정보 | `<AutorunInfo />` |
| `ChiefReservedCommand.vue` | 사령 예약 명령 | `<ReservedCommand />` |

---

## 3. shadcn/ui 매핑

### 3.1 기본 컴포넌트 매핑

| 레거시 | shadcn/ui | 비고 |
|--------|-----------|------|
| Bootstrap Button | Button | variant 매핑 필요 |
| Bootstrap Modal | Dialog | - |
| Bootstrap Dropdown | DropdownMenu | - |
| Bootstrap Form | Form (react-hook-form) | - |
| Bootstrap Table | Table | - |
| Bootstrap Input | Input | - |
| Bootstrap Select | Select | - |
| Bootstrap Checkbox | Checkbox | - |
| Bootstrap Switch | Switch | - |
| Bootstrap Toast | Toast (sonner) | - |
| Bootstrap Tooltip | Tooltip | - |
| Bootstrap Progress | Progress | - |
| Bootstrap Card | Card | - |
| Bootstrap Tabs | Tabs | - |

### 3.2 Bootstrap Vue 컴포넌트 대체

| bootstrap-vue-next | shadcn/ui | 비고 |
|--------------------|-----------|------|
| `BContainer` | div + cn() | Tailwind 유틸리티 |
| `BButton` | Button | - |
| `BDropdown` | DropdownMenu | - |
| `BModal` | Dialog | - |
| `BFormInput` | Input | - |
| `BFormSelect` | Select | - |
| `BFormCheckbox` | Checkbox | - |
| `BToast` | Toast | sonner 라이브러리 |
| `BButtonGroup` | Button + flex | - |

### 3.3 AG Grid → TanStack Table 고려사항

**현재 AG Grid 기능 사용 현황**:
- 열 그룹화 (column groups)
- 열 정렬/필터링
- 커스텀 셀 렌더러
- 열 가시성 토글
- 설정 저장 (localStorage)

**마이그레이션 옵션**:
1. AG Grid React 유지 (라이선스 주의)
2. TanStack Table로 전환 (추가 개발 필요)
3. shadcn DataTable 사용

---

## 4. 라우팅 구조

### 4.1 Next.js App Router 구조

```
apps/web/app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (game)/
│   ├── layout.tsx              # 게임 공통 레이아웃
│   ├── page.tsx                # /game (PageFront)
│   ├── join/page.tsx           # /game/join (PageJoin)
│   ├── auction/page.tsx        # /game/auction (PageAuction)
│   ├── general/
│   │   └── [id]/page.tsx       # /game/general/:id (PageBattleCenter)
│   ├── nation/
│   │   ├── generals/page.tsx   # /game/nation/generals (PageNationGeneral)
│   │   └── finance/page.tsx    # /game/nation/finance (PageNationStratFinan)
│   ├── troop/page.tsx          # /game/troop (PageTroop)
│   ├── vote/page.tsx           # /game/vote (PageVote)
│   ├── history/page.tsx        # /game/history (PageHistory)
│   ├── board/
│   │   └── [type]/page.tsx     # /game/board/:type (PageBoard)
│   ├── chief/page.tsx          # /game/chief (PageChiefCenter)
│   ├── npc-control/page.tsx    # /game/npc-control (PageNPCControl)
│   ├── betting/page.tsx        # /game/betting (PageNationBetting)
│   ├── diplomacy/page.tsx      # /game/diplomacy (PageGlobalDiplomacy)
│   └── inherit/page.tsx        # /game/inherit (PageInheritPoint)
└── page.tsx                    # 랜딩 페이지
```

### 4.2 라우트 매핑 테이블

| Vue 컴포넌트 | 레거시 URL | Next.js 라우트 |
|-------------|-----------|---------------|
| PageFront | `/v_game.php` | `/game` |
| PageJoin | `/v_join.php` | `/game/join` |
| PageAuction | `/v_auction.php` | `/game/auction` |
| PageBattleCenter | `/v_battleCenter.php` | `/game/general/[id]` |
| PageNationGeneral | `/v_nationGeneral.php` | `/game/nation/generals` |
| PageTroop | `/v_troop.php` | `/game/troop` |
| PageVote | `/v_vote.php` | `/game/vote` |
| PageHistory | `/v_history.php` | `/game/history` |
| PageBoard | `/v_board.php` | `/game/board/[type]` |
| PageChiefCenter | `/v_chief.php` | `/game/chief` |
| PageNPCControl | `/v_npcControl.php` | `/game/npc-control` |
| PageNationBetting | `/v_betting.php` | `/game/betting` |
| PageGlobalDiplomacy | `/v_globalDiplomacy.php` | `/game/diplomacy` |
| PageNationStratFinan | `/v_nationStratFinan.php` | `/game/nation/finance` |
| PageInheritPoint | `/v_inheritPoint.php` | `/game/inherit` |

---

## 5. 스타일 시스템

### 5.1 레거시 SCSS 구조

```
legacy/hwe/scss/
├── common/
│   ├── variables.scss    # 색상 변수
│   ├── base.scss         # 기본 스타일
│   └── break_500px.scss  # 반응형 믹스인
├── game_bg.scss          # 게임 배경 스타일
└── map.scss              # 지도 스타일
```

### 5.2 색상 팔레트

```scss
// 기본 테마 색상
$base1color: #141c65;  // 주요 배경 (파란색)
$base2color: #00582c;  // 보조 배경 (초록색)
$base3color: #704615;  // 액센트 (갈색)
$base4color: #70153b;  // 액센트 (보라색)
$nbase2color: #0c1a41; // 네비게이션 배경
```

### 5.3 Tailwind 색상 매핑

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        sammo: {
          base1: '#141c65',
          base2: '#00582c',
          base3: '#704615',
          base4: '#70153b',
          nbase2: '#0c1a41',
        },
        // 국가 색상 (동적 적용)
      }
    }
  }
}
```

### 5.4 반응형 브레이크포인트

| 레거시 | Tailwind | 설명 |
|--------|----------|------|
| `@include media-1000px` | `lg:` (1024px) | 데스크톱 |
| `@include media-500px` | `sm:` (640px) | 모바일 |

---

## 6. API 및 상태 관리

### 6.1 SammoAPI 구조

레거시에서는 `SammoAPI` 객체를 통해 모든 API 호출을 관리합니다.

```typescript
// 주요 API 네임스페이스
SammoAPI.General.*    // 장수 관련
SammoAPI.Nation.*     // 국가 관련
SammoAPI.Global.*     // 전역 정보
SammoAPI.Auction.*    // 경매
SammoAPI.Betting.*    // 베팅
SammoAPI.Board.*      // 게시판
SammoAPI.Vote.*       // 투표
SammoAPI.Troop.*      // 부대
SammoAPI.Chief.*      // 사령부
SammoAPI.InheritAction.*  // 유산
```

### 6.2 React Query 마이그레이션

```typescript
// apps/web/lib/api/general.ts
export const useGeneralDetail = (id: number) => {
  return useQuery({
    queryKey: ['general', id],
    queryFn: () => api.general.getDetail(id),
  });
};

export const useGeneralList = () => {
  return useQuery({
    queryKey: ['nation', 'generals'],
    queryFn: () => api.nation.getGeneralList(),
  });
};
```

### 6.3 GameConstStore → React Context

```typescript
// apps/web/contexts/GameConstContext.tsx
export interface GameConstStore {
  gameConst: GameConst;
  cityConst: Record<number, CityConst>;
  iActionInfo: IActionInfo;
}

export const GameConstContext = createContext<GameConstStore | null>(null);

export const useGameConst = () => {
  const context = useContext(GameConstContext);
  if (!context) throw new Error('GameConstContext not found');
  return context;
};
```

### 6.4 localStorage 상태

| 키 | 용도 | React 대응 |
|----|------|-----------|
| `GeneralListDisplaySetting` | 장수 목록 열 설정 | Zustand 또는 localStorage hook |
| `LastUsedSettingsKey_*` | 마지막 사용 설정 | 동일 |
| `hideMapCityName` | 지도 도시명 표시 | Zustand |
| `toggleSingleTap` | 모바일 탭 모드 | Zustand |

---

## 7. 마이그레이션 우선순위

### Phase 1: 핵심 페이지 (높음)
1. PageFront (메인)
2. PageJoin (가입)
3. PageBattleCenter (장수 상세)
4. PageNationGeneral (장수 목록)

### Phase 2: 국가 관리 (중간)
5. PageNationStratFinan (내무부)
6. PageChiefCenter (사령부)
7. PageTroop (부대)

### Phase 3: 부가 기능 (낮음)
8. PageAuction (경매)
9. PageBoard (게시판)
10. PageVote (투표)
11. PageHistory (연감)
12. PageGlobalDiplomacy (외교)
13. PageNationBetting (베팅)
14. PageNPCControl (NPC)
15. PageInheritPoint (유산)

---

## 8. 주의사항

1. **AG Grid 라이선스**: 상용 라이선스 필요 여부 확인
2. **TipTap 에디터**: React 버전으로 마이그레이션
3. **지도 컴포넌트**: 복잡한 렌더링 로직, 별도 개발 필요
4. **실시간 업데이트**: SSE/WebSocket 구현 방식 결정
5. **국가 색상**: 동적 CSS 변수 처리 방안
