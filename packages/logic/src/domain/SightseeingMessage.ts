import { RandUtil } from "@sammo/common";

/**
 * 견문 결과 타입
 */
export enum SightseeingType {
  /** 경험치 소폭 상승 */
  IncExp = 0x1,
  /** 경험치 대폭 상승 */
  IncHeavyExp = 0x2,
  /** 통솔 상승 */
  IncLeadership = 0x10,
  /** 무력 상승 */
  IncStrength = 0x20,
  /** 지력 상승 */
  IncIntel = 0x40,
  /** 금 획득 */
  IncGold = 0x100,
  /** 쌀 획득 */
  IncRice = 0x200,
  /** 금 손실 */
  DecGold = 0x400,
  /** 쌀 손실 */
  DecRice = 0x800,
  /** 경상 */
  Wounded = 0x1000,
  /** 중상 */
  HeavyWounded = 0x2000,
}

/**
 * 견문 메시지 엔트리
 */
interface SightseeingMessageEntry {
  /** 결과 타입 (SightseeingType 비트마스크) */
  type: number;
  /** 출력될 메시지 목록 */
  texts: string[];
  /** 발생 확률 가중치 */
  weight: number;
}

/**
 * 견문 발생 가능 메시지 및 결과 정의
 */
const MESSAGES: SightseeingMessageEntry[] = [
  {
    type: SightseeingType.IncExp,
    texts: [
      "아무일도 일어나지 않았습니다.",
      "명사와 설전을 벌였으나 망신만 당했습니다.",
      "동네 장사와 힘겨루기를 했지만 망신만 당했습니다.",
    ],
    weight: 1,
  },
  {
    type: SightseeingType.IncHeavyExp,
    texts: ["주점에서 사람들과 어울려 술을 마셨습니다.", "위기에 빠진 사람을 구해주었습니다."],
    weight: 1,
  },
  {
    type: SightseeingType.IncHeavyExp | SightseeingType.IncLeadership,
    texts: [
      "백성들에게 현인의 가르침을 설파했습니다.",
      "어느 집의 도망친 가축을 되찾아 주었습니다.",
    ],
    weight: 2,
  },
  {
    type: SightseeingType.IncHeavyExp | SightseeingType.IncStrength,
    texts: [
      "동네 장사와 힘겨루기를 하여 멋지게 이겼습니다.",
      "어느 집의 무너진 울타리를 고쳐주었습니다.",
    ],
    weight: 2,
  },
  {
    type: SightseeingType.IncHeavyExp | SightseeingType.IncIntel,
    texts: [
      "어느 명사와 설전을 벌여 멋지게 이겼습니다.",
      "거리에서 글 모르는 아이들을 모아 글을 가르쳤습니다.",
    ],
    weight: 2,
  },
  {
    type: SightseeingType.IncExp | SightseeingType.IncGold,
    texts: ["지나가는 행인에게서 금을 <C>:goldAmount:</> 받았습니다."],
    weight: 1,
  },
  {
    type: SightseeingType.IncExp | SightseeingType.IncRice,
    texts: ["지나가는 행인에게서 쌀을 <C>:riceAmount:</> 받았습니다."],
    weight: 1,
  },
  {
    type: SightseeingType.IncExp | SightseeingType.DecGold,
    texts: [
      "산적을 만나 금 <C>:goldAmount:</>을 빼앗겼습니다.",
      "돈을 <C>:goldAmount:</> 빌려주었다가 떼어먹혔습니다.",
    ],
    weight: 1,
  },
  {
    type: SightseeingType.IncExp | SightseeingType.DecRice,
    texts: ["쌀을 <C>:riceAmount:</> 빌려주었다가 떼어먹혔습니다."],
    weight: 1,
  },
  {
    type: SightseeingType.IncExp | SightseeingType.Wounded,
    texts: ["호랑이에게 물려 다쳤습니다.", "곰에게 할퀴어 다쳤습니다."],
    weight: 1,
  },
  {
    type: SightseeingType.IncHeavyExp | SightseeingType.Wounded,
    texts: ["위기에 빠진 사람을 구해주다가 다쳤습니다."],
    weight: 1,
  },
  {
    type: SightseeingType.IncExp | SightseeingType.HeavyWounded,
    texts: ["호랑이에게 물려 크게 다쳤습니다.", "곰에게 할퀴어 크게 다쳤습니다."],
    weight: 1,
  },
  {
    type: SightseeingType.IncHeavyExp | SightseeingType.Wounded | SightseeingType.HeavyWounded,
    texts: ["위기에 빠진 사람을 구하다가 죽을뻔 했습니다."],
    weight: 1,
  },
  {
    type: SightseeingType.IncHeavyExp | SightseeingType.IncStrength | SightseeingType.IncGold,
    texts: ["산적과 싸워 금 <C>:goldAmount:</>을 빼앗았습니다."],
    weight: 1,
  },
  {
    type: SightseeingType.IncHeavyExp | SightseeingType.IncStrength | SightseeingType.IncRice,
    texts: [
      "호랑이를 잡아 고기 <C>:riceAmount:</>을 얻었습니다.",
      "곰을 잡아 고기 <C>:riceAmount:</>을 얻었습니다.",
    ],
    weight: 1,
  },
  {
    type: SightseeingType.IncHeavyExp | SightseeingType.IncIntel | SightseeingType.IncGold,
    texts: ["돈을 빌려주었다가 이자 <C>:goldAmount:</>을 받았습니다."],
    weight: 1,
  },
  {
    type: SightseeingType.IncHeavyExp | SightseeingType.IncIntel | SightseeingType.IncRice,
    texts: ["쌀을 빌려주었다가 이자 <C>:riceAmount:</>을 받았습니다."],
    weight: 1,
  },
];

/**
 * 견문 메시지 선택기
 * 가중치에 따라 견문 이벤트와 메시지를 무작위로 선택합니다.
 */
export class SightseeingMessage {
  /**
   * 가중치 기반 무작위 견문 결과를 선택합니다.
   *
   * @param rng 난수 생성기
   * @returns 선택된 결과 타입과 메시지 텍스트
   */
  public pickAction(rng: RandUtil): { type: number; text: string } {
    const totalWeight = MESSAGES.reduce((sum, msg) => sum + msg.weight, 0);
    let rand = rng.nextRange(0, totalWeight);

    for (const msg of MESSAGES) {
      if (rand < msg.weight) {
        const text = rng.choice(msg.texts);
        return { type: msg.type, text };
      }
      rand -= msg.weight;
    }

    // 예외 상황 발생 시 기본값 반환
    const fallback = MESSAGES[0];
    if (!fallback) {
      throw new Error("MESSAGES is empty");
    }
    return { type: fallback.type, text: rng.choice(fallback.texts) };
  }
}
