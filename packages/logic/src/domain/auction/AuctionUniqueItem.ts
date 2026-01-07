import { BaseAuction } from "./BaseAuction.js";
import { General } from "../entities.js";
import { AuctionBid, AuctionInfo } from "./types.js";
import { JosaUtil } from "@sammo/common";

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

    // 중복 소유 체크 (장수 엔티티의 인벤토리 확인)
    // 무기, 서적, 명마, 보물 중 해당 아이템이 있는지 확인
    const items = [this.general.weapon, this.general.book, this.general.horse, this.general.item];
    if (items.includes(itemCode)) {
      return "이미 가진 아이템이 있습니다.";
    }

    // 실제 입찰 로직(자원 차감 등)은 서비스 레이어에서 _bid() 형태로 호출
    return null;
  }

  protected rollbackAuction(): void {
    // 유니크 경매 유찰 시 특별한 처리는 없음 (아이템이 소멸되지 않음)
  }

  /**
   * 경매 완료 및 아이템 지급
   * relYear: 게임 시작으로부터 경과한 연수 (유니크 제한 계산용)
   */
  finishAuction(highestBid: AuctionBid, bidder: General, relYear: number = 0): string | null {
    const itemKey = this.info.target;
    if (!itemKey) return "아이템 키가 없습니다.";

    const general = bidder;

    // 1. 유니크 아이템 소유 개수 제한 체크
    // 레거시: 연도에 따라 1개 -> 2개 -> ... 증가
    let availableEquipUniqueCnt = 1;
    // (간소화: 0-19년 1개, 20-39년 2개, 40년 이상 3개 가정한 예시)
    if (relYear >= 40) availableEquipUniqueCnt = 3;
    else if (relYear >= 20) availableEquipUniqueCnt = 2;

    const currentUniques = [general.weapon, general.book, general.horse, general.item].filter(
      (code) => {
        // TODO: ItemRegistry를 통해 유니크 여부 확인 필요
        // 일단 code가 있고 "common" 아이템이 아니면 유니크로 간주 (임시)
        return code && !code.includes("_"); // 레거시 규칙: 유니크는 코드가 짧거나 특정 형태
      }
    );

    if (currentUniques.length >= availableEquipUniqueCnt) {
      return "유니크 아이템 소유 제한 상태입니다. 종료 시간이 연장됩니다.";
    }

    // 2. 부위별 중복 체크 및 지급
    // 아이템 종류(weapon, book, horse, item)를 판별해야 함
    // (이 로직은 ItemRegistry의 정보를 필요로 함)

    // 임시: target 코드로 부위 판별 (prefix 기준 등)
    let itemType: "weapon" | "book" | "horse" | "item" = "item";
    if (itemKey.startsWith("che_무기")) itemType = "weapon";
    else if (itemKey.startsWith("che_서적")) itemType = "book";
    else if (itemKey.startsWith("che_명마")) itemType = "horse";

    // 이미 해당 부위에 유니크가 있는지 확인
    const ownItemCode = general[itemType];
    if (ownItemCode && !ownItemCode.includes("_")) {
      return "이미 해당 부위에 유니크 아이템을 가지고 있습니다.";
    }

    // 지급
    general[itemType] = itemKey;

    // 로그 생성 (JosaUtil 사용)
    const itemName = itemKey; // TODO: 실제 이름 lookup 필요
    const josaUl = JosaUtil.pick(itemName, "을");

    // 로그 메시지는 string으로 반환하여 호출 측에서 처리
    return null; // 성공
  }
}
