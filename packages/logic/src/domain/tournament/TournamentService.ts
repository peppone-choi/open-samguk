/**
 * TournamentService - 토너먼트 시스템 서비스
 * Ported from legacy/hwe/func_tournament.php
 */

import {
  TournamentState,
  TournamentType,
  TournamentParticipant,
  TournamentConfig,
  FightResult,
  getTournamentTypeInfo,
  calcTournamentTerm,
  getQualifyingMatchup,
  createDummyParticipant,
} from "./types";

/**
 * Tournament Service
 * Manages tournament lifecycle: recruitment → qualifying → main round → knockout → finals
 */
export class TournamentService {
  /**
   * Start a new tournament
   * @param type Tournament type (전력전/통솔전/일기토/설전)
   * @param turnTerm Server turn interval in minutes
   * @param develcost Entry fee
   */
  static startTournament(
    type: TournamentType,
    turnTerm: number,
    develcost: number
  ): TournamentConfig {
    const unit = calcTournamentTerm(turnTerm);
    const tnmtTime = new Date(Date.now() + unit * 60 * 1000).toISOString();

    return {
      tournament: TournamentState.Recruiting,
      phase: 0,
      tnmtType: type,
      tnmtMsg: "",
      tnmtAuto: true,
      tnmtTime,
      develcost,
      lastTournamentBettingId: 0,
    };
  }

  /**
   * Process tournament - called periodically to advance the tournament
   * @returns Updated tournament config or null if no change
   */
  static processTournament(
    config: TournamentConfig,
    participants: TournamentParticipant[],
    now: Date = new Date()
  ): { config: TournamentConfig; participants: TournamentParticipant[] } | null {
    if (!config.tnmtAuto) {
      return null;
    }

    const tnmtTime = new Date(config.tnmtTime);
    const offset = now.getTime() - tnmtTime.getTime();

    if (offset < 0) {
      return null;
    }

    // Calculate iterations
    const unit = calcTournamentTerm(60); // TODO: Get actual turn term
    const iter = Math.floor(offset / (unit * 1000)) + 1;

    let newConfig = { ...config };
    let newParticipants = [...participants];

    for (let i = 0; i < iter; i++) {
      const result = this.advancePhase(newConfig, newParticipants);
      if (!result) break;
      newConfig = result.config;
      newParticipants = result.participants;

      // Stop if tournament ended
      if (newConfig.tournament === TournamentState.None) {
        break;
      }
    }

    return { config: newConfig, participants: newParticipants };
  }

  /**
   * Advance tournament by one phase
   */
  private static advancePhase(
    config: TournamentConfig,
    participants: TournamentParticipant[]
  ): { config: TournamentConfig; participants: TournamentParticipant[] } | null {
    const newConfig = { ...config };
    let newParticipants = [...participants];

    switch (config.tournament) {
      case TournamentState.Recruiting:
        // Fill empty slots and start qualifying
        newParticipants = this.fillEmptySlots(newParticipants, config.tnmtType);
        newConfig.tournament = TournamentState.PreliminaryRound;
        newConfig.phase = 0;
        break;

      case TournamentState.PreliminaryRound:
        // Run qualifying matches
        newParticipants = this.runQualifyingMatches(newParticipants, config.tnmtType, config.phase);
        newConfig.phase++;
        if (newConfig.phase >= 56) {
          // 28 home + 28 away games
          newConfig.tournament = TournamentState.PreliminaryDraw;
          newConfig.phase = 0;
          newParticipants = this.markQualifiedForMain(newParticipants);
        }
        break;

      case TournamentState.PreliminaryDraw:
        // Draw for main round
        newParticipants = this.drawMainRound(newParticipants, config.phase);
        newConfig.phase += 8;
        if (newConfig.phase >= 32) {
          newConfig.tournament = TournamentState.MainRound;
          newConfig.phase = 0;
        }
        break;

      case TournamentState.MainRound:
        // Run main round matches
        newParticipants = this.runMainRoundMatches(newParticipants, config.tnmtType, config.phase);
        newConfig.phase++;
        if (newConfig.phase >= 6) {
          newConfig.tournament = TournamentState.MainRoundComplete;
          newConfig.phase = 0;
          newParticipants = this.markQualifiedFor16(newParticipants);
        }
        break;

      case TournamentState.MainRoundComplete:
        // Set up Round of 16
        newParticipants = this.setupRoundOf16(newParticipants);
        newConfig.tournament = TournamentState.Betting;
        newConfig.phase = 0;
        break;

      case TournamentState.Betting:
        // Close betting and start Round of 16
        newConfig.tournament = TournamentState.RoundOf16;
        newConfig.phase = 0;
        break;

      case TournamentState.RoundOf16:
        newParticipants = this.runKnockoutMatch(newParticipants, config.tnmtType, config.phase, 16);
        newConfig.phase++;
        if (newConfig.phase >= 8) {
          newConfig.tournament = TournamentState.Quarterfinals;
          newConfig.phase = 0;
        }
        break;

      case TournamentState.Quarterfinals:
        newParticipants = this.runKnockoutMatch(newParticipants, config.tnmtType, config.phase, 8);
        newConfig.phase++;
        if (newConfig.phase >= 4) {
          newConfig.tournament = TournamentState.Semifinals;
          newConfig.phase = 0;
        }
        break;

      case TournamentState.Semifinals:
        newParticipants = this.runKnockoutMatch(newParticipants, config.tnmtType, config.phase, 4);
        newConfig.phase++;
        if (newConfig.phase >= 2) {
          newConfig.tournament = TournamentState.Finals;
          newConfig.phase = 0;
        }
        break;

      case TournamentState.Finals:
        newParticipants = this.runKnockoutMatch(newParticipants, config.tnmtType, config.phase, 2);
        // Tournament complete
        newConfig.tournament = TournamentState.None;
        newConfig.phase = 0;
        newConfig.tnmtAuto = false;
        break;

      default:
        return null;
    }

    return { config: newConfig, participants: newParticipants };
  }

  /**
   * Fill empty slots with dummy participants or auto-joined players
   */
  private static fillEmptySlots(
    participants: TournamentParticipant[],
    _type: TournamentType
  ): TournamentParticipant[] {
    const result = [...participants];
    const grpCount = new Array(8).fill(0);

    // Count existing participants per group
    for (const p of result) {
      if (p.grp >= 0 && p.grp < 8) {
        grpCount[p.grp]++;
      }
    }

    // Fill each group to 8 members
    for (let grp = 0; grp < 8; grp++) {
      while (grpCount[grp] < 8) {
        result.push(createDummyParticipant(grp, grpCount[grp]));
        grpCount[grp]++;
      }
    }

    return result;
  }

  /**
   * Run qualifying matches for a phase
   */
  private static runQualifyingMatches(
    participants: TournamentParticipant[],
    type: TournamentType,
    phase: number
  ): TournamentParticipant[] {
    const result = [...participants];
    const [p1Pos, p2Pos] = getQualifyingMatchup(TournamentState.PreliminaryRound, phase);

    // Run matches for each of 8 groups
    for (let grp = 0; grp < 8; grp++) {
      const grpParticipants = result.filter((p) => p.grp === grp);
      const p1 = grpParticipants.find((p) => p.grpNo === p1Pos);
      const p2 = grpParticipants.find((p) => p.grpNo === p2Pos);

      if (p1 && p2) {
        const fightResult = this.simulateFight(p1, p2, type, false);
        this.applyFightResult(result, p1, p2, fightResult);
      }
    }

    return result;
  }

  /**
   * Mark top 4 from each group as qualified for main round
   */
  private static markQualifiedForMain(
    participants: TournamentParticipant[]
  ): TournamentParticipant[] {
    const result = [...participants];

    for (let grp = 0; grp < 8; grp++) {
      const grpParticipants = result
        .filter((p) => p.grp === grp)
        .sort((a, b) => {
          const aPoints = a.win * 3 + a.draw;
          const bPoints = b.win * 3 + b.draw;
          if (bPoints !== aPoints) return bPoints - aPoints;
          return b.gl - a.gl;
        });

      for (let i = 0; i < Math.min(4, grpParticipants.length); i++) {
        const p = result.find((r) => r.grp === grp && r.grpNo === grpParticipants[i].grpNo);
        if (p) {
          p.prmt = i + 1;
        }
      }
    }

    return result;
  }

  /**
   * Draw for main round - seed participants into groups 10-17
   */
  private static drawMainRound(
    participants: TournamentParticipant[],
    _phase: number
  ): TournamentParticipant[] {
    const result = [...participants];
    // TODO: Implement proper seeding logic
    // For now, just mark as moved to main round
    return result;
  }

  /**
   * Run main round matches
   */
  private static runMainRoundMatches(
    participants: TournamentParticipant[],
    type: TournamentType,
    phase: number
  ): TournamentParticipant[] {
    const result = [...participants];
    const [p1Pos, p2Pos] = getQualifyingMatchup(TournamentState.MainRound, phase);

    // Run matches for main round groups (10-17)
    for (let grp = 10; grp < 18; grp++) {
      const grpParticipants = result.filter((p) => p.grp === grp);
      const p1 = grpParticipants.find((p) => p.grpNo === p1Pos);
      const p2 = grpParticipants.find((p) => p.grpNo === p2Pos);

      if (p1 && p2) {
        const fightResult = this.simulateFight(p1, p2, type, false);
        this.applyFightResult(result, p1, p2, fightResult);
      }
    }

    return result;
  }

  /**
   * Mark top 2 from each main round group for Round of 16
   */
  private static markQualifiedFor16(
    participants: TournamentParticipant[]
  ): TournamentParticipant[] {
    const result = [...participants];

    for (let grp = 10; grp < 18; grp++) {
      const grpParticipants = result
        .filter((p) => p.grp === grp)
        .sort((a, b) => {
          const aPoints = a.win * 3 + a.draw;
          const bPoints = b.win * 3 + b.draw;
          if (bPoints !== aPoints) return bPoints - aPoints;
          return b.gl - a.gl;
        });

      for (let i = 0; i < Math.min(2, grpParticipants.length); i++) {
        const p = result.find((r) => r.grp === grp && r.grpNo === grpParticipants[i].grpNo);
        if (p) {
          p.prmt = i + 1;
        }
      }
    }

    return result;
  }

  /**
   * Setup Round of 16 bracket
   */
  private static setupRoundOf16(participants: TournamentParticipant[]): TournamentParticipant[] {
    const result = [...participants];

    // Bracket: 1조1-5조2, 2조1-6조2, etc.
    const grpPairs = [10, 14, 11, 15, 12, 16, 13, 17, 14, 10, 15, 11, 16, 12, 17, 13];
    const prmtPairs = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2];

    for (let i = 0; i < 16; i++) {
      const sourceGrp = grpPairs[i];
      const sourcePrmt = prmtPairs[i];
      const source = result.find((p) => p.grp === sourceGrp && p.prmt === sourcePrmt);

      if (source) {
        const newGrp = 20 + Math.floor(i / 2);
        const newGrpNo = i % 2;

        result.push({
          ...source,
          grp: newGrp,
          grpNo: newGrpNo,
          win: 0,
          draw: 0,
          lose: 0,
          gl: 0,
          prmt: 0,
        });
      }
    }

    // Reset prmt for main round participants
    for (const p of result) {
      if (p.grp >= 10 && p.grp < 18) {
        p.prmt = 0;
      }
    }

    return result;
  }

  /**
   * Run a knockout match
   */
  private static runKnockoutMatch(
    participants: TournamentParticipant[],
    type: TournamentType,
    phase: number,
    roundSize: number
  ): TournamentParticipant[] {
    const result = [...participants];

    const baseGrp = roundSize === 16 ? 20 : roundSize === 8 ? 30 : roundSize === 4 ? 40 : 50;
    const grp = baseGrp + phase;

    const grpParticipants = result.filter((p) => p.grp === grp);
    const p1 = grpParticipants.find((p) => p.grpNo === 0);
    const p2 = grpParticipants.find((p) => p.grpNo === 1);

    if (p1 && p2) {
      // Knockout - no draws
      const fightResult = this.simulateFight(p1, p2, type, true);
      this.applyFightResult(result, p1, p2, fightResult);

      // Winner advances
      const winner = fightResult === FightResult.Player1Win ? p1 : p2;
      const nextGrp = baseGrp + 10 + Math.floor(phase / 2);
      const nextGrpNo = phase % 2;

      result.push({
        ...winner,
        grp: nextGrp,
        grpNo: nextGrpNo,
        win: 0,
        draw: 0,
        lose: 0,
        gl: 0,
        prmt: 0,
      });
    }

    return result;
  }

  /**
   * Simulate a fight between two participants
   */
  private static simulateFight(
    p1: TournamentParticipant,
    p2: TournamentParticipant,
    type: TournamentType,
    noDraws: boolean
  ): FightResult {
    const typeInfo = getTournamentTypeInfo(type);
    const statKey = typeInfo.statKey;

    const stat1 =
      statKey === "total"
        ? p1.leadership + p1.strength + p1.intel
        : (p1[statKey as keyof TournamentParticipant] as number);
    const stat2 =
      statKey === "total"
        ? p2.leadership + p2.strength + p2.intel
        : (p2[statKey as keyof TournamentParticipant] as number);

    // Simple simulation based on stats
    const energy1 = Math.round(stat1 * this.getLevelRatio(p1.lvl, p2.lvl) * 10);
    const energy2 = Math.round(stat2 * this.getLevelRatio(p2.lvl, p1.lvl) * 10);

    let e1 = energy1;
    let e2 = energy2;
    const maxTurns = noDraws ? 100 : 10;

    for (let turn = 0; turn < maxTurns; turn++) {
      // Damage calculation with randomness
      const damage1 = Math.round(stat2 * (0.9 + Math.random() * 0.2));
      const damage2 = Math.round(stat1 * (0.9 + Math.random() * 0.2));

      e1 -= damage1;
      e2 -= damage2;

      if (e1 <= 0 && e2 <= 0) {
        if (noDraws) {
          // Rematch
          e1 = Math.round(energy1 / 2);
          e2 = Math.round(energy2 / 2);
          continue;
        }
        return FightResult.Draw;
      }
      if (e1 <= 0) return FightResult.Player2Win;
      if (e2 <= 0) return FightResult.Player1Win;
    }

    // Timeout - determine by remaining energy
    if (e1 > e2) return FightResult.Player1Win;
    if (e2 > e1) return FightResult.Player2Win;
    return noDraws ? FightResult.Player1Win : FightResult.Draw;
  }

  /**
   * Get level ratio for fight calculation
   */
  private static getLevelRatio(lvl1: number, lvl2: number): number {
    if (lvl1 >= lvl2) {
      return 1 + Math.log10(1 + lvl1 - lvl2) / 10;
    } else {
      return 1 - Math.log10(1 + lvl2 - lvl1) / 10;
    }
  }

  /**
   * Apply fight result to participants
   */
  private static applyFightResult(
    participants: TournamentParticipant[],
    p1: TournamentParticipant,
    p2: TournamentParticipant,
    result: FightResult
  ): void {
    const idx1 = participants.findIndex((p) => p.grp === p1.grp && p.grpNo === p1.grpNo);
    const idx2 = participants.findIndex((p) => p.grp === p2.grp && p.grpNo === p2.grpNo);

    if (idx1 === -1 || idx2 === -1) return;

    switch (result) {
      case FightResult.Player1Win:
        participants[idx1].win++;
        participants[idx2].lose++;
        participants[idx1].gl += 1;
        participants[idx2].gl -= 1;
        break;
      case FightResult.Player2Win:
        participants[idx1].lose++;
        participants[idx2].win++;
        participants[idx1].gl -= 1;
        participants[idx2].gl += 1;
        break;
      case FightResult.Draw:
        participants[idx1].draw++;
        participants[idx2].draw++;
        break;
    }
  }

  /**
   * Get participants for a specific stage
   */
  static getParticipantsByStage(
    participants: TournamentParticipant[],
    stage: "preliminary" | "main" | "round16" | "round8" | "round4" | "final" | "champion"
  ): TournamentParticipant[] {
    switch (stage) {
      case "preliminary":
        return participants.filter((p) => p.grp >= 0 && p.grp < 8);
      case "main":
        return participants.filter((p) => p.grp >= 10 && p.grp < 18);
      case "round16":
        return participants.filter((p) => p.grp >= 20 && p.grp < 28);
      case "round8":
        return participants.filter((p) => p.grp >= 30 && p.grp < 34);
      case "round4":
        return participants.filter((p) => p.grp >= 40 && p.grp < 42);
      case "final":
        return participants.filter((p) => p.grp >= 50 && p.grp < 60);
      case "champion":
        return participants.filter((p) => p.grp >= 60);
      default:
        return [];
    }
  }
}
