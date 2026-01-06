import { General as IGeneral, Delta } from "../entities.js";
import { GameConst } from "../GameConst.js";

/**
 * 장수(General) 도메인 엔티티
 * DDD: Rich Domain Model을 지향하며 비즈니스 로직을 내포함
 */
export class General {
  private props: IGeneral;

  constructor(props: IGeneral) {
    this.props = { ...props };
  }

  /**
   * 훈련 수행 로직
   */
  public train(leadership: number): Delta<IGeneral> {
    const crew = Math.max(this.props.crew, 1);
    let score = Math.round(((leadership * 100) / crew) * GameConst.trainDelta);
    score = Math.min(
      score,
      Math.max(GameConst.maxTrainByCommand - this.props.train, 0),
    );

    const expGain = 100;
    const dedGain = 70;

    // 내부 상태 변경
    this.props.train += score;
    this.props.atmos = Math.min(
      this.props.atmos + GameConst.atmosSideEffectByTraining,
      100,
    );
    this.props.experience += expGain;
    this.props.dedication += dedGain;
    this.props.leadershipExp += 1;

    // 변경된 델타 반환
    return {
      train: this.props.train,
      atmos: this.props.atmos,
      experience: this.props.experience,
      dedication: this.props.dedication,
      leadershipExp: this.props.leadershipExp,
    };
  }

  /**
   * 농지 개간 수행 로직 (정치 능력치 활용)
   */
  public developAgriculture(politics: number): {
    delta: Delta<IGeneral>;
    agriGain: number;
  } {
    // 임시 로직: 정치력에 비례하여 개간 효율 결정
    const agriGain = Math.round(politics * 2);

    this.props.politicsExp += 1;
    this.props.experience += 50;

    return {
      agriGain,
      delta: {
        politicsExp: this.props.politicsExp,
        experience: this.props.experience,
      },
    };
  }

  /**
   * 상업 투자 수행 로직 (지력 능력치 활용)
   */
  public developCommerce(intel: number): {
    delta: Delta<IGeneral>;
    commGain: number;
  } {
    // 임시 로직: 지력에 비례하여 상업 효율 결정
    const commGain = Math.round(intel * 2);

    this.props.intelExp += 1;
    this.props.experience += 50;

    return {
      commGain,
      delta: {
        intelExp: this.props.intelExp,
        experience: this.props.experience,
      },
    };
  }

  /**
   * 치안 강화 수행 로직 (무력 능력치 활용)
   */
  public reinforceSecurity(strength: number): {
    delta: Delta<IGeneral>;
    secuGain: number;
  } {
    // 임시 로직: 무력에 비례하여 치안 효율 결정
    const secuGain = Math.round(strength * 2);

    this.props.strengthExp += 1;
    this.props.experience += 50;

    return {
      secuGain,
      delta: {
        strengthExp: this.props.strengthExp,
        experience: this.props.experience,
      },
    };
  }

  /**
   * 수비 강화 수행 로직 (무력 능력치 활용)
   */
  public strengthenDefense(strength: number): {
    delta: Delta<IGeneral>;
    defGain: number;
  } {
    // 임시 로직: 무력에 비례하여 수비 효율 결정
    const defGain = Math.round(strength * 2);

    this.props.strengthExp += 1;
    this.props.experience += 50;

    return {
      defGain,
      delta: {
        strengthExp: this.props.strengthExp,
        experience: this.props.experience,
      },
    };
  }

  /**
   * 성벽 보수 수행 로직 (무력 능력치 활용)
   */
  public repairWall(strength: number): {
    delta: Delta<IGeneral>;
    wallGain: number;
  } {
    // 임시 로직: 무력에 비례하여 성벽 효율 결정
    const wallGain = Math.round(strength * 2);

    this.props.strengthExp += 1;
    this.props.experience += 50;

    return {
      wallGain,
      delta: {
        strengthExp: this.props.strengthExp,
        experience: this.props.experience,
      },
    };
  }

  /**
   * 이동 수행 로직
   */
  public move(destCityId: number): Delta<IGeneral> {
    this.props.cityId = destCityId;
    this.props.atmos = Math.max(this.props.atmos - 10, 0); // 이동 시 사기 감소

    return {
      cityId: this.props.cityId,
      atmos: this.props.atmos,
    };
  }

  /**
   * 등용 시도 로직
   */
  public recruit(
    destGeneralExperience: number,
    destGeneralDedication: number,
  ): { delta: Delta<IGeneral>; reqGold: number } {
    // 임시 비용 계산 (레거시 참고)
    const reqGold =
      Math.round(100 + (destGeneralExperience + destGeneralDedication) / 1000) *
      10;

    this.props.gold = Math.max(this.props.gold - reqGold, 0);
    this.props.experience += 100;
    this.props.dedication += 200;
    this.props.leadershipExp += 1;

    return {
      reqGold,
      delta: {
        gold: this.props.gold,
        experience: this.props.experience,
        dedication: this.props.dedication,
        leadershipExp: this.props.leadershipExp,
      },
    };
  }

  /**
   * 모병/징병 시 병력 증가 및 훈련/사기 희석 로직
   */
  private addCrewWithDilution(newCrew: number): Delta<IGeneral> {
    const oldCrew = this.props.crew;
    const totalCrew = oldCrew + newCrew;

    if (totalCrew === 0) return {};

    // 훈련도/사기 희석 (새 병력은 훈련도 0, 사기 0으로 가정)
    const newTrain = Math.floor((this.props.train * oldCrew) / totalCrew);
    const newAtmos = Math.floor((this.props.atmos * oldCrew) / totalCrew);

    this.props.crew = totalCrew;
    this.props.train = newTrain;
    this.props.atmos = newAtmos;

    return {
      crew: this.props.crew,
      train: this.props.train,
      atmos: this.props.atmos,
    };
  }

  /**
   * 모병 수행 로직
   */
  public draft(leadership: number): {
    delta: Delta<IGeneral>;
    crewGain: number;
  } {
    const crewGain = leadership * 10; // 임시 공식
    const delta = this.addCrewWithDilution(crewGain);

    this.props.experience += 50;
    this.props.leadershipExp += 1;
    this.props.gold = Math.max(this.props.gold - GameConst.draftGoldCost, 0);

    return {
      crewGain,
      delta: {
        ...delta,
        gold: this.props.gold,
        experience: this.props.experience,
        leadershipExp: this.props.leadershipExp,
      },
    };
  }

  /**
   * 징병 수행 로직
   */
  public conscript(leadership: number): {
    delta: Delta<IGeneral>;
    crewGain: number;
  } {
    const crewGain = leadership * 10; // 임시 공식
    const delta = this.addCrewWithDilution(crewGain);

    this.props.experience += 30;
    this.props.leadershipExp += 1;
    this.props.gold = Math.max(
      this.props.gold - GameConst.conscriptGoldCost,
      0,
    );

    return {
      crewGain,
      delta: {
        ...delta,
        gold: this.props.gold,
        experience: this.props.experience,
        leadershipExp: this.props.leadershipExp,
      },
    };
  }

  /**

     * 정착 장려 수행 로직 (통솔 능력치 활용)

     */

  public developPopulation(
    rng: import("@sammo-ts/common").RandUtil,
    leadership: number,
    explevel: number,
  ): {
    delta: Delta<IGeneral>;
    popGain: number;
    pick: "success" | "fail" | "normal";
  } {
    let score = leadership;

    // 경험 레벨 보너스

    score *= 1 + explevel * 0.01;

    // RNG 변동

    score *= rng.nextRange(0.8, 1.2);

    // 성공/실패 판정

    const successRatio = Math.min(0.15 + leadership / 1000, 1.0);

    const failRatio = Math.min(0.05 + leadership / 2000, 1.0 - successRatio);

    const normalRatio = 1 - successRatio - failRatio;

    const pick = rng.choiceUsingWeight({
      success: successRatio,

      fail: failRatio,

      normal: normalRatio,
    }) as "success" | "fail" | "normal";

    if (pick === "success") {
      score *= rng.nextRange(1.5, 2.5);
    } else if (pick === "fail") {
      score *= 0.5;
    }

    const popGain = Math.max(Math.round(score * 10), 1);

    this.props.leadershipExp += 1;

    this.props.experience += Math.round(score * 0.7);

    this.props.dedication += Math.round(score * 1.0);

    return {
      popGain,

      pick,

      delta: {
        leadershipExp: this.props.leadershipExp,

        experience: this.props.experience,

        dedication: this.props.dedication,
      },
    };
  }

  /**

     * 기술 연구 수행 로직

   (지력 능력치 활용)
   */
  public researchTech(
    rng: import("@sammo-ts/common").RandUtil,
    intel: number,
    trust: number,
    explevel: number,
  ): {
    delta: Delta<IGeneral>;
    techGain: number;
    pick: "success" | "fail" | "normal";
  } {
    // 레거시 기반 공식
    let score = intel * (trust / 100);
    // 경험 레벨 보너스 (임시: explevel당 1% 증가)
    score *= 1 + explevel * 0.01;
    // RNG 변동 (0.8 ~ 1.2)
    score *= rng.nextRange(0.8, 1.2);

    // 성공/실패 판정
    const successRatio = Math.min(0.15 + intel / 1000, 1.0);
    const failRatio = Math.min(0.05 + intel / 2000, 1.0 - successRatio);
    const normalRatio = 1 - successRatio - failRatio;

    const pick = rng.choiceUsingWeight({
      success: successRatio,
      fail: failRatio,
      normal: normalRatio,
    }) as "success" | "fail" | "normal";

    // 크리티컬 점수 보정
    if (pick === "success") {
      score *= rng.nextRange(1.5, 2.5);
    } else if (pick === "fail") {
      score *= 0.5;
    }

    const techGain = Math.max(Math.round(score), 1);

    this.props.intelExp += 1;
    this.props.experience += Math.round(techGain * 0.7);
    this.props.dedication += Math.round(techGain * 1.0);

    return {
      techGain,
      pick,
      delta: {
        intelExp: this.props.intelExp,
        experience: this.props.experience,
        dedication: this.props.dedication,
      },
    };
  }

  /**
   * 사기 진작 수행 로직 (통솔 능력치 활용)
   */
  public encourage(leadership: number): {
    delta: Delta<IGeneral>;
    atmosGain: number;
  } {
    const crew = Math.max(this.props.crew, 1);
    // 레거시 공식: leadership * 100 / crew * atmosDelta
    let score = Math.round(((leadership * 100) / crew) * GameConst.atmosDelta);
    score = Math.min(
      score,
      Math.max(GameConst.maxAtmosByCommand - this.props.atmos, 0),
    );

    const expGain = 100;
    const dedGain = 70;

    this.props.atmos += score;
    this.props.experience += expGain;
    this.props.dedication += dedGain;
    this.props.leadershipExp += 1;

    return {
      atmosGain: score,
      delta: {
        atmos: this.props.atmos,
        experience: this.props.experience,
        dedication: this.props.dedication,
        leadershipExp: this.props.leadershipExp,
      },
    };
  }

  /**
   * 주민 선정 수행 로직 (통솔 능력치 활용)
   */
  public developTrust(
    rng: import("@sammo-ts/common").RandUtil,
    leadership: number,
    riceCost: number,
  ): {
    delta: Delta<IGeneral>;
    trustGain: number;
    pick: "success" | "fail" | "normal";
  } {
    // 기본 수치 계산
    let score = leadership;
    // 경험 레벨 보너스 (임시: explevel당 1% 증가)
    // score *= (1 + this.props.explevel * 0.01);
    score *= rng.nextRange(0.8, 1.2);

    // 성공/실패 판정 (GameConst 활용)
    const successRatio = GameConst.domesticCritical.success;
    const failRatio = GameConst.domesticCritical.fail;
    const normalRatio = 1 - successRatio - failRatio;

    const pick = rng.choiceUsingWeight({
      success: successRatio,
      fail: failRatio,
      normal: normalRatio,
    }) as "success" | "fail" | "normal";

    // 크리티컬 점수 보정
    if (pick === "success") {
      score *= 2.0;
    } else if (pick === "fail") {
      score *= 0.5;
    }

    const trustGain = Math.max(Math.round(score / 10), 1);

    this.props.leadershipExp += 1;
    this.props.experience += Math.round(score * 0.7);
    this.props.dedication += Math.round(score * 1.0);
    this.props.rice = Math.max(this.props.rice - riceCost, 0);

    return {
      trustGain,
      pick,
      delta: {
        leadershipExp: this.props.leadershipExp,
        experience: this.props.experience,
        dedication: this.props.dedication,
        rice: this.props.rice,
      },
    };
  }

  /**
   * 부상 회복 (매월 또는 트리거에 의해 발생)
   */
  public heal(amount: number): Delta<IGeneral> {
    this.props.injury = Math.max(this.props.injury - amount, 0);
    return { injury: this.props.injury };
  }

  /**
   * 나이 증가 (매년 1월 발생)
   */
  public grow(): Delta<IGeneral> {
    this.props.age += 1;
    return { age: this.props.age };
  }

  /**
   * 아이템 장착
   */
  public equip(
    itemType: "weapon" | "book" | "horse" | "item",
    itemCode: string,
  ): Delta<IGeneral> {
    this.props[itemType] = itemCode;
    return { [itemType]: itemCode };
  }

  /**
   * 요양 수행 로직
   */
  public recuperate(): Delta<IGeneral> {
    this.props.injury = 0;
    this.props.experience += 10;
    this.props.dedication += 7;

    return {
      injury: this.props.injury,
      experience: this.props.experience,
      dedication: this.props.dedication,
    };
  }

  /**
   * 단련 수행 로직
   */
  public discipline(
    incStatKey: "leadershipExp" | "strengthExp" | "intelExp",
    dexGain: number,
    goldCost: number,
    riceCost: number,
  ): Delta<IGeneral> {
    const expGain = this.props.crew / 400;

    // 숙련도 증가 (현재 병종 기준 - 단순화하여 0번 인덱스 사용하거나 props에 armType 필요)
    // 여기서는 단순하게 incStatKey에 대응하는 병종 숙련도가 있다면 올리거나,
    // 레거시처럼 현재 부대 타입의 숙련도를 올림.
    const currentArmType = 0; // 임시: 현재 부대 타입 정보가 props에 명확히 없으므로 0 사용
    this.props.dex[currentArmType] =
      (this.props.dex[currentArmType] || 0) + dexGain;

    this.props[incStatKey] += 1;
    this.props.experience += expGain;
    this.props.gold = Math.max(this.props.gold - goldCost, 0);
    this.props.rice = Math.max(this.props.rice - riceCost, 0);

    return {
      dex: { ...this.props.dex },
      [incStatKey]: this.props[incStatKey],
      experience: this.props.experience,
      gold: this.props.gold,
      rice: this.props.rice,
    };
  }

  /**
   * 숙련도 전환 수행 로직
   */
  public convertDex(
    srcType: number,
    destType: number,
    decreaseCoeff: number,
    convertCoeff: number,
  ): { delta: Delta<IGeneral>; cutDex: number; addDex: number } {
    const srcDex = this.props.dex[srcType] || 0;
    const cutDex = Math.floor(srcDex * decreaseCoeff);
    const addDex = Math.floor(cutDex * convertCoeff);

    this.props.dex[srcType] = srcDex - cutDex;
    this.props.dex[destType] = (this.props.dex[destType] || 0) + addDex;

    return {
      cutDex,
      addDex,
      delta: {
        dex: { ...this.props.dex },
      },
    };
  }

  /**
   * 경험치 추가
   */
  public addExperience(amount: number): Delta<IGeneral> {
    this.props.experience += amount;
    return { experience: this.props.experience };
  }

  /**
   * 공헌도 추가
   */
  public addDedication(amount: number): Delta<IGeneral> {
    this.props.dedication += amount;
    return { dedication: this.props.dedication };
  }

  /**
   * 능력치 경험치 추가
   */
  public addStatExp(
    stat:
      | "leadershipExp"
      | "strengthExp"
      | "intelExp"
      | "politicsExp"
      | "charmExp",
    amount: number,
  ): Delta<IGeneral> {
    this.props[stat] += amount;
    return { [stat]: this.props[stat] };
  }

  /**
   * 금 추가 (또는 차감)
   */
  public addGold(amount: number): Delta<IGeneral> {
    this.props.gold = Math.max(this.props.gold + amount, 0);
    return { gold: this.props.gold };
  }

  /**
   * 군량 추가 (또는 차감)
   */
  public addRice(amount: number): Delta<IGeneral> {
    this.props.rice = Math.max(this.props.rice + amount, 0);
    return { rice: this.props.rice };
  }

  /**
   * 부상 추가 (또는 차감)
   */
  public addInjury(amount: number, limit: number = 80): Delta<IGeneral> {
    this.props.injury = Math.max(
      Math.min(this.props.injury + amount, limit),
      0,
    );
    return { injury: this.props.injury };
  }

  public updateLastTurn(
    action: string,
    args: Record<string, any>,
  ): Delta<IGeneral> {
    this.props.lastTurn = { action, args, time: new Date() };
    return { lastTurn: this.props.lastTurn };
  }

  public get id(): number {
    return this.props.id;
  }
  public get nationId(): number {
    return this.props.nationId;
  }
  public get dedication(): number {
    return this.props.dedication;
  }
  public get gold(): number {
    return this.props.gold;
  }
  public get rice(): number {
    return this.props.rice;
  }
  public get age(): number {
    return this.props.age;
  }
  public toJSON(): IGeneral {
    return { ...this.props };
  }
}
