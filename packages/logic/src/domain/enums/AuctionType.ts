/**
 * 입찰자 기준
 */
export enum AuctionType {
  /** 쌀을 매물로 등록, 금으로 구매 */
  BuyRice = 'buyRice',
  /** 금을 매물로 등록, 쌀로 판매 */
  SellRice = 'sellRice',
  /** 유미크를 매물로 등록, 유산 포인트로 구매 */
  UniqueItem = 'uniqueItem',
}
