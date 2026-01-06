import { BaseNationType } from "./types";

/**
 * NeutralNationType (중립) - Neutral (No affiliation)
 * No bonuses or penalties
 */
export class NeutralNationType extends BaseNationType {
  readonly name = "-";
  readonly pros = "";
  readonly cons = "";
}
