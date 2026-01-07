import { RandUtil } from "@sammo/common";

export enum SightseeingType {
  IncExp = 0x1,
  IncHeavyExp = 0x2,
  IncLeadership = 0x10,
  IncStrength = 0x20,
  IncIntel = 0x40,
  IncGold = 0x100,
  IncRice = 0x200,
  DecGold = 0x400,
  DecRice = 0x800,
  Wounded = 0x1000,
  HeavyWounded = 0x2000,
}

interface SightseeingMessageEntry {
  type: number;
  texts: string[];
  weight: number;
}

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

export class SightseeingMessage {
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

    // fallback
    const fallback = MESSAGES[0];
    if (!fallback) {
      throw new Error("MESSAGES is empty");
    }
    return { type: fallback.type, text: rng.choice(fallback.texts) };
  }
}
