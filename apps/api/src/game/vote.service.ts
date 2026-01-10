import { Injectable } from "@nestjs/common";
import { createPrismaClient } from "@sammo/infra";

interface VoteInfo {
  id: number;
  title: string;
  opener: string;
  multipleOptions: number;
  startDate: string;
  endDate: string | null;
  options: string[];
}

interface VoteResult {
  selection: number[];
  count: number;
}

interface VoteCommentData {
  id: number;
  voteId: number;
  generalId: number;
  nationId: number | null;
  generalName: string;
  nationName: string;
  text: string;
  date: string | null;
}

interface VoteCommentRecord {
  id: number;
  voteId: number;
  generalId: number;
  nationId: number | null;
  generalName: string;
  nationName: string;
  text: string;
  date: Date | null;
}

@Injectable()
export class VoteService {
  private readonly prisma = createPrismaClient();

  async getVoteList(): Promise<{ votes: Record<number, VoteInfo> }> {
    const storageEntries = await this.prisma.storage.findMany({
      where: {
        namespace: "vote",
        key: { startsWith: "vote_" },
      },
    });

    const votes: Record<number, VoteInfo> = {};
    for (const entry of storageEntries) {
      const voteId = parseInt(entry.key.substring(5), 10);
      if (!isNaN(voteId)) {
        votes[voteId] = entry.value as unknown as VoteInfo;
      }
    }

    return { votes };
  }

  async getVoteDetail(
    voteId: number,
    generalId?: number
  ): Promise<{
    voteInfo: VoteInfo | null;
    votes: VoteResult[];
    comments: VoteCommentData[];
    myVote: number[] | null;
    userCount: number;
  }> {
    const storageEntry = await this.prisma.storage.findUnique({
      where: {
        namespace_key: { namespace: "vote", key: `vote_${voteId}` },
      },
    });

    if (!storageEntry) {
      return {
        voteInfo: null,
        votes: [],
        comments: [],
        myVote: null,
        userCount: 0,
      };
    }

    const voteInfo = storageEntry.value as unknown as VoteInfo;

    const voteRecords = await this.prisma.vote.findMany({
      where: { voteId },
    });

    const selectionCounts = new Map<string, number>();
    for (const record of voteRecords) {
      const selectionKey = JSON.stringify(record.selection);
      selectionCounts.set(selectionKey, (selectionCounts.get(selectionKey) || 0) + 1);
    }

    const votes: VoteResult[] = Array.from(selectionCounts.entries()).map(([key, count]) => ({
      selection: JSON.parse(key) as number[],
      count,
    }));

    const commentRecords = await this.prisma.voteComment.findMany({
      where: { voteId },
      orderBy: { id: "asc" },
    });

    const comments: VoteCommentData[] = commentRecords.map((c: VoteCommentRecord) => ({
      id: c.id,
      voteId: c.voteId,
      generalId: c.generalId,
      nationId: c.nationId,
      generalName: c.generalName,
      nationName: c.nationName,
      text: c.text,
      date: c.date?.toISOString() ?? null,
    }));

    let myVote: number[] | null = null;
    if (generalId) {
      const myVoteRecord = await this.prisma.vote.findUnique({
        where: { generalId_voteId: { generalId, voteId } },
      });
      if (myVoteRecord) {
        myVote = myVoteRecord.selection as number[];
      }
    }

    const userCount = await this.prisma.general.count({
      where: { npc: { lt: 2 } },
    });

    return {
      voteInfo,
      votes,
      comments,
      myVote,
      userCount,
    };
  }

  async vote(
    voteId: number,
    generalId: number,
    selection: number[]
  ): Promise<{ success: boolean; message?: string; reward?: number }> {
    if (!selection || selection.length === 0) {
      return { success: false, message: "No selection provided" };
    }

    const storageEntry = await this.prisma.storage.findUnique({
      where: {
        namespace_key: { namespace: "vote", key: `vote_${voteId}` },
      },
    });

    if (!storageEntry) {
      return { success: false, message: "Vote not found" };
    }

    const voteInfo = storageEntry.value as unknown as VoteInfo;

    if (voteInfo.endDate) {
      const endDate = new Date(voteInfo.endDate);
      if (endDate < new Date()) {
        return { success: false, message: "Vote has ended" };
      }
    }

    if (voteInfo.multipleOptions >= 1 && selection.length > voteInfo.multipleOptions) {
      return { success: false, message: "Too many selections" };
    }

    const optionsCount = voteInfo.options.length;
    for (const sel of selection) {
      if (sel < 0 || sel >= optionsCount) {
        return { success: false, message: "Invalid selection" };
      }
    }

    selection.sort((a, b) => a - b);

    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { nationId: true },
    });

    if (!general) {
      return { success: false, message: "General not found" };
    }

    try {
      await this.prisma.vote.create({
        data: {
          voteId,
          generalId,
          nationId: general.nationId,
          selection,
        },
      });
    } catch {
      return { success: false, message: "Already voted" };
    }

    const gameEnv = await this.prisma.storage.findUnique({
      where: {
        namespace_key: { namespace: "game_env", key: "develcost" },
      },
    });
    const develCost = (gameEnv?.value as number) ?? 100;
    const voteReward = develCost * 5;

    await this.prisma.general.update({
      where: { no: generalId },
      data: { gold: { increment: voteReward } },
    });

    return { success: true, reward: voteReward };
  }

  async createVote(
    opener: string,
    title: string,
    options: string[],
    multipleOptions: number = 1,
    endDate?: string,
    keepOldVote: boolean = false
  ): Promise<{ success: boolean; voteId?: number; message?: string }> {
    if (!options || options.length === 0) {
      return { success: false, message: "No options provided" };
    }

    if (endDate) {
      const oEndDate = new Date(endDate);
      if (oEndDate < new Date()) {
        return { success: false, message: "End date is in the past" };
      }
    }

    const lastVoteEntry = await this.prisma.storage.findUnique({
      where: {
        namespace_key: { namespace: "game_env", key: "lastVote" },
      },
    });
    const lastVoteId = (lastVoteEntry?.value as number) ?? 0;
    const newVoteId = lastVoteId + 1;

    if (!keepOldVote && lastVoteId > 0) {
      await this.closeVote(lastVoteId);
    }

    const clampedMultipleOptions = Math.max(0, Math.min(multipleOptions, options.length));

    const now = new Date().toISOString();
    const voteInfo: VoteInfo = {
      id: newVoteId,
      title,
      opener,
      multipleOptions: clampedMultipleOptions,
      startDate: now,
      endDate: endDate ?? null,
      options,
    };

    await this.prisma.storage.upsert({
      where: {
        namespace_key: { namespace: "vote", key: `vote_${newVoteId}` },
      },
      update: { value: voteInfo as object },
      create: { namespace: "vote", key: `vote_${newVoteId}`, value: voteInfo as object },
    });

    await this.prisma.storage.upsert({
      where: {
        namespace_key: { namespace: "game_env", key: "lastVote" },
      },
      update: { value: newVoteId },
      create: { namespace: "game_env", key: "lastVote", value: newVoteId },
    });

    await this.prisma.general.updateMany({
      data: { newVote: 1 },
    });

    return { success: true, voteId: newVoteId };
  }

  private async closeVote(voteId: number): Promise<void> {
    const storageEntry = await this.prisma.storage.findUnique({
      where: {
        namespace_key: { namespace: "vote", key: `vote_${voteId}` },
      },
    });

    if (!storageEntry) return;

    const voteInfo = storageEntry.value as unknown as VoteInfo;
    if (voteInfo.endDate) return;

    voteInfo.endDate = new Date().toISOString();

    await this.prisma.storage.update({
      where: {
        namespace_key: { namespace: "vote", key: `vote_${voteId}` },
      },
      data: { value: voteInfo as object },
    });
  }

  async addComment(
    voteId: number,
    generalId: number,
    text: string
  ): Promise<{ success: boolean; message?: string }> {
    const truncatedText = text.slice(0, 200);

    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: {
        name: true,
        nationId: true,
        nation: { select: { name: true } },
      },
    });

    if (!general) {
      return { success: false, message: "General not found" };
    }

    await this.prisma.voteComment.create({
      data: {
        voteId,
        generalId,
        nationId: general.nationId,
        generalName: general.name,
        nationName: general.nation?.name ?? "None",
        text: truncatedText,
        date: new Date(),
      },
    });

    return { success: true };
  }
}
