import { ItemInfo, ItemType } from "./types.js";

/**
 * 전역 아이템 데이터 정의
 */
export const ItemData: Record<string, ItemInfo> = {};

/**
 * 스탯 기반 아이템 생성 헬퍼
 */
function registerStatItems(
  type: ItemType,
  statType: ItemInfo["statType"],
  namePrefix: string,
  items: [string, number, boolean][]
) {
  for (const [name, value, buyable] of items) {
    const code = `che_${namePrefix}_${value.toString().padStart(2, "0")}_${name}`;
    ItemData[code] = {
      code,
      name: `${name}(+${value})`,
      type,
      cost: value * 1000, // 임시 가격 정책
      reqSecu: value * 5,
      buyable,
      consumable: false,
      info: `${namePrefix === "무기" ? "무력" : namePrefix === "서적" ? "지력" : "통솔"} +${value}`,
      statType,
      statValue: value,
    };
  }
}

// 1. 무기 (Strength)
registerStatItems("weapon", "strength", "무기", [
  ["단도", 1, true],
  ["단궁", 2, true],
  ["단극", 3, true],
  ["목검", 4, true],
  ["죽창", 5, true],
  ["소부", 6, true],
  ["동추", 7, true],
  ["유성추", 8, true],
  ["쌍철극", 9, true],
  ["대부", 10, true],
  ["고정도", 11, true],
  ["칠성검", 12, false],
  ["사모", 13, false],
  ["방천화극", 14, false],
  ["의천검", 15, false],
  ["청홍검", 15, false],
  ["언월도", 14, false],
]);

// 2. 서적 (Intel)
registerStatItems("book", "intel", "서적", [
  ["효경전", 1, true],
  ["회남자", 2, true],
  ["변도론", 3, true],
  ["건상역주", 4, true],
  ["여씨춘추", 5, true],
  ["사민월령", 6, true],
  ["논어", 7, true],
  ["사마법", 7, true],
  ["위료자", 7, true],
  ["사기", 8, true],
  ["역경", 9, true],
  ["시경", 10, true],
  ["상군서", 11, true],
  ["맹덕신서", 12, false],
  ["관자", 13, false],
  ["오자병법", 14, false],
  ["손자병법", 15, false],
]);

// 3. 명마 (Leadership)
registerStatItems("horse", "leadership", "명마", [
  ["노기", 1, true],
  ["조랑", 2, true],
  ["노새", 3, true],
  ["나귀", 4, true],
  ["갈색마", 5, true],
  ["흑색마", 6, true],
  ["백마", 7, true],
  ["오환마", 7, true],
  ["양주마", 8, true],
  ["과하마", 9, true],
  ["대완마", 10, true],
  ["서량마", 11, true],
  ["적로", 13, false],
  ["절영", 13, false],
  ["조황비전", 14, false],
  ["적토마", 15, false],
]);

// 4. 특수 아이템 (Misc)
function registerMiscItems(items: (Partial<ItemInfo> & { code: string; name: string })[]) {
  for (const item of items) {
    ItemData[item.code] = {
      type: "item",
      cost: 5000,
      reqSecu: 0,
      buyable: false,
      consumable: false,
      info: "",
      ...item,
    } as ItemInfo;
  }
}

registerMiscItems([
  {
    code: "che_치료_환약",
    name: "환약(치료)",
    cost: 200,
    buyable: true,
    consumable: true,
    info: "부상 회복 (3회용)",
  },
  { code: "che_저격_수극", name: "수극(저격)", cost: 1000, buyable: true, info: "저격 성능 향상" },
  {
    code: "che_사기_탁주",
    name: "탁주(사기)",
    cost: 300,
    buyable: true,
    consumable: true,
    info: "사기진작 효과 증가",
  },
  {
    code: "che_훈련_청주",
    name: "청주(훈련)",
    cost: 300,
    buyable: true,
    consumable: true,
    info: "훈련 효과 증가",
  },
  { code: "che_계략_이추", name: "이추(지력)", cost: 5000, info: "지력 +5, 계략 보너스" },
  { code: "che_계략_향낭", name: "향낭(매력)", cost: 5000, info: "매력 +5, 계략 보너스" },
  { code: "che_의술_정력견혈산", name: "정력견혈산", cost: 10000, info: "의술 특기 효과" },
  { code: "che_의술_청낭서", name: "청낭서", cost: 20000, info: "최상위 의술 아이템" },
  { code: "che_보물_도기", name: "도기", cost: 15000, info: "상업/치안 보너스" },
  { code: "che_조달_주판", name: "주판", cost: 8000, info: "금 수입 보너스" },
  { code: "che_전략_평만지장도", name: "평만지장도", cost: 12000, info: "전방 이동/보급 보너스" },
  { code: "che_공성_묵자", name: "묵자", cost: 15000, info: "공성 능력 향상" },
  { code: "che_집중_전국책", name: "전국책", cost: 10000, info: "집중 특기 효과" },
  { code: "che_환술_논어집해", name: "논어집해", cost: 20000, info: "환술 능력 향상" },
  { code: "che_행동_서촉지형도", name: "서촉지형도", cost: 15000, info: "행동력 보너스" },
  { code: "che_필살_둔갑천서", name: "둔갑천서", cost: 30000, info: "필살 확률 증가" },
  { code: "che_계략_삼략", name: "삼략", cost: 20000, info: "계략 및 통솔 보너스" },
  { code: "che_계략_육도", name: "육도", cost: 20000, info: "계략 및 통솔 보너스" },
  { code: "che_공성_묵자", name: "묵자", cost: 25000, info: "공성전 시 파괴력 증가" },
  { code: "che_반계_백우선", name: "백우선", cost: 30000, info: "반계 확률 대폭 증가" },
  { code: "che_반계_파초선", name: "파초선", cost: 25000, info: "반계 확률 증가" },
  { code: "che_의술_상한잡병론", name: "상한잡병론", cost: 15000, info: "의술 및 부상 치료" },
  { code: "che_의술_태평청령", name: "태평청령", cost: 20000, info: "의술 및 부상 치료" },
  { code: "che_농성_위공자병법", name: "위공자병법", cost: 15000, info: "수성 시 방어력 증가" },
  { code: "che_서적_13_병법24편", name: "병법24편", cost: 25000, info: "지력 +13, 특수 계략" },
  { code: "che_무기_12_칠성검", name: "칠성검", cost: 20000, info: "무력 +12, 암살 확률" },
]);
