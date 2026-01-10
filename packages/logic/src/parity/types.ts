/**
 * 패리티 테스트 타입
 * TypeScript 구현과 레거시 PHP 비교를 위한 스키마 정의
 */

/**
 * 캡처된 게임 상태 스냅샷
 */
export interface ParitySnapshot {
  /** 스냅샷 고유 식별자 */
  id: string;
  /** 스냅샷 캡처 시점 */
  capturedAt: Date;
  /** 소스 시스템 (legacy 또는 new) */
  source: "legacy" | "new";
  /** 결정론적 실행을 위한 RNG 시드 */
  rngSeed: string;
  /** 스냅샷 캡처 시점의 게임 시간 */
  gameTime: GameTime;
  /** 모든 게임 엔티티 */
  entities: SnapshotEntities;
  /** 환경/설정 값 */
  env: Record<string, unknown>;
}

export interface GameTime {
  year: number;
  month: number;
}

export interface SnapshotEntities {
  generals: GeneralSnapshot[];
  nations: NationSnapshot[];
  cities: CitySnapshot[];
  diplomacy: DiplomacySnapshot[];
  troops: TroopSnapshot[];
  generalTurns: GeneralTurnSnapshot[];
  nationTurns: NationTurnSnapshot[];
  auctions: AuctionSnapshot[];
  messages: MessageSnapshot[];
}

export interface GeneralSnapshot {
  no: number;
  owner: number;
  name: string;
  nation: number;
  city: number;
  leadership: number;
  strength: number;
  intel: number;
  gold: number;
  rice: number;
  crew: number;
  crewtype: number;
  train: number;
  atmos: number;
  injury: number;
  experience: number;
  dedication: number;
  weapon: string;
  book: string;
  horse: string;
  item: string;
  personal: string;
  special: string;
  special2: string;
  officerLevel: number;
  turnTime: Date;
  aux: Record<string, unknown>;
}

export interface NationSnapshot {
  nation: number;
  name: string;
  color: string;
  capital: number;
  gold: number;
  rice: number;
  tech: number;
  type: string;
  level: number;
  gennum: number;
  aux: Record<string, unknown>;
}

export interface CitySnapshot {
  city: number;
  name: string;
  nation: number;
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
  trust: number;
  supply: number;
  level: number;
  region: number;
}

export interface DiplomacySnapshot {
  no: number;
  me: number;
  you: number;
  state: number;
  term: number;
}

export interface TroopSnapshot {
  troopLeader: number;
  nation: number;
  name: string;
}

export interface GeneralTurnSnapshot {
  id: number;
  generalId: number;
  turnIdx: number;
  action: string;
  arg: Record<string, unknown> | null;
}

export interface NationTurnSnapshot {
  id: number;
  nationId: number;
  officerLevel: number;
  turnIdx: number;
  action: string;
  arg: Record<string, unknown> | null;
}

export interface AuctionSnapshot {
  id: number;
  type: string;
  finished: boolean;
  target: string | null;
  hostGeneralId: number;
  reqResource: string;
  openDate: Date;
  closeDate: Date;
  detail: Record<string, unknown>;
}

export interface MessageSnapshot {
  id: number;
  mailbox: number;
  type: string;
  src: number;
  dest: number;
  time: Date;
  message: Record<string, unknown>;
}

/**
 * 패리티 테스트용 커맨드 실행 입력
 */
export interface ParityCommandInput {
  /** 커맨드 이름 (예: "휴식", "농지개간") */
  command: string;
  /** 커맨드 인자 */
  args: Record<string, unknown>;
  /** 커맨드를 실행하는 장수 ID */
  generalId: number;
  /** 결정론적 실행을 위한 RNG 시드 */
  rngSeed: string;
}

/**
 * 패리티 커맨드 실행 결과
 */
export interface ParityCommandResult {
  /** 실행 성공 여부 */
  success: boolean;
  /** 실행 전 상태 */
  beforeState: ParitySnapshot;
  /** 실행 후 상태 */
  afterState: ParitySnapshot;
  /** 상태 간 계산된 델타 */
  delta: ParityDelta;
  /** 에러 메시지 (있을 경우) */
  error?: string;
  /** 실행 시간 (ms) */
  executionTime: number;
}

/**
 * 두 스냅샷 간의 델타
 */
export interface ParityDelta {
  /** 추가된 엔티티 */
  added: {
    generals?: GeneralSnapshot[];
    nations?: NationSnapshot[];
    cities?: CitySnapshot[];
    diplomacy?: DiplomacySnapshot[];
    troops?: TroopSnapshot[];
    messages?: MessageSnapshot[];
    auctions?: AuctionSnapshot[];
  };
  /** 수정된 엔티티 (변경 전/후 값 포함) */
  modified: {
    generals?: EntityChange<GeneralSnapshot>[];
    nations?: EntityChange<NationSnapshot>[];
    cities?: EntityChange<CitySnapshot>[];
    diplomacy?: EntityChange<DiplomacySnapshot>[];
    troops?: EntityChange<TroopSnapshot>[];
  };
  /** 삭제된 엔티티 ID */
  deleted: {
    generals?: number[];
    nations?: number[];
    cities?: number[];
    diplomacy?: number[];
    troops?: number[];
  };
}

export interface EntityChange<T> {
  id: number | string;
  changes: {
    [K in keyof T]?: {
      old: T[K];
      new: T[K];
    };
  };
}

/**
 * 패리티 테스트 케이스 정의
 */
export interface ParityTestCase {
  /** 테스트 케이스 이름 */
  name: string;
  /** 테스트 케이스 설명 */
  description: string;
  /** 초기 상태 픽스처 (SQL 또는 스냅샷) */
  fixture: string;
  /** 실행할 커맨드 */
  command: ParityCommandInput;
  /** 예상 델타 (특정 변경 검증 시) */
  expectedDelta?: Partial<ParityDelta>;
  /** 레거시 비교 스킵 (신규 전용 기능) */
  skipLegacyComparison?: boolean;
  /** 테스트 필터링용 태그 */
  tags?: string[];
}

/**
 * 레거시 vs 신규 실행 비교 결과
 */
export interface ParityComparisonResult {
  /** 실행된 테스트 케이스 */
  testCase: ParityTestCase;
  /** 레거시 시스템 결과 */
  legacyResult: ParityCommandResult;
  /** 신규 시스템 결과 */
  newResult: ParityCommandResult;
  /** 델타 일치 여부 */
  deltasMatch: boolean;
  /** 발견된 차이점 */
  differences: ParityDifference[];
  /** 전체 통과/실패 */
  passed: boolean;
}

export interface ParityDifference {
  path: string;
  legacyValue: unknown;
  newValue: unknown;
  severity: "critical" | "warning" | "info";
}

/**
 * 패리티 테스트 러너 설정
 */
export interface ParityTestConfig {
  /** 레거시 PHP 브릿지 URL */
  legacyBridgeUrl: string;
  /** 스냅샷 디스크 저장 여부 */
  saveSnapshots: boolean;
  /** 스냅샷 저장 디렉토리 */
  snapshotDir: string;
  /** 레거시 호출 타임아웃 (ms) */
  legacyTimeout: number;
  /** 비교 시 무시할 필드 */
  ignoreFields: string[];
  /** 숫자 비교 허용 오차 */
  numericTolerance: number;
}

export const DEFAULT_PARITY_CONFIG: ParityTestConfig = {
  legacyBridgeUrl: "http://localhost:3100",
  saveSnapshots: true,
  snapshotDir: "./parity-snapshots",
  legacyTimeout: 30000,
  ignoreFields: ["capturedAt", "turnTime"], // 타임스탬프는 다를 수 있음
  numericTolerance: 0.0001, // 부동소수점 비교용
};
