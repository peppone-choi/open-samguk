/**
 * 맵 데이터 로더
 *
 * PHP 맵 파일에서 도시 데이터를 JSON으로 변환하여 로드
 * 레거시 호환성을 위해 PHP 파일을 파싱하거나 미리 변환된 JSON 사용
 */
import { readFile, readdir } from "fs/promises";
import { join, basename } from "path";

type CityInitData = [
  id: number,
  name: string,
  level: string,
  pop: number,
  agri: number,
  comm: number,
  secu: number,
  wall: number,
  def: number,
  region: string,
  x: number,
  y: number,
  connections: string[],
];

/**
 * 병종 데이터 타입
 */
export interface UnitBuildData {
  id: number;
  type: number;
  name: string;
  attack: number;
  defense: number;
  speed: number;
  cost: number;
  magicRate: number;
  attackRange: number;
  defenseRange: number;
  attackModifiers: Record<number, number>;
  defenseModifiers: Record<number, number>;
  descriptions: string[];
  attackAbility?: string | null;
  defenseAbility?: string | null;
  specialAbility?: string | null;
}

/**
 * 맵 로더 에러
 */
export class MapLoadError extends Error {
  constructor(
    message: string,
    public readonly mapName: string,
    public readonly cause?: Error
  ) {
    super(`맵 '${mapName}' 로드 실패: ${message}`);
    this.name = "MapLoadError";
  }
}

/**
 * 맵 로더 옵션
 */
export interface MapLoaderOptions {
  /** 맵 파일 기본 경로 */
  basePath?: string;
  /** 캐싱 활성화 여부 */
  enableCache?: boolean;
}

/**
 * 맵 로더 클래스
 *
 * 레거시 PHP 맵 파일을 파싱하여 도시 데이터를 추출
 */
export class MapLoader {
  private readonly basePath: string;
  private readonly enableCache: boolean;
  private readonly mapCache: Map<string, CityInitData[]> = new Map();
  private readonly unitCache: Map<string, UnitBuildData[]> = new Map();

  // 기본 도시 데이터 (CityConstBase의 $initCity)
  private static readonly DEFAULT_CITIES: CityInitData[] = [
    [
      1,
      "업",
      "특",
      6205,
      125,
      113,
      100,
      117,
      122,
      "하북",
      345,
      130,
      ["남피", "복양", "호관", "계교", "관도"],
    ],
    [
      2,
      "허창",
      "특",
      5876,
      121,
      124,
      100,
      117,
      125,
      "중원",
      330,
      215,
      ["완", "진류", "초", "호로", "사수", "관도"],
    ],
    [
      3,
      "낙양",
      "특",
      8357,
      117,
      120,
      100,
      121,
      124,
      "중원",
      275,
      180,
      ["호관", "호로", "사곡", "사수"],
    ],
    [4, "장안", "특", 5923, 116, 123, 100, 120, 118, "서북", 145, 165, ["안정", "함곡", "기산"]],
    [5, "성도", "특", 6525, 123, 125, 100, 125, 123, "서촉", 25, 290, ["덕양", "강주", "면죽"]],
    [6, "양양", "특", 5837, 120, 126, 100, 115, 117, "초", 255, 290, ["신야", "장판"]],
    [7, "건업", "특", 6386, 116, 123, 100, 115, 119, "오월", 505, 305, ["오", "합비", "광릉"]],
  ];

  constructor(options: MapLoaderOptions = {}) {
    this.basePath = options.basePath ?? ".";
    this.enableCache = options.enableCache ?? true;
  }

  /**
   * 맵 데이터 로드
   * @param mapName 맵 이름 (기본: 'che')
   * @returns 도시 초기 데이터 배열
   */
  async loadMap(mapName: string = "che"): Promise<CityInitData[]> {
    // 캐시 확인
    if (this.enableCache && this.mapCache.has(mapName)) {
      return this.mapCache.get(mapName)!;
    }

    try {
      // 1. JSON 파일 시도
      const jsonPath = join(this.basePath, "map", `${mapName}.json`);
      try {
        const content = await readFile(jsonPath, "utf-8");
        const data = JSON.parse(content) as CityInitData[];
        if (this.enableCache) {
          this.mapCache.set(mapName, data);
        }
        return data;
      } catch {
        // JSON 파일 없음, PHP 파싱 시도
      }

      // 2. PHP 파일 파싱 시도
      const phpPath = join(this.basePath, "map", `${mapName}.php`);
      try {
        const data = await this.parsePhpMapFile(phpPath);
        if (this.enableCache) {
          this.mapCache.set(mapName, data);
        }
        return data;
      } catch {
        // PHP 파싱 실패
      }

      // 3. 기본 맵(che) 요청 시 하드코딩된 데이터 반환
      if (mapName === "che") {
        const data = await this.loadDefaultCheMap();
        if (this.enableCache) {
          this.mapCache.set(mapName, data);
        }
        return data;
      }

      throw new MapLoadError("맵 파일을 찾을 수 없습니다", mapName);
    } catch (error) {
      if (error instanceof MapLoadError) {
        throw error;
      }
      throw new MapLoadError((error as Error).message, mapName, error as Error);
    }
  }

  /**
   * PHP 맵 파일 파싱
   */
  private async parsePhpMapFile(filePath: string): Promise<CityInitData[]> {
    const content = await readFile(filePath, "utf-8");

    // PHP 배열 구문 파싱 (간단한 정규식 기반)
    const initCityMatch = content.match(/\$initCity\s*=\s*\[([\s\S]*?)\];/);
    if (!initCityMatch) {
      throw new Error("$initCity 배열을 찾을 수 없습니다");
    }

    const arrayContent = initCityMatch[1];
    return this.parsePhpArray(arrayContent);
  }

  /**
   * PHP 배열 문자열 파싱
   */
  private parsePhpArray(content: string): CityInitData[] {
    const cities: CityInitData[] = [];

    // 각 행(도시) 파싱
    const rowRegex =
      /\[\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*\[([^\]]*)\]\s*\]/g;

    let match;
    while ((match = rowRegex.exec(content)) !== null) {
      const connections = match[13]
        .split(",")
        .map((s) => s.trim().replace(/['"]/g, ""))
        .filter((s) => s.length > 0);

      cities.push([
        parseInt(match[1], 10),
        match[2],
        match[3],
        parseInt(match[4], 10),
        parseInt(match[5], 10),
        parseInt(match[6], 10),
        parseInt(match[7], 10),
        parseInt(match[8], 10),
        parseInt(match[9], 10),
        match[10],
        parseInt(match[11], 10),
        parseInt(match[12], 10),
        connections,
      ]);
    }

    return cities;
  }

  /**
   * 기본 che 맵 로드 (하드코딩)
   * 레거시 CityConstBase에서 추출한 데이터
   */
  private async loadDefaultCheMap(): Promise<CityInitData[]> {
    // miniche.php의 전체 데이터
    return [
      [1, "낙양", "특", 8357, 117, 120, 100, 121, 124, "중원", 285, 176, ["하내", "홍농", "호로"]],
      [2, "성도", "특", 6525, 123, 125, 100, 125, 123, "서촉", 30, 285, ["덕양", "강주"]],
      [3, "건업", "특", 6386, 116, 123, 100, 115, 119, "오월", 507, 303, ["광릉", "합비", "오"]],
      [
        4,
        "업",
        "특",
        6205,
        125,
        113,
        100,
        117,
        122,
        "하북",
        355,
        135,
        ["하내", "거록", "남피", "제남", "진류"],
      ],
      [
        5,
        "장안",
        "특",
        5923,
        116,
        123,
        100,
        120,
        118,
        "서북",
        162,
        173,
        ["안정", "오장원", "한중", "홍농"],
      ],
      [
        6,
        "허창",
        "특",
        5876,
        121,
        124,
        100,
        117,
        125,
        "중원",
        325,
        218,
        ["호로", "진류", "초", "여남", "완"],
      ],
      [7, "양양", "특", 5837, 120, 126, 100, 115, 117, "초", 259, 295, ["신야", "강릉", "강하"]],
      [
        8,
        "시상",
        "대",
        5252,
        98,
        100,
        80,
        99,
        96,
        "오월",
        357,
        357,
        ["적벽", "여강", "단양", "상동", "장사"],
      ],
      [9, "수춘", "대", 5143, 99, 96, 80, 99, 95, "중원", 385, 270, ["여남", "초", "하비", "합비"]],
      [
        10,
        "한중",
        "대",
        5137,
        96,
        101,
        80,
        102,
        103,
        "서촉",
        130,
        218,
        ["무도", "오장원", "장안", "상용", "자동"],
      ],
      [
        11,
        "남피",
        "대",
        5032,
        99,
        101,
        80,
        101,
        105,
        "하북",
        410,
        93,
        ["계", "북평", "평원", "업", "거록"],
      ],
      [
        12,
        "위례",
        "대",
        4926,
        100,
        93,
        80,
        98,
        103,
        "동이",
        618,
        140,
        ["평양", "북해", "웅진", "계림"],
      ],
      [13, "북평", "대", 4862, 102, 95, 80, 103, 99, "하북", 442, 53, ["계", "요동", "남피"]],
      [
        14,
        "강릉",
        "대",
        4850,
        105,
        96,
        80,
        95,
        96,
        "초",
        245,
        330,
        ["이릉", "양양", "적벽", "장사", "무릉"],
      ],
      [15, "완", "대", 4724, 103, 100, 80, 101, 99, "중원", 275, 235, ["허창", "여남", "신야"]],
      [
        16,
        "장사",
        "대",
        4710,
        97,
        99,
        80,
        100,
        105,
        "초",
        258,
        373,
        ["강릉", "시상", "계양", "무릉"],
      ],
      [
        17,
        "오",
        "중",
        4355,
        77,
        81,
        60,
        77,
        76,
        "오월",
        515,
        340,
        ["건업", "단양", "회계", "탐라"],
      ],
      [
        18,
        "하비",
        "중",
        4278,
        85,
        83,
        60,
        82,
        78,
        "중원",
        460,
        240,
        ["패", "북해", "광릉", "수춘"],
      ],
      [19, "복양", "중", 4185, 80, 83, 60, 82, 80, "중원", 412, 170, ["제남", "진류", "패"]],
      [20, "웅진", "중", 4157, 77, 79, 60, 78, 80, "동이", 615, 205, ["위례", "계림", "탐라"]],
      [
        21,
        "강주",
        "중",
        4126,
        79,
        80,
        60,
        84,
        81,
        "서촉",
        75,
        305,
        ["성도", "덕양", "영안", "주제", "월수"],
      ],
      [22, "무도", "중", 4027, 77, 84, 60, 80, 85, "서촉", 55, 191, ["저", "한중", "자동"]],
      [23, "국내", "중", 3982, 78, 80, 60, 83, 78, "동이", 596, 48, ["요동", "오환", "평양"]],
      [
        24,
        "진류",
        "중",
        3957,
        82,
        80,
        60,
        80,
        83,
        "중원",
        370,
        175,
        ["업", "복양", "패", "초", "허창", "호로"],
      ],
      [25, "계양", "중", 3955, 83, 80, 60, 81, 77, "초", 242, 408, ["영릉", "장사", "상동"]],
      [26, "계림", "중", 3911, 80, 74, 60, 81, 78, "동이", 660, 195, ["위례", "웅진", "왜"]],
      [27, "계", "중", 3885, 75, 80, 60, 78, 81, "하북", 386, 55, ["진양", "북평", "남피"]],
      [28, "무위", "중", 3874, 77, 79, 60, 83, 80, "서북", 56, 76, ["강", "안정", "천수", "저"]],
      [29, "제남", "중", 3831, 77, 81, 60, 84, 77, "하북", 402, 132, ["업", "평원", "복양"]],
      [30, "남해", "중", 3803, 82, 76, 60, 80, 81, "오월", 270, 474, ["상동", "산월", "교지"]],
      [
        31,
        "덕양",
        "중",
        3803,
        81,
        84,
        60,
        79,
        77,
        "서촉",
        73,
        276,
        ["자동", "영안", "강주", "성도"],
      ],
      [
        32,
        "하내",
        "중",
        3736,
        77,
        81,
        60,
        81,
        80,
        "하북",
        295,
        140,
        ["진양", "업", "낙양", "하동"],
      ],
      [33, "상용", "중", 3687, 78, 76, 60, 77, 81, "서촉", 190, 220, ["한중", "신야"]],
      [
        34,
        "초",
        "소",
        3286,
        60,
        62,
        40,
        62,
        57,
        "중원",
        375,
        225,
        ["허창", "진류", "패", "수춘", "여남"],
      ],
      [35, "운남", "소", 3258, 62, 60, 40, 64, 61, "남중", 45, 405, ["월수", "건녕", "남만"]],
      [36, "대", "소", 3256, 60, 62, 40, 57, 60, "오월", 450, 470, ["산월", "회계", "왜"]],
      [
        37,
        "하동",
        "소",
        3208,
        60,
        60,
        40,
        62,
        55,
        "서북",
        240,
        140,
        ["흉노", "진양", "하내", "홍농"],
      ],
      [38, "무릉", "소", 3196, 58, 63, 40, 63, 58, "초", 195, 352, ["강릉", "장사", "영릉"]],
      [39, "교지", "소", 3195, 58, 59, 40, 58, 59, "남중", 136, 480, ["남만", "남해"]],
      [
        40,
        "단양",
        "소",
        3183,
        62,
        64,
        40,
        58,
        57,
        "오월",
        440,
        350,
        ["여강", "오", "건안", "시상"],
      ],
      [41, "영안", "소", 3153, 62, 59, 40, 58, 59, "서촉", 116, 282, ["덕양", "이릉", "강주"]],
      [42, "북해", "소", 3146, 55, 63, 40, 63, 58, "하북", 470, 150, ["평원", "위례", "하비"]],
      [43, "합비", "진", 998, 20, 19, 20, 39, 41, "중원", 420, 294, ["수춘", "건업", "여강"]],
      [44, "이릉", "진", 968, 18, 19, 20, 39, 41, "초", 188, 275, ["영안", "강릉"]],
      [45, "건녕", "소", 3082, 58, 59, 40, 63, 56, "남중", 85, 390, ["주제", "장가", "운남"]],
      [46, "강하", "소", 3074, 55, 56, 40, 57, 60, "초", 320, 299, ["양양", "적벽", "여강"]],
      [
        47,
        "진양",
        "소",
        3074,
        56,
        59,
        40,
        64,
        59,
        "하북",
        310,
        75,
        ["흉노", "하동", "하내", "거록", "계"],
      ],
      [48, "평원", "소", 3074, 62, 65, 40, 61, 63, "하북", 445, 110, ["남피", "제남", "북해"]],
      [49, "회계", "소", 3005, 64, 59, 40, 62, 64, "오월", 485, 390, ["오", "건안", "대"]],
      [
        50,
        "천수",
        "소",
        2985,
        59,
        64,
        40,
        60,
        58,
        "서북",
        76,
        140,
        ["무위", "안정", "오장원", "저"],
      ],
      [51, "평양", "소", 2939, 55, 59, 40, 60, 58, "동이", 606, 97, ["국내", "위례"]],
      [52, "요동", "소", 2937, 63, 59, 40, 59, 63, "동이", 549, 26, ["북평", "오환", "국내"]],
      [53, "거록", "소", 2936, 61, 57, 40, 64, 58, "하북", 355, 95, ["진양", "남피", "업"]],
      [
        54,
        "여강",
        "소",
        2905,
        56,
        58,
        40,
        60,
        55,
        "오월",
        392,
        325,
        ["합비", "단양", "시상", "강하"],
      ],
      [55, "패", "소", 2877, 64, 58, 40, 58, 59, "중원", 425, 210, ["진류", "복양", "하비", "초"]],
      [56, "자동", "소", 2870, 57, 55, 40, 60, 58, "서촉", 62, 240, ["무도", "한중", "덕양"]],
      [57, "광릉", "소", 2867, 61, 55, 40, 60, 62, "오월", 478, 270, ["하비", "건업"]],
      [58, "장가", "소", 2853, 59, 62, 40, 58, 57, "남중", 136, 395, ["건녕", "영릉", "남만"]],
      [59, "영릉", "소", 2849, 62, 58, 40, 62, 62, "초", 197, 390, ["무릉", "계양", "장가"]],
      [60, "월수", "소", 2828, 60, 59, 40, 58, 63, "남중", 39, 349, ["강주", "주제", "운남"]],
      [61, "건안", "소", 2802, 57, 62, 40, 58, 63, "오월", 440, 420, ["단양", "회계", "산월"]],
      [62, "신야", "소", 2786, 60, 62, 40, 58, 55, "초", 245, 255, ["상용", "완", "양양"]],
      [63, "탐라", "수", 1130, 22, 21, 20, 43, 41, "동이", 614, 259, ["웅진", "왜", "오"]],
      [64, "상동", "소", 2767, 58, 59, 40, 62, 58, "초", 285, 405, ["계양", "시상", "남해"]],
      [
        65,
        "안정",
        "소",
        2764,
        57,
        59,
        40,
        57,
        62,
        "서북",
        135,
        130,
        ["강", "무위", "천수", "장안"],
      ],
      [66, "여남", "소", 2749, 63, 56, 40, 64, 64, "중원", 335, 255, ["완", "허창", "초", "수춘"]],
      [67, "홍농", "소", 2748, 57, 63, 40, 58, 63, "서북", 220, 170, ["하동", "낙양", "장안"]],
      [68, "주제", "소", 2746, 58, 61, 40, 61, 58, "남중", 93, 357, ["강주", "월수", "건녕"]],
      [69, "남만", "이", 2378, 40, 42, 20, 43, 45, "남중", 90, 454, ["운남", "장가", "교지"]],
      [70, "산월", "이", 2275, 40, 37, 20, 43, 38, "오월", 373, 447, ["건안", "대", "남해"]],
      [71, "오환", "이", 2153, 42, 37, 20, 43, 40, "동이", 628, 19, ["요동", "국내"]],
      [72, "강", "이", 2095, 40, 42, 20, 43, 40, "서북", 154, 70, ["무위", "안정"]],
      [73, "왜", "이", 2065, 39, 37, 20, 43, 41, "동이", 681, 292, ["계림", "탐라", "대"]],
      [74, "흉노", "이", 2064, 40, 41, 20, 40, 38, "서북", 227, 79, ["진양", "하동"]],
      [75, "저", "이", 1957, 40, 42, 20, 43, 42, "서북", 24, 123, ["무위", "천수", "무도"]],
      [76, "호로", "관", 958, 17, 19, 20, 95, 96, "중원", 317, 182, ["낙양", "진류", "허창"]],
      [77, "오장원", "진", 1005, 19, 18, 20, 41, 40, "서북", 104, 175, ["천수", "장안", "한중"]],
      [78, "적벽", "수", 1117, 23, 21, 20, 42, 41, "오월", 335, 330, ["강하", "강릉", "시상"]],
    ];
  }

  /**
   * 유닛 세트 로드
   * @param unitSetName 유닛 세트 이름 (기본: 'basic')
   * @returns 병종 데이터 배열
   */
  async loadUnitSet(unitSetName: string = "basic"): Promise<UnitBuildData[]> {
    // 캐시 확인
    if (this.enableCache && this.unitCache.has(unitSetName)) {
      return this.unitCache.get(unitSetName)!;
    }

    try {
      // 1. JSON 파일 시도
      const jsonPath = join(this.basePath, "unit", `${unitSetName}.json`);
      try {
        const content = await readFile(jsonPath, "utf-8");
        const data = JSON.parse(content) as UnitBuildData[];
        if (this.enableCache) {
          this.unitCache.set(unitSetName, data);
        }
        return data;
      } catch {
        // JSON 파일 없음
      }

      // 2. 기본 유닛 반환
      const defaultUnits = this.getDefaultUnits();
      if (this.enableCache) {
        this.unitCache.set(unitSetName, defaultUnits);
      }
      return defaultUnits;
    } catch (error) {
      throw new MapLoadError((error as Error).message, unitSetName, error as Error);
    }
  }

  /**
   * 기본 병종 데이터
   */
  private getDefaultUnits(): UnitBuildData[] {
    return [
      {
        id: 1000,
        type: 0, // CASTLE
        name: "성벽",
        attack: 100,
        defense: 100,
        speed: 7,
        cost: 0,
        magicRate: 0,
        attackRange: 99,
        defenseRange: 9,
        attackModifiers: {},
        defenseModifiers: { 1: 1.2 },
        descriptions: ["성벽입니다.", "생성할 수 없습니다."],
      },
      {
        id: 1100,
        type: 1, // FOOTMAN
        name: "보병",
        attack: 100,
        defense: 150,
        speed: 7,
        cost: 10,
        magicRate: 0,
        attackRange: 9,
        defenseRange: 9,
        attackModifiers: { 2: 1.2, 3: 0.8, 5: 1.2 },
        defenseModifiers: { 2: 0.8, 3: 1.2, 5: 0.8 },
        descriptions: [
          "표준적인 보병입니다.",
          "보병은 방어특화이며,",
          "상대가 회피하기 어렵습니다.",
        ],
      },
      {
        id: 1200,
        type: 2, // ARCHER
        name: "궁병",
        attack: 100,
        defense: 100,
        speed: 7,
        cost: 20,
        magicRate: 0,
        attackRange: 10,
        defenseRange: 10,
        attackModifiers: { 3: 1.2, 1: 0.8, 5: 1.2 },
        defenseModifiers: { 3: 0.8, 1: 1.2, 5: 0.8 },
        descriptions: ["표준적인 궁병입니다.", "궁병은 회피특화입니다."],
      },
      {
        id: 1300,
        type: 3, // CAVALRY
        name: "기병",
        attack: 150,
        defense: 100,
        speed: 7,
        cost: 5,
        magicRate: 0,
        attackRange: 11,
        defenseRange: 11,
        attackModifiers: { 1: 1.2, 2: 0.8, 5: 1.2 },
        defenseModifiers: { 1: 0.8, 2: 1.2, 5: 0.8 },
        descriptions: ["표준적인 기병입니다.", "기병은 공격특화입니다."],
      },
      {
        id: 1400,
        type: 4, // WIZARD
        name: "귀병",
        attack: 80,
        defense: 80,
        speed: 7,
        cost: 5,
        magicRate: 0.5,
        attackRange: 9,
        defenseRange: 9,
        attackModifiers: { 5: 1.2 },
        defenseModifiers: { 5: 0.8 },
        descriptions: ["계략을 사용하는 병종입니다."],
      },
      {
        id: 1500,
        type: 5, // SIEGE
        name: "정란",
        attack: 100,
        defense: 100,
        speed: 6,
        cost: 0,
        magicRate: 0,
        attackRange: 15,
        defenseRange: 5,
        attackModifiers: { 1: 0.8, 2: 0.8, 3: 0.8, 4: 0.8, 0: 1.8 },
        defenseModifiers: { 1: 1.2, 2: 1.2, 3: 1.2, 4: 1.2 },
        descriptions: ["높은 구조물 위에서 공격합니다."],
      },
    ];
  }

  /**
   * 사용 가능한 맵 목록 조회
   */
  async listMaps(): Promise<string[]> {
    try {
      const mapDir = join(this.basePath, "map");
      const files = await readdir(mapDir);
      return files
        .filter((f) => f.endsWith(".php") || f.endsWith(".json"))
        .map((f) => basename(f, f.endsWith(".php") ? ".php" : ".json"));
    } catch {
      return ["che", "miniche", "miniche_b", "chess"];
    }
  }

  /**
   * 도시 연결 정보 조회
   * @param cities 도시 배열
   * @returns 도시 ID -> 연결 도시 ID 배열 맵
   */
  buildConnectionMap(cities: CityInitData[]): Map<number, number[]> {
    const nameToId = new Map<string, number>();
    for (const city of cities) {
      nameToId.set(city[1], city[0]);
    }

    const connections = new Map<number, number[]>();
    for (const city of cities) {
      const cityId = city[0];
      const connectedIds = city[12]
        .map((name) => nameToId.get(name))
        .filter((id): id is number => id !== undefined);
      connections.set(cityId, connectedIds);
    }

    return connections;
  }

  /**
   * 캐시 클리어
   */
  clearCache(): void {
    this.mapCache.clear();
    this.unitCache.clear();
  }
}
