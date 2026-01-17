# Game Frontend SPA Plan

이 문서는 `app/game-frontend`를 **Next.js 15 (App Router)** 기반 SPA로 재구축하기 위한
지속 사용 가능한 작업 플랜이다. 레거시 화면(`legacy/hwe`)과 문서(`docs/`)를 기준으로
화면 목록, 인증/권한 분기, 데이터 계약을 정리하고 단계별 구현 순서를 정의한다.

## Goals

- 레거시 화면과 정보 제공 범위를 보존하면서 SPA로 재구성한다.
- 인증 상태별 정보 공개 범위를 엄격히 분리한다.
- API 통신은 tRPC로 통일하고, 추후 SSE 실시간 업데이트 경로를 고려한다.
- **UI/레이아웃은 현대적으로 새롭게 디자인**하되, 정보 구조는 레거시와 동일하게 유지한다.
- **Next.js App Router** 기반으로 전환하여 RSC, 서버 액션, 스트리밍 등 최신 기능 활용.

## Tech Stack

### 이전 스택 (Vue 3) — DEPRECATED

- Vue 3 + `<script setup>`
- Pinia (상태 관리)
- Vue Router
- Vite
- TailwindCSS

### 새 스택 (Next.js 15)

- **Next.js 15** (App Router)
- **React 19** + Server Components
- **Zustand** 또는 **Jotai** (클라이언트 상태 관리)
- **TanStack Query** (서버 상태 + tRPC 연동)
- **TailwindCSS v4** + **shadcn/ui** (디자인 시스템)
- **Framer Motion** (애니메이션)
- **tRPC React Query adapter** (API 통신)

## Reference Sources

- Legacy view entrypoints: `legacy/hwe/{b_,v_,a_,index}*.php`
- Legacy Vue/TS sources: `legacy/hwe/ts/`, `legacy/hwe/ts/components/`
- Docs: `docs/architecture/overview.md`, `docs/architecture/rewrite-plan.md`,
  `docs/architecture/runtime.md`, `docs/architecture/legacy-engine*.md`

## User State Matrix

- **Public** (미로그인/장수 미생성): 공개 정보만 노출
    - 레거시 기준: 10분 캐시 지도 + 동향(최소 정보)
- **Authed** (로그인 + 장수 생성): 대부분의 정보 접근 허용
- **Admin/GM**: 운영자 전용 화면 및 도구 (후순위)

## Legacy Screen Inventory (Route 후보)

정확한 데이터 흐름/권한은 각 PHP 엔트리포인트와 연관 TS 컴포넌트에서 확인한다.

### Public Routes

| Route       | Legacy              | 설명                   |
| ----------- | ------------------- | ---------------------- |
| `/`         | `v_cachedMap.php`   | 캐시된 지도 + 중원정세 |
| `/nations`  | `a_kingdomList.php` | 세력 일람              |
| `/generals` | `a_genList.php`     | 장수 일람 (제한)       |

### Auth Routes

| Route        | Legacy                  | 설명            |
| ------------ | ----------------------- | --------------- |
| `/login`     | —                       | 로그인/회원가입 |
| `/join`      | `v_join.php`            | 장수 생성/빙의  |
| `/main`      | `index.php`             | 메인 대시보드   |
| `/board`     | `v_board.php`           | 게시판          |
| `/history`   | `v_history.php`         | 기록실          |
| `/vote`      | `v_vote.php`            | 투표            |
| `/auction`   | `v_auction.php`         | 경매            |
| `/battle`    | `v_battleCenter.php`    | 전투 센터       |
| `/diplomacy` | `v_globalDiplomacy.php` | 외교 현황       |
| `/troop`     | `v_troop.php`           | 부대 관리       |
| `/inherit`   | `v_inheritPoint.php`    | 유산 포인트     |
| `/betting`   | `b_betting.php`         | 베팅            |
| `/fame`      | `a_hallOfFame.php`      | 명예의 전당     |
| `/emperors`  | `a_emperior.php`        | 역대 천자       |
| `/traffic`   | `a_traffic.php`         | 접속 통계       |

### Nation Admin Routes

| Route              | Legacy                   | 설명           |
| ------------------ | ------------------------ | -------------- |
| `/nation/generals` | `v_nationGeneral.php`    | 국가 장수 관리 |
| `/nation/strategy` | `v_nationStratFinan.php` | 국가 전략/재정 |
| `/nation/npc`      | `v_NPCControl.php`       | NPC 제어       |
| `/nation/chief`    | `v_chiefCenter.php`      | 군주 센터      |

## Architecture Decisions (Next.js)

### 렌더링 전략

- **Public 페이지**: SSG + ISR (10분 revalidate) — 캐시 지도, 세력 일람
- **Auth 페이지**: CSR + Streaming — 실시간 데이터 필요
- **Main 대시보드**: Hybrid — 초기 로드는 서버, 이후 클라이언트 갱신

### 라우팅 구조 (App Router)

```
app/
├── (public)/
│   ├── page.tsx              # 캐시 지도
│   ├── nations/page.tsx      # 세력 일람
│   └── generals/page.tsx     # 장수 일람
├── (auth)/
│   ├── login/page.tsx
│   ├── join/page.tsx
│   └── layout.tsx            # 로그인 체크
├── (game)/
│   ├── main/page.tsx         # 메인 대시보드
│   ├── board/page.tsx
│   ├── battle/page.tsx
│   ├── diplomacy/page.tsx
│   ├── auction/page.tsx
│   └── layout.tsx            # 장수 생성 체크 + 게임 레이아웃
├── api/                      # API Routes (필요시)
└── layout.tsx                # Root layout
```

### 상태 관리

- **서버 상태**: TanStack Query + tRPC
- **클라이언트 상태**: Zustand (세션, UI 상태)
- **URL 상태**: nuqs (검색/필터 파라미터)

### API 통신

- tRPC React Query adapter 사용
- SSR: `createCaller`로 서버에서 직접 호출
- CSR: `trpc.useQuery()` / `trpc.useMutation()`
- 실시간: SSE 또는 WebSocket (메인 대시보드)

### 디자인 시스템

- **shadcn/ui**: 기본 컴포넌트
- **TailwindCSS v4**: 스타일링
- **Framer Motion**: 애니메이션
- **Radix UI**: 접근성 보장
- 다크 모드 기본 지원
- 한국어 UI 최적화

## Implementation Phases

### Phase 0: Discovery & Mapping ✅

- 레거시 화면별 데이터 소스, 권한 레벨, 갱신 주기 파악 완료
- 화면/기능 분류 완료: Public / Core / Advanced
- tRPC 엔드포인트 목록과 데이터 계약 초안 작성 완료

### Phase 1: Next.js Project Setup

- [ ] `app/game-frontend` 초기화 (Next.js 15 + TypeScript)
- [ ] TailwindCSS v4 + shadcn/ui 설정
- [ ] tRPC 클라이언트 설정 (React Query adapter)
- [ ] Zustand 스토어 기본 구조
- [ ] 공통 레이아웃 및 에러 바운더리
- [ ] 인증 미들웨어 (middleware.ts)

### Phase 2: Design System

- [ ] 컬러 팔레트 정의 (다크 모드 기본)
- [ ] 타이포그래피 (한글 최적화)
- [ ] 공통 컴포넌트 (Button, Card, Modal, Toast 등)
- [ ] 지도 컴포넌트 (MapViewer) 재구현
- [ ] 반응형 레이아웃 (모바일 지원)

### Phase 3: Public Views

- [ ] 캐시 지도 페이지 (SSG + ISR)
- [ ] 세력 일람 페이지
- [ ] 장수 일람 페이지 (제한된 정보)
- [ ] 로그인/회원가입 페이지

### Phase 4: Core Auth Views

- [ ] 장수 생성/빙의 페이지
- [ ] 메인 대시보드
    - [ ] 지도 패널
    - [ ] 명령 패널
    - [ ] 장수/도시/국가 정보 패널
    - [ ] 메시지 패널
    - [ ] 실시간 동기화 토글
- [ ] 게시판

### Phase 5: Advanced Views

- [ ] 전투 센터
- [ ] 외교 현황
- [ ] 경매
- [ ] 베팅
- [ ] 통계/명예전당

### Phase 6: Hardening

- [ ] 라우트 가드 완성
- [ ] 에러 복구 전략
- [ ] 캐시/재시도 정책
- [ ] E2E 테스트 (Playwright)
- [ ] 성능 최적화

## Previous Progress (Vue Version) — Archived

이전 Vue 버전에서 완료된 작업 (참조용):

- Phase 1: `app/game-frontend` 기본 스캐폴딩(Vite/Vue3/Pinia/Router/Tailwind) 완료
- Phase 2: 게임/게이트웨이 tRPC 클라이언트 분리 구성 및 env 키 추가
- 인증 부트스트랩: 게이트웨이 세션 확인 → 게임 토큰 발급 → 장수 보유 여부 반영
- 라우트: Public/Login/Join/Main 기본 가드 및 분기 처리
- 메인 화면 스켈레톤: 지도/명령/장수/도시/국가/메시지 패널 + 반응형 레이아웃 + 실시간 토글 UI
- API 보강: 게임 API에 `general.me` 추가 (메인 화면 컨텍스트 제공)
- MapViewer 1차 이식: 지도 토글/툴팁/도시 마커/디테일 모드와 Pinia 상태 연결
- 지도 레이아웃 API: 시나리오 기반 도시명/좌표 제공 + MapViewer 연동 완료
- 지도 선택 연동: 클릭 시 선택 도시 패널/명령 패널에 연결
- 레거시 맵 렌더링 보강: 테마/계절 배경, 도로 레이어, 성/이벤트 아이콘, 상태색 로직 이식
- 지도 아이콘 베이스 경로: `VITE_GAME_ASSET_URL`로 레거시 이미지 경로 주입
- Join/빙의 UI 구현: 장수 생성/빙의 탭, NPC 목록 로딩, 생성/빙의 후 세션 상태 갱신 및 메인 이동
- 게임 API: `join.getConfig`, `join.createGeneral`, `join.listPossessCandidates`, `join.possessGeneral` 추가
- Public 화면 구현: 캐시 지도/중원 정세/세력 일람/제한 장수 일람 구성
- Public API: `public.getCachedMap`, `public.getWorldTrend`, `public.getNationList`, `public.getGeneralList` 추가
- Gateway → Game handoff: 게이트웨이에서 `gameToken` 발급 후 게임 프론트에서 1회 교환(access token)하는 흐름 추가

## Current Status (Next.js Version)

- Phase 0: ✅ 완료
- Phase 1: 🔨 시작 예정

## Gateway Frontend

`app/gateway-frontend`도 동일하게 Next.js로 전환 예정.

| 현재         | 변경       |
| ------------ | ---------- |
| Vue 3 + Vite | Next.js 15 |
| Pinia        | Zustand    |
| Vue Router   | App Router |

게이트웨이는 상대적으로 단순하므로 게임 프론트엔드 전환 후 진행.

## Design Direction

### 비주얼 컨셉

- **모던 다크 테마**: 게임 분위기에 맞는 어두운 배경
- **삼국지 느낌**: 붓글씨 스타일 타이틀, 전통 문양 액센트
- **미니멀 UI**: 정보 밀도는 유지하되 시각적 노이즈 최소화
- **글로우 효과**: 중요 정보에 네온 스타일 강조

### 색상 팔레트 (예시)

```css
--background: hsl(222 47% 11%); /* 어두운 남색 */
--foreground: hsl(210 40% 98%); /* 밝은 회백색 */
--primary: hsl(346 77% 49%); /* 붉은색 (전쟁/위험) */
--secondary: hsl(43 96% 56%); /* 금색 (부/영예) */
--accent: hsl(199 89% 48%); /* 청색 (지략/평화) */
--muted: hsl(215 16% 47%); /* 회색 */
```

### 폰트

- **제목**: Noto Serif KR (명조) 또는 Gowun Batang
- **본문**: Pretendard 또는 SUIT

## Open Questions

- [ ] SSE vs WebSocket: 실시간 업데이트 방식 최종 결정
- [ ] 이미지 서빙: 레거시 이미지 CDN 경로 확정
- [ ] 모바일 지원 범위: 반응형 vs 별도 모바일 뷰

## Resolved Questions

- Public 상태 동향 범위는 캐싱된 지도, 중원 정세, 세력일람으로 제한한다. 장수일람은 실시간 제공하되 이름/NPC 여부/국가/기본 능력치만 노출한다. 그 외 장수 정보는 캐싱된 자료에 기반하며, 빈번한 접근 제한 우회를 막기 위해 캐싱 전략을 유지한다.
- 실시간 업데이트는 메인 화면에 한정한다. 대상: 지도, 명령 목록, 현재 도시 정보, 소속 국가 정보, 장수 스탯, 장수 동향, 개인 기록, 중원 정세, 메시지함. 메인 화면에는 "실시간 동기화 켬/끔" 토글이 필요하다.
