import { Injectable } from "@nestjs/common";
import { createPrismaClient, type PrismaClientType } from "@sammo/infra";
import { ScenarioLoader, InitialEventRunner, SnapshotRepository, DeltaUtil } from "@sammo/logic";
import type { WorldSnapshot } from "@sammo/logic";

interface InitWorldResult {
  success: boolean;
  message: string;
  stats?: {
    nations: number;
    cities: number;
    generals: number;
    year: number;
    month: number;
  };
}

interface GameEnvInfo {
  year: number;
  month: number;
  turnterm: number;
  turntime: string | null;
  isunited: boolean;
  nationCount: number;
  generalCount: number;
  cityCount: number;
}

@Injectable()
export class AdminService {
  private readonly prisma: PrismaClientType = createPrismaClient();

  async initWorld(scenarioId: number): Promise<InitWorldResult> {
    try {
      const loader = new ScenarioLoader();
      const scenario = await loader.load(scenarioId);
      let snapshot = await loader.toWorldState(scenario);

      const eventRunner = new InitialEventRunner();
      const eventResult = eventRunner.runInitialEvents(scenario, snapshot);

      if (eventResult.delta && Object.keys(eventResult.delta).length > 0) {
        snapshot = DeltaUtil.apply(snapshot, eventResult.delta);
      }

      const repo = new SnapshotRepository(this.prisma);
      await repo.saveAll(snapshot);

      await this.initGameEnv(snapshot);

      return {
        success: true,
        message: `시나리오 ${scenarioId} 초기화 완료`,
        stats: {
          nations: Object.keys(snapshot.nations).length,
          cities: Object.keys(snapshot.cities).length,
          generals: Object.keys(snapshot.generals).length,
          year: snapshot.gameTime.year,
          month: snapshot.gameTime.month,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `초기화 실패: ${(error as Error).message}`,
      };
    }
  }

  private async initGameEnv(snapshot: WorldSnapshot): Promise<void> {
    const envKeys = [
      { key: "year", value: snapshot.gameTime.year },
      { key: "month", value: snapshot.gameTime.month },
      { key: "turnterm", value: 10 },
      { key: "startyear", value: snapshot.gameTime.year },
      { key: "isunited", value: false },
    ];

    for (const { key, value } of envKeys) {
      await this.prisma.storage.upsert({
        where: { namespace_key: { namespace: "game_env", key } },
        update: { value: value as any },
        create: { namespace: "game_env", key, value: value as any },
      });
    }

    for (const { key, value } of envKeys) {
      await this.prisma.storage.upsert({
        where: { namespace_key: { namespace: "game", key } },
        update: { value: value as any },
        create: { namespace: "game", key, value: value as any },
      });
    }
  }

  async getGameEnv(): Promise<GameEnvInfo> {
    const [yearEntry, monthEntry, turntermEntry, turntimeEntry, isunitedEntry] = await Promise.all([
      this.prisma.storage.findUnique({
        where: { namespace_key: { namespace: "game_env", key: "year" } },
      }),
      this.prisma.storage.findUnique({
        where: { namespace_key: { namespace: "game_env", key: "month" } },
      }),
      this.prisma.storage.findUnique({
        where: { namespace_key: { namespace: "game_env", key: "turnterm" } },
      }),
      this.prisma.storage.findUnique({
        where: { namespace_key: { namespace: "game_env", key: "turntime" } },
      }),
      this.prisma.storage.findUnique({
        where: { namespace_key: { namespace: "game_env", key: "isunited" } },
      }),
    ]);

    const nationCount = await this.prisma.nation.count();
    const generalCount = await this.prisma.general.count();
    const cityCount = await this.prisma.city.count();

    return {
      year: (yearEntry?.value as number) ?? 184,
      month: (monthEntry?.value as number) ?? 1,
      turnterm: (turntermEntry?.value as number) ?? 10,
      turntime: (turntimeEntry?.value as string) ?? null,
      isunited: (isunitedEntry?.value as boolean) ?? false,
      nationCount,
      generalCount,
      cityCount,
    };
  }

  async resetWorld(): Promise<{ success: boolean; message: string }> {
    try {
      await this.prisma.$transaction([
        this.prisma.generalTurn.deleteMany(),
        this.prisma.generalRecord.deleteMany(),
        this.prisma.generalAccessLog.deleteMany(),
        this.prisma.message.deleteMany(),
        this.prisma.diplomacy.deleteMany(),
        this.prisma.troop.deleteMany(),
        this.prisma.general.deleteMany(),
        this.prisma.city.deleteMany(),
        this.prisma.nation.deleteMany(),
        this.prisma.storage.deleteMany({ where: { namespace: "game" } }),
        this.prisma.storage.deleteMany({ where: { namespace: "game_env" } }),
      ]);

      return { success: true, message: "월드 초기화 완료" };
    } catch (error) {
      return { success: false, message: `초기화 실패: ${(error as Error).message}` };
    }
  }

  async listScenarios(): Promise<{ id: number; title: string }[]> {
    const loader = new ScenarioLoader();
    const scenarios: { id: number; title: string }[] = [];

    for (let i = 0; i <= 10; i++) {
      try {
        const scenario = await loader.load(i);
        scenarios.push({ id: i, title: scenario.title });
      } catch {
        continue;
      }
    }

    return scenarios;
  }
}
