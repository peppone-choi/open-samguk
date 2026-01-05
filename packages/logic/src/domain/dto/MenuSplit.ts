import type { MenuItem } from './MenuItem';
import type { MenuLine } from './MenuLine';

export interface MenuSplit {
  type: 'split';
  main: MenuItem;
  subMenu: (MenuItem | MenuLine)[];
}
