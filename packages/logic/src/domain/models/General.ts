import { General as IGeneral, Delta } from '../entities.js';
import { GameConst } from '../GameConst.js';

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
    let score = Math.round((leadership * 100 / crew) * GameConst.trainDelta);
    score = Math.min(score, Math.max(GameConst.maxTrainByCommand - this.props.train, 0));

    const expGain = 100;
    const dedGain = 70;

    // 내부 상태 변경
    this.props.train += score;
    this.props.atmos = Math.min(this.props.atmos + GameConst.atmosSideEffectByTraining, 100);
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
  public developAgriculture(politics: number): { delta: Delta<IGeneral>, agriGain: number } {
    // 임시 로직: 정치력에 비례하여 개간 효율 결정
    const agriGain = Math.round(politics * 2);
    
    this.props.politicsExp += 1;
    this.props.experience += 50;

    return {
      agriGain,
      delta: {
        politicsExp: this.props.politicsExp,
        experience: this.props.experience,
      }
    };
  }

  /**
   * 상업 투자 수행 로직 (지력 능력치 활용)
   */
  public developCommerce(intel: number): { delta: Delta<IGeneral>, commGain: number } {
    // 임시 로직: 지력에 비례하여 상업 효율 결정
    const commGain = Math.round(intel * 2);

    this.props.intelExp += 1;
    this.props.experience += 50;

    return {
      commGain,
      delta: {
        intelExp: this.props.intelExp,
        experience: this.props.experience,
      }
    };
  }

  /**
   * 치안 강화 수행 로직 (무력 능력치 활용)
   */
  public reinforceSecurity(strength: number): { delta: Delta<IGeneral>, secuGain: number } {
    // 임시 로직: 무력에 비례하여 치안 효율 결정
    const secuGain = Math.round(strength * 2);

    this.props.strengthExp += 1;
    this.props.experience += 50;

    return {
      secuGain,
      delta: {
        strengthExp: this.props.strengthExp,
        experience: this.props.experience,
      }
    };
  }

  /**
   * 성벽 보수 수행 로직 (무력 능력치 활용)
   */
  public repairWall(strength: number): { delta: Delta<IGeneral>, wallGain: number } {
    // 임시 로직: 무력에 비례하여 성벽 효율 결정
    const wallGain = Math.round(strength * 2);

    this.props.strengthExp += 1;
    this.props.experience += 50;

    return {
      wallGain,
      delta: {
        strengthExp: this.props.strengthExp,
        experience: this.props.experience,
      }
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
  public recruit(destGeneralExperience: number, destGeneralDedication: number): { delta: Delta<IGeneral>, reqGold: number } {
    // 임시 비용 계산 (레거시 참고)
    const reqGold = Math.round(100 + (destGeneralExperience + destGeneralDedication) / 1000) * 10;

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
      }
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
  public draft(leadership: number): { delta: Delta<IGeneral>, crewGain: number } {
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
      }
    };
  }

  /**
   * 징병 수행 로직
   */
  public conscript(leadership: number): { delta: Delta<IGeneral>, crewGain: number } {
    const crewGain = leadership * 10; // 임시 공식
    const delta = this.addCrewWithDilution(crewGain);

    this.props.experience += 30;
    this.props.leadershipExp += 1;
    this.props.gold = Math.max(this.props.gold - GameConst.conscriptGoldCost, 0);

    return {
      crewGain,
      delta: {
        ...delta,
        gold: this.props.gold,
        experience: this.props.experience,
        leadershipExp: this.props.leadershipExp,
      }
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
  public equip(itemType: 'weapon' | 'book' | 'horse' | 'item', itemCode: string): Delta<IGeneral> {
    this.props[itemType] = itemCode;
    return { [itemType]: itemCode };
  }

  public get id(): number { return this.props.id; }
  public get nationId(): number { return this.props.nationId; }
  public get dedication(): number { return this.props.dedication; }
  public get gold(): number { return this.props.gold; }
  public get age(): number { return this.props.age; }
  public toJSON(): IGeneral { return { ...this.props }; }
}
