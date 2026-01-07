import { BaseSpecial } from "../specials/BaseSpecial.js";

/**
 * 성격(Ego) 기본 클래스
 * 레거시: ActionPersonality
 */
export abstract class BasePersonality extends BaseSpecial {
  abstract id: number;
  abstract name: string;
  abstract info: string;
}
