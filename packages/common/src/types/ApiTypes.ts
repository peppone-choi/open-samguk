/**
 * API Response Types
 * 
 * 이 파일은 tRPC API의 응답 타입들을 정의합니다.
 * API 서버와 프론트엔드에서 공유하여 타입 안전성을 보장합니다.
 */

// ============================================================================
// Board (게시판) Types
// ============================================================================

/** 게시판 목록 아이템 */
export interface BoardListItem {
  no: number;
  date: Date | string;
  author: string;
  authorIcon: string | null;
  title: string;
  generalId: number;
  commentCount: number;
}

/** 게시판 목록 응답 */
export interface BoardListResponse {
  result: boolean;
  boards: BoardListItem[];
  total: number;
  limit: number;
  offset: number;
}

/** 게시판 댓글 */
export interface BoardComment {
  no: number;
  date: Date | string;
  author: string;
  text: string;
  generalId: number;
}

/** 게시판 상세 정보 */
export interface BoardDetail {
  no: number;
  nationId: number;
  date: Date | string;
  author: string;
  authorIcon: string | null;
  title: string;
  text: string;
  generalId: number;
  comments: BoardComment[];
}

/** 게시판 상세 응답 */
export interface BoardDetailResponse {
  result: boolean;
  board: BoardDetail;
}

// ============================================================================
// General (장수) Types
// ============================================================================

/** 장수 기본 정보 */
export interface GeneralBasic {
  id: number;
  name: string;
  picture: string;
  nation: number;
}

/** 장수 목록 아이템 */
export interface GeneralListItem {
  no: number;
  name: string;
  picture: string;
  nationId: number;
  cityId: number;
  officerLevel: number;
  leadership: number;
  strength: number;
  intel: number;
  experience: number;
  dedication: number;
  gold: number;
  rice: number;
  crew: number;
  crewType: number;
  trainLevel: number;
  morale: number;
  atmos: number;
  age: number;
  troopId: number | null;
  killturn: number;
  npc: number;
  lastTurn: Date | string | null;
  specialDomestic: string | null;
  specialWar: string | null;
  personal: string | null;
}

// ============================================================================
// Nation (국가) Types
// ============================================================================

/** 국가 기본 정보 */
export interface NationBasic {
  nation: number;
  name: string;
  color: string;
  level: number;
}

/** 국가 상세 정보 */
export interface NationInfo extends NationBasic {
  capital: number | null;
  gold: number;
  rice: number;
  tech: number;
  rate: number;
  bill: number;
  scout: number;
  war: number;
  cities?: CityBasic[];
}

/** 국가 소속 장수 목록 응답 */
export interface NationGeneralListResponse {
  list: any[];
  troops: { id: number; name: string }[];
  env: {
    year: number;
    month: number;
    turntime: string;
    turnterm: number;
    killturn: number;
  };
  permission: number;
}

/** 외교 관계 */
export interface DiplomacyRelation {
  nationId: number;
  targetNationId: number;
  state: number;
  term: number;
}

// ============================================================================
// City (도시) Types
// ============================================================================

/** 도시 기본 정보 */
export interface CityBasic {
  id: number;
  city: number;
  name: string;
  nationId: number;
  level: number;
}

/** 지도용 도시 정보 */
export interface CityForMap extends CityBasic {
  nationName: string | null;
  nationColor: string | null;
  pop: number;
  trust: number;
  secu: number;
  comm: number;
  agri: number;
  def: number;
  wall: number;
  x: number;
  y: number;
}

// ============================================================================
// History (역사) Types
// ============================================================================

/** 역사 기록 아이템 (글로벌 히스토리) */
export interface HistoryItem {
  id: number;
  date?: Date | string;
  text: string;
  year: number;
  month: number;
}

/** 장수 기록 아이템 (GeneralRecord) */
export interface GeneralRecordItem {
  id: number;
  generalId: number;
  logType: string;
  year: number;
  month: number;
  text: string;
}

// ============================================================================
// Auction (경매) Types
// ============================================================================

/** 경매 아이템 */
export interface AuctionItem {
  id: number;
  type: string;
  name: string;
  info: string;
  host: string;
  hostGeneralId: number;
  closeDate: Date | string;
  finishDate: Date | string;
  openBid: number;
  currentBid: number;
  bidCount: number;
}

/** 경매 입찰 */
export interface AuctionBid {
  id: number;
  auctionId: number;
  bidder: string;
  bidderGeneralId: number;
  amount: number;
  date: Date | string;
}

// ============================================================================
// Betting (도박) Types
// ============================================================================

/** 베팅 정보 */
export interface BettingInfo {
  id: number;
  type: string;
  name: string;
  closeDate: Date | string;
  candidates: BettingCandidate[];
}

/** 베팅 후보 */
export interface BettingCandidate {
  id: number;
  name: string;
  odds: number;
  totalAmount: number;
}

// ============================================================================
// Tournament (토너먼트) Types
// ============================================================================

/** 토너먼트 정보 */
export interface TournamentInfo {
  id: number;
  type: string;
  name: string;
  startDate: Date | string;
  status: string;
}

/** 토너먼트 참가자 */
export interface TournamentParticipant {
  id: number;
  generalId: number;
  generalName: string;
  seed: number;
}

// ============================================================================
// Message (메시지) Types
// ============================================================================

/** 메시지 아이템 */
export interface MessageItem {
  id: number;
  date: Date | string;
  sender: string;
  senderId: number;
  receiver: string;
  receiverId: number;
  text: string;
  isRead: boolean;
}

/** 장수 상세 정보 */
export interface GeneralDetail {
  no: number;
  name: string;
  picture: string;
  imgsvr: number;
  nationId: number;
  cityId: number;
  officerLevel: number;
  leadership: number;
  leadershipExp: number;
  strength: number;
  strengthExp: number;
  intel: number;
  intelExp: number;
  experience: number;
  dedication: number;
  gold: number;
  rice: number;
  crew: number;
  crewType: number;
  train: number;
  atmos: number;
  age: number;
  bornYear: number;
  injury: number;
  personal: string | null;
  specialDomestic: string | null;
  specialWar: string | null;
  weapon: string | null;
  book: string | null;
  horse: string | null;
  item: string | null;
  killturn: number;
  belong: number;
  npc: number;
  turnTime: Date | string;
  nation?: NationBasic;
  city?: CityBasic;
  troop?: number | null;
}

// ============================================================================
// Game State & System Types
// ============================================================================

/** 게임 상태 조회 응답 */
export interface GameStateResponse {
  year: number;
  month: number;
  nations: any[];
  cities: any[];
}

/** 서버 정보 */
export interface ServerInfo {
  id: string;
  name: string;
  korName: string;
  status: string;
  scenario: string;
  year: string;
  month?: string;
  turnTime: string;
  players: number;
  maxPlayers: number;
  hasCharacter: boolean;
  characterName: string | null;
}

/** 메인 정보 (FrontInfo) 응답 */
export interface FrontInfoResponse {
  result: boolean;
  general: GeneralDetail;
  nation: NationInfo | null;
  city: any; // 도시 정보는 별도 인터페이스 정의 필요하나 일단 유지
  global: {
    year: number;
    month: number;
    startyear: number;
    turnterm: number;
    lastExecuted: string;
    auctionCount: number;
    isTournamentActive: boolean;
    isLocked: boolean;
  };
  recentRecord: {
    general: any[];
    global: any[];
    history: any[];
  };
}

// ============================================================================
// Common Response Types
// ============================================================================

/** 기본 성공 응답 */
export interface SuccessResponse {
  success: boolean;
  message?: string;
}

/** 에러 응답 */
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
}
