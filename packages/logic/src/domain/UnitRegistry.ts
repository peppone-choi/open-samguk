import { UnitData, UnitDataSchema } from "./scenario/schema.js";
import { GameUnit } from "./GameUnit.js";
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

/**
 * 병종 레지스트리
 * 게임에 정의된 모든 병종 데이터를 로드하고 관리합니다.
 */
export class UnitRegistry {
  private static instance: UnitRegistry;
  /** 병종 ID를 키로 하는 병종 맵 */
  private units: Map<number, GameUnit> = new Map();
  /** 마지막으로 로드된 병종 세트 이름 */
  private lastLoadedSet: string | null = null;

  private constructor() {}

  /**
   * 레지스트리 인스턴스를 획득합니다 (싱글톤).
   */
  public static getInstance(): UnitRegistry {
    if (!UnitRegistry.instance) {
      UnitRegistry.instance = new UnitRegistry();
    }
    return UnitRegistry.instance;
  }

  /**
   * 지정된 병종 세트를 JSON 파일로부터 로드합니다.
   *
   * @param unitSetName 병종 세트 이름 (예: "basic", "che")
   * @param cityNameMap 도시 이름-ID 매핑 (제약 조건 검사용)
   * @param regionNameMap 지역 이름-ID 매핑 (제약 조건 검사용)
   */
  public async load(
    unitSetName: string = "basic",
    cityNameMap: Record<string, number> = {},
    regionNameMap: Record<string, number> = {}
  ): Promise<void> {
    if (this.lastLoadedSet === unitSetName) return;

    try {
      const __dirname = dirname(fileURLToPath(import.meta.url));
      // 소스 경로: packages/logic/src/domain/scenario/unit/*.json
      // 빌드 경로: packages/logic/dist/domain/scenario/unit/*.json
      const unitJsonPath = join(__dirname, "scenario", "unit", `${unitSetName}.json`);
      const content = await readFile(unitJsonPath, "utf-8");
      const rawData = JSON.parse(content);

      if (!Array.isArray(rawData)) {
        throw new Error(`${unitSetName}의 병종 데이터가 배열 형식이 아닙니다.`);
      }

      this.units.clear();
      for (const item of rawData) {
        // Zod 스키마를 이용한 유효성 검사
        const parsed = UnitDataSchema.safeParse(item);
        if (!parsed.success) {
          console.error(`${unitSetName} 세트의 병종 ${item.id} 파싱 실패:`, parsed.error);
          continue;
        }

        const unit = new GameUnit(parsed.data, cityNameMap, regionNameMap);
        this.units.set(unit.id, unit);
      }

      this.lastLoadedSet = unitSetName;
      console.log(`${unitSetName} 세트에서 ${this.units.size}개의 병종을 로드했습니다.`);
    } catch (e) {
      console.error(`${unitSetName} 병종 세트 로드 중 오류 발생:`, e);
      throw e;
    }
  }

  /**
   * ID로 특정 병종을 조회합니다.
   */
  public getUnit(id: number): GameUnit | undefined {
    return this.units.get(id);
  }

  /**
   * 모든 병종 목록을 반환합니다.
   */
  public getAllUnits(): GameUnit[] {
    return Array.from(this.units.values());
  }

  /**
   * 특정 타입의 병종 목록을 반환합니다.
   */
  public getUnitsByType(type: number): GameUnit[] {
    return this.getAllUnits().filter((u) => u.type === type);
  }
}
