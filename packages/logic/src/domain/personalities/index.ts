import * as Personalities from "./instances/index.js";
import { BasePersonality } from "./BasePersonality.js";

export * from "./instances/index.js";
export { BasePersonality };

const personalityMap: Record<string, typeof BasePersonality> = {
  None: Personalities.NoPersonality,
  che_대의: Personalities.PersonalityEminence,
  che_의협: Personalities.PersonalityHero,
  che_왕좌: Personalities.PersonalityThrone,
  che_정복: Personalities.PersonalityConquest,
  che_유지: Personalities.PersonalityMaintain,
  che_할거: Personalities.PersonalityWarlord,
  che_패권: Personalities.PersonalityHegemony,
  che_출세: Personalities.PersonalitySuccess,
  che_안전: Personalities.PersonalitySafety,
  che_재간: Personalities.PersonalityTalent,
  che_은둔: Personalities.PersonalityHermit,
};

export class PersonalityHelper {
  public static getPersonality(id: string): BasePersonality {
    const PersonalityClass = personalityMap[id] || Personalities.NoPersonality;
    return new (PersonalityClass as any)();
  }
}
