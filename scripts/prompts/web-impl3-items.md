# Web 구현 3: 아이템 시스템

## 프로젝트 컨텍스트
```
프로젝트: open-samguk (삼국지 모의전투 포팅)
스택: TypeScript (순수 도메인 로직)
경로: packages/logic/src/domain/items/
```

## 참고 문서
먼저 이 파일들을 읽어주세요:
- `docs/architecture/item-catalog.md` - 아이템 목록
- `legacy/hwe/sammo/BaseItem.php` - 레거시 아이템 기본 클래스
- `legacy/hwe/sammo/ActionItem/` - 레거시 아이템 구현

## 구현 작업

### 1. 아이템 기본 인터페이스
```typescript
// packages/logic/src/domain/items/types.ts
interface IItem {
    readonly id: number;
    readonly name: string;
    readonly type: ItemType;
    readonly rarity: ItemRarity;

    getStatBonus(): StatBonus;
    canEquip(general: General): boolean;
    onEquip(general: General): void;
    onUnequip(general: General): void;
}

type ItemType = 'weapon' | 'armor' | 'horse' | 'book' | 'consumable';
type ItemRarity = 'common' | 'rare' | 'unique';
```

### 2. 무기 아이템 구현
```typescript
// packages/logic/src/domain/items/weapons/
├── BaseWeapon.ts
├── 청룡언월도.ts
├── 방천화극.ts
└── index.ts
```

### 3. 아이템 효과 트리거 연동
```typescript
// packages/logic/src/domain/items/ItemTrigger.ts
```

### 4. 코드 작성 규칙
- 한글 아이템명 사용 가능
- 레거시와 동일한 스탯 계산
- 테스트로 레거시 패리티 검증

### 5. 검증
```bash
pnpm --filter @sammo-ts/logic test
```

## 출력 형식
```typescript
// 파일: packages/logic/src/domain/items/types.ts
export interface IItem {
    // ... 전체 코드
}
```
