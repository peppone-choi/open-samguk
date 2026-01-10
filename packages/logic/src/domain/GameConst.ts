/**
 * 게임 전역 상수 정의
 * 수치 밸런싱, 병종 타입, 기본 설정값 등을 관리합니다.
 */
export const GameConst = {
  /** 커맨드로 올릴 수 있는 최대 훈련도 (기본 100) */
  maxTrainByCommand: 100,
  /** 훈련 행동 시 훈련도 상승 계수 */
  trainDelta: 30,
  /** 훈련 시 사기 부가 효과 상승치 */
  atmosSideEffectByTraining: 1,

  // 기본 자원량
  defaultGold: 1000,
  defaultRice: 1000,
  minNationalGold: 1000,
  minNationalRice: 1000,
  /** 장수 최대 수용 인원 (서버 설정에 의해 덮어씌워질 수 있음) */
  defaultMaxGeneral: 50,
  /** 시나리오 초기의 장수 제한 인원 */
  initialNationGenLimit: 10,
  /** 모병 가능한 최소 인구 */
  minAvailableRecruitPop: 10000,
  /** 초반 보호/제한 기간 (년) */
  openingPartYear: 3,
  /** 거병, 임관 등의 행동 제한 기간 (턴) */
  joinActionLimit: 12,

  /** 모병(Draft) 금 비용 */
  draftGoldCost: 1000,
  /** 징병(Conscript) 금 비용 */
  conscriptGoldCost: 200,
  /** 모병 시 치안 감소량 */
  draftSecuLoss: 5,
  /** 징병 시 치안 감소량 */
  conscriptSecuLoss: 15,
  /** 국가 건국 비용 */
  foundNationCost: 2000,

  /** 커맨드로 올릴 수 있는 최대 사기 (기본 100) */
  maxAtmosByCommand: 100,
  /** 사기진작 계수 */
  atmosDelta: 30,
  /** 최대 기술 레벨 */
  maxTechLevel: 12,
  /** 기술 레벨 상승 주기 (년 단위) */
  techLevelIncYear: 5,
  /** 시나리오 시작 시 기본 기술 레벨 */
  initialAllowedTechLevel: 1,

  /** 매매 수수료 비율 */
  exchangeFee: 0.01,

  /** 금/쌀 일시적 투입 행동의 최대 허용량 */
  maxResourceActionAmount: 10000,
  /** 장수 최소 금 보유량 */
  generalMinimumGold: 0,
  /** 장수 최소 쌀 보유량 */
  generalMinimumRice: 500,

  /** 최대 전쟁 설정 가능 횟수 */
  maxAvailableWarSettingCnt: 10,
  /** 월간 전쟁 설정 횟수 회복량 */
  incAvailableWarSettingCnt: 2,

  // 계략 (화계 등) 관련 상수
  sabotageDefaultProb: 0.35,
  sabotageProbCoefByStat: 300,
  sabotageDefenceCoefByGeneralCnt: 0.04,
  sabotageDamageMin: 100,
  sabotageDamageMax: 800,

  /** 병종 타입 분류 (Legacy: GameUnitConst) */
  armType: {
    CASTLE: 0,
    FOOTMAN: 1,
    ARCHER: 2,
    CAVALRY: 3,
    WIZARD: 4,
    SIEGE: 5,
    MISC: 6,
  },
  /** 병종 타입 이름 (한국어) */
  armTypeNames: {
    0: "성벽",
    1: "보병",
    2: "궁병",
    3: "기병",
    4: "귀병",
    5: "차병",
    6: "기타",
  },
  /** 국가별 사용 가능한 컬러 팔레트 */
  nationColors: [
    "#FF0000", "#800000", "#A0522D", "#FF6347", "#FFA500", "#FFDAB9", "#FFD700", "#FFFF00",
    "#7CFC00", "#00FF00", "#808000", "#008000", "#2E8B57", "#008080", "#20B2AA", "#6495ED",
    "#7FFFD4", "#AFEEEE", "#87CEEB", "#00FFFF", "#00BFFF", "#0000FF", "#000080", "#483D8B",
    "#7B68EE", "#BA55D3", "#800080", "#FF00FF", "#FFC0CB", "#F5F5DC", "#E0FFFF", "#FFFFFF",
    "#A9A9A9",
  ],

  /** 내정 크리티컬 성공/실패 확률 */
  domesticCritical: {
    success: 0.15,
    fail: 0.05,
  },

  /** 최대 공헌도 레벨 */
  maxDedLevel: 30,
  /** 최대 레벨 */
  maxLevel: 255,
  basegold: 0,
  baserice: 2000,
  /** 매달 자연 인구 증가분 */
  basePopIncreaseAmount: 5000,
  /** 도시 확장 시 인구 증가분 */
  expandCityPopIncreaseAmount: 100000,
  /** 유산 아이템 계승을 허용할 최소 달 수 */
  minMonthToAllowInheritItem: 4,
  /** 원조 작위 관련 계수 */
  coefAidAmount: 10000,

  /** 기본 아이템 정보 및 구매 비용 설정 */
  items: {
    weapon: {
      LongSword: { name: "장검", cost: 500, reqSecu: 20, isBuyable: true },
      Spear: { name: "장창", cost: 800, reqSecu: 40, isBuyable: true },
      SevenStarSword: { name: "칠성보도", cost: 5000, reqSecu: 0, isBuyable: false },
    },
    horse: {
      Horse: { name: "군마", cost: 1000, reqSecu: 30, isBuyable: true },
      RedHare: { name: "적토마", cost: 10000, reqSecu: 0, isBuyable: false },
    },
    book: {
      Manual: { name: "병법서", cost: 1200, reqSecu: 50, isBuyable: true },
    },
    item: {
      Medicine: { name: "한약", cost: 300, reqSecu: 10, isBuyable: true },
    },
  },
  /** 장수 익명화 처리를 위한 성/이름 풀 */
  namePoolRaw: {
    first: ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권"],
    middle: ["영", "철", "지", "성", "민", "재", "현", "진", "동", "수", "슬", "보", "정", "석", "준"],
    last: ["수", "영", "호", "진", "희", "환", "석", "민", "우", "현", "훈", "태", "재", "윤", "성"],
  },
} as const;
