/**
 * Tournament System Types
 * Ported from legacy/hwe/func_tournament.php
 */

/**
 * Tournament state enum
 * 0: 없음 (No tournament)
 * 1: 모집중 (Recruiting)
 * 2-3: 예선 (Preliminary round)
 * 4-5: 본선 (Main round)
 * 6: 베팅 (Betting phase)
 * 7: 16강 (Round of 16)
 * 8: 8강 (Quarterfinals)
 * 9: 4강 (Semifinals)
 * 10: 결승 (Finals)
 */
export enum TournamentState {
  None = 0,
  Recruiting = 1,
  PreliminaryRound = 2,
  PreliminaryDraw = 3,
  MainRound = 4,
  MainRoundComplete = 5,
  Betting = 6,
  RoundOf16 = 7,
  Quarterfinals = 8,
  Semifinals = 9,
  Finals = 10,
}

/**
 * Tournament type (determines which stat is used)
 */
export enum TournamentType {
  Total = 0, // 전력전 - Total stats
  Leadership = 1, // 통솔전 - Leadership
  Strength = 2, // 일기토 - Strength/Duel
  Intel = 3, // 설전 - Intelligence/Debate
}

/**
 * Tournament participant data
 */
export interface TournamentParticipant {
  no: number; // General ID (0 for dummy)
  npc: number; // NPC type
  name: string;
  leadership: number;
  strength: number;
  intel: number;
  lvl: number; // Experience level
  grp: number; // Group number (0-7 preliminary, 10-17 main, 20+ knockout)
  grpNo: number; // Position within group
  win: number;
  draw: number;
  lose: number;
  gl: number; // Goal difference
  prmt: number; // Promotion rank (1-4 for qualified)
  seq: number; // Sequence for tiebreaker
  horse: string;
  weapon: string;
  book: string;
}

/**
 * Tournament configuration stored in game_env
 */
export interface TournamentConfig {
  tournament: TournamentState;
  phase: number;
  tnmtType: TournamentType;
  tnmtMsg: string;
  tnmtAuto: boolean;
  tnmtTime: string; // ISO datetime string
  develcost: number; // Entry fee
  lastTournamentBettingId: number;
}

/**
 * Fight result
 */
export enum FightResult {
  Player1Win = 0,
  Player2Win = 1,
  Draw = 2,
}

/**
 * Fight log entry
 */
export interface FightLogEntry {
  group: number;
  logs: string[];
}

/**
 * Tournament type info for display
 */
export interface TournamentTypeInfo {
  name: string; // Display name (전력전, 통솔전, etc.)
  statKey: "total" | "leadership" | "strength" | "intel";
  statLabel: string; // 종합, 통솔, 무력, 지력
  rankKey: string; // tt, tl, ts, ti
}

/**
 * Get tournament type info
 */
export function getTournamentTypeInfo(type: TournamentType): TournamentTypeInfo {
  switch (type) {
    case TournamentType.Total:
      return { name: "전력전", statKey: "total", statLabel: "종합", rankKey: "tt" };
    case TournamentType.Leadership:
      return { name: "통솔전", statKey: "leadership", statLabel: "통솔", rankKey: "tl" };
    case TournamentType.Strength:
      return { name: "일기토", statKey: "strength", statLabel: "무력", rankKey: "ts" };
    case TournamentType.Intel:
      return { name: "설전", statKey: "intel", statLabel: "지력", rankKey: "ti" };
  }
}

/**
 * Get tournament state text
 */
export function getTournamentStateText(state: TournamentState): string {
  switch (state) {
    case TournamentState.None:
      return "경기 없음";
    case TournamentState.Recruiting:
      return "참가 모집중";
    case TournamentState.PreliminaryRound:
      return "예선 진행중";
    case TournamentState.PreliminaryDraw:
      return "본선 추첨중";
    case TournamentState.MainRound:
      return "본선 진행중";
    case TournamentState.MainRoundComplete:
      return "16강 배정중";
    case TournamentState.Betting:
      return "베팅 진행중";
    case TournamentState.RoundOf16:
      return "16강 진행중";
    case TournamentState.Quarterfinals:
      return "8강 진행중";
    case TournamentState.Semifinals:
      return "4강 진행중";
    case TournamentState.Finals:
      return "결승 진행중";
    default:
      return "알 수 없음";
  }
}

/**
 * Calculate tournament term in seconds based on turn term
 */
export function calcTournamentTerm(turnTerm: number): number {
  return Math.max(5, Math.min(turnTerm, 120));
}

/**
 * Get matchup pairs for qualifying rounds
 * Each phase determines which two positions in a group fight
 */
export function getQualifyingMatchup(tournament: TournamentState, phase: number): [number, number] {
  if (tournament === TournamentState.PreliminaryRound) {
    // Preliminary round - 28 matchups per direction (home/away)
    const candMap: [number, number][] = [
      [0, 1],
      [2, 3],
      [4, 5],
      [6, 7],
      [0, 2],
      [1, 3],
      [4, 6],
      [5, 7],
      [0, 3],
      [1, 6],
      [2, 5],
      [4, 7],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
      [0, 5],
      [1, 4],
      [2, 7],
      [3, 6],
      [0, 6],
      [1, 7],
      [2, 4],
      [3, 5],
      [0, 7],
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    const idx = phase % 28;
    const cand = candMap[idx];
    // Swap for second half (away games)
    return phase >= 28 ? [cand[1], cand[0]] : cand;
  }

  if (tournament === TournamentState.MainRound) {
    // Main round - 6 matchups
    const candMap: [number, number][] = [
      [0, 1],
      [2, 3],
      [0, 2],
      [1, 3],
      [0, 3],
      [1, 2],
    ];
    return candMap[phase % 6];
  }

  return [0, 1];
}

/**
 * Create a dummy participant for empty slots
 */
export function createDummyParticipant(grp: number, grpNo: number): TournamentParticipant {
  return {
    no: 0,
    npc: 2,
    name: "무명장수",
    leadership: 10,
    strength: 10,
    intel: 10,
    lvl: 10,
    grp,
    grpNo,
    win: 0,
    draw: 0,
    lose: 0,
    gl: 0,
    prmt: 0,
    seq: grpNo,
    horse: "None",
    weapon: "None",
    book: "None",
  };
}
