import { Injectable } from "@nestjs/common";
import { createPrismaClient } from "@sammo/infra";

export interface NPCPolicy {
  reqNationGold: number;
  reqNationRice: number;
  reqHumanWarUrgentGold: number;
  reqHumanWarUrgentRice: number;
  reqHumanWarRecommandGold: number;
  reqHumanWarRecommandRice: number;
  reqHumanDevelGold: number;
  reqHumanDevelRice: number;
  reqNPCWarGold: number;
  reqNPCWarRice: number;
  reqNPCDevelGold: number;
  reqNPCDevelRice: number;
  minimumResourceActionAmount: number;
  maximumResourceActionAmount: number;
  minWarCrew: number;
  minNPCRecruitCityPopulation: number;
  safeRecruitCityPopulationRatio: number;
  minNPCWarLeadership: number;
  properWarTrainAtmos: number;
  cureThreshold: number;
}

@Injectable()
export class NPCService {
  private readonly prisma = createPrismaClient();

  async getNPCControl(nationId: number) {
    const nation = await this.prisma.nation.findUnique({
      where: { nation: nationId },
      select: { aux: true },
    });

    if (!nation) throw new Error("국가 정보가 없습니다.");

    const aux = (nation.aux as any) || {};
    const policies: NPCPolicy = aux.npcPolicies || {
      reqNationGold: 50000,
      reqNationRice: 50000,
      reqHumanWarUrgentGold: 0,
      reqHumanWarUrgentRice: 0,
      reqHumanWarRecommandGold: 0,
      reqHumanWarRecommandRice: 0,
      reqHumanDevelGold: 3000,
      reqHumanDevelRice: 3000,
      reqNPCWarGold: 0,
      reqNPCWarRice: 0,
      reqNPCDevelGold: 600,
      reqNPCDevelRice: 500,
      minimumResourceActionAmount: 500,
      maximumResourceActionAmount: 10000,
      minWarCrew: 500,
      minNPCRecruitCityPopulation: 10000,
      safeRecruitCityPopulationRatio: 0.4,
      minNPCWarLeadership: 60,
      properWarTrainAtmos: 80,
      cureThreshold: 50,
    };

    const chiefPriorityList: string[] = aux.npcChiefPriority || [
      "유저장긴급포상",
      "유저장구출발령",
      "유저장후방발령",
      "유저장전방발령",
      "유저장포상",
      "NPC긴급포상",
      "NPC구출발령",
      "NPC후방발령",
      "NPC포상",
      "NPC전방발령",
      "유저장내정발령",
      "NPC내정발령",
      "NPC몰수",
    ];

    const generalPriorityList: string[] = aux.npcGeneralPriority || [
      "NPC사망대비",
      "귀환",
      "금쌀구매",
      "출병",
      "긴급내정",
      "전투준비",
      "전방워프",
      "NPC헌납",
      "징병",
      "후방워프",
      "전쟁내정",
      "소집해제",
      "일반내정",
      "내정워프",
    ];

    const lastSetters = aux.npcLastSetters || {
      policy: { setter: null, date: null },
      nation: { setter: null, date: null },
      general: { setter: null, date: null },
    };

    return {
      policies,
      chiefPriorityList,
      generalPriorityList,
      lastSetters,
    };
  }

  async updateNPCControl(
    nationId: number,
    generalId: number,
    data: {
      policies?: Record<string, any>;
      chiefPriorityList?: string[];
      generalPriorityList?: string[];
      type: "nationPolicy" | "nationPriority" | "generalPriority";
    }
  ) {
    // 권한 확인 (수뇌부 이상)
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { nationId: true, officerLevel: true, name: true },
    });

    if (!general || general.nationId !== nationId) {
      throw new Error("해당 국가 소속이 아닙니다.");
    }
    if (general.officerLevel < 5) {
      throw new Error("수뇌부 이상만 NPC 정책을 설정할 수 있습니다.");
    }

    const nation = await this.prisma.nation.findUnique({
      where: { nation: nationId },
    });

    if (!nation) throw new Error("국가 정보가 없습니다.");

    const aux = (nation.aux as any) || {};
    if (!aux.npcLastSetters) {
      aux.npcLastSetters = {
        policy: { setter: null, date: null },
        nation: { setter: null, date: null },
        general: { setter: null, date: null },
      };
    }

    const now = new Date().toISOString();

    if (data.type === "nationPolicy" && data.policies) {
      aux.npcPolicies = { ...(aux.npcPolicies || {}), ...data.policies };
      aux.npcLastSetters.policy = { setter: general.name, date: now };
    } else if (data.type === "nationPriority" && data.chiefPriorityList) {
      aux.npcChiefPriority = data.chiefPriorityList;
      aux.npcLastSetters.nation = { setter: general.name, date: now };
    } else if (data.type === "generalPriority" && data.generalPriorityList) {
      aux.npcGeneralPriority = data.generalPriorityList;
      aux.npcLastSetters.general = { setter: general.name, date: now };
    }

    return this.prisma.nation.update({
      where: { nation: nationId },
      data: { aux },
    });
  }
}
