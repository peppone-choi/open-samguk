# 레거시 마이그레이션 에이전트 프롬프트

## 개요
이 디렉토리는 레거시 PHP 코드베이스를 TypeScript/NestJS로 마이그레이션하기 위한 병렬 에이전트 프롬프트를 포함합니다.

## 전체 마이그레이션 범위
- 총 파일 수: ~1,264개
- 레거시 위치: `/home/user/opensam/legacy/`
- 타겟 위치: `/home/user/opensam/packages/logic/`, `/home/user/opensam/apps/api/`

## 에이전트 목록

| 에이전트 | 업무 범위 | 파일 수 | 상태 |
|---------|----------|--------|------|
| Agent 1 | General Commands | 55개 | 진행중 |
| Agent 2 | Nation Commands | 38개 | 대기 |
| Agent 3 | 특기 시스템 (SpecialWar + SpecialDomestic) | 51개 | 대기 |
| Agent 4 | 국가 성향 (NationType) | 15개 | 대기 |
| Agent 5 | 트리거 시스템 (GeneralTrigger + WarUnitTrigger) | 44개 | 대기 |
| Agent 6 | 이벤트 시스템 | 39개 | 대기 |
| Agent 7 | Enums 및 DTO/VO | 33개 | 대기 |
| Agent 8 | Constraint 시스템 | 73개 | 대기 |
| Agent 9 | 아이템 시스템 | 161개 | 대기 |
| Agent 10 | 시나리오 시스템 | ~15개 | 대기 |
| Agent 11 | API 레이어 | 79개 | 대기 |
| Agent 12 | 핵심 클래스 | ~25개 | 대기 |

## 의존성 그래프
```
                    ┌─────────────┐
                    │   Enums &   │
                    │   DTO/VO    │
                    │  (Agent 7)  │
                    └──────┬──────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Constraints │     │    Core     │     │   GameConst │
│  (Agent 8)  │     │  Classes    │     │  (Agent 10) │
│             │     │ (Agent 12)  │     │             │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Commands   │     │   Items     │     │  Specials   │
│ (Agent 1,2) │     │  (Agent 9)  │     │  (Agent 3)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Triggers   │     │   Events    │     │ NationType  │
│  (Agent 5)  │     │  (Agent 6)  │     │  (Agent 4)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │     API     │
                    │ (Agent 11)  │
                    └─────────────┘
```

## 병렬 실행 가능한 그룹

### Phase 1 (기반)
- Agent 7: Enums & DTO/VO
- Agent 10: 시나리오/GameConst (일부)

### Phase 2 (핵심)
- Agent 8: Constraints
- Agent 12: 핵심 클래스

### Phase 3 (도메인 로직) - 병렬 가능
- Agent 1: General Commands
- Agent 2: Nation Commands
- Agent 3: 특기 시스템
- Agent 4: 국가 성향
- Agent 9: 아이템 시스템

### Phase 4 (통합)
- Agent 5: 트리거 시스템
- Agent 6: 이벤트 시스템

### Phase 5 (API)
- Agent 11: API 레이어

## 사용법

각 에이전트 프롬프트를 읽고 Task tool로 실행:

```
Task tool 호출 예시:
- subagent_type: "general-purpose"
- prompt: agent-1-general-commands.md 내용
```

## 참고 문서
- `/home/user/opensam/docs/architecture.md`
- `/home/user/opensam/docs/plan.md`
- `/home/user/opensam/docs/porting-status.md`
- `/home/user/opensam/docs/architecture/legacy-*.md`
