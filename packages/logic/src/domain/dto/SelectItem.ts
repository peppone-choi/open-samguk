export interface SelectItem {
  title: string;
  info: string | null;
  isHtml: boolean | null;
  aux: Record<string, string | number | boolean | null | unknown[]> | null;
}
