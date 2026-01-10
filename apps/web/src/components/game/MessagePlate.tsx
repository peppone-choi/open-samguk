"use client";

import { useMemo } from "react";

// ============================================================================
// Types
// ============================================================================

export type MsgType = "private" | "public" | "national" | "diplomacy";

export type MsgTarget = {
  id: number;
  name: string;
  nation_id: number;
  nation: string;
  color: string;
  icon: string;
};

export type MsgActionType = "scout" | "noAggression" | "cancelNA" | "stopWar";

export interface MsgItem {
  id: number;
  msgType: MsgType;
  src: MsgTarget;
  dest?: MsgTarget;
  text: string;
  option: {
    action?: MsgActionType;
    invalid?: boolean;
    deletable?: boolean;
    overwrite?: number[];
    hide?: boolean;
    silence?: boolean;
    delete?: number;
  };
  time: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function isBrightColor(color: string): boolean {
  // Convert hex to RGB and calculate luminance
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

function getIconPath(icon: string | undefined): string {
  if (!icon) return "/icons/default.jpg";
  return icon;
}

// Simple linkify - convert URLs to anchor tags
function linkifyText(text: string): string {
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlPattern,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">$1</a>'
  );
}

// ============================================================================
// Component Props
// ============================================================================

interface MessagePlateProps {
  message: MsgItem;
  generalID: number;
  generalName: string;
  nationID: number;
  permissionLevel: number;
  deleted?: boolean;
  onSetTarget?: (type: MsgType, target: MsgTarget) => void;
  onDelete?: (msgId: number) => void;
  onAccept?: (msgId: number) => void;
  onDecline?: (msgId: number) => void;
  onRequestRefresh?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function MessagePlate({
  message,
  generalID,
  generalName,
  nationID,
  permissionLevel,
  deleted = false,
  onSetTarget,
  onDelete,
  onAccept,
  onDecline,
}: MessagePlateProps) {
  const msg = message;
  const src = msg.src;
  const dest = msg.dest ?? {
    id: 0,
    name: "",
    nation: "재야",
    nation_id: 0,
    color: "#000000",
    icon: "",
  };

  const srcColorType = isBrightColor(src.color) ? "bright" : "dark";
  const destColorType = isBrightColor(dest.color) ? "bright" : "dark";

  const isValidMsg = useMemo(() => {
    if (deleted) return false;
    if (msg.option.invalid) return false;
    return true;
  }, [deleted, msg.option.invalid]);

  const deletable = useMemo(() => {
    if (deleted) return false;
    if (msg.option.action) return false;
    if (msg.src.id !== generalID) return false;
    if (msg.option.invalid) return false;
    if (!(msg.option.deletable ?? true)) return false;
    // Note: Time-based deletability check would need to be implemented with useEffect
    return true;
  }, [deleted, msg, generalID]);

  const allowButton = useMemo(() => {
    if (msg.msgType !== "diplomacy") return true;
    if (permissionLevel >= 4) return true;
    return false;
  }, [msg.msgType, permissionLevel]);

  const nationType = useMemo((): "local" | "src" | "dest" => {
    if (msg.src.nation_id === msg.dest?.nation_id) return "local";
    if (msg.src.nation_id === nationID) return "src";
    return "dest";
  }, [msg.src.nation_id, msg.dest?.nation_id, nationID]);

  // Background color based on message type - now with gradients for depth
  const bgColorClass = useMemo(() => {
    const base: Record<MsgType, string> = {
      private: "bg-gradient-to-r from-red-950/80 to-red-900/60 border-l-2 border-l-red-500",
      public: "bg-gradient-to-r from-slate-900/80 to-slate-800/60 border-l-2 border-l-slate-500",
      national:
        "bg-gradient-to-r from-emerald-950/80 to-emerald-900/60 border-l-2 border-l-emerald-500",
      diplomacy: "bg-gradient-to-r from-amber-950/80 to-amber-900/60 border-l-2 border-l-amber-500",
    };

    if (
      (msg.msgType === "private" || msg.msgType === "national" || msg.msgType === "diplomacy") &&
      nationType === "dest"
    ) {
      if (msg.msgType === "private")
        return "bg-gradient-to-r from-amber-950/80 to-orange-950/60 border-l-2 border-l-orange-500";
      return "bg-gradient-to-r from-yellow-950/80 to-amber-900/60 border-l-2 border-l-amber-500";
    }
    if ((msg.msgType === "national" || msg.msgType === "diplomacy") && nationType === "src") {
      return "bg-gradient-to-r from-rose-950/80 to-pink-900/60 border-l-2 border-l-pink-500";
    }
    return base[msg.msgType];
  }, [msg.msgType, nationType]);

  const handleSetTarget = (target: MsgTarget) => {
    onSetTarget?.(msg.msgType, target);
  };

  const handleDelete = () => {
    if (confirm("삭제하시겠습니까?")) {
      onDelete?.(msg.id);
    }
  };

  const handleAccept = () => {
    if (confirm("수락하시겠습니까?")) {
      onAccept?.(msg.id);
    }
  };

  const handleDecline = () => {
    if (confirm("거절하시겠습니까?")) {
      onDecline?.(msg.id);
    }
  };

  // Render header based on message type
  const renderHeader = () => {
    const TargetBadge = ({
      target,
      colorType,
      clickable = false,
      children,
    }: {
      target: MsgTarget;
      colorType: "bright" | "dark";
      clickable?: boolean;
      children: React.ReactNode;
    }) => (
      <span
        role={clickable ? "button" : undefined}
        className={`inline-flex items-center mx-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-all duration-300 ${
          colorType === "bright" ? "text-black/90 shadow-sm" : "text-white shadow-md"
        } ${clickable ? "cursor-pointer hover:brightness-110 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95" : ""}`}
        style={{
          backgroundColor: target.color,
          boxShadow: "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
          textShadow: colorType === "dark" ? "0 1px 2px rgba(0,0,0,0.5)" : "none",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
        onClick={clickable ? () => handleSetTarget(target) : undefined}
      >
        {children}
      </span>
    );

    if (msg.msgType === "private") {
      if (src.name === generalName) {
        return (
          <>
            <TargetBadge target={src} colorType={srcColorType}>
              나
            </TargetBadge>
            <span className="text-white/40 text-[10px]">▶</span>
            <TargetBadge target={dest} colorType={destColorType} clickable>
              {dest.name}:{dest.nation}
            </TargetBadge>
          </>
        );
      }
      return (
        <>
          <TargetBadge target={src} colorType={srcColorType} clickable>
            {src.name}:{src.nation}
          </TargetBadge>
          <span className="text-white/40 text-[10px]">▶</span>
          <TargetBadge target={dest} colorType={destColorType}>
            나
          </TargetBadge>
        </>
      );
    }

    if (msg.msgType === "national" && src.nation_id === dest.nation_id) {
      return (
        <TargetBadge target={src} colorType={srcColorType}>
          {src.name}
        </TargetBadge>
      );
    }

    if ((msg.msgType === "national" || msg.msgType === "diplomacy") && permissionLevel >= 4) {
      if (src.nation_id === nationID) {
        return (
          <>
            <TargetBadge target={src} colorType={srcColorType}>
              {src.name}
            </TargetBadge>
            <span className="text-white/40 text-[10px]">▶</span>
            <TargetBadge target={dest} colorType={destColorType} clickable>
              {dest.nation}
            </TargetBadge>
          </>
        );
      }
      return (
        <TargetBadge target={src} colorType={srcColorType} clickable>
          {src.name}:{src.nation}
        </TargetBadge>
      );
    }

    if (msg.msgType === "national" || msg.msgType === "diplomacy") {
      if (src.nation_id === nationID) {
        return (
          <>
            <TargetBadge target={src} colorType={srcColorType}>
              {src.name}
            </TargetBadge>
            <span className="text-white/40 text-[10px]">▶</span>
            <TargetBadge target={dest} colorType={destColorType}>
              {dest.nation}
            </TargetBadge>
          </>
        );
      }
      return (
        <TargetBadge target={src} colorType={srcColorType}>
          {src.name}:{src.nation}
        </TargetBadge>
      );
    }

    // public message
    if (src.id !== generalID) {
      return (
        <TargetBadge target={src} colorType={srcColorType} clickable>
          {src.name}:{src.nation}
        </TargetBadge>
      );
    }
    return (
      <TargetBadge target={src} colorType={srcColorType}>
        {src.name}
      </TargetBadge>
    );
  };

  return (
    <div
      id={`msg_${msg.id}`}
      className={`relative grid grid-cols-[56px_1fr] border-b border-white/5 min-h-[56px] text-xs text-white/90 break-all transition-all duration-300 hover:bg-white/5 group ${bgColorClass}`}
      data-id={msg.id}
    >
      {/* Icon */}
      <div className="w-14 h-14 flex-shrink-0 overflow-hidden relative border-r border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
        <img
          src={getIconPath(src.icon)}
          alt={src.name}
          width={56}
          height={56}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 z-20" />
      </div>

      {/* Body */}
      <div className="py-2 px-3 flex flex-col relative">
        {/* Header */}
        <div className="flex items-center flex-wrap gap-y-1 mb-1.5 relative">
          {renderHeader()}
          <span className="text-[10px] font-mono text-white/30 ml-auto mr-6 group-hover:text-white/50 transition-colors">
            {msg.time}
          </span>

          {deletable && (
            <button
              type="button"
              className="absolute -right-1 -top-1 p-1.5 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              onClick={handleDelete}
              title="삭제"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  fillRule="evenodd"
                  d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div
          className={`text-[13px] leading-relaxed tracking-wide text-shadow-sm ${isValidMsg ? "text-white/90" : "text-white/40 italic"}`}
          dangerouslySetInnerHTML={{
            __html: isValidMsg ? linkifyText(msg.text) : "삭제된 메시지입니다",
          }}
        />

        {/* Action buttons */}
        {msg.option.action && (
          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
            <button
              type="button"
              disabled={!allowButton}
              onClick={handleAccept}
              className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300 rounded text-xs font-medium shadow-sm active:scale-95 transition-all flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span>✓</span> 수락
            </button>
            <button
              type="button"
              disabled={!allowButton}
              onClick={handleDecline}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-300 rounded text-xs font-medium shadow-sm active:scale-95 transition-all flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span>✕</span> 거절
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
