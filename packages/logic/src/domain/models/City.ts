import { City as ICity, Delta } from '../entities.js';

/**
 * 도시(City) 도메인 엔티티
 */
export class City {
  private props: ICity;

  constructor(props: ICity) {
    this.props = { ...props };
  }

  /**
   * 인구 증가
   */
  public increasePop(amount: number): Delta<ICity> {
    this.props.pop = Math.min(this.props.pop + amount, this.props.popMax);
    return { pop: this.props.pop };
  }

  /**
   * 농지 수치 증가
   */
  public increaseAgri(amount: number): Delta<ICity> {
    this.props.agri += amount;
    return { agri: this.props.agri };
  }

  /**
   * 상업 수치 증가
   */
  public increaseComm(amount: number): Delta<ICity> {
    this.props.comm += amount;
    return { comm: this.props.comm };
  }

  /**
   * 치안 수치 증가
   */
  public increaseSecu(amount: number): Delta<ICity> {
    this.props.secu += amount;
    return { secu: this.props.secu };
  }

  /**
   * 수비 수치 증가
   */
  public increaseDef(amount: number): Delta<ICity> {
    this.props.def = Math.min(this.props.def + amount, this.props.defMax);
    return { def: this.props.def };
  }

  /**
   * 성벽 수치 증가
   */
  public increaseWall(amount: number): Delta<ICity> {
    this.props.wall = Math.min(this.props.wall + amount, this.props.wallMax);
    return { wall: this.props.wall };
  }

  /**
   * 인구 감소
   */
  public decreasePop(amount: number): Delta<ICity> {
    this.props.pop = Math.max(this.props.pop - amount, 0);
    return { pop: this.props.pop };
  }

  /**
   * 치안 감소
   */
  public decreaseSecu(amount: number): Delta<ICity> {
    this.props.secu = Math.max(this.props.secu - amount, 0);
    return { secu: this.props.secu };
  }

  /**
   * 월간 금/쌀 수입 계산
   * 레거시: 상업(comm) -> 금 수입, 농지(agri) -> 쌀 수입
   */
  public calcIncome(taxRate: number): { gold: number; rice: number } {
    const goldIncome = Math.floor(this.props.comm * (this.props.pop / 10000) * (taxRate / 100));
    const riceIncome = Math.floor(this.props.agri * (this.props.pop / 10000) * (taxRate / 100));
    
    return {
      gold: goldIncome,
      rice: riceIncome,
    };
  }

  public get id(): number { return this.props.id; }
  public toJSON(): ICity { return { ...this.props }; }
}
