/**
 * SammoBar - Progress bar component
 * Ported from legacy/hwe/ts/components/SammoBar.vue
 */

interface SammoBarProps {
  percent: number;
  height?: number;
  color?: string;
  bgColor?: string;
}

export function SammoBar({
  percent,
  height = 10,
  color = "#4ade80", // green-400
  bgColor = "#374151", // gray-700
}: SammoBarProps) {
  const clampedPercent = Math.max(0, Math.min(100, percent));

  return (
    <div
      className="w-full rounded overflow-hidden"
      style={{ height: `${height}px`, backgroundColor: bgColor }}
    >
      <div
        className="h-full rounded transition-all duration-300"
        style={{
          width: `${clampedPercent}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
