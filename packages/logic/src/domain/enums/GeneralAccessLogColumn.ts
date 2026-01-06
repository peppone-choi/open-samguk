export enum GeneralAccessLogColumn {
  id = "id",
  generalID = "general_id",
  userID = "user_id",
  lastRefresh = "last_refresh",
  refresh = "refresh", //순간 갱신 횟수(00:00에 초기화)
  refreshTotal = "refresh_total", //누적 갱신 횟수
  refreshScore = "refresh_score", //순간 벌점(턴 시간에 초기화)
  refreshScoreTotal = "refresh_score_total", //누적 벌점(지속적으로 감소, refreshScoreTotal <= refreshTotal)
}
