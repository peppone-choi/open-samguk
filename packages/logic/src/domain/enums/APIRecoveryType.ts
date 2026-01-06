/**
 * API 호출 결과가 false이면서, 대상 API가 처리할 수 없는 추가 동작이 있는 경우 사용.
 * 예시: 턴을 예약해야 하지만, 장수가 사망하여 게이트웨이로 이동해야함.
 */
export enum APIRecoveryType {
  Login = "login", //로그인 재시도부터 시작한다
  TwoFactorAuth = "2fa", //로그인은 가능하지만 인증코드 입력이 필요하다
  Gateway = "gateway", //로그인은 되어있지만, 장수가 없어 게이트웨이로 이동해야 한다
  GameLogin = "game_login", //서버 업데이트 등으로 다시 게임 정보 수신 필요
  GameQuota = "game_quota", //접속 제한
}

export function getAPIRecoveryTypeInfo(type: APIRecoveryType): string {
  switch (type) {
    case APIRecoveryType.Login:
      return "로그인을 해야합니다.";
    case APIRecoveryType.TwoFactorAuth:
      return "인증코드를 입력해야합니다.";
    case APIRecoveryType.Gateway:
      return "장수가 없습니다.";
    case APIRecoveryType.GameLogin:
      return "게임 정보를 다시 받아야합니다.";
    case APIRecoveryType.GameQuota:
      return "접속 제한이 걸렸습니다.";
  }
}
