// 타입 정의
export * from './types.js';

// 기본 클래스
export { BaseItem } from './BaseItem.js';
export { BaseStatItem, BaseWeaponItem, BaseHorseItem, BaseBookItem } from './BaseStatItem.js';

// 아이템 레지스트리
export { ItemRegistry, getItemRegistry } from './ItemRegistry.js';

// 트리거 시스템
export * from './triggers/index.js';

// 개별 아이템 (필요 시 직접 import)
export * as weapons from './weapons/index.js';
export * as horses from './horses/index.js';
export * as books from './books/index.js';
