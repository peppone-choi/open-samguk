/**
 * 시나리오 로더
 *
 * 시나리오 JSON 파일을 로드하고 검증하여 WorldState로 변환
 * @see docs/architecture/scenario-schema.md
 */
import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  Scenario,
  ScenarioSchema,
  GeneralData,
  NationData,
  DiplomacyData,
  StatConfig,
  DEFAULT_STAT_CONFIG,
  DEFAULT_MAP_CONFIG,
  validateScenario,
  safeValidateScenario,
} from "./schema.js";
import type { WorldSnapshot, General, Nation, City, Diplomacy } from "../entities.js";
import { MapLoader } from "./MapLoader.js";

/**
 * 시나리오 로드 에러
 */
export class ScenarioLoadError extends Error {
  constructor(
    message: string,
    public readonly scenarioId: number,
    public readonly cause?: Error
  ) {
    super(`시나리오 ${scenarioId} 로드 실패: ${message}`);
    this.name = "ScenarioLoadError";
  }
}

/**
 * 시나리오 검증 에러
 */
export class ScenarioValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: unknown[]
  ) {
    super(`시나리오 검증 실패: ${message}`);
    this.name = "ScenarioValidationError";
  }
}

/**
 * 관직 레벨 상수
 */
export const OFFICER_LEVEL = {
  WANDERER: 0, // 재야
  GENERAL: 1, // 장수
  CHIEF_MIN: 5, // 수뇌 최소
  CHIEF_MAX: 10, // 수뇌 최대
  STRATEGIST: 11, // 참모
  LORD: 12, // 군주
} as const;

/**
 * 국가 규모 상수
 */
export const NATION_LEVEL = {
  WANDERER: 0, // 방랑군
  NOBLE: 1, // 호족
  WARLORD: 2, // 군벌
  GOVERNOR: 3, // 주목
  INSPECTOR: 4, // 자사
  KING: 5, // 왕
  EMPEROR_KING: 6, // 제왕
  EMPEROR: 7, // 황제
} as const;

/**
 * 외교 관계 상수
 */
export const DIPLOMACY_TYPE = {
  WAR: 0, // 전쟁
  DECLARED: 1, // 선포
  NON_AGGRESSION: 7, // 불가침
} as const;

/**
 * 시나리오 로더 옵션
 */
export interface ScenarioLoaderOptions {
  /** 시나리오 디렉토리 경로 */
  scenarioPath?: string;
  /** 기본 설정 파일 경로 */
  defaultConfigPath?: string;
}

/**
 * 시나리오 로더 클래스
 */
export class ScenarioLoader {
  private readonly scenarioPath: string;
  private readonly defaultConfigPath: string;
  private defaultConfig: StatConfig | null = null;
  private mapLoader: MapLoader;

  constructor(options: ScenarioLoaderOptions = {}) {
    // 기본 경로 설정 (레거시 경로 사용)
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const projectRoot = join(__dirname, "../../../../../..");

    this.scenarioPath = options.scenarioPath ?? join(projectRoot, "legacy/hwe/scenario");
    this.defaultConfigPath = options.defaultConfigPath ?? join(this.scenarioPath, "default.json");
    this.mapLoader = new MapLoader({ basePath: this.scenarioPath });
  }

  /**
   * 기본 설정 로드
   */
  private async loadDefaultConfig(): Promise<StatConfig> {
    if (this.defaultConfig) {
      return this.defaultConfig;
    }

    try {
      const content = await readFile(this.defaultConfigPath, "utf-8");
      const parsed = JSON.parse(content);
      this.defaultConfig = {
        ...DEFAULT_STAT_CONFIG,
        ...parsed.stat,
      };
      return this.defaultConfig!;
    } catch {
      // 기본 설정 파일이 없으면 기본값 사용
      this.defaultConfig = { ...DEFAULT_STAT_CONFIG };
      return this.defaultConfig;
    }
  }

  /**
   * 시나리오 파일 로드
   * @param scenarioId 시나리오 ID
   * @returns 검증된 시나리오 데이터
   */
  async load(scenarioId: number): Promise<Scenario> {
    const filePath = join(this.scenarioPath, `scenario_${scenarioId}.json`);

    try {
      const content = await readFile(filePath, "utf-8");
      const data = JSON.parse(content);
      return this.validate(data);
    } catch (error) {
      if (error instanceof ScenarioValidationError) {
        throw error;
      }
      throw new ScenarioLoadError((error as Error).message, scenarioId, error as Error);
    }
  }

  /**
   * 시나리오 데이터 검증
   * @param data 검증할 데이터
   * @returns 검증된 Scenario 객체
   */
  validate(data: unknown): Scenario {
    const result = safeValidateScenario(data);

    if (!result.success) {
      const errors = result.error.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
        code: e.code,
      }));
      throw new ScenarioValidationError(`검증 오류 ${errors.length}건`, errors);
    }

    return result.data;
  }

  /**
   * 시나리오를 WorldSnapshot으로 변환
   * @param scenario 시나리오 데이터
   * @returns WorldSnapshot 객체
   */
  async toWorldState(scenario: Scenario): Promise<WorldSnapshot> {
    const defaultConfig = await this.loadDefaultConfig();
    const statConfig = { ...defaultConfig, ...scenario.stat };
    const mapConfig = { ...DEFAULT_MAP_CONFIG, ...scenario.map };

    // 맵 데이터 로드
    const cityInitData = await this.mapLoader.loadMap(mapConfig.mapName);

    // 국가 ID 매핑 (이름 -> ID)
    const nationIdMap = new Map<string, number>();
    const nations: Record<number, Nation> = {};
    const cities: Record<number, City> = {};
    const generals: Record<number, General> = {};
    const diplomacy: Record<string, Diplomacy> = {};

    // 도시 초기화 (맵 데이터 기반)
    for (const cityData of cityInitData) {
      const city = this.createCity(cityData);
      cities[city.id] = city;
    }

    // 시나리오 도시 오버라이드 적용
    if (scenario.cities) {
      for (const override of scenario.cities) {
        const city = Object.values(cities).find((c) => c.name === override.name);
        if (city) {
          if (override.pop !== undefined) city.pop = override.pop;
          if (override.agri !== undefined) city.agri = override.agri;
          if (override.comm !== undefined) city.comm = override.comm;
          if (override.secu !== undefined) city.secu = override.secu;
          if (override.def !== undefined) city.def = override.def;
          if (override.wall !== undefined) city.wall = override.wall;
          if (override.trust !== undefined) city.trust = override.trust;
        }
      }
    }

    // 국가 초기화
    let nationId = 1;
    if (scenario.nation) {
      for (const nationData of scenario.nation) {
        const nation = this.createNation(nationData, nationId, cities);
        nations[nationId] = nation;
        nationIdMap.set(nationData[0], nationId);
        nationId++;
      }
    }

    // 외교 관계 초기화
    if (scenario.diplomacy) {
      for (const diplData of scenario.diplomacy) {
        const dipl = this.createDiplomacy(diplData, scenario.nation || []);
        if (dipl) {
          const key = `${dipl.srcNationId}:${dipl.destNationId}`;
          diplomacy[key] = dipl;
        }
      }
    }

    // 장수 초기화
    let generalId = 1;
    const allGenerals = [
      ...(scenario.general || []),
      ...(scenario.general_ex || []),
      ...(scenario.general_neutral || []),
    ];

    for (const generalData of allGenerals) {
      const general = this.createGeneral(
        generalData,
        generalId,
        nationIdMap,
        cities,
        scenario.startYear
      );
      generals[generalId] = general;
      generalId++;
    }

    // 국가별 군주 설정
    for (const general of Object.values(generals)) {
      if (general.officerLevel === OFFICER_LEVEL.LORD && general.nationId > 0) {
        const nation = nations[general.nationId];
        if (nation && nation.chiefGeneralId === 0) {
          nation.chiefGeneralId = general.id;
        }
      }
    }

    return {
      generals,
      nations,
      cities,
      diplomacy,
      troops: {},
      messages: {},
      gameTime: {
        year: scenario.startYear,
        month: 1,
      },
      env: {
        title: scenario.title,
        life: scenario.life ?? 0,
        fiction: scenario.fiction ?? 0,
        statConfig,
        mapConfig,
        constOverride: scenario.const ?? {},
        history: scenario.history ?? [],
      },
    };
  }

  /**
   * 도시 엔티티 생성
   */
  private createCity(
    data: [
      number,
      string,
      string,
      number,
      number,
      number,
      number,
      number,
      number,
      string,
      number,
      number,
      string[],
    ]
  ): City {
    const [id, name, level, pop, agri, comm, secu, wall, def, region, _x, _y, _connections] = data;

    // 규모에 따른 최대값 설정
    const levelMultiplier = this.getCityLevelMultiplier(level);
    const popMax = Math.floor(pop * 1.5);
    const agriMax = Math.floor(agri * levelMultiplier);
    const commMax = Math.floor(comm * levelMultiplier);
    const secuMax = 100;
    const defMax = 100;
    const wallMax = Math.floor(wall * levelMultiplier);

    return {
      id,
      name,
      nationId: 0,
      level: this.getCityLevelNumber(level),
      supply: 1,
      front: 0,
      pop,
      popMax,
      agri,
      agriMax,
      comm,
      commMax,
      secu,
      secuMax,
      def,
      defMax,
      wall,
      wallMax,
      trust: 50,
      gold: 0,
      rice: 0,
      region: this.getRegionNumber(region),
      state: 0,
      term: 0,
      conflict: {},
      meta: {},
    };
  }

  /**
   * 국가 엔티티 생성
   */
  private createNation(data: NationData, id: number, cities: Record<number, City>): Nation {
    const [name, color, gold, rice, _infoText, tech, typeCode, level, cityNames] = data;

    // 수도 설정 (첫 번째 도시)
    let capitalCityId = 0;
    for (const cityName of cityNames) {
      const city = Object.values(cities).find((c) => c.name === cityName);
      if (city) {
        city.nationId = id;
        if (capitalCityId === 0) {
          capitalCityId = city.id;
        }
      }
    }

    return {
      id,
      name,
      color,
      chiefGeneralId: 0,
      capitalCityId,
      gold,
      rice,
      rate: 20,
      rateTmp: 0,
      tech,
      power: 0,
      level,
      gennum: 0,
      typeCode: typeof typeCode === "string" ? typeCode : "유가",
      scoutLevel: 0,
      warState: 0,
      strategicCmdLimit: 10,
      surrenderLimit: 0,
      spy: {},
      meta: {},
      aux: {},
    };
  }

  /**
   * 외교 관계 엔티티 생성
   */
  private createDiplomacy(data: DiplomacyData, nations: NationData[]): Diplomacy | null {
    const [nation1Idx, nation2Idx, diplomacyType, duration] = data;

    // 인덱스가 범위 내인지 확인
    if (nation1Idx >= nations.length || nation2Idx >= nations.length) {
      return null;
    }

    // 인덱스 -> ID 변환 (인덱스 + 1)
    const srcNationId = nation1Idx + 1;
    const destNationId = nation2Idx + 1;

    return {
      id: srcNationId * 1000 + destNationId,
      srcNationId,
      destNationId,
      state: this.getDiplomacyState(diplomacyType),
      term: duration,
      meta: {},
    };
  }

  /**
   * 장수 엔티티 생성
   */
  private createGeneral(
    data: GeneralData,
    id: number,
    nationIdMap: Map<string, number>,
    cities: Record<number, City>,
    startYear: number
  ): General {
    const [
      affinity,
      name,
      _picturePath,
      nationName,
      locatedCity,
      leadership,
      strength,
      intel,
      officerLevel,
      birth,
      death,
      ego,
      speciality,
      ...rest
    ] = data;
    const text = rest[0] as string | undefined;

    // 국가 ID 결정
    let nationId = 0;
    if (nationName !== null && nationName !== 0) {
      if (typeof nationName === "string") {
        nationId = nationIdMap.get(nationName) ?? 0;
      } else if (typeof nationName === "number") {
        nationId = nationName;
      }
    }

    // 도시 ID 결정
    let cityId = 0;
    if (locatedCity) {
      const city = Object.values(cities).find((c) => c.name === locatedCity);
      if (city) {
        cityId = city.id;
      }
    }

    // 나이 계산
    const age = startYear - birth;

    return {
      id,
      name,
      ownerId: 0,
      nationId,
      cityId,
      troopId: 0,
      gold: 0,
      rice: 500,
      leadership,
      leadershipExp: 0,
      strength,
      strengthExp: 0,
      intel,
      intelExp: 0,
      politics: Math.floor((leadership + intel) / 2), // 정치력 추정
      politicsExp: 0,
      charm: Math.floor((leadership + strength + intel) / 3), // 매력 추정
      charmExp: 0,
      injury: 0,
      experience: 0,
      dedication: 0,
      officerLevel,
      officerCity: cityId,
      recentWar: 0,
      crew: 0,
      crewType: 1100, // 기본 보병
      train: 0,
      atmos: 0,
      dex: {},
      age,
      bornYear: birth,
      deadYear: death,
      special: ego ?? "",
      specAge: 0,
      special2: speciality ?? "",
      specAge2: 0,
      weapon: "",
      book: "",
      horse: "",
      item: "",
      turnTime: new Date(),
      recentWarTime: null,
      makeLimit: 0,
      killTurn: -1,
      block: 0,
      defenceTrain: 0,
      tournamentState: 0,
      lastTurn: {},
      meta: {
        affinity: affinity ?? 0,
        text: text ?? "",
      },
      penalty: {},
    };
  }

  /**
   * 도시 규모 -> 배수 변환
   */
  private getCityLevelMultiplier(level: string): number {
    const multipliers: Record<string, number> = {
      특: 1.5,
      대: 1.3,
      중: 1.2,
      소: 1.1,
      진: 1.0,
      수: 1.0,
      관: 1.0,
      이: 0.9,
    };
    return multipliers[level] ?? 1.0;
  }

  /**
   * 도시 규모 -> 숫자 변환
   */
  private getCityLevelNumber(level: string): number {
    const levels: Record<string, number> = {
      수: 1,
      진: 2,
      관: 3,
      이: 4,
      소: 5,
      중: 6,
      대: 7,
      특: 8,
    };
    return levels[level] ?? 5;
  }

  /**
   * 지역 -> 숫자 변환
   */
  private getRegionNumber(region: string): number {
    const regions: Record<string, number> = {
      하북: 1,
      중원: 2,
      서북: 3,
      서촉: 4,
      남중: 5,
      초: 6,
      오월: 7,
      동이: 8,
    };
    return regions[region] ?? 0;
  }

  /**
   * 외교 타입 -> 상태 문자열 변환
   */
  private getDiplomacyState(diplomacyType: number): string {
    const states: Record<number, string> = {
      [DIPLOMACY_TYPE.WAR]: "war",
      [DIPLOMACY_TYPE.DECLARED]: "declared",
      [DIPLOMACY_TYPE.NON_AGGRESSION]: "non_aggression",
    };
    return states[diplomacyType] ?? "neutral";
  }
}
