import { Injectable } from "@nestjs/common";
import { createPrismaClient, type PrismaClientType } from "@sammo/infra";

const MAX_CHIEF_TURN = 12; // 최대 예약 턴 수
const MIN_OFFICER_LEVEL_FOR_CHIEF = 5; // 수뇌부 최소 관직 레벨

/** 국가 커맨드 예약 입력 */
export interface ReserveCommandInput {
  action: string;
  turnList: number[];
  arg?: Record<string, any>;
}

/** 예약 결과 */
export interface ReserveCommandResult {
  result: boolean;
  brief?: string;
  reason?: string;
}

@Injectable()
export class NationCommandService {
  private readonly prisma: PrismaClientType = createPrismaClient();

  /**
   * 예약된 국가 커맨드 조회 (수뇌부용)
   */
  async getReservedCommand(generalId: number) {
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { nationId: true, officerLevel: true },
    });

    if (!general) throw new Error("장수 정보가 없습니다.");
    if (!general.nationId) throw new Error("국가에 소속되어 있지 않습니다.");
    if (general.officerLevel < MIN_OFFICER_LEVEL_FOR_CHIEF) {
      throw new Error("수뇌부가 아닙니다.");
    }

    const nationId = general.nationId;

    // 게임 환경 정보
    const gameEnvStorage = await this.prisma.storage.findMany({
      where: { namespace: "game_env", key: { in: ["turnterm", "year", "month", "turntime"] } },
    });
    const gameEnv: Record<string, any> = {};
    for (const item of gameEnvStorage) {
      gameEnv[item.key] = item.value;
    }

    // 수뇌부 장수 목록 (officer_level >= 5)
    const chiefGenerals = await this.prisma.general.findMany({
      where: { nationId, officerLevel: { gte: MIN_OFFICER_LEVEL_FOR_CHIEF } },
      select: {
        no: true,
        name: true,
        officerLevel: true,
        turnTime: true,
        npc: true,
      },
      orderBy: { officerLevel: "desc" },
    });

    // 국가 턴 목록
    const nationTurns = await this.prisma.nationTurn.findMany({
      where: { nationId },
      orderBy: [{ officerLevel: "desc" }, { turnIdx: "asc" }],
    });

    // officer_level별로 그룹화
    const nationTurnList: Record<number, Record<number, any>> = {};
    for (const turn of nationTurns) {
      if (!nationTurnList[turn.officerLevel]) {
        nationTurnList[turn.officerLevel] = {};
      }
      // 턴 인덱스 정규화 (0 ~ MAX_CHIEF_TURN-1)
      let turnIdx = turn.turnIdx;
      if (turnIdx < 0) turnIdx += MAX_CHIEF_TURN;
      if (turnIdx >= MAX_CHIEF_TURN) turnIdx -= MAX_CHIEF_TURN;

      nationTurnList[turn.officerLevel][turnIdx] = {
        action: turn.action,
        brief: turn.brief,
        arg: turn.arg,
      };
    }

    // 부대 목록
    const troops = await this.prisma.troop.findMany({
      where: { nationId },
      select: { troopLeader: true, name: true },
    });
    const troopList: Record<number, string> = {};
    for (const troop of troops) {
      troopList[troop.troopLeader] = troop.name;
    }

    // 국가 레벨
    const nation = await this.prisma.nation.findUnique({
      where: { nation: nationId },
      select: { level: true },
    });

    // 수뇌부 정보 구성
    const chiefList: Record<number, any> = {};
    for (const chief of chiefGenerals) {
      chiefList[chief.officerLevel] = {
        name: chief.name,
        turnTime: chief.turnTime,
        officerLevel: chief.officerLevel,
        officerLevelText: this.getOfficerLevelText(chief.officerLevel, nation?.level ?? 0),
        npcType: chief.npc,
        turn: nationTurnList[chief.officerLevel] || {},
      };
    }

    // 비어있는 수뇌부 자리 처리
    for (const officerLevel of Object.keys(nationTurnList).map(Number)) {
      if (!chiefList[officerLevel]) {
        chiefList[officerLevel] = {
          name: null,
          turnTime: null,
          officerLevelText: this.getOfficerLevelText(officerLevel, nation?.level ?? 0),
          npcType: null,
          turn: nationTurnList[officerLevel],
        };
      }
    }

    return {
      result: true,
      lastExecute: gameEnv.turntime,
      year: gameEnv.year,
      month: gameEnv.month,
      turnTerm: gameEnv.turnterm,
      date: new Date().toISOString(),
      chiefList,
      troopList,
      isChief: general.officerLevel >= MIN_OFFICER_LEVEL_FOR_CHIEF,
      officerLevel: general.officerLevel,
      editable: true,
    };
  }

  /**
   * 국가 커맨드 예약
   */
  async reserveCommand(
    generalId: number,
    input: ReserveCommandInput
  ): Promise<ReserveCommandResult> {
    const { action, turnList, arg = {} } = input;

    if (!turnList || turnList.length === 0) {
      return { result: false, reason: "턴이 입력되지 않았습니다." };
    }

    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { nationId: true, officerLevel: true, name: true },
    });

    if (!general) return { result: false, reason: "장수 정보가 없습니다." };
    if (!general.nationId) return { result: false, reason: "국가에 소속되어 있지 않습니다." };
    if (general.officerLevel < MIN_OFFICER_LEVEL_FOR_CHIEF) {
      return { result: false, reason: "수뇌부가 아닙니다." };
    }

    const nationId = general.nationId;
    const officerLevel = general.officerLevel;

    // 커맨드 brief 생성 (간단한 설명)
    const brief = this.generateCommandBrief(action, arg);

    // 트랜잭션으로 턴 업데이트
    await (this.prisma as any).$transaction(async (tx: any) => {
      for (const turnIdx of turnList) {
        // 기존 턴 삭제 후 새로 생성 (upsert)
        await tx.nationTurn.upsert({
          where: {
            nationId_officerLevel_turnIdx: {
              nationId,
              officerLevel,
              turnIdx: this.normalizeTurnIdx(turnIdx),
            },
          },
          update: {
            action,
            arg,
            brief,
          },
          create: {
            nationId,
            officerLevel,
            turnIdx: this.normalizeTurnIdx(turnIdx),
            action,
            arg,
            brief,
          },
        });
      }
    });

    return { result: true, brief };
  }

  /**
   * 대량 커맨드 예약
   */
  async reserveBulkCommand(
    generalId: number,
    commands: ReserveCommandInput[]
  ): Promise<{
    result: boolean;
    briefList: Record<number, string>;
    errorIdx?: number;
    reason?: string;
  }> {
    const briefList: Record<number, string> = {};

    for (let idx = 0; idx < commands.length; idx++) {
      const cmd = commands[idx];
      const partialResult = await this.reserveCommand(generalId, cmd);

      if (!partialResult.result) {
        return {
          result: false,
          briefList,
          errorIdx: idx,
          reason: partialResult.reason,
        };
      }

      briefList[idx] = partialResult.brief || "";
    }

    return { result: true, briefList, reason: "success" };
  }

  /**
   * 커맨드 반복 (마지막 커맨드를 N턴 동안 반복)
   */
  async repeatCommand(generalId: number, amount: number) {
    if (amount < 1 || amount > MAX_CHIEF_TURN) {
      throw new Error(`반복 횟수는 1~${MAX_CHIEF_TURN} 사이여야 합니다.`);
    }

    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { nationId: true, officerLevel: true },
    });

    if (!general) throw new Error("장수 정보가 없습니다.");
    if (!general.nationId) throw new Error("국가에 소속되어 있지 않습니다.");
    if (general.officerLevel < MIN_OFFICER_LEVEL_FOR_CHIEF) {
      throw new Error("수뇌부가 아닙니다.");
    }

    const nationId = general.nationId;
    const officerLevel = general.officerLevel;

    // 현재 예약된 커맨드 조회
    const currentTurns = await this.prisma.nationTurn.findMany({
      where: { nationId, officerLevel },
      orderBy: { turnIdx: "asc" },
    });

    if (currentTurns.length === 0) {
      throw new Error("예약된 커맨드가 없습니다.");
    }

    // 마지막 턴의 커맨드 찾기
    const lastTurn = currentTurns[currentTurns.length - 1];
    const lastTurnIdx = lastTurn.turnIdx;

    // 다음 턴들에 동일한 커맨드 복사
    await (this.prisma as any).$transaction(async (tx: any) => {
      for (let i = 1; i <= amount; i++) {
        const newTurnIdx = this.normalizeTurnIdx(lastTurnIdx + i);
        await tx.nationTurn.upsert({
          where: {
            nationId_officerLevel_turnIdx: {
              nationId,
              officerLevel,
              turnIdx: newTurnIdx,
            },
          },
          update: {
            action: lastTurn.action,
            arg: lastTurn.arg ?? undefined,
            brief: lastTurn.brief,
          },
          create: {
            nationId,
            officerLevel,
            turnIdx: newTurnIdx,
            action: lastTurn.action,
            arg: lastTurn.arg ?? undefined,
            brief: lastTurn.brief,
          },
        });
      }
    });

    return { result: true };
  }

  /**
   * 커맨드 밀기/당기기 (모든 커맨드를 N턴 만큼 이동)
   */
  async pushCommand(generalId: number, amount: number) {
    if (amount === 0) {
      throw new Error("0은 불가능합니다.");
    }
    if (amount < -MAX_CHIEF_TURN || amount > MAX_CHIEF_TURN) {
      throw new Error(`이동량은 -${MAX_CHIEF_TURN}~${MAX_CHIEF_TURN} 사이여야 합니다.`);
    }

    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { nationId: true, officerLevel: true },
    });

    if (!general) throw new Error("장수 정보가 없습니다.");
    if (!general.nationId) throw new Error("국가에 소속되어 있지 않습니다.");
    if (general.officerLevel < MIN_OFFICER_LEVEL_FOR_CHIEF) {
      throw new Error("수뇌부가 아닙니다.");
    }

    const nationId = general.nationId;
    const officerLevel = general.officerLevel;

    // 현재 예약된 커맨드 조회
    const currentTurns = await this.prisma.nationTurn.findMany({
      where: { nationId, officerLevel },
      orderBy: { turnIdx: "asc" },
    });

    if (currentTurns.length === 0) {
      return { result: true }; // 이동할 것이 없음
    }

    // 트랜잭션으로 모든 턴 이동
    await (this.prisma as any).$transaction(async (tx: any) => {
      // 먼저 모든 기존 턴 삭제
      await tx.nationTurn.deleteMany({
        where: { nationId, officerLevel },
      });

      // 새로운 인덱스로 재생성
      for (const turn of currentTurns) {
        const newTurnIdx = this.normalizeTurnIdx(turn.turnIdx + amount);
        await tx.nationTurn.create({
          data: {
            nationId,
            officerLevel,
            turnIdx: newTurnIdx,
            action: turn.action,
            arg: turn.arg !== null ? turn.arg : undefined,
            brief: turn.brief,
          },
        });
      }
    });

    return { result: true };
  }

  /**
   * 특정 턴의 커맨드 삭제
   */
  async clearCommand(generalId: number, turnList: number[]) {
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { nationId: true, officerLevel: true },
    });

    if (!general) throw new Error("장수 정보가 없습니다.");
    if (!general.nationId) throw new Error("국가에 소속되어 있지 않습니다.");
    if (general.officerLevel < MIN_OFFICER_LEVEL_FOR_CHIEF) {
      throw new Error("수뇌부가 아닙니다.");
    }

    const nationId = general.nationId;
    const officerLevel = general.officerLevel;

    const normalizedTurnList = turnList.map((t) => this.normalizeTurnIdx(t));

    await this.prisma.nationTurn.deleteMany({
      where: {
        nationId,
        officerLevel,
        turnIdx: { in: normalizedTurnList },
      },
    });

    return { result: true, cleared: normalizedTurnList.length };
  }

  // ===== Helper Methods =====

  private normalizeTurnIdx(turnIdx: number): number {
    let normalized = turnIdx % MAX_CHIEF_TURN;
    if (normalized < 0) normalized += MAX_CHIEF_TURN;
    return normalized;
  }

  private generateCommandBrief(action: string, _arg?: Record<string, any>): string {
    void _arg; // Mark as intentionally unused
    // 간단한 brief 생성 로직
    // 실제로는 logic 패키지의 CommandFactory를 사용해야 함
    const briefMap: Record<string, string> = {
      che_발령: "발령",
      che_징병: "징병",
      che_훈련: "훈련",
      che_선양: "선양",
      che_천도: "천도",
      che_포상: "포상",
      che_몰수: "몰수",
      che_해임: "해임",
      che_등용: "등용",
      che_전쟁: "전쟁 선포",
      che_동맹: "동맹 제안",
      che_불가침: "불가침 제안",
      che_조공: "조공 제안",
    };

    return briefMap[action] || action;
  }

  private getOfficerLevelText(officerLevel: number, _nationLevel?: number): string {
    void _nationLevel; // Mark as intentionally unused
    // 관직 레벨에 따른 텍스트 반환
    const officerNames: Record<number, string> = {
      12: "군주",
      11: "승상",
      10: "참모",
      9: "장군",
      8: "군사",
      7: "시중",
      6: "태수",
      5: "장관",
    };
    return officerNames[officerLevel] || `레벨${officerLevel}`;
  }
}
