/**
 * 경매 시스템 타입 정의
 */

/**
 * 경매 종류
 */
export type AuctionType = "UniqueItem" | "BuyRice" | "SellRice" | "BasicResource";

/**
 * 입찰 자원 종류
 */
export type AuctionResourceType = "gold" | "rice" | "inheritancePoint";

/**
 * 경매 입찰 정보 (AuctionBidItem)
 */
export interface AuctionBid {
  id?: number;
  auctionId: number;
  userId: string; // owner_id
  generalId: number;
  amount: number;
  bidDate: Date;
  aux: {
    userName: string; // owner_name
    obfuscatedName: string; // 익명화된 이름
    tryExtendCloseDate: boolean; // 입찰 시 종료 연장 요청 여부
  };
}

/**
 * 경매 세부 정보 (AuctionInfoDetail)
 */
export interface AuctionDetail {
  title: string;
  hostName: string;
  remainCloseDateExtensionCnt: number | null; // 연장 가능 횟수
  isReverse: boolean; // 역경매 여부 (쌀 매각 등)
  startBidAmount: number | null; // 시작가 (자원 경매용)
  finishBidAmount: number | null; // 즉시 낙찰가
  amount: number | null; // 거래량 (자원 경매용)
  availableLatestBidCloseDate: Date | null; // 최대 연장 가능 시간
}

/**
 * 자원 타입 (ResourceType)
 */
export type ResourceType = "gold" | "rice";

/**
 * 경매 메타 정보 (AuctionInfo)
 */
export interface AuctionInfo {
  id: number;
  type: AuctionType;
  finished: boolean;
  target: string | null; // 아이템 코드 또는 자원 식별자
  hostGeneralId: number;
  reqResource: AuctionResourceType;
  openDate: Date;
  closeDate: Date;
  detail: AuctionDetail;
}
