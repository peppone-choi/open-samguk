import { GameConst } from "../GameConst.js";

/**
 * 전용 유틸리티 함수 (레거시 func_converter.php, func_time_event.php 참조)
 */
export const GameUtil = {
  /**
   * 공헌도에 따른 품계 레벨 계산
   */
  getDedLevel(dedication: number): number {
    return Math.min(Math.max(Math.ceil(Math.sqrt(dedication) / 10), 0), GameConst.maxDedLevel || 9);
  },

  /**
   * 품계 레벨에 따른 봉록(금) 계산
   */
  getBillByLevel(dedLevel: number): number {
    return dedLevel * 200 + 400;
  },

  /**
   * 공헌도에 따른 봉록(금) 계산
   */
  getBill(dedication: number): number {
    return this.getBillByLevel(this.getDedLevel(dedication));
  },

  /**
   * 경험치에 따른 레벨 계산
   */
  getExpLevel(experience: number): number {
    if (experience < 1000) {
      return Math.floor(experience / 100);
    }
    return Math.floor(Math.sqrt(experience / 10));
  },

  /**
   * 기술 레벨 계산
   */
  getTechLevel(tech: number): number {
    return Math.min(Math.max(Math.floor(tech / 1000), 0), GameConst.maxTechLevel || 10);
  },

  /**
   * 국가 레벨에 따른 작위 명칭 (dep: getNationLevel)
   */
  getNationLevelName(level: number): string {
    const names = ["방랑군", "호족", "군벌", "주자사", "주목", "공", "왕", "황제"];
    return names[level] || "방랑군";
  },
};
