export enum ResourceType {
  gold = "gold",
  rice = "rice",
  inheritancePoint = "inheritPoint",
}

export function getResourceTypeName(type: ResourceType): string {
  switch (type) {
    case ResourceType.gold:
      return "금";
    case ResourceType.rice:
      return "쌀";
    case ResourceType.inheritancePoint:
      return "유산 포인트";
  }
}
