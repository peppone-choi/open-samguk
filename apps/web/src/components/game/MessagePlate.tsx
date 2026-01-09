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
      private: "bg-gradient-to-br from-[#6d2e2a] to-[#4d0e0a]",
      public: "bg-gradient-to-br from-[#1e2c75] to-[#0a1245]",
      national: "bg-gradient-to-br from-[#10683c] to-[#00481c]",
      diplomacy: "bg-gradient-to-br from-[#10683c] to-[#00481c]",
    };

    if (
      (msg.msgType === "private" || msg.msgType === "national" || msg.msgType === "diplomacy") &&
      nationType === "dest"
    ) {
      if (msg.msgType === "private") return "bg-gradient-to-br from-[#6d562a] to-[#4d360a]";
      return "bg-gradient-to-br from-[#805625] to-[#603605]";
    }
    if ((msg.msgType === "national" || msg.msgType === "diplomacy") && nationType === "src") {
      return "bg-gradient-to-br from-[#80254b] to-[#60052b]";
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
        className={`inline-block mx-0.5 px-1.5 py-0.5 rounded-md font-medium transition-all duration-150 ${
          colorType === "bright" ? "text-black/90" : "text-white"
        } ${clickable ? "cursor-pointer hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]" : ""}`}
        style={{
          backgroundColor: target.color,
          boxShadow: "0 1px 2px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
          textShadow: colorType === "dark" ? "0 1px 1px rgba(0,0,0,0.3)" : "none",
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
            <span className="mx-1">▶</span>
            <TargetBadge target={dest} colorType={destColorType} clickable>
              {dest.name}:{dest.nation} | ↩
            </TargetBadge>
          </>
        );
      }
      return (
        <>
          <TargetBadge target={src} colorType={srcColorType} clickable>
            {src.name}:{src.nation} | ↩
          </TargetBadge>
          <span className="mx-1">▶</span>
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
            <span className="mx-1">▶</span>
            <TargetBadge target={dest} colorType={destColorType} clickable>
              {dest.nation} | ↩
            </TargetBadge>
          </>
        );
      }
      return (
        <TargetBadge target={src} colorType={srcColorType} clickable>
          {src.name}:{src.nation} | ↩
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
            <span className="mx-1">▶</span>
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
          {src.name}:{src.nation} | ↩
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
      className={`grid grid-cols-[64px_1fr] border-b border-gray-600/50 min-h-[64px] text-xs text-white break-all transition-colors ${bgColorClass}`}
      data-id={msg.id}
    >
      {/* Icon */}
      <div className="w-16 h-16 border-r border-gray-600/50 flex-shrink-0 overflow-hidden">
        <img
          src={getIconPath(src.icon)}
          alt={src.name}
          width={64}
          height={64}
          className="object-cover"
        />
      </div>

      {/* Body */}
      <div className="py-1 px-2 flex flex-col">
        {/* Header */}
        <div className="font-bold mb-1 relative">
          {deletable && (
            <button
              type="button"
              className="absolute right-0 top-0 px-1.5 py-0.5 text-[8px] border border-yellow-500/70 text-yellow-500 rounded-md hover:bg-yellow-500 hover:text-black transition-colors"
              onClick={handleDelete}
            >
              ❌
            </button>
          )}
          {renderHeader()}
          <span className="text-[0.75em] font-normal ml-1 text-gray-300">&lt;{msg.time}&gt;</span>
        </div>

        {/* Content */}
        <div
          className={`ml-2 mr-1 ${isValidMsg ? "" : "text-white/50"}`}
          dangerouslySetInnerHTML={{
            __html: isValidMsg ? linkifyText(msg.text) : "삭제된 메시지입니다",
          }}
        />

        {/* Action buttons */}
        {msg.option.action && (
          <div className="text-right mt-1.5 mr-1 space-x-2">
            <button
              type="button"
              disabled={!allowButton}
              onClick={handleAccept}
              className="px-2.5 py-1 bg-gradient-to-b from-green-500 to-green-600 text-white rounded-md text-xs font-medium shadow-sm hover:from-green-400 hover:to-green-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-500 disabled:hover:to-green-600"
            >
              수락
            </button>
            <button
              type="button"
              disabled={!allowButton}
              onClick={handleDecline}
              className="px-2.5 py-1 bg-gradient-to-b from-red-500 to-red-600 text-white rounded-md text-xs font-medium shadow-sm hover:from-red-400 hover:to-red-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-red-500 disabled:hover:to-red-600"
            >
              거절
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
