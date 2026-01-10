/**
 * @fileoverview 게임 핵심 엔티티(Entity) 타입 정의
 *
 * 삼국지 모의전투 게임의 핵심 데이터 모델을 정의합니다.
 * 이 파일은 도메인 로직 전체에서 사용되는 타입들의 원천(Source of Truth)입니다.
 *
 * ## 주요 엔티티
 * - **General**: 장수 - 게임의 핵심 플레이어 캐릭터
 * - **Nation**: 국가 - 장수들이 소속되는 세력
 * - **City**: 도시 - 영토와 자원의 기본 단위
 * - **Diplomacy**: 외교 - 국가 간 관계
 * - **Troop**: 부대 - 장수들의 그룹
 * - **Message**: 서신 - 플레이어 간 통신
 *
 * ## 설계 원칙
 * - 모든 엔티티는 불변(Immutable)으로 취급
 * - 변경은 WorldDelta를 통해서만 표현
 * - DB 스키마와 1:1 대응하지 않음 (인메모리 최적화된 구조)
 *
 * @example
 * // 장수 생성 예시
 * const general: General = {
 *   id: 1,
 *   name: "유비",
 *   nationId: 1,
 *   cityId: 10,
 *   leadership: 85,
 *   strength: 70,
 *   intel: 75,
 *   // ... 기타 필드
 * };
 */

/**
 * 장수 엔티티
 *
 * 게임의 핵심 플레이어 캐릭터를 나타냅니다.
 * 유저가 직접 조종하거나 NPC로 자동 행동합니다.
 *
 * ## NPC 타입 (npc 필드)
 * - 0: 유저 (플레이어가 직접 조종)
 * - 1: 이벤트 NPC (시나리오 이벤트용)
 * - 2: 일반 NPC (자동 행동)
 * - 3: 수뇌 NPC (국가 핵심 인물)
 * - 4: 군주 NPC (AI 군주)
 *
 * ## 스탯 시스템
 * - 기본 스탯: leadership(통솔), strength(무력), intel(지력), politics(정치), charm(매력)
 * - 각 스탯에는 경험치(Exp)가 있어 레벨업 시 상승
 * - dex: 병종별 숙련도 (key: 병종 코드, value: 숙련도 점수)
 *
 * ## 상태 관리
 * - injury: 부상 수치 (0이 건강, 높을수록 부상 심함)
 * - block: 차단 상태 (0: 정상, 2: 멀티/비매너, 3: 악성유저)
 * - killTurn: 삭턴 카운터 (0이 되면 자동 삭제)
 */
export interface General {
  /** 장수 고유 ID */
  id: number;
  /** 장수 이름 */
  name: string;
  /** 소유 계정 ID (member 테이블 참조) */
  ownerId: number;
  /** 상성 값 (0-150, 같은 상성끼리 친밀도 높음) */
  affinity: number;
  /** 소속 국가 ID (0이면 재야) */
  nationId: number;
  /** 현재 위치 도시 ID */
  cityId: number;
  /** NPC 타입 (0: 유저, 1: 이벤트NPC, 2: 일반NPC, 3: 수뇌NPC, 4: 군주NPC) */
  npc: number;
  /** 소속 부대 ID (리더 장수의 ID, 0이면 무소속) */
  troopId: number;
  /** 보유 금 */
  gold: number;
  /** 보유 쌀 (군량) */
  rice: number;
  /** 통솔력 (병사 지휘 능력) */
  leadership: number;
  /** 통솔 경험치 */
  leadershipExp: number;
  /** 무력 (전투 능력) */
  strength: number;
  /** 무력 경험치 */
  strengthExp: number;
  /** 지력 (계략, 내정 능력) */
  intel: number;
  /** 지력 경험치 */
  intelExp: number;
  /** 정치력 (외교, 내정 능력) */
  politics: number;
  /** 정치 경험치 */
  politicsExp: number;
  /** 매력 (등용, 민심 능력) */
  charm: number;
  /** 매력 경험치 */
  charmExp: number;
  /** 부상 수치 (0: 건강, 높을수록 부상 심함) */
  injury: number;
  /** 총 경험치 */
  experience: number;
  /** 공헌도 (국가에 대한 기여도) */
  dedication: number;
  /** 관직 레벨 (0: 무관직, 12: 군주) */
  officerLevel: number;
  /** 임지 도시 ID (태수 등 관직 부여 시) */
  officerCity: number;
  /** 최근 전투 결과 코드 */
  recentWar: number;
  /** 보유 병사 수 */
  crew: number;
  /** 병종 타입 코드 */
  crewType: number;
  /** 훈련도 (0-100, 전투력에 영향) */
  train: number;
  /** 사기 (0-100, 전투 지속력에 영향) */
  atmos: number;
  /** 병종별 숙련도 맵 (key: 병종코드, value: 숙련도) */
  dex: Record<number, number>;
  /** 현재 나이 */
  age: number;
  /** 게임 시작 시 나이 */
  startAge: number;
  /** 임관 기간 (월 단위, 호봉 계산용) */
  belong: number;
  /** 배반 수치 (높을수록 배신 가능성 높음) */
  betray: number;
  /** 공헌 레벨 */
  dedLevel: number;
  /** 경험 레벨 */
  expLevel: number;
  /** 출생 연도 */
  bornYear: number;
  /** 사망 예정 연도 (수명) */
  deadYear: number;
  /** 성격 코드 (행동 패턴 결정) */
  personal: string;
  /** 내정 특기 코드 */
  special: string;
  /** 내정 특기 습득 나이 */
  specAge: number;
  /** 전투 특기 코드 */
  special2: string;
  /** 전투 특기 습득 나이 */
  specAge2: number;
  /** 장착 무기 코드 */
  weapon: string;
  /** 장착 서적 코드 */
  book: string;
  /** 장착 명마 코드 */
  horse: string;
  /** 장착 보물 코드 */
  item: string;
  /** 다음 턴 실행 시간 */
  turnTime: Date;
  /** 최근 전투 시간 */
  recentWarTime: Date | null;
  /** 장수 생성 제한 (쿨다운) */
  makeLimit: number;
  /** 삭턴 카운터 (0이 되면 삭제) */
  killTurn: number;
  /** 처치 수 (선택적) */
  killnum?: number;
  /** 차단 상태 (0: 정상, 2: 멀티/비매너, 3: 악성유저) */
  block: number;
  /** 수비 훈련도 */
  defenceTrain: number;
  /** 토너먼트 참가 상태 */
  tournamentState: number;
  /** 마지막 턴 실행 정보 */
  lastTurn: Record<string, any>;
  /** 확장 메타 데이터 */
  meta: Record<string, any>;
  /** 페널티 정보 (행동 제한) */
  penalty: Record<string, any>;
  /** 관직 잠금 상태 */
  officerLock: number;
}

/**
 * 국가 엔티티
 *
 * 장수들이 소속되는 세력을 나타냅니다.
 * 군주(chiefGeneralId)가 이끌며, 도시를 점령하고 외교를 수행합니다.
 *
 * ## 국가 레벨 (level)
 * - 0: 방랑군 (도시 미보유)
 * - 1~5: 도시 수에 따른 등급
 *
 * ## 성향 코드 (typeCode)
 * 국가의 특성을 결정하는 코드 (예: 유가, 법가, 도가 등)
 * 각 성향에 따라 특수 효과가 적용됩니다.
 */
export interface Nation {
  /** 국가 고유 ID */
  id: number;
  /** 국호 */
  name: string;
  /** 국가 색상 (UI 표시용) */
  color: string;
  /** 군주 장수 ID */
  chiefGeneralId: number;
  /** 수도 도시 ID */
  capitalCityId: number;
  /** 국고 금 */
  gold: number;
  /** 국고 쌀 */
  rice: number;
  /** 세율 (0-100, 도시 수입 비율) */
  rate: number;
  /** 임시 세율 (월 중 변동 시 사용) */
  rateTmp: number;
  /** 기술력 (병종 해금, 전투력 보정) */
  tech: number;
  /** 국력 (순위 계산용) */
  power: number;
  /** 국가 레벨 (도시 수 기반) */
  level: number;
  /** 소속 장수 수 */
  gennum: number;
  /** 성향 코드 (유가, 법가 등) */
  typeCode: string;
  /** 첩보 레벨 (정보 수집 능력) */
  scoutLevel: number;
  /** 전쟁 상태 코드 */
  warState: number;
  /** 전략 커맨드 쿨다운 */
  strategicCmdLimit: number;
  /** 항복 쿨다운 */
  surrenderLimit: number;
  /** 첩보 정보 맵 */
  spy: Record<string, any>;
  /** 국가 보조 데이터 (특수병종 연구 등) */
  aux: Record<string, any>;
  /** 확장 메타 데이터 */
  meta: Record<string, any>;
}

/**
 * 도시 엔티티
 *
 * 영토와 자원의 기본 단위입니다.
 * 국가가 점령하며, 내정과 전쟁의 무대가 됩니다.
 *
 * ## 도시 수치 체계
 * - 인구(pop): 병사 모집과 세금의 원천
 * - 농업(agri): 쌀 생산량 결정
 * - 상업(comm): 금 수입 결정
 * - 치안(secu): 민심과 반란 확률에 영향
 * - 수비(def): 수비 전투력 보정
 * - 성벽(wall): 공성전 방어력
 *
 * ## 전방 상태 (front)
 * - 0: 후방 (적과 인접하지 않음)
 * - 1: 교전 (전쟁 중인 국가와 인접)
 * - 2: 접경 (공백지와 인접, 평시)
 * - 3: 적진 (적국 영토)
 */
export interface City {
  /** 도시 고유 ID */
  id: number;
  /** 도시 이름 */
  name: string;
  /** 점령 국가 ID (0이면 공백지) */
  nationId: number;
  /** 도시 등급 (규모) */
  level: number;
  /** 보급 상태 (0: 단절, 1: 정상) */
  supply: number;
  /** 전방 상태 (0: 후방, 1: 교전, 2: 접경, 3: 적진) */
  front: number;
  /** 현재 인구 */
  pop: number;
  /** 최대 인구 */
  popMax: number;
  /** 현재 농업 수치 */
  agri: number;
  /** 최대 농업 수치 */
  agriMax: number;
  /** 현재 상업 수치 */
  comm: number;
  /** 최대 상업 수치 */
  commMax: number;
  /** 현재 치안 수치 */
  secu: number;
  /** 최대 치안 수치 */
  secuMax: number;
  /** 현재 수비 수치 */
  def: number;
  /** 최대 수비 수치 */
  defMax: number;
  /** 현재 성벽 수치 */
  wall: number;
  /** 최대 성벽 수치 */
  wallMax: number;
  /** 민심 (0-100) */
  trust: number;
  /** 시세 (매매 가격 보정, null이면 상인 없음) */
  trade: number | null;
  /** 지역 코드 (지도상 권역) */
  region: number;
  /** 도시 상태 코드 (전쟁, 계략 등) */
  state: number;
  /** 상태 잔여 기한 (월 단위) */
  term: number;
  /** 분쟁 정보 */
  conflict: Record<string, any>;
  /** 확장 메타 데이터 */
  meta: Record<string, any>;
  /** 사망/파괴 플래그 */
  dead: number;
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

export interface ReservedTurn {
  generalId: number;
  turnIdx: number;
  action: string;
  arg: Record<string, any>;
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
  generalTurns: Record<number, ReservedTurn[]>; // key: generalId
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
  deleteEvents?: string[]; // 삭제할 이벤트 ID 목록
  deleteNations?: number[];
  deleteGenerals?: number[];
  deleteGeneralTurns?: { generalId: number; turnIdx: number }[];
}
