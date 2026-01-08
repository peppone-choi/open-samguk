// 게임 전역 상수 정의
export const GameConst = {
  maxTrainByCommand: 100, // 커맨드로 올릴 수 있는 최대 훈련도
  trainDelta: 30, // 훈련 계수
  atmosSideEffectByTraining: 1, // 훈련 시 사기 부가 효과 (레거시는 1로 고정되어 있음)

  // 기본 자원량
  defaultGold: 1000,
  defaultRice: 1000,
  minNationalGold: 1000,
  minNationalRice: 1000,
  defaultMaxGeneral: 50,
  initialNationGenLimit: 10, // 초기 제한시 장수 제한
  minAvailableRecruitPop: 10000, // 모병 가능한 최소 인구
  openingPartYear: 3, // 초반 기간 (년)
  joinActionLimit: 12, // 거병, 임관 제한 기간 (턴)

  draftGoldCost: 1000, // 모병 금 비용
  conscriptGoldCost: 200, // 징병 금 비용
  draftSecuLoss: 5, // 모병 시 치안 감소
  conscriptSecuLoss: 15, // 징병 시 치안 감소
  foundNationCost: 2000, // 건국 비용

  maxAtmosByCommand: 100, // 커맨드로 올릴 수 있는 최대 사기
  atmosDelta: 30, // 사기진작 계수
  maxTechLevel: 12, // 최대 기술 레벨
  techLevelIncYear: 5, // 기술 레벨 상승 주기(년)
  initialAllowedTechLevel: 1, // 초기 허용 기술 레벨

  exchangeFee: 0.01, // 매매 수수료

  maxResourceActionAmount: 10000, // 금/쌀 관련 행동 최대량
  generalMinimumGold: 0, // 장수 최소 금 보유량
  generalMinimumRice: 500, // 장수 최소 쌀 보유량

  maxAvailableWarSettingCnt: 10, // 최대 전쟁 설정 가능 횟수
  incAvailableWarSettingCnt: 2, // 월간 전쟁 설정 횟수 회복량

  // 계략 (화계 등) 관련 상수
  sabotageDefaultProb: 0.35,
  sabotageProbCoefByStat: 300,
  sabotageDefenceCoefByGeneralCnt: 0.04,
  sabotageDamageMin: 100,
  sabotageDamageMax: 800,

  // 병종 타입 (Legacy: GameUnitConst)
  armType: {
    CASTLE: 0,
    FOOTMAN: 1,
    ARCHER: 2,
    CAVALRY: 3,
    WIZARD: 4,
    SIEGE: 5,
    MISC: 6,
  },
  armTypeNames: {
    0: "성벽",
    1: "보병",
    2: "궁병",
    3: "기병",
    4: "귀병",
    5: "차병",
    6: "기타",
  },
  nationColors: [
    "#FF0000",
    "#800000",
    "#A0522D",
    "#FF6347",
    "#FFA500",
    "#FFDAB9",
    "#FFD700",
    "#FFFF00",
    "#7CFC00",
    "#00FF00",
    "#808000",
    "#008000",
    "#2E8B57",
    "#008080",
    "#20B2AA",
    "#6495ED",
    "#7FFFD4",
    "#AFEEEE",
    "#87CEEB",
    "#00FFFF",
    "#00BFFF",
    "#0000FF",
    "#000080",
    "#483D8B",
    "#7B68EE",
    "#BA55D3",
    "#800080",
    "#FF00FF",
    "#FFC0CB",
    "#F5F5DC",
    "#E0FFFF",
    "#FFFFFF",
    "#A9A9A9",
  ],

  domesticCritical: {
    success: 0.15,
    fail: 0.05,
  },

  maxDedLevel: 30,
  maxLevel: 255,
  basegold: 0,
  baserice: 2000,
  basePopIncreaseAmount: 5000,
  expandCityPopIncreaseAmount: 100000,
  minMonthToAllowInheritItem: 4,
  coefAidAmount: 10000, // 원조 작위 계수 (레거시: GameConst::$coefAidAmount)

  // 기본 아이템 목록 (Legacy: GameConst::$allItems)
  items: {
    weapon: {
      LongSword: { name: "장검", cost: 500, reqSecu: 20, isBuyable: true },
      Spear: { name: "장창", cost: 800, reqSecu: 40, isBuyable: true },
      SevenStarSword: {
        name: "칠성보도",
        cost: 5000,
        reqSecu: 0,
        isBuyable: false,
      },
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
  // 성/이름 풀 (익명화용)
  namePoolRaw: {
    first: ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권"],
    middle: [
      "영", "철", "지", "성", "민", "재", "현", "진", "동", "수", "슬", "보", "정", "석", "준",
    ],
    last: ["수", "영", "호", "진", "희", "환", "석", "민", "우", "현", "훈", "태", "재", "윤", "성"],
  },
} as const;
