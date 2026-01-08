import { BaseAuction } from "./BaseAuction.js";
import { General } from "../entities.js";
import { AuctionBid, AuctionInfo } from "./types.js";
import { JosaUtil } from "@sammo/common";
import { getItemRegistry } from "../items/ItemRegistry.js";

/**
 * 유니크 아이템 경매 클래스
 * 레거시 sammo/AuctionUniqueItem.php 포팅
 */
export class AuctionUniqueItem extends BaseAuction {
  static readonly COEFF_EXTENSION_MINUTES_LIMIT_UNIQUE_CNT = 24;

  constructor(info: AuctionInfo, general: General) {
    super(info, general);
  }

  /**
   * 입찰 (특수 능력: 유니크 중복 체크 등)
   */
  bid(amount: number, tryExtendCloseDate: boolean): string | null {
    if (this.info.finished) {
      return "경매가 종료되었습니다.";
    }

    const itemCode = this.info.target;
    if (!itemCode) {
      return "아이템 코드가 없습니다.";
    }

    const registry = getItemRegistry();
    const targetItem = registry.create(itemCode);
    if (!targetItem) {
      return "존재하지 않는 아이템입니다.";
    }

    // 중복 소유 체크
    const types: ("weapon" | "book" | "horse" | "item")[] = ["weapon", "book", "horse", "item"];
    for (const type of types) {
      if (this.general[type] === itemCode) {
        return "이미 가진 아이템이 있습니다.";
      }
    }

    // 실제 입찰 처리(자원 차감 등)는 호출부(서비스)에서 _bid() 공통 로직으로 처리됨
    return null;
  }

  public rollbackAuction(): void {
    // 유니크 경매 유찰 시 특별한 처리는 없음
  }

  /**
   * 경매 완료 및 아이템 지급
   * relYear: 게임 시작으로부터 경과한 연수 (유니크 제한 계산용)
   */
  finishAuction(highestBid: AuctionBid, bidder: General, relYear: number = 0): string | null {
    const itemKey = this.info.target;
    if (!itemKey) return "아이템 키가 없습니다.";

    const registry = getItemRegistry();
    const itemObj = registry.create(itemKey);
    if (!itemObj) return "아이템 정보를 불러올 수 없습니다.";

    const general = bidder;

    // 1. 유니크 아이템 전체 소유 개수 제한 체크 (레거시 GameConst::$maxUniqueItemLimit 대응)
    let availableEquipUniqueCnt = 1;
    if (relYear >= 40) availableEquipUniqueCnt = 3;
    else if (relYear >= 20) availableEquipUniqueCnt = 2;

    const inventory = [general.weapon, general.book, general.horse, general.item];
    const currentUniques = inventory.filter((code) => {
      if (!code || code === "None") return false;
      const it = registry.create(code);
      return it?.rarity === "unique";
    });

    if (currentUniques.length >= availableEquipUniqueCnt) {
      return "유니크 아이템 소유 제한 상태입니다. 종료 시간이 연장됩니다.";
    }

    // 2. 부위별 중복 체크 및 지급
    const itemType = itemObj.type; // weapon, book, horse, item
    const ownItemCode = general[itemType];

    // 이미 해당 부위에 유니크가 있는지 확인
    if (ownItemCode && ownItemCode !== "None") {
      const ownItem = registry.create(ownItemCode);
      if (ownItem?.rarity === "unique") {
        return "이미 해당 부위(순수 유니크)를 가지고 있습니다. 종료 시간이 연장됩니다.";
      }
    }

    // 지급 (사후 처리는 서비스 레이어에서 Delta/Log 반영)
    general[itemType] = itemKey;

    return null; // 성공
  }
}
