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
      className={`bg0 w-full max-w-[1000px] mx-auto grid h-8 items-center ${teleportZone ? "grid-cols-[90px_90px_1fr_180px]" : "grid-cols-[90px_90px_1fr_90px_90px]"
        }`}
    >
      {/* Back Button */}
      <button
        type="button"
        onClick={handleBack}
        className="h-8 mr-0.5 px-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-sm border border-gray-600 transition-colors"
      >
        {buttonText}
      </button>

      {/* Reload Button or Empty */}
      {reloadable ? (
        <button
          type="button"
          onClick={handleReload}
          className="h-8 mr-0.5 px-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-sm border border-gray-600 transition-colors flex items-center justify-center gap-1"
        >
          <RefreshCw size={14} />
          갱신
        </button>
      ) : (
        <div />
      )}

      {/* Title */}
      <h2 className="text-center text-lg font-bold text-white leading-8 m-0">{title}</h2>

      {/* Right side content */}
      {children ? (
        children
      ) : teleportZone ? (
        <div id={teleportZone} className="h-8" />
      ) : (
        <>
          <div>&nbsp;</div>
          {searchable !== undefined && (
            <button
              type="button"
              onClick={() => onSearchToggle?.(!searchable)}
              className={`h-8 px-2 text-sm rounded-sm border transition-colors ${searchable
                ? "bg-cyan-600 hover:bg-cyan-500 border-cyan-500 text-white"
                : "bg-zinc-700 hover:bg-zinc-600 border-gray-600 text-gray-300"
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
