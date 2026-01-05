# Agent 12: 핵심 클래스 마이그레이션

## 업무 범위
레거시 핵심 도메인 클래스들을 TypeScript로 포팅

## 대상 파일
```
legacy/hwe/sammo/
├── General.php
├── GeneralBase.php
├── GeneralLite.php
├── DummyGeneral.php
├── DummyGeneralLite.php
├── BaseNation.php
├── CityConstBase.php
├── CityHelper.php
├── CityInitialDetail.php
├── WarUnit.php
├── WarUnitGeneral.php
├── WarUnitCity.php
├── ActionLogger.php
├── LastTurn.php
├── Message.php
├── Auction.php
├── Betting.php
├── GeneralAI.php
├── AutorunGeneralPolicy.php
├── AutorunNationPolicy.php
└── (기타)
```

## 체크리스트

### 장수 관련
- [ ] General.php → General.ts (핵심 장수 클래스)
- [ ] GeneralBase.php → GeneralBase.ts
- [ ] GeneralLite.php → GeneralLite.ts
- [ ] DummyGeneral.php → DummyGeneral.ts
- [ ] GeneralAI.php → GeneralAI.ts

### 국가 관련
- [ ] BaseNation.php → Nation.ts

### 도시 관련
- [ ] CityConstBase.php → CityConst.ts
- [ ] CityHelper.php → CityHelper.ts
- [ ] CityInitialDetail.php → CityInitialDetail.ts

### 전투 관련
- [ ] WarUnit.php → WarUnit.ts
- [ ] WarUnitGeneral.php → WarUnitGeneral.ts
- [ ] WarUnitCity.php → WarUnitCity.ts

### 로깅/메시지
- [ ] ActionLogger.php → ActionLogger.ts
- [ ] Message.php → Message.ts
- [ ] LastTurn.php → LastTurn.ts

### 경제
- [ ] Auction.php → Auction.ts
- [ ] Betting.php → Betting.ts

### AI
- [ ] AutorunGeneralPolicy.php → AutorunGeneralPolicy.ts
- [ ] AutorunNationPolicy.php → AutorunNationPolicy.ts

## 현재 포팅 상태
일부 파일이 `packages/logic/src/domain/` 에 존재:
- [x] WorldState.ts
- [x] entities.ts
- [x] models/General.ts
- [x] models/Nation.ts
- [x] models/City.ts

## 포팅 규칙
1. 불변 데이터 구조 지향
2. 상태 변경은 Delta 패턴
3. 비즈니스 로직과 데이터 분리
4. 테스트 가능한 구조

## 파일 구조
```typescript
// packages/logic/src/domain/models/General.ts
export interface GeneralState {
  id: number;
  name: string;
  nationId: number;
  cityId: number;

  // 능력치
  leadership: number;
  strength: number;
  intelligence: number;

  // 자원
  gold: number;
  rice: number;
  crew: number;

  // 상태
  train: number;
  atmos: number;
  experience: number;
  dedication: number;
  age: number;
  injury: number;

  // 직위
  officerLevel: number;
  officerCity: number;

  // 특기
  specialWar: string;
  specialDomestic: string;

  // 장비
  weaponId?: string;
  armorId?: string;
  horseId?: string;
  bookId?: string;

  // 메타
  aux: Record<string, any>;
  penalty: Record<string, any>;
  turnTime: Date;
}

// packages/logic/src/domain/models/Nation.ts
export interface NationState {
  id: number;
  name: string;
  color: string;
  level: number;
  type: string;
  capitalId: number;

  // 자원
  gold: number;
  rice: number;

  // 정책
  bill: number;
  rate: number;
  tech: number;

  // 상태
  power: number;

  // 메타
  aux: Record<string, any>;
}

// packages/logic/src/domain/models/City.ts
export interface CityState {
  id: number;
  name: string;
  nationId: number;
  level: number;

  // 내정
  population: number;
  agriculture: number;
  agricultureMax: number;
  commerce: number;
  commerceMax: number;
  security: number;
  trust: number;

  // 방어
  defense: number;
  wall: number;

  // 상태
  front: number;
  supply: boolean;
  state: number;
}
```
