# 프론트엔드 포팅 현황 (Frontend Porting Status)

> 최종 업데이트: 2026-01-09
> 현재 진행도: **33/33 tasks (100%)**

---

## 요약

| 단계                     | 상태    | 완료 항목                                |
| ------------------------ | ------- | ---------------------------------------- |
| Phase 0: 기반 설정       | ✅ 완료 | 디자인 시스템, 공통 레이아웃             |
| Phase 1-2: Gateway       | ✅ 완료 | 로그인, 회원가입, 서버 목록, 계정 관리   |
| Phase 3: 컴포넌트        | ✅ 완료 | MapViewer, GeneralList, 등 핵심 컴포넌트 |
| Phase 4: 유틸리티 페이지 | ✅ 완료 | PageJoin, PageAuction, PageBoard 등      |
| Phase 5: 정보 페이지     | ✅ 완료 | 6/6 완료                                 |
| Phase 6: 관리 페이지     | ✅ 완료 | 3/3 완료 (사령부, 유산, NPC 정책)        |
| Phase 7: 메인 대시보드   | ✅ 완료 | 1/1 완료 (PageFront)                     |

---

## 완료된 작업 (27개)

### Phase 0: 기반 설정 ✅

- [x] p0-1: 디자인 시스템 설정 - Tailwind 색상, 고정폭 컨테이너, 공통 클래스
- [x] p0-2: 공통 레이아웃 컴포넌트 - GatewayLayout, Navbar

### Phase 1-2: Gateway 페이지 ✅

- [x] p1-1: 로그인 페이지 (`legacy/index.php` → `/login`)
- [x] p1-2: 회원가입 페이지 (`oauth_kakao/join.php` → `/register`)
- [x] p2-1: 서버 목록/로비 (`entrance.php` → `/servers`)
- [x] p2-2: 계정 관리 (`user_info.php` → `/account`)

### Phase 3: 핵심 컴포넌트 ✅

- [x] p3-0a: CityBasicCard 컴포넌트 포팅
- [x] p3-0b: NationBasicCard 컴포넌트 포팅
- [x] p3-0c: GeneralBasicCard 컴포넌트 포팅
- [x] p3-0d: GameBottomBar 컴포넌트 포팅
- [x] p3-1: MapViewer 컴포넌트 (Vue → React 포팅)
- [x] p3-2: GeneralList 컴포넌트 (AG Grid → TanStack Table)
- [x] p3-3: MessagePanel 컴포넌트 (SSE 실시간)
- [x] p3-4: CommandSelectForm 컴포넌트 (명령 선택 UI)
- [x] p3-5: ReservedCommandPanel 컴포넌트 (예약 명령 패널)
- [x] p3-6: CommandArgForms (SelectCity, SelectAmount 등 명령 인자 폼)

### Phase 4: 유틸리티 페이지 ✅

- [x] p4-1: PageJoin - 장수 생성 (`/join`)
- [x] p4-2: PageAuction - 경매장 (`/auction`)
- [x] p4-3: PageBoard - 게시판 (`/board/[type]`)
- [x] p4-4: PageNationBetting - 베팅장 (`/betting`)
- [x] p4-5: PageVote - 투표 (`/vote`)
- [x] p4-6: PageCachedMap - 캐시된 지도 (`/cached-map`)

### Phase 5: 정보 페이지 (6/6 완료) ✅

- [x] p5-1: PageNationGeneral - 세력 장수 목록 (`/nation/generals`)
- [x] p5-2: PageBattleCenter - 감찰부 (`/battle-center`)
- [x] p5-3: PageHistory - 연감 (`/history`)
- [x] p5-4: PageGlobalDiplomacy - 중원 정보 (`/diplomacy`)
- [x] p5-5: PageNationStratFinan - 내무부 (`/nation/finance`)
- [x] p5-6: PageTroop - 부대 편성 (`/troop`)

---

## 남은 작업 (0개)

(현재 계획된 33개 작업 모두 완료)

---

## 완료된 작업 보강 (Phase 6-7)

### Phase 6: 관리 페이지 ✅

- [x] p6-1: PageChiefCenter - 사령부 (`/chief`)
- [x] p6-2: PageInheritPoint - 유산 관리 (`/inherit`)
- [x] p6-3: PageNPCControl - NPC 정책 (`/npc-control`)

### Phase 7: 메인 대시보드 ✅

- [x] p7-1: PageFront - 메인 대시보드 (`/`)

---

## 구현 패턴 참고

### 파일 구조

```
apps/web/src/app/(game)/[feature]/page.tsx  - 메인 페이지 컴포넌트
legacy/hwe/ts/Page[Feature].vue             - 레거시 참조
```

### 컴포넌트 패턴

```tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";

// Types, utility functions, mock data at top
// Sub-components if needed
// Main page component with loading state, error handling
```

### 스타일링 패턴

- 최대 너비: `max-w-[1000px]` (데스크톱), `max-w-[500px]` (모바일)
- 배경 클래스: `bg0`, `bg1`, `bg2` (다크 테마 그라데이션)
- 그리드 레이아웃: legacy col-X 패턴과 매칭

### formatLog 유틸리티 (컬러 로그 파싱)

```tsx
const LOG_REGEX = /<([RBGMCLSODYW]1?|1|\/)>/g;
const COLOR_MAP = { R: "color: red;", B: "color: blue;", ... };
// <R>text</> → <span style="color: red;">text</span>
```

---

## 핵심 제약 조건

1. **레거시와 동일한 레이아웃/사이즈** - 500px 모바일, 1000px 데스크톱 max-width
2. **동일한 입출력 데이터 구조** - 레거시 API와 호환
3. **모던화 가능 항목**: 색상, 그림자, 타이포그래피, 트랜지션
4. **기존 컴포넌트 사용**: TopBackBar, Button, SammoBar 등 @/components에서 가져오기
5. **Mock 데이터 + TODO 주석**: API 연동 전 mock 데이터로 UI 구현

---

## 기존 컴포넌트 목록

| 컴포넌트             | 위치                | 설명                              |
| -------------------- | ------------------- | --------------------------------- |
| TopBackBar           | `@/components/game` | 뒤로가기/닫기 버튼이 있는 상단 바 |
| GeneralList          | `@/components/game` | TanStack Table 기반 장수 목록     |
| MapViewer            | `@/components/game` | 인터랙티브 맵 컴포넌트            |
| SammoBar             | `@/components/game` | 프로그레스 바 컴포넌트            |
| Button               | `@/components/ui`   | Shadcn 버튼 컴포넌트              |
| GeneralBasicCard     | `@/components/game` | 장수 기본 정보 카드               |
| CityBasicCard        | `@/components/game` | 도시 기본 정보 카드               |
| NationBasicCard      | `@/components/game` | 국가 기본 정보 카드               |
| CommandSelectForm    | `@/components/game` | 명령 선택 폼                      |
| ReservedCommandPanel | `@/components/game` | 예약 명령 패널                    |
| MessagePanel         | `@/components/game` | 실시간 메시지 패널                |

---

## 다음 단계

1. `todoread` 실행하여 현재 상태 확인
2. 레거시 파일 확인: `legacy/hwe/ts/PageNationStratFinan.vue`
3. 타겟 파일로 포팅: `apps/web/src/app/(game)/nation/finance/page.tsx`

---

## 참조 문서

- [전체 남은 작업](./remaining-work.md)
- [구현 진행 현황](./implementation-progress.md)
- [백엔드 포팅 현황](./backend-porting-status.md)
- [아키텍처 개요](./architecture/overview.md)
