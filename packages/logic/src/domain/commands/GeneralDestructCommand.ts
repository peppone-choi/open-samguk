import { RandUtil } from "@sammo-ts/common";
import { GeneralSabotageCommand } from "./GeneralSabotageCommand.js";
import { City as ICity, Delta } from "../entities.js";
import { GameConst } from "../GameConst.js";

/**
 * 파괴 커맨드
 * 레거시: che_파괴
 */
export class GeneralDestructCommand extends GeneralSabotageCommand {
  override readonly actionName = "파괴";
  override readonly statType = "strength";

  override affectDestCity(
    rng: RandUtil,
    destCity: ICity,
  ): { cityDelta: Delta<ICity>; successMsg: string } {
    const defDamage = Math.min(
      rng.nextRangeInt(
        GameConst.sabotageDamageMin,
        GameConst.sabotageDamageMax,
      ),
      destCity.def,
    );
    const wallDamage = Math.min(
      rng.nextRangeInt(
        GameConst.sabotageDamageMin,
        GameConst.sabotageDamageMax,
      ),
      destCity.wall,
    );

    const newDef = destCity.def - defDamage;
    const newWall = destCity.wall - wallDamage;

    return {
      cityDelta: {
        def: newDef,
        wall: newWall,
        state: 32, // 파괴 상태 (임시)
      },
      successMsg: `도시의 수비가 ${defDamage}, 성벽이 ${wallDamage}만큼 감소했습니다.`,
    };
  }
}
