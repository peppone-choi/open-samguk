# Legacy 포팅 병렬 작업 분배

## 현재 상태 요약

- Phase A-H: 완료
- Phase I (패리티 테스트): 미완료
- Phase J2 (트리거 시스템): 미완료
- 커맨드 포팅: ~40% 완료

---

## 세션별 작업 분배 (5개 터미널)

### Session 1: 미포팅 장수 커맨드

```
cd ~/Desktop/open-samguk
claude

# 프롬프트:
docs/architecture/legacy-commands.md를 참고하여 아직 포팅되지 않은 장수 커맨드를 구현해줘.
packages/logic/src/domain/commands/ 폴더의 기존 패턴을 따라서.
레거시 코드는 legacy/hwe/sammo/Command/General/ 참조.
작업 후 pnpm typecheck && pnpm test 실행해서 검증하고, 실패하면 수정해. 성공할 때까지 반복.

우선순위:
1. che_맹훈련 (GeneralIntenseTrainingCommand)
2. che_접경귀환 (GeneralBorderReturnCommand)
3. che_NPC능동 (GeneralNPCActiveCommand) - 이미 있으면 skip
4. che_선양 (GeneralAbdicateCommand)
5. che_탈취 (GeneralSeizeCommand)
```

### Session 2: 미포팅 국가 커맨드

```
cd ~/Desktop/open-samguk
claude

# 프롬프트:
docs/architecture/legacy-commands.md를 참고하여 아직 포팅되지 않은 국가 커맨드를 구현해줘.
packages/logic/src/domain/commands/ 폴더의 기존 패턴을 따라서.
레거시 코드는 legacy/hwe/sammo/Command/Nation/ 참조.
작업 후 pnpm typecheck && pnpm test 실행해서 검증하고, 실패하면 수정해.

우선순위:
1. 선전포고 (NationDeclareWarCommand)
2. 휴전제의 (NationProposeArmisticeCommand)
3. 동맹제의 (NationProposeAllianceCommand)
4. 불가침제의 (NationProposeNonAggressionCommand)
5. 세금조정 (NationAdjustTaxCommand)
```

### Session 3: 트리거 시스템

```
cd ~/Desktop/open-samguk
claude

# 프롬프트:
Phase J2 트리거 시스템을 완성해줘.
docs/architecture/legacy-engine-triggers.md 참조.
레거시 코드: legacy/hwe/sammo/GeneralTrigger/, legacy/hwe/sammo/WarUnitTrigger/

필요한 작업:
1. 트리거 registry 구현 (packages/logic/src/domain/TriggerRegistry.ts)
2. attempt/execute 2단계 분리
3. 우선순위 기반 실행
4. RNG 시드 컨텍스트 포함
5. 기존 SoldierMaintenanceTrigger 패턴 확장

작업 후 테스트 작성 및 검증.
```

### Session 4: 레거시 패리티 테스트 (Phase I)

```
cd ~/Desktop/open-samguk
claude

# 프롬프트:
Phase I 레거시 패리티 테스트 하네스를 완성해줘.
packages/logic/src/test/ParityHarness.ts 확장.

필요한 작업:
1. 입력 포맷 고정: 엔티티 스냅샷, 시드, 게임 시간, 시나리오, 커맨드
2. 출력 포맷 고정: delta, 로그 요약, 주요 수치
3. 정규화/정렬 규칙 명시
4. Vitest 테스트 케이스 작성
5. RNG/조사/가중치 비교 테스트

docs/testing-policy.md 참조.
```

### Session 5: 특기(Specials) 포팅

```
cd ~/Desktop/open-samguk
claude

# 프롬프트:
전투 특기와 내정 특기를 포팅해줘.
레거시: legacy/hwe/sammo/ActionSpecialWar/, legacy/hwe/sammo/ActionSpecialDomestic/
대상: packages/logic/src/domain/specials/ (새로 생성)

우선순위 (전투):
1. 돌격 특기
2. 화공 특기
3. 계략 특기

우선순위 (내정):
1. 농업 특기
2. 상업 특기
3. 기술 특기

기존 Command 패턴과 Trigger 패턴을 참고해서 Special 인터페이스 정의.
```

---

## 웹 세션 (5개) - 문서/분석 작업

### Web 1: 레거시 API 분석

```
legacy/hwe/sammo/API/ 폴더의 모든 API를 분석하고
apps/api에 필요한 엔드포인트 목록 정리
```

### Web 2: 이벤트 시스템 분석

```
legacy/hwe/sammo/Event/ 분석
pre-month, month, post-month 이벤트 목록화
```

### Web 3: 아이템 시스템 분석

```
legacy/hwe/sammo/ActionItem/ 분석
아이템 효과 및 장착 로직 정리
```

### Web 4: 시나리오 데이터 분석

```
legacy/hwe/scenario/ JSON 파일 분석
시나리오 로딩 로직 정리
```

### Web 5: 프론트엔드 컴포넌트 분석

```
legacy/hwe/ts/components/ Vue 컴포넌트 분석
apps/web에 필요한 페이지 목록 정리
```

---

## 검증 체크리스트

각 세션 완료 후:

- [ ] pnpm typecheck 통과
- [ ] pnpm lint 통과
- [ ] pnpm test 통과
- [ ] 새 테스트 추가됨
