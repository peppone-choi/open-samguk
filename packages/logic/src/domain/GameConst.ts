// 게임 전역 상수 정의
export const GameConst = {
  maxTrainByCommand: 100, // 커맨드로 올릴 수 있는 최대 훈련도
  trainDelta: 30, // 훈련 계수
  atmosSideEffectByTraining: 1, // 훈련 시 사기 부가 효과 (레거시는 1로 고정되어 있음)

  draftGoldCost: 1000, // 모병 금 비용
  conscriptGoldCost: 200, // 징병 금 비용
  draftSecuLoss: 5, // 모병 시 치안 감소
  conscriptSecuLoss: 15, // 징병 시 치안 감소

  exchangeFee: 0.01, // 매매 수수료
} as const;
