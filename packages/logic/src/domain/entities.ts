export interface General {
  id: number;
  name: string;
  ownerId: number; // member.id 매핑
  nationId: number;
  cityId: number;
  troopId: number;
  gold: number;
  rice: number;
  leadership: number;
  leadershipExp: number;
  strength: number;
  strengthExp: number;
  intel: number;
  intelExp: number;
  politics: number;
  politicsExp: number;
  charm: number;
  charmExp: number;
  injury: number;
  experience: number;
  dedication: number;
  officerLevel: number; // 관직 레벨
  officerCity: number; // 임지
  recentWar: number;
  crew: number;
  crewType: number;
  train: number;
  atmos: number;
  dex: Record<number, number>; // 병종 숙련도 (key: armType, value: score)
  age: number;
  bornYear: number;
  deadYear: number;
  special: string; // 내정 특기
  specAge: number;
  special2: string; // 전투 특기
  specAge2: number;
  weapon: string; // 무기 코드
  book: string; // 서적 코드
  horse: string; // 명마 코드
  item: string; // 보물 코드
  turnTime: Date;
  recentWarTime: Date | null;
  makeLimit: number;
  killTurn: number;
  block: number; // 차단 상태
  defenceTrain: number;
  tournamentState: number;
  lastTurn: Record<string, any>;
  meta: Record<string, any>;
  penalty: Record<string, any>;
}

export interface Nation {
  id: number;
  name: string;
  color: string;
  chiefGeneralId: number; // 군주 ID
  capitalCityId: number;
  gold: number;
  rice: number;
  rate: number; // 세율
  rateTmp: number; // 세율 (변동)
  tech: number;
  power: number;
  level: number;
  gennum: number; // 장수 수
  typeCode: string; // 성향 코드
  scoutLevel: number; // 첩보 레벨
  warState: number; // 전쟁 상태
  strategicCmdLimit: number;
  surrenderLimit: number;
  spy: Record<string, any>;
  meta: Record<string, any>;
}

export interface City {
  id: number;
  name: string;
  nationId: number;
  level: number;
  supply: number; // 보급 상태 (0:단절, 1:보급)
  front: number; // 전방 상태 (0:후방, 1:교전, 2:접경, 3:적진)
  pop: number;
  popMax: number;
  agri: number;
  agriMax: number;
  comm: number;
  commMax: number;
  secu: number;
  secuMax: number;
  def: number;
  defMax: number;
  wall: number;
  wallMax: number;
  trust: number; // 민심
  gold: number;
  rice: number;
  region: number; // 지역 코드
  state: number; // 상태 (전쟁중 등)
  term: number; // 전쟁 기한
  conflict: Record<string, any>;
  meta: Record<string, any>;
}

export interface Diplomacy {
  id: number;
  srcNationId: number;
  destNationId: number;
  state: string; // 관계 상태
  term: number; // 잔여 기한
  meta: Record<string, any>;
}

export interface Troop {
  id: number; // 리더 장수 ID
  nationId: number;
  name: string;
  meta: Record<string, any>;
}

export interface Message {
  id: number;
  mailbox: string; // 수신함 타입
  srcId: number | null;
  destId: number | null;
  text: string;
  sentAt: Date;
  meta: Record<string, any>;
}

export interface GameTime {
  year: number;
  month: number;
}

export interface WorldSnapshot {
  generals: Record<number, General>;
  nations: Record<number, Nation>;
  cities: Record<number, City>;
  diplomacy: Record<string, Diplomacy>; // key: "src:dest"
  troops: Record<number, Troop>;
  messages: Record<number, Message>;
  gameTime: GameTime;
  env: Record<string, any>;
}

export type Delta<T> = Partial<T>;

export interface WorldDelta {
  generals?: Record<number, Delta<General>>;
  nations?: Record<number, Delta<Nation>>;
  cities?: Record<number, Delta<City>>;
  diplomacy?: Record<string, Delta<Diplomacy>>;
  troops?: Record<number, Delta<Troop>>;
  messages?: Message[];
  deleteMessages?: number[];
  gameTime?: Delta<GameTime>;
  env?: Delta<Record<string, any>>;
  logs?: {
    general?: Record<number, string[]>;
    nation?: Record<number, string[]>;
    global?: string[];
  };
}
