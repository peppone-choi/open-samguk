/**
 * Penalty Key
 * general의 penalty 항목
 */
export enum PenaltyKey {
  SendPrivateMsgDelay = "sendPrivateMsgDelay",
  NoSendPrivateMsg = "noSendPrivateMsg",
  NoSendPublicMsg = "noSendPublicMsg",
  NoTopSecret = "noTopSecret",
  NoChief = "noChief",
  NoAmbassador = "noAmbassador",
  NoBanGeneral = "noBanGeneral",
  NoChiefTurnInput = "noChiefTurnInput",
  NoChiefChange = "noChiefChange",
  NoFoundNation = "noFoundNation",
  NoChosenAssignment = "noChosenAssignment",
}

/**
 * Get help text for penalty key
 */
export function getPenaltyKeyHelptext(key: PenaltyKey): string {
  switch (key) {
    case PenaltyKey.SendPrivateMsgDelay:
      return "개인 메세지 보내기 제한 시간";
    case PenaltyKey.NoSendPrivateMsg:
      return "개인 메세지 보내기 금지";
    case PenaltyKey.NoSendPublicMsg:
      return "공개 메세지 보내기 금지";
    case PenaltyKey.NoTopSecret:
      return "암행부 열람 금지";
    case PenaltyKey.NoChief:
      return "수뇌 금지";
    case PenaltyKey.NoAmbassador:
      return "외교권자 금지";
    case PenaltyKey.NoBanGeneral:
      return "장수 추방 금지";
    case PenaltyKey.NoChiefTurnInput:
      return "수뇌 턴 입력 금지";
    case PenaltyKey.NoChiefChange:
      return "수뇌 임명/해임 금지";
    case PenaltyKey.NoFoundNation:
      return "건국 금지";
    case PenaltyKey.NoChosenAssignment:
      return "지정 임관 금지";
    default:
      return `페널티(${key})`;
  }
}
