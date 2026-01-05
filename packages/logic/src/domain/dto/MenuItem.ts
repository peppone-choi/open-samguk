export interface MenuItem {
  type: 'item';
  name: string;
  url: string;
  funcCall?: string;
  icon?: string;
  newTab?: boolean;
  condHighlightVar?: string;
  condShowVar?: string;
}
