# Agent 9: 아이템 시스템 마이그레이션

## 업무 범위
아이템(장비, 소비품, 유니크 아이템) 시스템을 TypeScript로 포팅

## 대상 디렉토리
- 소스: `legacy/hwe/sammo/ActionItem/*.php` (161개 파일)
- 타겟: `packages/logic/src/domain/items/`

## 아이템 분류
```bash
ls legacy/hwe/sammo/ActionItem/ | head -50
```

### 무기류
- [ ] che_도 (도)
- [ ] che_검 (검)
- [ ] che_창 (창)
- [ ] che_극 (극)
- [ ] che_궁 (궁)
- [ ] che_노 (노)
- [ ] (기타 무기)

### 방어구류
- [ ] che_갑옷 (갑옷)
- [ ] che_투구 (투구)
- [ ] che_방패 (방패)
- [ ] (기타 방어구)

### 서적류
- [ ] che_병서 (병서)
- [ ] che_서적 (서적)
- [ ] (기타 서적)

### 말류
- [ ] che_마 (말)
- [ ] (기타 탈것)

### 유니크 아이템
- [ ] 청룡언월도
- [ ] 방천화극
- [ ] 칠성보검
- [ ] 적토마
- [ ] (기타 유니크)

### 소비 아이템
- [ ] 회복약
- [ ] 부활석
- [ ] (기타 소비품)

## 포팅 규칙
1. 아이템 타입 분류 체계
2. 능력치 보정 로직
3. 장착 조건 및 슬롯
4. 유니크 아이템 특수 효과
5. 아이템 획득/소비 로직

## 파일 구조
```typescript
// packages/logic/src/domain/items/types.ts
export enum ItemType {
  Weapon = 'weapon',
  Armor = 'armor',
  Horse = 'horse',
  Book = 'book',
  Consumable = 'consumable',
  Unique = 'unique',
}

export enum ItemSlot {
  Weapon = 'weapon',
  Armor = 'armor',
  Horse = 'horse',
  Book = 'book',
  Accessory = 'accessory',
}

export interface Item {
  readonly id: string;
  readonly name: string;
  readonly type: ItemType;
  readonly slot: ItemSlot;
  readonly rarity: number;
  readonly description: string;

  // 능력치 보정
  readonly leadershipBonus?: number;
  readonly strengthBonus?: number;
  readonly intelligenceBonus?: number;
  readonly attackBonus?: number;
  readonly defenseBonus?: number;

  // 장착 조건
  canEquip?(general: GeneralState): boolean;

  // 특수 효과
  onEquip?(general: GeneralState): void;
  onUnequip?(general: GeneralState): void;
  onBattle?(context: BattleContext): void;
}

// packages/logic/src/domain/items/weapons/Sword.ts
export class Sword implements Item {
  readonly id = 'sword';
  readonly name = '검';
  readonly type = ItemType.Weapon;
  readonly slot = ItemSlot.Weapon;
  readonly rarity = 1;
  readonly description = '기본 무기';
  readonly attackBonus = 5;
}
```
