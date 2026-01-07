# Web Session 2: 이벤트 시스템 분석

## 목표

legacy/hwe/sammo/Event/ 폴더의 이벤트 시스템을 분석하고, packages/logic에 구현해야 할 이벤트 목록을 정리합니다.

## 분석 대상 경로

```
legacy/hwe/sammo/Event/
├── Action/       # 이벤트 액션
└── Condition/    # 이벤트 조건

legacy/hwe/sammo/StaticEvent/  # 정적 이벤트
```

## 수행 작업

### 1. 이벤트 타입 분류

- **Pre-Month**: 월초 이벤트
- **Month**: 월간 이벤트
- **Post-Month**: 월말 이벤트
- **Conditional**: 조건부 이벤트
- **Static**: 정적 이벤트

### 2. 각 이벤트별 분석

```markdown
## 이벤트명: [이름]

### 트리거 조건

- 시점: pre-month / month / post-month
- 조건: [조건 설명]

### 효과

- [효과 1]
- [효과 2]

### 관련 엔티티

- General, Nation, City 등

### RNG 사용 여부

- 예/아니오, 사용 시 시드 컨텍스트

### 레거시 파일

- legacy/hwe/sammo/Event/Action/XXX.php
```

### 3. 이벤트 실행 순서

월간 처리 파이프라인에서 이벤트 실행 순서 정리

### 4. 우선순위 분류

- **P0**: 게임 진행에 필수
- **P1**: 주요 게임플레이
- **P2**: 부가 효과

## 참고 문서

- docs/architecture/legacy-engine-events.md
- docs/architecture/turn-daemon-lifecycle.md

## 최종 산출물

`docs/architecture/event-catalog.md` 파일에 정리된 전체 이벤트 목록
