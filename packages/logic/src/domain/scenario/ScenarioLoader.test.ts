/**
 * 시나리오 로더 테스트
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  ScenarioSchema,
  GeneralDataSchema,
  NationDataSchema,
  validateScenario,
  safeValidateScenario,
  DEFAULT_STAT_CONFIG,
  Scenario,
} from "./schema.js";
import {
  ScenarioLoader,
  ScenarioValidationError,
  OFFICER_LEVEL,
  NATION_LEVEL,
} from "./ScenarioLoader.js";
import { MapLoader } from "./MapLoader.js";
import { InitialEventRunner } from "./InitialEventRunner.js";

describe("ScenarioSchema", () => {
  describe("GeneralDataSchema", () => {
    it("유효한 장수 데이터를 파싱한다", () => {
      const validGeneral = [1, "관우", 1047, 1, null, 96, 98, 80, 12, 162, 219, "의협", "위압"];

      const result = GeneralDataSchema.safeParse(validGeneral);
      expect(result.success).toBe(true);
    });

    it("장수 대사가 포함된 데이터를 파싱한다", () => {
      const generalWithText = [
        1,
        "헌제",
        1002,
        1,
        null,
        17,
        13,
        61,
        0,
        170,
        250,
        "안전",
        null,
        "한 왕실을 구해줄 이는 진정 없는 것인가...",
      ];

      const result = GeneralDataSchema.safeParse(generalWithText);
      expect(result.success).toBe(true);
    });

    it("재야 장수(affinity=999)를 파싱한다", () => {
      const wandererGeneral = [
        999,
        "사마휘",
        1003,
        0,
        null,
        71,
        11,
        96,
        0,
        173,
        234,
        "은둔",
        "신산",
      ];

      const result = GeneralDataSchema.safeParse(wandererGeneral);
      expect(result.success).toBe(true);
    });
  });

  describe("NationDataSchema", () => {
    it("유효한 국가 데이터를 파싱한다", () => {
      const validNation = [
        "후한",
        "#800000",
        10000,
        10000,
        "후한왕조",
        1500,
        "유가",
        7,
        ["낙양", "계", "역경", "진양"],
      ];

      const result = NationDataSchema.safeParse(validNation);
      expect(result.success).toBe(true);
    });
  });

  describe("ScenarioSchema", () => {
    it("최소 시나리오를 파싱한다", () => {
      const minimalScenario = {
        title: "테스트 시나리오",
        startYear: 180,
      };

      const result = ScenarioSchema.safeParse(minimalScenario);
      expect(result.success).toBe(true);
    });

    it("공백지 시나리오를 파싱한다", () => {
      const scenario0 = {
        title: "【공백지】 일반",
        startYear: 180,
        history: [],
        const: {
          joinRuinedNPCProp: 0,
          npcBanMessageProb: 1,
        },
        events: [
          [
            "month",
            1000,
            ["or", ["Date", "==", null, 12], ["Date", "==", null, 6]],
            ["CreateManyNPC", 10, 10],
            ["DeleteEvent"],
          ],
        ],
      };

      const result = ScenarioSchema.safeParse(scenario0);
      expect(result.success).toBe(true);
    });

    it("역사 시나리오를 파싱한다", () => {
      const historicalScenario = {
        title: "【역사모드1】 황건적의 난",
        startYear: 181,
        life: 1,
        fiction: 0,
        const: {
          defaultMaxGeneral: 600,
        },
        nation: [
          ["후한", "#800000", 10000, 10000, "후한왕조", 1500, "유가", 7, ["낙양"]],
          ["황건적", "#FFD700", 10000, 10000, "황건적", 500, "태평도", 2, ["업"]],
        ],
        diplomacy: [],
        general: [[1, "소제1", 1001, 1, null, 20, 11, 48, 0, 168, 190, "유지", null]],
      };

      const result = ScenarioSchema.safeParse(historicalScenario);
      expect(result.success).toBe(true);
    });
  });

  describe("validateScenario", () => {
    it("유효한 데이터를 검증한다", () => {
      const data = {
        title: "테스트",
        startYear: 180,
      };

      const result = validateScenario(data);
      expect(result.title).toBe("테스트");
      expect(result.startYear).toBe(180);
    });

    it("잘못된 데이터에서 예외를 던진다", () => {
      const invalidData = {
        title: 123, // 문자열이어야 함
        startYear: "180", // 숫자여야 함
      };

      expect(() => validateScenario(invalidData)).toThrow();
    });
  });

  describe("safeValidateScenario", () => {
    it("유효한 데이터는 success: true를 반환한다", () => {
      const data = {
        title: "테스트",
        startYear: 180,
      };

      const result = safeValidateScenario(data);
      expect(result.success).toBe(true);
    });

    it("잘못된 데이터는 success: false를 반환한다", () => {
      const invalidData = {
        title: 123,
      };

      const result = safeValidateScenario(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe("ScenarioLoader", () => {
  describe("validate", () => {
    let loader: ScenarioLoader;

    beforeEach(() => {
      loader = new ScenarioLoader();
    });

    it("유효한 시나리오를 검증한다", () => {
      const scenario = {
        title: "테스트 시나리오",
        startYear: 180,
        nation: [["위", "#FF0000", 5000, 5000, "위나라", 1000, "법가", 5, ["업"]]],
      };

      const result = loader.validate(scenario);
      expect(result.title).toBe("테스트 시나리오");
    });

    it("잘못된 시나리오에서 ScenarioValidationError를 던진다", () => {
      const invalidScenario = {
        title: 123,
      };

      expect(() => loader.validate(invalidScenario)).toThrow(ScenarioValidationError);
    });
  });

  describe("toWorldState", () => {
    let loader: ScenarioLoader;

    beforeEach(() => {
      loader = new ScenarioLoader();
    });

    it("시나리오를 WorldSnapshot으로 변환한다", async () => {
      const scenario: Scenario = {
        title: "테스트 시나리오",
        startYear: 200,
        nation: [["위", "#FF0000", 5000, 3000, "위나라", 1000, "법가", 5, ["낙양"]]],
        general: [[1, "조조", null, "위", "낙양", 96, 72, 91, 12, 155, 220, "패권", "신산"]],
      };

      const worldState = await loader.toWorldState(scenario);

      // 기본 검증
      expect(worldState.gameTime.year).toBe(200);
      expect(worldState.gameTime.month).toBe(1);

      // 국가 검증
      const nations = Object.values(worldState.nations);
      expect(nations.length).toBe(1);
      expect(nations[0].name).toBe("위");
      expect(nations[0].gold).toBe(5000);
      expect(nations[0].rice).toBe(3000);

      // 장수 검증
      const generals = Object.values(worldState.generals);
      expect(generals.length).toBe(1);
      expect(generals[0].name).toBe("조조");
      expect(generals[0].leadership).toBe(96);
      expect(generals[0].officerLevel).toBe(OFFICER_LEVEL.LORD);
    });

    it("외교 관계를 설정한다", async () => {
      const scenario: Scenario = {
        title: "외교 테스트",
        startYear: 200,
        nation: [
          ["위", "#FF0000", 5000, 3000, "위나라", 1000, "법가", 5, ["낙양"]],
          ["촉", "#00FF00", 5000, 3000, "촉나라", 800, "유가", 4, ["성도"]],
        ],
        diplomacy: [
          [0, 1, 0, 12], // 위-촉 전쟁
        ],
      };

      const worldState = await loader.toWorldState(scenario);

      const diplomacyEntries = Object.values(worldState.diplomacy);
      expect(diplomacyEntries.length).toBe(1);
      expect(diplomacyEntries[0].state).toBe("war");
      expect(diplomacyEntries[0].term).toBe(12);
    });

    it("환경 설정을 저장한다", async () => {
      const scenario: Scenario = {
        title: "환경 테스트",
        startYear: 200,
        life: 1,
        fiction: 0,
        const: {
          defaultMaxGeneral: 500,
        },
      };

      const worldState = await loader.toWorldState(scenario);

      expect(worldState.env.title).toBe("환경 테스트");
      expect(worldState.env.life).toBe(1);
      expect(worldState.env.fiction).toBe(0);
      expect(worldState.env.constOverride.defaultMaxGeneral).toBe(500);
    });
  });
});

describe("MapLoader", () => {
  let mapLoader: MapLoader;

  beforeEach(() => {
    mapLoader = new MapLoader();
  });

  describe("loadMap", () => {
    it("기본 che 맵을 로드한다", async () => {
      const cities = await mapLoader.loadMap("che");

      expect(cities.length).toBeGreaterThan(0);
      expect(cities[0][1]).toBe("낙양"); // 첫 번째 도시
    });

    it("맵 데이터가 올바른 형식이다", async () => {
      const cities = await mapLoader.loadMap("che");

      for (const city of cities) {
        expect(city.length).toBe(13);
        expect(typeof city[0]).toBe("number"); // id
        expect(typeof city[1]).toBe("string"); // name
        expect(typeof city[2]).toBe("string"); // level
        expect(typeof city[3]).toBe("number"); // pop
        expect(Array.isArray(city[12])).toBe(true); // connections
      }
    });
  });

  describe("loadUnitSet", () => {
    it("기본 유닛을 로드한다", async () => {
      const units = await mapLoader.loadUnitSet("basic");

      expect(units.length).toBeGreaterThan(0);
      expect(units[0].name).toBe("성벽");
    });

    it("유닛 데이터가 올바른 형식이다", async () => {
      const units = await mapLoader.loadUnitSet("basic");

      for (const unit of units) {
        expect(typeof unit.id).toBe("number");
        expect(typeof unit.name).toBe("string");
        expect(typeof unit.attack).toBe("number");
        expect(typeof unit.defense).toBe("number");
      }
    });
  });

  describe("buildConnectionMap", () => {
    it("도시 연결 맵을 생성한다", async () => {
      const cities = await mapLoader.loadMap("che");
      const connections = mapLoader.buildConnectionMap(cities);

      // 낙양(id=1)의 연결 확인
      const luoyangConnections = connections.get(1);
      expect(luoyangConnections).toBeDefined();
      expect(luoyangConnections!.length).toBeGreaterThan(0);
    });
  });
});

describe("InitialEventRunner", () => {
  let runner: InitialEventRunner;

  beforeEach(() => {
    runner = new InitialEventRunner();
  });

  describe("evaluateCondition", () => {
    const mockSnapshot = {
      gameTime: { year: 183, month: 1 },
      nations: { 1: {}, 2: {}, 3: {} },
    } as any;

    const mockContext = {
      startYear: 180,
      currentYear: 183,
      currentMonth: 1,
      eventsToDelete: new Set<string>(),
    };

    it("boolean 조건을 평가한다", () => {
      expect(runner.evaluateCondition(true, mockSnapshot, mockContext)).toBe(true);
      expect(runner.evaluateCondition(false, mockSnapshot, mockContext)).toBe(false);
    });

    it("Date 조건을 평가한다", () => {
      // 연도만 비교
      expect(runner.evaluateCondition(["Date", ">=", 183, null], mockSnapshot, mockContext)).toBe(
        true
      );

      expect(runner.evaluateCondition(["Date", ">", 183, null], mockSnapshot, mockContext)).toBe(
        false
      );

      // 월만 비교
      expect(runner.evaluateCondition(["Date", "==", null, 1], mockSnapshot, mockContext)).toBe(
        true
      );

      // 연월 비교
      expect(runner.evaluateCondition(["Date", "==", 183, 1], mockSnapshot, mockContext)).toBe(
        true
      );
    });

    it("DateRelative 조건을 평가한다", () => {
      expect(runner.evaluateCondition(["DateRelative", ">=", 3], mockSnapshot, mockContext)).toBe(
        true
      );

      expect(runner.evaluateCondition(["DateRelative", "<", 2], mockSnapshot, mockContext)).toBe(
        false
      );
    });

    it("RemainNation 조건을 평가한다", () => {
      expect(runner.evaluateCondition(["RemainNation", "==", 3], mockSnapshot, mockContext)).toBe(
        true
      );

      expect(runner.evaluateCondition(["RemainNation", "<=", 5], mockSnapshot, mockContext)).toBe(
        true
      );
    });

    it("and 조건을 평가한다", () => {
      expect(
        runner.evaluateCondition(
          ["and", ["Date", ">=", 183, null], ["RemainNation", "<=", 5]],
          mockSnapshot,
          mockContext
        )
      ).toBe(true);

      expect(
        runner.evaluateCondition(
          ["and", ["Date", ">=", 200, null], ["RemainNation", "<=", 5]],
          mockSnapshot,
          mockContext
        )
      ).toBe(false);
    });

    it("or 조건을 평가한다", () => {
      expect(
        runner.evaluateCondition(
          ["or", ["Date", ">=", 200, null], ["RemainNation", "<=", 5]],
          mockSnapshot,
          mockContext
        )
      ).toBe(true);

      expect(
        runner.evaluateCondition(
          ["or", ["Date", ">=", 200, null], ["RemainNation", "==", 10]],
          mockSnapshot,
          mockContext
        )
      ).toBe(false);
    });
  });

  describe("runInitialEvents", () => {
    it("초기 이벤트를 실행한다", () => {
      const scenario: Scenario = {
        title: "테스트",
        startYear: 180,
        initialEvents: [[true, ["NoticeToHistoryLog", "게임 시작!"]]],
      };

      const mockSnapshot = {
        gameTime: { year: 180, month: 1 },
        nations: {},
        generals: {},
        cities: {},
        diplomacy: {},
        troops: {},
        messages: {},
        env: {},
      } as any;

      const result = runner.runInitialEvents(scenario, mockSnapshot);

      expect(result.success).toBe(true);
      expect(result.executedCount).toBe(1);
    });

    it("조건이 false인 이벤트는 실행하지 않는다", () => {
      const scenario: Scenario = {
        title: "테스트",
        startYear: 180,
        initialEvents: [[false, ["NoticeToHistoryLog", "실행되지 않음"]]],
      };

      const mockSnapshot = {
        gameTime: { year: 180, month: 1 },
        nations: {},
        generals: {},
        cities: {},
        diplomacy: {},
        troops: {},
        messages: {},
        env: {},
      } as any;

      const result = runner.runInitialEvents(scenario, mockSnapshot);

      expect(result.success).toBe(true);
      expect(result.executedCount).toBe(0);
    });
  });
});

describe("DEFAULT_STAT_CONFIG", () => {
  it("기본 스탯 설정이 올바르다", () => {
    expect(DEFAULT_STAT_CONFIG.total).toBe(165);
    expect(DEFAULT_STAT_CONFIG.min).toBe(15);
    expect(DEFAULT_STAT_CONFIG.max).toBe(80);
    expect(DEFAULT_STAT_CONFIG.npcTotal).toBe(150);
    expect(DEFAULT_STAT_CONFIG.npcMax).toBe(75);
    expect(DEFAULT_STAT_CONFIG.npcMin).toBe(10);
    expect(DEFAULT_STAT_CONFIG.chiefMin).toBe(65);
  });
});

describe("상수 정의", () => {
  it("OFFICER_LEVEL이 올바르게 정의되어 있다", () => {
    expect(OFFICER_LEVEL.WANDERER).toBe(0);
    expect(OFFICER_LEVEL.GENERAL).toBe(1);
    expect(OFFICER_LEVEL.LORD).toBe(12);
  });

  it("NATION_LEVEL이 올바르게 정의되어 있다", () => {
    expect(NATION_LEVEL.WANDERER).toBe(0);
    expect(NATION_LEVEL.EMPEROR).toBe(7);
  });
});
