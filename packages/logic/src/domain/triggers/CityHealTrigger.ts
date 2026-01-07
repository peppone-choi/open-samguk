import { Trigger, TriggerContext, TriggerResult, TriggerPriority } from "../Trigger.js";
import { JosaUtil } from "@sammo/common";

/**
 * 도시 치료 트리거 (의술 특기)
 * 레거시: legacy/hwe/sammo/GeneralTrigger/che_도시치료.php
 * Priority: 10010
 */
export class CityHealTrigger implements Trigger {
  readonly name = "도시치료";
  readonly priority = TriggerPriority.BEGIN + 10;

  attempt(_ctx: TriggerContext): boolean {
    return true;
  }

  execute(ctx: TriggerContext): TriggerResult {
    const actor = ctx.snapshot.generals[ctx.actorId];
    if (!actor) {
      return { delta: {}, continueExecution: true };
    }

    const logs: string[] = [];
    const generalUpdates: Record<number, { injury: number }> = {};

    if (actor.injury > 0) {
      generalUpdates[ctx.actorId] = { injury: 0 };
      ctx.env["pre.부상경감"] = true;
      ctx.env["pre.치료"] = true;
      logs.push("<C>의술</>을 펼쳐 스스로 치료합니다!");
    }

    const patients = this.findPatientsInCity(ctx, actor);
    const curedPatients = this.healPatients(ctx, patients, generalUpdates);

    if (curedPatients.length > 0) {
      logs.push(this.formatHealLog(curedPatients));
    }

    return {
      delta: {
        generals: generalUpdates,
        logs: { general: { [ctx.actorId]: logs } },
      },
      continueExecution: true,
    };
  }

  private findPatientsInCity(
    ctx: TriggerContext,
    actor: { cityId: number; nationId: number }
  ): Array<{ id: number; name: string }> {
    const patients: Array<{ id: number; name: string }> = [];

    for (const [id, general] of Object.entries(ctx.snapshot.generals)) {
      const generalId = Number(id);
      if (generalId === ctx.actorId) continue;
      if (general.cityId !== actor.cityId) continue;
      if (general.injury <= 10) continue;
      if (actor.nationId === 0 && general.nationId !== 0) continue;

      patients.push({ id: generalId, name: general.name });
    }

    return patients;
  }

  private healPatients(
    ctx: TriggerContext,
    patients: Array<{ id: number; name: string }>,
    generalUpdates: Record<number, { injury: number }>
  ): Array<{ id: number; name: string }> {
    const cured: Array<{ id: number; name: string }> = [];

    for (const patient of patients) {
      if (!ctx.rand.nextBool(0.5)) continue;
      generalUpdates[patient.id] = { injury: 0 };
      cured.push(patient);
    }

    return cured;
  }

  private formatHealLog(curedPatients: Array<{ name: string }>): string {
    const lastName = curedPatients[curedPatients.length - 1].name;

    if (curedPatients.length === 1) {
      const josaUl = JosaUtil.pick(lastName, "을");
      return `<C>의술</>을 펼쳐 도시의 장수 <Y>${lastName}</>${josaUl} 치료합니다!`;
    }

    const otherCount = curedPatients.length - 1;
    return `<C>의술</>을 펼쳐 도시의 장수들 <Y>${lastName}</> 외 <C>${otherCount}</>명을 치료합니다!`;
  }
}
