import { BaseNationType } from "./types";

/**
 * NoNationType - No philosophical school selected
 * No bonuses or penalties
 */
export class NoNationType extends BaseNationType {
  readonly name = "-";
  readonly pros = "";
  readonly cons = "";
}
