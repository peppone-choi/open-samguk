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
      className="w-full rounded-full overflow-hidden border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] bg-black/40 relative"
      style={{
        height: `${height}px`,
        backgroundColor: bgColor === "#374151" ? undefined : bgColor,
      }}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
        style={{
          width: `${clampedPercent}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />

        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
      </div>
    </div>
  );
}
