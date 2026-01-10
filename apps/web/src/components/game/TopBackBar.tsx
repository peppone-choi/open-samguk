"use client";

/**
 * TopBackBar - Top navigation bar with back button, title, and optional actions
 * Ported from legacy/hwe/ts/components/TopBackBar.vue
 */

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

type BackType = "normal" | "chief" | "close" | "gateway";

interface TopBackBarProps {
  title: string;
  type?: BackType;
  reloadable?: boolean;
  searchable?: boolean;
  onSearchToggle?: (enabled: boolean) => void;
  onReload?: () => void;
  children?: React.ReactNode;
  teleportZone?: string;
}

export function TopBackBar({
  title,
  type = "normal",
  reloadable = false,
  searchable,
  onSearchToggle,
  onReload,
  children,
  teleportZone,
}: TopBackBarProps) {
  const router = useRouter();

  const handleBack = () => {
    if (type === "normal") {
      router.push("/game");
    } else if (type === "gateway") {
      router.push("/auth/servers");
    } else if (type === "chief") {
      router.push("/game/chief");
    } else {
      // close - in SPA context, go back
      router.back();
    }
  };

  const handleReload = () => {
    onReload?.();
  };

  const buttonText = type === "close" ? "창 닫기" : "돌아가기";

  return (
    <div
      className={`glass w-full max-w-[1000px] mx-auto grid h-10 items-center transition-all duration-300 ${
        teleportZone ? "grid-cols-[90px_90px_1fr_180px]" : "grid-cols-[90px_90px_1fr_90px_90px]"
      }`}
    >
      {/* Back Button */}
      <button
        type="button"
        onClick={handleBack}
        className="h-8 ml-1 px-3 bg-white/5 hover:bg-white/10 text-white/90 text-sm font-medium rounded border border-white/10 hover:border-primary/50 hover:shadow-glow-sm transition-all duration-300 active:scale-95"
      >
        {buttonText}
      </button>

      {/* Reload Button or Empty */}
      {reloadable ? (
        <button
          type="button"
          onClick={handleReload}
          className="h-8 ml-1 px-3 bg-white/5 hover:bg-white/10 text-white/90 text-sm font-medium rounded border border-white/10 hover:border-primary/50 hover:shadow-glow-sm transition-all duration-300 active:scale-95 flex items-center justify-center gap-1.5"
        >
          <RefreshCw size={14} className="opacity-80" />
          갱신
        </button>
      ) : (
        <div />
      )}

      {/* Title */}
      <h2 className="text-center text-lg font-bold text-white leading-8 m-0 tracking-wide drop-shadow-md">
        {title}
      </h2>

      {/* Right side content */}
      {children ? (
        children
      ) : teleportZone ? (
        <div id={teleportZone} className="h-8 flex items-center justify-end pr-1" />
      ) : (
        <>
          <div>&nbsp;</div>
          {searchable !== undefined && (
            <button
              type="button"
              onClick={() => onSearchToggle?.(!searchable)}
              className={`h-8 mr-1 px-3 text-sm font-medium rounded border transition-all duration-300 active:scale-95 ${
                searchable
                  ? "bg-primary/20 hover:bg-primary/30 border-primary text-primary shadow-glow-sm"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white"
              }`}
            >
              {searchable ? "검색 켜짐" : "검색 꺼짐"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
