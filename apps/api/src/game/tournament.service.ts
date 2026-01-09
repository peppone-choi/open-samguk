import { Injectable } from "@nestjs/common";
import { createPrismaClient, type PrismaClientType } from "@sammo/infra";
import {
  TournamentState,
  TournamentType,
  type TournamentParticipant,
  type TournamentConfig,
  getTournamentTypeInfo,
  getTournamentStateText,
  calcTournamentTerm,
} from "@sammo/logic";

@Injectable()
export class TournamentService {
  private readonly prisma: PrismaClientType = createPrismaClient();

  /**
   * Get current tournament status and config
   */
  async getTournamentStatus() {
    const config = await this.getTournamentConfig();
    const participants = await this.getParticipants();

    const typeInfo = getTournamentTypeInfo(config.tnmtType);
    const stateText = getTournamentStateText(config.tournament);

    // Group participants by stage
    const preliminary = participants.filter((p) => p.grp >= 0 && p.grp < 8);
    const main = participants.filter((p) => p.grp >= 10 && p.grp < 18);
    const knockout = participants.filter((p) => p.grp >= 20);

    return {
      result: true,
      config,
      typeInfo,
      stateText,
      participants: {
        preliminary: this.groupByGrp(preliminary),
        main: this.groupByGrp(main),
        knockout: this.groupKnockout(knockout),
      },
      canJoin: config.tournament === TournamentState.Recruiting,
      nextPhaseTime: config.tnmtTime,
    };
  }

  /**
   * Get tournament brackets for display
   */
  async getTournamentBrackets() {
    const config = await this.getTournamentConfig();
    const participants = await this.getParticipants();

    // Extract knockout stage participants
    const round16 = participants.filter((p) => p.grp >= 20 && p.grp < 28);
    const quarterfinals = participants.filter((p) => p.grp >= 30 && p.grp < 34);
    const semifinals = participants.filter((p) => p.grp >= 40 && p.grp < 42);
    const finals = participants.filter((p) => p.grp >= 50 && p.grp < 60);
    const champion = participants.filter((p) => p.grp >= 60);

    return {
      result: true,
      state: config.tournament,
      stateText: getTournamentStateText(config.tournament),
      brackets: {
        round16: this.formatBracket(round16, 8),
        quarterfinals: this.formatBracket(quarterfinals, 4),
        semifinals: this.formatBracket(semifinals, 2),
        finals: this.formatBracket(finals, 1),
        champion: champion[0] || null,
      },
    };
  }

  /**
   * Get group standings for preliminary or main round
   */
  async getGroupStandings(stage: "preliminary" | "main") {
    const participants = await this.getParticipants();
    const config = await this.getTournamentConfig();

    const grpRange = stage === "preliminary" ? [0, 8] : [10, 18];
    const grpParticipants = participants.filter((p) => p.grp >= grpRange[0] && p.grp < grpRange[1]);

    const groups: Record<number, TournamentParticipant[]> = {};
    for (const p of grpParticipants) {
      if (!groups[p.grp]) groups[p.grp] = [];
      groups[p.grp].push(p);
    }

    // Sort each group by points
    for (const grp of Object.keys(groups)) {
      groups[Number(grp)].sort((a, b) => {
        const aPoints = a.win * 3 + a.draw;
        const bPoints = b.win * 3 + b.draw;
        if (bPoints !== aPoints) return bPoints - aPoints;
        return b.gl - a.gl;
      });
    }

    return {
      result: true,
      stage,
      state: config.tournament,
      groups,
    };
  }

  /**
   * Join tournament
   */
  async joinTournament(generalId: number) {
    const config = await this.getTournamentConfig();

    if (config.tournament !== TournamentState.Recruiting) {
      throw new Error("현재 토너먼트 참가 접수 기간이 아닙니다.");
    }

    // Check if general exists and is valid
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
    });

    if (!general) {
      throw new Error("존재하지 않는 장수입니다.");
    }

    if (general.npc > 1) {
      throw new Error("NPC는 토너먼트에 참가할 수 없습니다.");
    }

    // Check entry fee
    if (general.gold < config.develcost) {
      throw new Error(`참가비 ${config.develcost} 금이 부족합니다.`);
    }

    // Check if already joined
    const existingStorage = await this.prisma.storage.findFirst({
      where: {
        namespace: "tournament_participants",
        key: `general_${generalId}`,
      },
    });

    if (existingStorage) {
      throw new Error("이미 참가 신청하셨습니다.");
    }

    // Find empty slot
    const participants = await this.getParticipants();
    const { grp, grpNo } = this.findEmptySlot(participants);

    if (grp === -1) {
      throw new Error("참가 정원이 가득 찼습니다.");
    }

    // Deduct entry fee and register
    await this.prisma.$transaction(async (tx) => {
      await tx.general.update({
        where: { no: generalId },
        data: { gold: { decrement: config.develcost } },
      });

      const participant: TournamentParticipant = {
        no: generalId,
        npc: general.npc,
        name: general.name,
        leadership: general.leadership,
        strength: general.strength,
        intel: general.intel,
        lvl: general.expLevel ?? 0,
        grp,
        grpNo,
        win: 0,
        draw: 0,
        lose: 0,
        gl: 0,
        prmt: 0,
        seq: grpNo,
        horse: general.horse ?? "None",
        weapon: general.weapon ?? "None",
        book: general.book ?? "None",
      };

      await tx.storage.create({
        data: {
          namespace: "tournament_participants",
          key: `general_${generalId}`,
          value: participant as object,
        },
      });
    });

    return { result: true, grp, grpNo };
  }

  /**
   * Get betting odds for tournament
   */
  async getBettingOdds() {
    const config = await this.getTournamentConfig();

    if (config.tournament < TournamentState.Betting) {
      return { result: false, error: "베팅이 아직 시작되지 않았습니다." };
    }

    const participants = await this.getParticipants();
    const round16 = participants.filter((p) => p.grp >= 20 && p.grp < 28);

    // Calculate basic odds based on stats
    const typeInfo = getTournamentTypeInfo(config.tnmtType);
    const odds: Record<number, number> = {};

    let totalPower = 0;
    for (const p of round16) {
      const stat =
        typeInfo.statKey === "total" ? p.leadership + p.strength + p.intel : p[typeInfo.statKey];
      totalPower += stat;
    }

    for (const p of round16) {
      const stat =
        typeInfo.statKey === "total" ? p.leadership + p.strength + p.intel : p[typeInfo.statKey];
      // Lower stat = higher odds (underdog)
      odds[p.no] = Math.max(1.1, Math.round((totalPower / stat / round16.length) * 10) / 10);
    }

    return {
      result: true,
      state: config.tournament,
      bettingId: config.lastTournamentBettingId,
      participants: round16.map((p) => ({
        no: p.no,
        name: p.name,
        odds: odds[p.no],
        grp: p.grp,
        grpNo: p.grpNo,
      })),
    };
  }

  /**
   * Start a new tournament (admin only)
   */
  async startTournament(type: TournamentType, develcost: number = 100) {
    const currentConfig = await this.getTournamentConfig();

    if (currentConfig.tournament !== TournamentState.None) {
      throw new Error("이미 진행중인 토너먼트가 있습니다.");
    }

    const gameEnv = await this.getGameEnv();
    const unit = calcTournamentTerm(gameEnv.turnTerm ?? 60);
    const tnmtTime = new Date(Date.now() + unit * 60 * 1000).toISOString();

    const newConfig: TournamentConfig = {
      tournament: TournamentState.Recruiting,
      phase: 0,
      tnmtType: type,
      tnmtMsg: "",
      tnmtAuto: true,
      tnmtTime,
      develcost,
      lastTournamentBettingId: currentConfig.lastTournamentBettingId,
    };

    await this.saveTournamentConfig(newConfig);

    // Clear old participants
    await this.prisma.storage.deleteMany({
      where: { namespace: "tournament_participants" },
    });

    return { result: true, config: newConfig };
  }

  /**
   * Get tournament history (past winners)
   */
  async getTournamentHistory(limit: number = 10) {
    const history = await this.prisma.storage.findMany({
      where: { namespace: "tournament_history" },
      orderBy: { id: "desc" },
      take: limit,
    });

    return {
      result: true,
      history: history.map((h) => h.value),
    };
  }

  // ============ Private Helper Methods ============

  private async getTournamentConfig(): Promise<TournamentConfig> {
    const storage = await this.prisma.storage.findFirst({
      where: { namespace: "game_env", key: "tournament_config" },
    });

    if (!storage) {
      return {
        tournament: TournamentState.None,
        phase: 0,
        tnmtType: TournamentType.Total,
        tnmtMsg: "",
        tnmtAuto: true,
        tnmtTime: new Date().toISOString(),
        develcost: 100,
        lastTournamentBettingId: 0,
      };
    }

    return storage.value as unknown as TournamentConfig;
  }

  private async saveTournamentConfig(config: TournamentConfig): Promise<void> {
    await this.prisma.storage.upsert({
      where: { namespace_key: { namespace: "game_env", key: "tournament_config" } },
      update: { value: config as object },
      create: { namespace: "game_env", key: "tournament_config", value: config as object },
    });
  }

  private async getParticipants(): Promise<TournamentParticipant[]> {
    const storage = await this.prisma.storage.findMany({
      where: { namespace: "tournament_participants" },
    });

    return storage.map((s) => s.value as unknown as TournamentParticipant);
  }

  private async getGameEnv() {
    const storage = await this.prisma.storage.findMany({
      where: {
        namespace: "game_env",
        key: { in: ["year", "month", "turn_term"] },
      },
    });

    const year = (storage.find((s) => s.key === "year")?.value as number) || 184;
    const month = (storage.find((s) => s.key === "month")?.value as number) || 1;
    const turnTerm = (storage.find((s) => s.key === "turn_term")?.value as number) || 60;

    return { year, month, turnTerm };
  }

  private findEmptySlot(participants: TournamentParticipant[]): { grp: number; grpNo: number } {
    const grpCount = new Array(8).fill(0);

    for (const p of participants) {
      if (p.grp >= 0 && p.grp < 8) {
        grpCount[p.grp]++;
      }
    }

    // Find group with fewest participants
    let minGrp = 0;
    let minCount = grpCount[0];

    for (let i = 1; i < 8; i++) {
      if (grpCount[i] < minCount) {
        minGrp = i;
        minCount = grpCount[i];
      }
    }

    if (minCount >= 8) {
      return { grp: -1, grpNo: -1 };
    }

    return { grp: minGrp, grpNo: minCount };
  }

  private groupByGrp(
    participants: TournamentParticipant[]
  ): Record<number, TournamentParticipant[]> {
    const groups: Record<number, TournamentParticipant[]> = {};

    for (const p of participants) {
      if (!groups[p.grp]) groups[p.grp] = [];
      groups[p.grp].push(p);
    }

    // Sort by grpNo
    for (const grp of Object.keys(groups)) {
      groups[Number(grp)].sort((a, b) => a.grpNo - b.grpNo);
    }

    return groups;
  }

  private groupKnockout(participants: TournamentParticipant[]) {
    const round16 = participants.filter((p) => p.grp >= 20 && p.grp < 28);
    const quarterfinals = participants.filter((p) => p.grp >= 30 && p.grp < 34);
    const semifinals = participants.filter((p) => p.grp >= 40 && p.grp < 42);
    const finals = participants.filter((p) => p.grp >= 50 && p.grp < 60);
    const champion = participants.filter((p) => p.grp >= 60);

    return {
      round16: this.formatBracket(round16, 8),
      quarterfinals: this.formatBracket(quarterfinals, 4),
      semifinals: this.formatBracket(semifinals, 2),
      finals: this.formatBracket(finals, 1),
      champion: champion[0] || null,
    };
  }

  private formatBracket(participants: TournamentParticipant[], matchCount: number) {
    const matches: Array<{ p1: TournamentParticipant | null; p2: TournamentParticipant | null }> =
      [];

    for (let i = 0; i < matchCount; i++) {
      const p1 = participants.find((p) => p.grpNo === 0 && p.grp % 10 === i) || null;
      const p2 = participants.find((p) => p.grpNo === 1 && p.grp % 10 === i) || null;
      matches.push({ p1, p2 });
    }

    return matches;
  }
}
