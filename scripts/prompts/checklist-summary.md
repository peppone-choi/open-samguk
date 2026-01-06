# 포팅 체크리스트 종합 요약

> 생성일: 2026-01-05
> 레거시 총 파일: 6,006개 (PHP: 907개)

## 전체 구현 현황

| 카테고리 | 레거시 | 구현 | 진행률 | 우선순위 |
|---------|--------|------|--------|----------|
| 장수 커맨드 | 55 | 42 | 76% | ⭐⭐⭐ |
| 국가 커맨드 | 38 | 18 | 47% | ⭐⭐⭐⭐ |
| 전투 트리거 | 36 | 0 | 0% | ⭐⭐⭐⭐⭐ |
| 전투 특기 | 21 | 0 | 0% | ⭐⭐⭐⭐⭐ |
| 내정 특기 | 30 | 0 | 0% | ⭐⭐⭐ |
| 장수 트리거 | 4 | 2 | 50% | ⭐⭐⭐ |
| 국가 성향 | 15 | 0 | 0% | ⭐⭐⭐⭐ |
| 제약 조건 | 73 | ~20 | 27% | ⭐⭐⭐ |
| 아이템 | 161 | 0 | 0% | ⭐⭐ |
| 이벤트 | 37 | 0 | 0% | ⭐⭐ |
| 성격 | 12 | 0 | 0% | ⭐ |
| **합계** | **482** | **~82** | **17%** | - |

## 체크리스트 파일 목록

| 파일명 | 내용 | 항목 수 |
|--------|------|---------|
| `checklist-war-triggers.md` | 전투 트리거 시스템 | 36개 |
| `checklist-specials.md` | 전투/내정 특기 | 51개 |
| `checklist-nation-commands.md` | 국가 커맨드 | 20개 |
| `checklist-nation-types.md` | 국가 성향 | 15개 |
| `checklist-general-triggers.md` | 장수 트리거 | 2개 |
| `checklist-constraints.md` | 제약 조건 | 73개 |
| `checklist-items.md` | 아이템 시스템 | 161개 |
| `checklist-events.md` | 이벤트 시스템 | 37개 |

## 우선순위별 작업 가이드

### Priority 1: 핵심 전투 시스템 (긴급)
**목표**: 전투가 정상 동작하도록 함

1. **전투 트리거** (`checklist-war-triggers.md`)
   - 필살/회피 시스템 (4개) - 전투의 핵심
   - 계략 시스템 (3개) - 지력전의 핵심
   - 저격/반계 (4개) - 특수 전투

2. **전투 특기** (`checklist-specials.md`)
   - 필살, 무쌍, 돌격, 집중, 견고 (5개)
   - 병종 특기: 기병, 궁병, 보병 (3개)

### Priority 2: 전략 시스템 (높음)
**목표**: 국가 운영이 가능하도록 함

1. **국가 커맨드** (`checklist-nation-commands.md`)
   - 전략 커맨드: 급습, 수몰, 초토화 (3개)
   - 외교 커맨드: 불가침파기, 동맹 (2개)
   - 연구 커맨드: 병종 연구 (9개)

2. **국가 성향** (`checklist-nation-types.md`)
   - 병가, 법가, 덕가 (3개) - 가장 많이 사용
   - 나머지 12개

### Priority 3: 보조 시스템 (중간)
**목표**: 게임 완성도 향상

1. **제약 조건** (`checklist-constraints.md`)
   - 외교/전쟁 제약 (6개)
   - 장수/국가 자원 제약 (14개)

2. **이벤트** (`checklist-events.md`)
   - 주기적 이벤트 (수입, 새해 등)
   - NPC 관련 이벤트

### Priority 4: 콘텐츠 (낮음)
**목표**: 게임 다양성

1. **아이템** (`checklist-items.md`)
   - 무기 30개, 명마 30개, 서적 30개
   - 특수 효과 아이템 70+개

2. **내정 특기** (`checklist-specials.md`)
   - 경작, 상재, 인덕 등 9개

## 병렬 작업 분배

### 터미널 세션 (Claude CLI) - 5개
| 세션 | 파일 | 예상 항목 |
|------|------|----------|
| 1 | `checklist-war-triggers.md` | 36개 |
| 2 | `checklist-specials.md` | 51개 |
| 3 | `checklist-nation-commands.md` | 20개 |
| 4 | `checklist-nation-types.md` | 15개 |
| 5 | `checklist-constraints.md` | 73개 |

### 웹 세션 (claude.ai) - 5개
| 세션 | 역할 | 담당 |
|------|------|------|
| 1 | 레거시 분석 | PHP 코드 분석 및 문서화 |
| 2 | 타입 설계 | 인터페이스 및 DTO 정의 |
| 3 | 테스트 작성 | 패리티 테스트 |
| 4 | 아이템/이벤트 | 콘텐츠 구현 |
| 5 | 리뷰/통합 | 코드 리뷰 및 통합 |

## 검증 명령어

```bash
# 전체 빌드
pnpm -r build

# 전체 테스트
pnpm -r test

# 특정 패키지 테스트
pnpm --filter @sammo-ts/logic test

# 타입 체크
pnpm --filter @sammo-ts/logic typecheck

# 패리티 테스트만
pnpm --filter @sammo-ts/logic test -- --grep "parity"
```

## 완료 조건

각 체크리스트 항목은 다음을 만족해야 완료:

1. **구현**: TypeScript 파일 생성
2. **테스트**: 최소 1개 유닛 테스트
3. **패리티**: 레거시와 동일 결과 확인 (가능한 경우)
4. **문서**: 필요시 docs 업데이트

## 파일 위치

```
scripts/prompts/
├── checklist-summary.md        # 이 파일
├── checklist-war-triggers.md   # 전투 트리거
├── checklist-specials.md       # 특기
├── checklist-nation-commands.md # 국가 커맨드
├── checklist-nation-types.md   # 국가 성향
├── checklist-general-triggers.md # 장수 트리거
├── checklist-constraints.md    # 제약 조건
├── checklist-items.md          # 아이템
└── checklist-events.md         # 이벤트

docs/
├── implementation-progress.md  # 진행 현황
└── legacy-inventory.md         # 레거시 인벤토리
```

## 관련 문서

- `docs/legacy-inventory.md` - 레거시 전체 파일 목록
- `docs/implementation-progress.md` - 구현 진행 상세
- `docs/architecture/legacy-commands.md` - 커맨드 문서
- `docs/architecture/legacy-engine-triggers.md` - 트리거 문서
