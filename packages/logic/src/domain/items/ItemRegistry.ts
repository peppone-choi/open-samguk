import type { IItem, ItemType, ItemMeta } from "./types.js";

// 아이템 import
import * as weapons from "./weapons/index.js";
import * as horses from "./horses/index.js";
import * as books from "./books/index.js";

/**
 * 아이템 레지스트리
 *
 * 모든 아이템을 코드로 관리하고 조회하는 중앙 저장소
 */
export class ItemRegistry {
  private static instance: ItemRegistry | null = null;
  private readonly items: Map<string, ItemMeta> = new Map();

  private constructor() {
    this.registerAllItems();
  }

  /**
   * 싱글톤 인스턴스 반환
   */
  static getInstance(): ItemRegistry {
    if (!ItemRegistry.instance) {
      ItemRegistry.instance = new ItemRegistry();
    }
    return ItemRegistry.instance;
  }

  /**
   * 모든 아이템 등록
   */
  private registerAllItems(): void {
    // 무기 등록
    for (const WeaponClass of weapons.ALL_WEAPONS) {
      const sample = new WeaponClass();
      this.register(sample.code, () => new WeaponClass());
    }

    // 명마 등록
    for (const HorseClass of horses.ALL_HORSES) {
      const sample = new HorseClass();
      this.register(sample.code, () => new HorseClass());
    }

    // 서적 등록
    for (const BookClass of books.ALL_BOOKS) {
      const sample = new BookClass();
      this.register(sample.code, () => new BookClass());
    }
  }

  /**
   * 아이템 등록
   */
  private register(code: string, create: () => IItem): void {
    if (this.items.has(code)) {
      throw new Error(`중복된 아이템 코드: ${code}`);
    }
    this.items.set(code, { code, create });
  }

  /**
   * 코드로 아이템 생성
   */
  create(code: string): IItem | null {
    const meta = this.items.get(code);
    if (!meta) {
      return null;
    }
    return meta.create();
  }

  /**
   * 코드로 아이템 존재 여부 확인
   */
  has(code: string): boolean {
    return this.items.has(code);
  }

  /**
   * 모든 아이템 코드 반환
   */
  getAllCodes(): string[] {
    return Array.from(this.items.keys());
  }

  /**
   * 타입별 아이템 코드 반환
   */
  getCodesByType(type: ItemType): string[] {
    const codes: string[] = [];
    for (const [code, meta] of this.items) {
      const item = meta.create();
      if (item.type === type) {
        codes.push(code);
      }
    }
    return codes;
  }

  /**
   * 구매 가능한 아이템 코드 반환
   */
  getBuyableCodes(): string[] {
    const codes: string[] = [];
    for (const [code, meta] of this.items) {
      const item = meta.create();
      if (item.buyable) {
        codes.push(code);
      }
    }
    return codes;
  }

  /**
   * 유니크 아이템 코드 반환
   */
  getUniqueCodes(): string[] {
    const codes: string[] = [];
    for (const [code, meta] of this.items) {
      const item = meta.create();
      if (item.rarity === "unique") {
        codes.push(code);
      }
    }
    return codes;
  }

  /**
   * 등록된 아이템 수 반환
   */
  get size(): number {
    return this.items.size;
  }
}

/**
 * 아이템 레지스트리 싱글톤 접근자
 */
export function getItemRegistry(): ItemRegistry {
  return ItemRegistry.getInstance();
}
