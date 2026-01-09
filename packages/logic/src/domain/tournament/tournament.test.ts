import { describe, it, expect, beforeEach } from "vitest";
import { TournamentService } from "./TournamentService.js";
import {
  TournamentState,
  TournamentType,
  TournamentConfig,
  TournamentParticipant,
  getTournamentTypeInfo,
  getTournamentStateText,
  calcTournamentTerm,
  getQualifyingMatchup,
  createDummyParticipant,
} from "./types.js";

describe("Tournament System", () => {
  describe("Types and helpers", () => {
    describe("TournamentType", () => {
      it("should have correct tournament types", () => {
        expect(TournamentType.Total).toBe(0);
        expect(TournamentType.Leadership).toBe(1);
        expect(TournamentType.Strength).toBe(2);
        expect(TournamentType.Intel).toBe(3);
      });
    });

    describe("TournamentState", () => {
      it("should have correct tournament states", () => {
        expect(TournamentState.None).toBe(0);
        expect(TournamentState.Recruiting).toBe(1);
        expect(TournamentState.PreliminaryRound).toBe(2);
        expect(TournamentState.Finals).toBe(10);
      });
    });

    describe("getTournamentTypeInfo", () => {
      it("should return correct info for Total type", () => {
        const info = getTournamentTypeInfo(TournamentType.Total);
        expect(info.name).toBe("전력전");
        expect(info.statKey).toBe("total");
      });

      it("should return correct info for Strength type", () => {
        const info = getTournamentTypeInfo(TournamentType.Strength);
        expect(info.name).toBe("일기토");
        expect(info.statKey).toBe("strength");
      });
    });

    describe("getTournamentStateText", () => {
      it("should return correct text for Recruiting state", () => {
        expect(getTournamentStateText(TournamentState.Recruiting)).toBe("참가 모집중");
      });

      it("should return correct text for Finals state", () => {
        expect(getTournamentStateText(TournamentState.Finals)).toBe("결승 진행중");
      });
    });

    describe("calcTournamentTerm", () => {
      it("should clamp to minimum of 5", () => {
        expect(calcTournamentTerm(1)).toBe(5);
        expect(calcTournamentTerm(3)).toBe(5);
      });

      it("should clamp to maximum of 120", () => {
        expect(calcTournamentTerm(200)).toBe(120);
        expect(calcTournamentTerm(150)).toBe(120);
      });

      it("should return turnTerm within bounds", () => {
        expect(calcTournamentTerm(60)).toBe(60);
        expect(calcTournamentTerm(10)).toBe(10);
      });
    });

    describe("getQualifyingMatchup", () => {
      it("should return correct matchup for preliminary round phase 0", () => {
        const [p1, p2] = getQualifyingMatchup(TournamentState.PreliminaryRound, 0);
        expect(p1).toBe(0);
        expect(p2).toBe(1);
      });

      it("should swap for away games (phase >= 28)", () => {
        const [p1Home, p2Home] = getQualifyingMatchup(TournamentState.PreliminaryRound, 0);
        const [p1Away, p2Away] = getQualifyingMatchup(TournamentState.PreliminaryRound, 28);
        expect(p1Away).toBe(p2Home);
        expect(p2Away).toBe(p1Home);
      });

      it("should return correct matchup for main round", () => {
        const [p1, p2] = getQualifyingMatchup(TournamentState.MainRound, 0);
        expect(p1).toBe(0);
        expect(p2).toBe(1);
      });
    });

    describe("createDummyParticipant", () => {
      it("should create a dummy participant with correct group", () => {
        const dummy = createDummyParticipant(3, 5);
        expect(dummy.no).toBe(0);
        expect(dummy.npc).toBe(2);
        expect(dummy.name).toBe("무명장수");
        expect(dummy.grp).toBe(3);
        expect(dummy.grpNo).toBe(5);
        expect(dummy.leadership).toBe(10);
      });
    });
  });

  describe("TournamentService", () => {
    describe("startTournament", () => {
      it("should create a tournament config with correct initial state", () => {
        const config = TournamentService.startTournament(TournamentType.Strength, 10, 100);

        expect(config.tournament).toBe(TournamentState.Recruiting);
        expect(config.phase).toBe(0);
        expect(config.tnmtType).toBe(TournamentType.Strength);
        expect(config.tnmtAuto).toBe(true);
        expect(config.develcost).toBe(100);
      });

      it("should set correct tournament time based on turn term", () => {
        const before = Date.now();
        const config = TournamentService.startTournament(TournamentType.Total, 60, 50);
        const after = Date.now();

        const tnmtTime = new Date(config.tnmtTime).getTime();
        const unit = calcTournamentTerm(60);
        const expected = before + unit * 60 * 1000;

        // Should be within reasonable range (allowing for execution time)
        expect(tnmtTime).toBeGreaterThanOrEqual(expected - 1000);
        expect(tnmtTime).toBeLessThanOrEqual(after + unit * 60 * 1000 + 1000);
      });
    });

    describe("processTournament", () => {
      it("should return null if not auto mode", () => {
        const config: TournamentConfig = {
          tournament: TournamentState.Recruiting,
          phase: 0,
          tnmtType: TournamentType.Total,
          tnmtMsg: "",
          tnmtAuto: false,
          tnmtTime: new Date().toISOString(),
          develcost: 100,
          lastTournamentBettingId: 0,
        };

        const result = TournamentService.processTournament(config, []);
        expect(result).toBeNull();
      });

      it("should return null if tournament time not reached", () => {
        const future = new Date(Date.now() + 3600000).toISOString();
        const config: TournamentConfig = {
          tournament: TournamentState.Recruiting,
          phase: 0,
          tnmtType: TournamentType.Total,
          tnmtMsg: "",
          tnmtAuto: true,
          tnmtTime: future,
          develcost: 100,
          lastTournamentBettingId: 0,
        };

        const result = TournamentService.processTournament(config, []);
        expect(result).toBeNull();
      });

      it("should advance from Recruiting to PreliminaryRound", () => {
        const past = new Date(Date.now() - 60000).toISOString();
        const config: TournamentConfig = {
          tournament: TournamentState.Recruiting,
          phase: 0,
          tnmtType: TournamentType.Total,
          tnmtMsg: "",
          tnmtAuto: true,
          tnmtTime: past,
          develcost: 100,
          lastTournamentBettingId: 0,
        };

        const result = TournamentService.processTournament(config, []);
        expect(result).not.toBeNull();
        expect(result!.config.tournament).toBe(TournamentState.PreliminaryRound);
        // Should have filled 8 groups with 8 participants each
        expect(result!.participants.length).toBe(64);
      });
    });

    describe("getParticipantsByStage", () => {
      let participants: TournamentParticipant[];

      beforeEach(() => {
        participants = [];
        // Add participants for different stages
        for (let grp = 0; grp < 8; grp++) {
          participants.push(createDummyParticipant(grp, 0));
        }
        for (let grp = 10; grp < 18; grp++) {
          participants.push(createDummyParticipant(grp, 0));
        }
        for (let grp = 20; grp < 28; grp++) {
          participants.push(createDummyParticipant(grp, 0));
        }
      });

      it("should return preliminary participants (groups 0-7)", () => {
        const result = TournamentService.getParticipantsByStage(participants, "preliminary");
        expect(result.length).toBe(8);
        expect(result.every((p) => p.grp >= 0 && p.grp < 8)).toBe(true);
      });

      it("should return main round participants (groups 10-17)", () => {
        const result = TournamentService.getParticipantsByStage(participants, "main");
        expect(result.length).toBe(8);
        expect(result.every((p) => p.grp >= 10 && p.grp < 18)).toBe(true);
      });

      it("should return round of 16 participants (groups 20+)", () => {
        const result = TournamentService.getParticipantsByStage(participants, "round16");
        expect(result.length).toBe(8);
        expect(result.every((p) => p.grp >= 20 && p.grp < 28)).toBe(true);
      });
    });
  });

  describe("Tournament Lifecycle Integration", () => {
    it("should complete a full preliminary round", () => {
      // Start tournament
      let config = TournamentService.startTournament(TournamentType.Strength, 10, 100);
      let participants: TournamentParticipant[] = [];

      // Set time to past to trigger processing
      config.tnmtTime = new Date(Date.now() - 60000).toISOString();

      // Process until past preliminary
      let iterations = 0;
      while (
        config.tournament === TournamentState.Recruiting ||
        config.tournament === TournamentState.PreliminaryRound
      ) {
        const result = TournamentService.processTournament(config, participants);
        if (!result) break;
        config = result.config;
        participants = result.participants;
        config.tnmtTime = new Date(Date.now() - 60000).toISOString(); // Keep advancing
        iterations++;
        if (iterations > 100) break; // Safety limit
      }

      // Should have progressed beyond preliminary
      expect(config.tournament).toBeGreaterThanOrEqual(TournamentState.PreliminaryDraw);
    });
  });
});
