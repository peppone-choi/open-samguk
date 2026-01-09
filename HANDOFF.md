# 삼국지 모의전투 - 멀티 에이전트 작업 문서

> 최종 업데이트: 2026-01-09
> 작업 방식: 각 에이전트가 하나의 TASK를 선택하여 독립적으로 수행

---

## 프로젝트 개요

**삼국지 모의전투 HiDCHe** - PHP 레거시 게임을 TypeScript로 포팅하는 프로젝트

| 항목          | 값                                  |
| ------------- | ----------------------------------- |
| 프로젝트 경로 | `/Users/apple/Desktop/open-samguk/` |
| 레거시 코드   | `legacy/`                           |
| 새 코드       | `packages/`, `apps/`                |
| 패키지 매니저 | pnpm (workspace)                    |
| 실행 명령어   | `pnpm dev` (API + Web 동시 실행)    |

---

## 완료된 작업 요약

### 백엔드 (packages/logic)

- 제약조건: 73/73 (100%) ✅
- 장수 커맨드: 56/56 (100%) ✅
- 국가 커맨드: 41/41 (100%) ✅
- 전투 트리거: 38/38 (100%) ✅
- 전투 특기 트리거 연결: 5/5 (100%) ✅
  - FurySpecial → RageAttemptTrigger, RageActivateTrigger
  - SniperSpecial → SniperAttemptTrigger, SniperActivateTrigger
  - IntimidationSpecial → IntimidationAttemptTrigger, IntimidationActivateTrigger
  - MedicineSpecial → BattleHealAttemptTrigger, BattleHealActivateTrigger
  - CounterStrategySpecial → CounterAttemptTrigger, CounterActivateTrigger
- GeneralSabotageCommand: MapUtil.getDistance() 사용하도록 수정 완료 ✅

### 프론트엔드 인증

- ✅ JWT 인증 시스템 (Access + Refresh Token)
- ✅ 카카오 OAuth 연동
- ✅ 세션 만료 경고 모달
- ✅ 비밀번호 재설정 기능

### 프론트엔드 페이지 (33/33 완료) ✅

- ✅ Phase 0-4: 기반 설정, Gateway, 컴포넌트, 유틸리티 페이지
- [x] p5-5: PageNationStratFinan - 내무부 (`/nation/finance`)
- [x] p5-6: PageTroop - 부대 편성 (`/troop`)
- ✅ Phase 7: 메인 대시보드 (1/1) - Dashboard.tsx 완전 재작성

---

## 🎯 가용 TASK 목록 (현 시점 기준)

> **원칙**: 이미 포팅된 페이지/커맨드 재작업은 금지.
> 아래는 실제 남아있는 "연동/운영 플로우/검증" 중심 작업입니다.

---

### TASK-H1: 프론트엔드 tRPC 실연동/실시간 업데이트

- **목표**: `apps/web`이 모든 주요 tRPC 엔드포인트를 사용하도록 정리하고, 실시간 이벤트 흐름(SSE/WebSocket)을 운영 가능한 수준으로 완성
- **참조**: `docs/remaining-work.md`의 H1

### TASK-H2: 엔딩/통일 이벤트 검증 및 운영 플로우 연결

- **목표**: 통일 조건 판정/엔딩 처리/명예의 전당 저장/게임 초기화 플로우를 실제 엔진 루프에서 검증
- **참조**: `docs/remaining-work.md`의 H2

### TASK-H3: 경매 시스템 운영 플로우 검증 (월간 처리 포함)

- **목표**: AuctionService + API + 프론트 페이지의 end-to-end 동작을 점검하고 월간 처리 훅까지 검증
- **참조**: `docs/remaining-work.md`의 H3

### TASK-M4: 메시지/게시판 실시간 완성

- **목표**: 메시지/게시판의 실시간 푸시 + UI 연동 완성
- **참조**: `docs/remaining-work.md`의 M4

### TASK-M5: 랭킹/통계 API

- **목표**: 랭킹/통계 조회 API + 캐싱 전략 적용
- **참조**: `docs/remaining-work.md`의 M5

---

## 공통 참조 정보

### 프로젝트 구조

```
/Users/apple/Desktop/open-samguk/
├── apps/
│   ├── api/             # NestJS API 서버 (포트 3001)
│   ├── engine/          # Turn Daemon
│   └── web/             # Next.js 프론트엔드 (포트 3000)
├── packages/
│   ├── common/          # 공통 유틸리티
│   ├── infra/           # Prisma, Redis
│   └── logic/           # 게임 로직 (핵심)
├── legacy/              # PHP 레거시 코드
│   └── hwe/ts/          # Vue 컴포넌트 (포팅 원본)
└── docs/                # 문서
```

### 프론트엔드 스타일링 규칙

```tsx
// 최대 너비
className = "max-w-[1000px]"; // 데스크톱
className = "max-w-[500px]"; // 모바일

// 배경 클래스 (globals.css에 정의)
className = "bg0"; // 가장 어두운 배경
className = "bg1"; // 중간 배경
className = "bg2"; // 밝은 배경

// 컬러 로그 파싱 (MessagePanel 등)
const LOG_REGEX = /<([RBGMCLSODYW]1?|1|\/)>/g;
// <R>빨강</> → <span style="color: red;">빨강</span>
```

### 컴포넌트 임포트 패턴

```tsx
"use client";

import { TopBackBar, GeneralBasicCard } from "@/components/game";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
```

### 빌드/테스트 명령어

```bash
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버 (API + Web)
pnpm -w run test      # 테스트 실행
pnpm -w run typecheck # 타입 체크
```

### 금지 사항

| 금지               | 이유                |
| ------------------ | ------------------- |
| `as any`           | 타입 안전성 파괴    |
| `@ts-ignore`       | 타입 에러 숨김      |
| `@ts-expect-error` | 타입 에러 숨김      |
| 테스트 삭제        | 빌드 통과 꼼수 금지 |

---

## 작업 완료 보고 형식

```markdown
## TASK-XX-XX 완료 보고

### 변경된 파일

- `apps/web/src/app/(game)/xxx/page.tsx` - 신규 생성
- `apps/api/src/game/xxx.service.ts` - 수정

### 구현 내용

1. ...
2. ...

### 테스트 결과

- TypeScript 에러: 없음
- 빌드: 성공

### 스크린샷 (해당 시)

[UI 스크린샷 또는 설명]

### 다음 작업 제안

- TASK-XX-XX와 연계 필요
```

---

_문서 버전: 2026-01-09 v2.0_
