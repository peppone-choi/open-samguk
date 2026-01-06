/**
 * mergeQueryColumn, createGeneralObjListFromDB, createGeneralObjFromDB 호출시 column 특수 모드 지정
 */
export enum GeneralQueryMode {
  /** 게임 내 모든 이벤트 처리를 위한 정보, iAction 포함 */
  Full = 3,
  /** 접속 정보를 포함한 모든 정보 */
  FullWithAccessLog = 4,
}
