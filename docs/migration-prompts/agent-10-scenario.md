# Agent 10: 시나리오 시스템 마이그레이션

## 업무 범위
시나리오 시스템과 게임 상수를 TypeScript로 포팅

## 대상 디렉토리
- 소스1: `legacy/hwe/sammo/Scenario/*.php`
- 소스2: `legacy/hwe/sammo/Scenario.php`
- 소스3: `legacy/hwe/sammo/GameConstBase.php`
- 소스4: `legacy/hwe/sammo/GameUnitConstBase.php`
- 소스5: `legacy/hwe/scenario/*.json` (시나리오 데이터)
- 타겟: `packages/logic/src/domain/scenarios/`

## 시나리오 파일 목록
```bash
ls legacy/hwe/sammo/Scenario/
ls legacy/hwe/scenario/
```

## 체크리스트

### 베이스 클래스
- [ ] Scenario.php → Scenario.ts
- [ ] GameConstBase.php → GameConst.ts (이미 일부 존재)
- [ ] GameUnitConstBase.php → GameUnitConst.ts

### 시나리오별 설정
- [ ] 삼국지 기본 시나리오
- [ ] 커스텀 시나리오들
- [ ] 시나리오별 초기 데이터

### 유닛 타입
- [ ] 보병 유닛
- [ ] 기병 유닛
- [ ] 궁병 유닛
- [ ] 특수 유닛

### 맵 데이터
- [ ] 도시 데이터
- [ ] 경로 데이터
- [ ] 지형 데이터

## 포팅 규칙
1. 시나리오별 상수 오버라이드 구조
2. 유닛 타입 정의 체계
3. 맵 데이터 로딩 시스템
4. 초기 데이터 설정 로직

## 파일 구조
```typescript
// packages/logic/src/domain/scenarios/types.ts
export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  startYear: number;
  startMonth: number;

  // 게임 상수 오버라이드
  constants: Partial<GameConstConfig>;

  // 유닛 설정
  availableUnits: UnitType[];

  // 맵 설정
  mapId: string;

  // 초기 국가/장수
  initialNations: NationInitData[];
  initialGenerals: GeneralInitData[];
}

// packages/logic/src/domain/scenarios/GameConst.ts
export interface GameConstConfig {
  // 훈련/사기
  maxTrainByCommand: number;
  maxAtmosByCommand: number;
  trainDelta: number;

  // 내정
  sabotageDamageMin: number;
  sabotageDamageMax: number;

  // 병사
  defaultGold: number;
  defaultRice: number;
  defaultMaxGeneral: number;
  initialNationGenLimit: number;

  // 전투
  baseDamage: number;
  criticalMultiplier: number;

  // 기타
  // ...
}

export const defaultGameConst: GameConstConfig = {
  maxTrainByCommand: 100,
  maxAtmosByCommand: 100,
  trainDelta: 1.5,
  sabotageDamageMin: 50,
  sabotageDamageMax: 100,
  defaultGold: 1000,
  defaultRice: 1000,
  defaultMaxGeneral: 50,
  initialNationGenLimit: 10,
  baseDamage: 100,
  criticalMultiplier: 1.5,
};
```
