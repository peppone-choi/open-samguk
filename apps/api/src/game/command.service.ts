import { Injectable } from "@nestjs/common";
import { createPrismaClient, type PrismaClientType } from "@sammo/infra";

const COMMAND_CONSTANTS = {
  maxTurn: 48,
  defaultAction: "휴식",
  TURN_ODD: -1,
  TURN_EVEN: -2,
  TURN_ALL: -3,
};

interface GeneralAux {
  autorun_limit?: number | null;
  [key: string]: unknown;
}

interface CommandInfo {
  action: string;
  brief: string;
  arg: Record<string, unknown>;
}

interface ReserveResult {
  result: boolean;
  reason: string;
  brief?: string;
}

interface ReserveBulkResult {
  result: boolean;
  briefList: Record<number, string>;
  reason: string;
  errorIdx?: number;
}

type TransactionClient = Omit<
  PrismaClientType,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

@Injectable()
export class CommandService {
  private readonly prisma: PrismaClientType = createPrismaClient();

  async pushCommand(generalId: number, amount: number): Promise<{ result: boolean }> {
    if (amount === 0) {
      return { result: false };
    }

    if (amount < 0) {
      return this.pullCommand(generalId, -amount);
    }

    if (amount >= COMMAND_CONSTANTS.maxTurn) {
      return { result: false };
    }

    const existingTurns = await this.prisma.generalTurn.findMany({
      where: { generalId },
      orderBy: { turnIdx: "desc" },
    });

    if (existingTurns.length === 0) {
      return { result: true };
    }

    await this.prisma.$transaction(async (tx: TransactionClient) => {
      for (const turn of existingTurns as any[]) {
        const newTurnIdx = turn.turnIdx + amount;
        if (newTurnIdx >= COMMAND_CONSTANTS.maxTurn) {
          await tx.generalTurn.update({
            where: { generalId_turnIdx: { generalId, turnIdx: turn.turnIdx } },
            data: {
              turnIdx: newTurnIdx - COMMAND_CONSTANTS.maxTurn,
              action: COMMAND_CONSTANTS.defaultAction,
              arg: {},
              brief: COMMAND_CONSTANTS.defaultAction,
            },
          });
        } else {
          await tx.generalTurn.update({
            where: { generalId_turnIdx: { generalId, turnIdx: turn.turnIdx } },
            data: { turnIdx: newTurnIdx },
          });
        }
      }
    });

    return { result: true };
  }

  private async pullCommand(generalId: number, amount: number): Promise<{ result: boolean }> {
    if (amount === 0) {
      return { result: false };
    }

    if (amount >= COMMAND_CONSTANTS.maxTurn) {
      return { result: false };
    }

    const existingTurns = await this.prisma.generalTurn.findMany({
      where: { generalId },
      orderBy: { turnIdx: "asc" },
    });

    if (existingTurns.length === 0) {
      return { result: true };
    }

    await this.prisma.$transaction(async (tx: TransactionClient) => {
      for (const turn of existingTurns as any[]) {
        const newTurnIdx = turn.turnIdx - amount;
        if (newTurnIdx < 0) {
          await tx.generalTurn.update({
            where: { generalId_turnIdx: { generalId, turnIdx: turn.turnIdx } },
            data: {
              turnIdx: newTurnIdx + COMMAND_CONSTANTS.maxTurn,
              action: COMMAND_CONSTANTS.defaultAction,
              arg: {},
              brief: COMMAND_CONSTANTS.defaultAction,
            },
          });
        } else {
          await tx.generalTurn.update({
            where: { generalId_turnIdx: { generalId, turnIdx: turn.turnIdx } },
            data: { turnIdx: newTurnIdx },
          });
        }
      }
    });

    return { result: true };
  }

  async repeatCommand(generalId: number, amount: number): Promise<{ result: boolean }> {
    if (amount <= 0) {
      return { result: false };
    }

    if (amount >= COMMAND_CONSTANTS.maxTurn) {
      return { result: false };
    }

    let reqTurn = amount;
    if (amount * 2 > COMMAND_CONSTANTS.maxTurn) {
      reqTurn = COMMAND_CONSTANTS.maxTurn - amount;
    }

    const sourceTurns = await this.prisma.generalTurn.findMany({
      where: {
        generalId,
        turnIdx: { lt: reqTurn },
      },
      orderBy: { turnIdx: "asc" },
    });

    if (sourceTurns.length === 0) {
      return { result: true };
    }

    await this.prisma.$transaction(async (tx: TransactionClient) => {
      for (const turn of sourceTurns as any[]) {
        const turnIdx = turn.turnIdx;
        const targetIndices: number[] = [];
        for (let i = turnIdx + amount; i < COMMAND_CONSTANTS.maxTurn; i += amount) {
          targetIndices.push(i);
        }

        for (const targetIdx of targetIndices) {
          await tx.generalTurn.upsert({
            where: { generalId_turnIdx: { generalId, turnIdx: targetIdx } },
            update: {
              action: turn.action,
              arg: turn.arg as object,
              brief: turn.brief,
            },
            create: {
              generalId,
              turnIdx: targetIdx,
              action: turn.action,
              arg: turn.arg as object,
              brief: turn.brief,
            },
          });
        }
      }
    });

    return { result: true };
  }

  async getReservedCommands(generalId: number): Promise<{
    result: boolean;
    turnTime: Date | null;
    turnTerm: number;
    year: number;
    month: number;
    date: string;
    turn: Record<number, CommandInfo>;
    autorun_limit: number | null;
    editable: boolean;
  }> {
    const [turnTermEntry, yearEntry, monthEntry, lastExecuteEntry] = await Promise.all([
      this.prisma.storage.findUnique({
        where: { namespace_key: { namespace: "game_env", key: "turnterm" } },
      }),
      this.prisma.storage.findUnique({
        where: { namespace_key: { namespace: "game_env", key: "year" } },
      }),
      this.prisma.storage.findUnique({
        where: { namespace_key: { namespace: "game_env", key: "month" } },
      }),
      this.prisma.storage.findUnique({
        where: { namespace_key: { namespace: "game_env", key: "turntime" } },
      }),
    ]);

    const turnTerm = (turnTermEntry?.value as number) ?? 10;
    let year = (yearEntry?.value as number) ?? 184;
    let month = (monthEntry?.value as number) ?? 1;
    const lastExecute = lastExecuteEntry?.value as string | null;

    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { turnTime: true, aux: true },
    });

    const generalAux = (general?.aux as unknown as GeneralAux) ?? {};
    const turnTime = general?.turnTime ?? null;

    if (turnTime && lastExecute) {
      const turnTimeMinutes = Math.floor(new Date(turnTime).getTime() / (turnTerm * 60 * 1000));
      const lastExecuteMinutes = Math.floor(
        new Date(lastExecute).getTime() / (turnTerm * 60 * 1000)
      );

      if (turnTimeMinutes > lastExecuteMinutes) {
        month++;
        if (month >= 13) {
          month -= 12;
          year += 1;
        }
      }
    }

    const rawTurns = await this.prisma.generalTurn.findMany({
      where: { generalId },
      orderBy: { turnIdx: "asc" },
    });

    const commandList: Record<number, CommandInfo> = {};
    let invalidTurnList = 0;

    for (const turn of rawTurns as any[]) {
      let turnIdx = turn.turnIdx;

      if (turnIdx < 0) {
        invalidTurnList = -1;
        turnIdx += COMMAND_CONSTANTS.maxTurn;
      } else if (turnIdx >= COMMAND_CONSTANTS.maxTurn) {
        invalidTurnList = 1;
        turnIdx -= COMMAND_CONSTANTS.maxTurn;
      }

      commandList[turnIdx] = {
        action: turn.action,
        brief: turn.brief ?? turn.action,
        arg: (turn.arg as Record<string, unknown>) ?? {},
      };
    }

    if (invalidTurnList !== 0) {
      if (invalidTurnList > 0) {
        await this.prisma.generalTurn.updateMany({
          where: {
            generalId,
            turnIdx: { gte: COMMAND_CONSTANTS.maxTurn },
          },
          data: {
            turnIdx: { decrement: COMMAND_CONSTANTS.maxTurn },
          },
        });
      } else {
        await this.prisma.generalTurn.updateMany({
          where: {
            generalId,
            turnIdx: { lt: 0 },
          },
          data: {
            turnIdx: { increment: COMMAND_CONSTANTS.maxTurn },
          },
        });
      }
    }

    return {
      result: true,
      turnTime,
      turnTerm,
      year,
      month,
      date: new Date().toISOString(),
      turn: commandList,
      autorun_limit: generalAux.autorun_limit ?? null,
      editable: true,
    };
  }

  async reserveCommand(
    generalId: number,
    turnList: number[],
    action: string,
    arg: Record<string, unknown> = {}
  ): Promise<ReserveResult> {
    const expandedTurnList: Set<number> = new Set();

    for (const turnIdx of turnList) {
      if (turnIdx < -3 || turnIdx >= COMMAND_CONSTANTS.maxTurn) {
        return {
          result: false,
          reason: `올바른 턴이 아닙니다: ${turnIdx}`,
        };
      }

      if (turnIdx >= 0) {
        expandedTurnList.add(turnIdx);
      } else if (turnIdx === COMMAND_CONSTANTS.TURN_ODD) {
        for (let i = 0; i < COMMAND_CONSTANTS.maxTurn; i += 2) {
          expandedTurnList.add(i);
        }
      } else if (turnIdx === COMMAND_CONSTANTS.TURN_EVEN) {
        for (let i = 1; i < COMMAND_CONSTANTS.maxTurn; i += 2) {
          expandedTurnList.add(i);
        }
      } else if (turnIdx === COMMAND_CONSTANTS.TURN_ALL) {
        for (let i = 0; i < COMMAND_CONSTANTS.maxTurn; i++) {
          expandedTurnList.add(i);
        }
      }
    }

    if (expandedTurnList.size === 0) {
      return {
        result: false,
        reason: "턴이 입력되지 않았습니다",
      };
    }

    const brief = this.generateBrief(action, arg);
    const turnIndices = Array.from(expandedTurnList);

    await this.prisma.$transaction(
      turnIndices.map((turnIdx: number) =>
        this.prisma.generalTurn.upsert({
          where: { generalId_turnIdx: { generalId, turnIdx } },
          update: {
            action,
            arg: arg as object,
            brief,
          },
          create: {
            generalId,
            turnIdx,
            action,
            arg: arg as object,
            brief,
          },
        })
      )
    );

    return {
      result: true,
      reason: "success",
      brief,
    };
  }

  async reserveBulkCommand(
    generalId: number,
    commands: Array<{
      action: string;
      turnList: number[];
      arg?: Record<string, unknown>;
    }>
  ): Promise<ReserveBulkResult> {
    const briefList: Record<number, string> = {};

    for (let idx = 0; idx < commands.length; idx++) {
      const cmd = commands[idx];
      const arg = cmd.arg ?? {};

      if (!cmd.turnList || cmd.turnList.length === 0) {
        return {
          result: false,
          briefList,
          errorIdx: idx,
          reason: `${idx}: 턴이 입력되지 않았습니다`,
        };
      }

      const result = await this.reserveCommand(generalId, cmd.turnList, cmd.action, arg);

      if (!result.result) {
        return {
          result: false,
          briefList,
          errorIdx: idx,
          reason: result.reason,
        };
      }

      briefList[idx] = result.brief ?? cmd.action;
    }

    return {
      result: true,
      briefList,
      reason: "success",
    };
  }

  private generateBrief(action: string, arg: Record<string, unknown>): string {
    if (Object.keys(arg).length === 0) {
      return action;
    }

    const parts = [action];
    if (arg.destCityID) {
      parts.push(`(도시:${arg.destCityID})`);
    }
    if (arg.destGeneralID) {
      parts.push(`(장수:${arg.destGeneralID})`);
    }
    if (arg.amount) {
      parts.push(`(수량:${arg.amount})`);
    }

    return parts.join(" ");
  }
}
