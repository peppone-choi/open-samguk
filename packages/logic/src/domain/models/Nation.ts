import { Nation as INation, Delta } from '../entities.js';

/**
 * 국가(Nation) 도메인 엔티티
 * DDD: 국가 자원 관리 및 정책 로직을 포함함
 */
export class Nation {
  private props: INation;

  constructor(props: INation) {
    this.props = { ...props };
  }

  /**
   * 국가 자금 인출
   */
  public withdrawGold(amount: number): Delta<INation> {
    if (this.props.gold < amount) {
      throw new Error('국가 자금이 부족합니다.');
    }
    this.props.gold -= amount;
    return { gold: this.props.gold };
  }

  /**
   * 국가 자금 입금
   */
  public depositGold(amount: number): Delta<INation> {
    this.props.gold += amount;
    return { gold: this.props.gold };
  }

  /**
   * 국가 군량 인출
   */
  public withdrawRice(amount: number): Delta<INation> {
    if (this.props.rice < amount) {
      throw new Error('국가 군량이 부족합니다.');
    }
    this.props.rice -= amount;
    return { rice: this.props.rice };
  }

  /**
   * 국가 군량 입금
   */
  public depositRice(amount: number): Delta<INation> {
    this.props.rice += amount;
    return { rice: this.props.rice };
  }

  /**
   * 국가 기술력 증가
   */
  public increaseTech(amount: number): Delta<INation> {
    this.props.tech += amount;
    return { tech: this.props.tech };
  }

  public get id(): number { return this.props.id; }
  public get gold(): number { return this.props.gold; }
  public toJSON(): INation { return { ...this.props }; }
}
