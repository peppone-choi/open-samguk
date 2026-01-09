/**
 * Parity Testing Types
 * Defines schemas for comparing TypeScript implementation with legacy PHP
 */

/**
 * Represents a captured game state snapshot
 */
export interface ParitySnapshot {
  /** Unique identifier for this snapshot */
  id: string;
  /** When this snapshot was captured */
  capturedAt: Date;
  /** Source system (legacy or new) */
  source: "legacy" | "new";
  /** RNG seed used for determinism */
  rngSeed: string;
  /** Game time when snapshot was taken */
  gameTime: GameTime;
  /** All game entities */
  entities: SnapshotEntities;
  /** Environment/configuration values */
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
 * Command execution input for parity testing
 */
export interface ParityCommandInput {
  /** Command name (e.g., "휴식", "농지개간") */
  command: string;
  /** Command arguments */
  args: Record<string, unknown>;
  /** General ID executing the command */
  generalId: number;
  /** RNG seed for deterministic execution */
  rngSeed: string;
}

/**
 * Result of a parity command execution
 */
export interface ParityCommandResult {
  /** Whether execution succeeded */
  success: boolean;
  /** State before execution */
  beforeState: ParitySnapshot;
  /** State after execution */
  afterState: ParitySnapshot;
  /** Computed delta between states */
  delta: ParityDelta;
  /** Any error message */
  error?: string;
  /** Execution time in ms */
  executionTime: number;
}

/**
 * Delta between two snapshots
 */
export interface ParityDelta {
  /** Entities added */
  added: {
    generals?: GeneralSnapshot[];
    nations?: NationSnapshot[];
    cities?: CitySnapshot[];
    diplomacy?: DiplomacySnapshot[];
    troops?: TroopSnapshot[];
    messages?: MessageSnapshot[];
    auctions?: AuctionSnapshot[];
  };
  /** Entities modified with before/after values */
  modified: {
    generals?: EntityChange<GeneralSnapshot>[];
    nations?: EntityChange<NationSnapshot>[];
    cities?: EntityChange<CitySnapshot>[];
    diplomacy?: EntityChange<DiplomacySnapshot>[];
    troops?: EntityChange<TroopSnapshot>[];
  };
  /** Entity IDs deleted */
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
 * Parity test case definition
 */
export interface ParityTestCase {
  /** Test case name */
  name: string;
  /** Test case description */
  description: string;
  /** Initial state fixture (SQL or snapshot) */
  fixture: string;
  /** Command to execute */
  command: ParityCommandInput;
  /** Expected delta (if verifying specific changes) */
  expectedDelta?: Partial<ParityDelta>;
  /** Skip legacy comparison (for new-only features) */
  skipLegacyComparison?: boolean;
  /** Tags for filtering tests */
  tags?: string[];
}

/**
 * Result of comparing legacy vs new execution
 */
export interface ParityComparisonResult {
  /** Test case that was run */
  testCase: ParityTestCase;
  /** Legacy system result */
  legacyResult: ParityCommandResult;
  /** New system result */
  newResult: ParityCommandResult;
  /** Whether deltas match */
  deltasMatch: boolean;
  /** Specific differences found */
  differences: ParityDifference[];
  /** Overall pass/fail */
  passed: boolean;
}

export interface ParityDifference {
  path: string;
  legacyValue: unknown;
  newValue: unknown;
  severity: "critical" | "warning" | "info";
}

/**
 * Configuration for the parity test runner
 */
export interface ParityTestConfig {
  /** Legacy PHP bridge URL */
  legacyBridgeUrl: string;
  /** Whether to save snapshots to disk */
  saveSnapshots: boolean;
  /** Directory to save snapshots */
  snapshotDir: string;
  /** Timeout for legacy calls (ms) */
  legacyTimeout: number;
  /** Fields to ignore in comparison */
  ignoreFields: string[];
  /** Tolerance for numeric comparisons */
  numericTolerance: number;
}

export const DEFAULT_PARITY_CONFIG: ParityTestConfig = {
  legacyBridgeUrl: "http://localhost:3100",
  saveSnapshots: true,
  snapshotDir: "./parity-snapshots",
  legacyTimeout: 30000,
  ignoreFields: ["capturedAt", "turnTime"], // Timestamps will differ
  numericTolerance: 0.0001, // For floating point comparisons
};
