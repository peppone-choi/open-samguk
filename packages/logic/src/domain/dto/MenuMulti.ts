import type { MenuItem } from "./MenuItem";
import type { MenuLine } from "./MenuLine";

export interface MenuMulti {
  type: "multi";
  name: string;
  subMenu: (MenuItem | MenuLine)[];
}
