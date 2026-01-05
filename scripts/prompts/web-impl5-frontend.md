# Web 구현 5: React 컴포넌트

## 프로젝트 컨텍스트
```
프로젝트: open-samguk (삼국지 모의전투 포팅)
스택: Next.js 15 + Tailwind + shadcn/ui
경로: apps/web/src/
```

## 참고 문서
먼저 이 파일들을 읽어주세요:
- `docs/architecture/frontend-components.md` - 컴포넌트 목록
- `apps/web/src/app/` - 기존 라우팅
- `apps/web/src/components/ui/` - shadcn/ui 컴포넌트

## 구현 작업

### 1. 페이지 라우팅
```
apps/web/src/app/
├── page.tsx              # 메인 (/)
├── join/page.tsx         # 가입 (/join)
├── game/
│   ├── page.tsx          # 게임 메인
│   ├── general/page.tsx  # 장수 정보
│   ├── nation/page.tsx   # 국가 정보
│   ├── city/page.tsx     # 도시 정보
│   └── battle/page.tsx   # 전투
├── auction/page.tsx      # 경매
└── board/page.tsx        # 게시판
```

### 2. 공통 컴포넌트
```typescript
// apps/web/src/components/
├── GeneralCard.tsx       // 장수 카드
├── NationBadge.tsx       // 국가 뱃지
├── CommandPanel.tsx      // 커맨드 패널
├── ResourceBar.tsx       // 자원 바
└── GameHeader.tsx        // 게임 헤더
```

### 3. API 연동 (tRPC 또는 fetch)
```typescript
// apps/web/src/lib/api.ts
```

### 4. 코드 작성 규칙
- 'use client' 명시적 선언
- shadcn/ui 컴포넌트 활용
- Tailwind 유틸리티 클래스
- 한글 UI 텍스트

### 5. 검증
```bash
pnpm --filter @sammo-ts/web build
```

## 출력 형식
```typescript
// 파일: apps/web/src/app/game/general/page.tsx
'use client';

import { Card } from '@/components/ui/card';
// ... 전체 코드
```

## shadcn/ui 컴포넌트 추가 (필요시)
```bash
cd apps/web
npx shadcn@latest add button card table dialog
```
