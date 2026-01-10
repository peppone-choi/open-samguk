"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { MessagePlate, type MsgItem, type MsgType, type MsgTarget } from "./MessagePlate";

// ============================================================================
// Types
// ============================================================================

interface MailboxTarget {
  value: number;
  text: string;
  nationID: number;
  disabled?: boolean;
  color?: string;
}

interface MailboxGroup {
  label: string;
  color?: string;
  options: MailboxTarget[];
}

interface MessagePanelProps {
  generalID: number;
  generalName: string;
  nationID: number;
  permissionLevel: number;
  // Initial messages for each type
  initialPublic?: MsgItem[];
  initialNational?: MsgItem[];
  initialPrivate?: MsgItem[];
  initialDiplomacy?: MsgItem[];
  // Mailbox list for sending
  mailboxList?: MailboxGroup[];
  // Callbacks
  onSendMessage?: (mailbox: number, text: string) => Promise<void>;
  onLoadOldMessages?: (type: MsgType, beforeId: number) => Promise<MsgItem[]>;
  onDeleteMessage?: (msgId: number) => Promise<void>;
  onAcceptMessage?: (msgId: number) => Promise<void>;
  onDeclineMessage?: (msgId: number) => Promise<void>;
  onRefresh?: () => Promise<void>;
  className?: string;
}

// ============================================================================
// Utility
// ============================================================================

function isBrightColor(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

// ============================================================================
// Component
// ============================================================================

export function MessagePanel({
  generalID,
  generalName,
  nationID,
  permissionLevel,
  initialPublic = [],
  initialNational = [],
  initialPrivate = [],
  initialDiplomacy = [],
  mailboxList = [],
  onSendMessage,
  onLoadOldMessages,
  onDeleteMessage,
  onAcceptMessage,
  onDeclineMessage,
  onRefresh,
  className,
}: MessagePanelProps) {
  // Message state
  const [messagePublic, setMessagePublic] = useState<MsgItem[]>(initialPublic);
  const [messageNational, setMessageNational] = useState<MsgItem[]>(initialNational);
  const [messagePrivate, setMessagePrivate] = useState<MsgItem[]>(initialPrivate);
  const [messageDiplomacy, setMessageDiplomacy] = useState<MsgItem[]>(initialDiplomacy);

  // Deleted messages tracking
  const [deletedMessages, setDeletedMessages] = useState<Set<number>>(new Set());

  // Input state
  const [targetMailbox, setTargetMailbox] = useState<number>(nationID + 9000);
  const [newMessageText, setNewMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Refs for scroll anchors
  const publicAnchorRef = useRef<HTMLDivElement>(null);
  const nationalAnchorRef = useRef<HTMLDivElement>(null);
  const privateAnchorRef = useRef<HTMLDivElement>(null);
  const diplomacyAnchorRef = useRef<HTMLDivElement>(null);

  // Update messages when initial props change
  useEffect(() => {
    setMessagePublic(initialPublic);
  }, [initialPublic]);

  useEffect(() => {
    setMessageNational(initialNational);
  }, [initialNational]);

  useEffect(() => {
    setMessagePrivate(initialPrivate);
  }, [initialPrivate]);

  useEffect(() => {
    setMessageDiplomacy(initialDiplomacy);
  }, [initialDiplomacy]);

  // Get messages by type
  const getMessagesByType = useCallback(
    (type: MsgType): MsgItem[] => {
      switch (type) {
        case "public":
          return messagePublic;
        case "national":
          return messageNational;
        case "private":
          return messagePrivate;
        case "diplomacy":
          return messageDiplomacy;
      }
    },
    [messagePublic, messageNational, messagePrivate, messageDiplomacy]
  );

  // Set target mailbox
  const handleSetTarget = useCallback((type: MsgType, target: MsgTarget) => {
    if (type === "diplomacy" || type === "national") {
      setTargetMailbox(target.nation_id + 9000);
    } else {
      setTargetMailbox(target.id);
    }
  }, []);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!newMessageText.trim()) {
      await onRefresh?.();
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage?.(targetMailbox, newMessageText);
      setNewMessageText("");
      await onRefresh?.();
    } catch (e) {
      console.error("Failed to send message:", e);
    } finally {
      setIsSending(false);
    }
  }, [newMessageText, targetMailbox, onSendMessage, onRefresh]);

  // Load old messages
  const handleLoadOldMessages = useCallback(
    async (type: MsgType) => {
      const messages = getMessagesByType(type);
      if (messages.length === 0) return;

      const lastId = messages[messages.length - 1].id;
      try {
        const oldMessages = await onLoadOldMessages?.(type, lastId);
        if (oldMessages && oldMessages.length > 0) {
          switch (type) {
            case "public":
              setMessagePublic((prev) => [...prev, ...oldMessages]);
              break;
            case "national":
              setMessageNational((prev) => [...prev, ...oldMessages]);
              break;
            case "private":
              setMessagePrivate((prev) => [...prev, ...oldMessages]);
              break;
            case "diplomacy":
              setMessageDiplomacy((prev) => [...prev, ...oldMessages]);
              break;
          }
        }
      } catch (e) {
        console.error("Failed to load old messages:", e);
      }
    },
    [getMessagesByType, onLoadOldMessages]
  );

  // Delete message
  const handleDeleteMessage = useCallback(
    async (msgId: number) => {
      try {
        await onDeleteMessage?.(msgId);
        setDeletedMessages((prev) => new Set(prev).add(msgId));
        await onRefresh?.();
      } catch (e) {
        console.error("Failed to delete message:", e);
      }
    },
    [onDeleteMessage, onRefresh]
  );

  // Accept/Decline message
  const handleAcceptMessage = useCallback(
    async (msgId: number) => {
      try {
        await onAcceptMessage?.(msgId);
        await onRefresh?.();
      } catch (e) {
        console.error("Failed to accept message:", e);
      }
    },
    [onAcceptMessage, onRefresh]
  );

  const handleDeclineMessage = useCallback(
    async (msgId: number) => {
      try {
        await onDeclineMessage?.(msgId);
        await onRefresh?.();
      } catch (e) {
        console.error("Failed to decline message:", e);
      }
    },
    [onDeclineMessage, onRefresh]
  );

  // Fold messages (mobile)
  const handleFoldMessages = useCallback((type: MsgType) => {
    const setter = {
      public: setMessagePublic,
      national: setMessageNational,
      private: setMessagePrivate,
      diplomacy: setMessageDiplomacy,
    }[type];

    setter((prev) => (prev.length > 10 ? prev.slice(0, 10) : prev));
  }, []);

  // Render message section
  const renderMessageSection = (
    type: MsgType,
    title: string,
    messages: MsgItem[],
    anchorRef: React.RefObject<HTMLDivElement>,
    quickTargetMailbox?: number
  ) => {
    const filteredMessages = messages.filter((msg) => !msg.option.hide);

    return (
      <div
        className={`${type === "public" || type === "private" ? "lg:border-r lg:border-white/10" : ""} relative flex flex-col`}
      >
        <div ref={anchorRef} className="absolute -top-[68px] invisible" />
        <div className="flex items-center justify-between bg-white/5 backdrop-blur-md border-y border-white/10 px-3 py-2 sticky top-0 z-10 shadow-lg">
          <span className="text-white/90 font-bold text-sm tracking-wide flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                type === "public"
                  ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"
                  : type === "national"
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    : type === "private"
                      ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"
                      : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
              }`}
            ></span>
            {title}
          </span>
          {quickTargetMailbox !== undefined && (
            <button
              className="px-2.5 py-1 text-xs bg-white/10 hover:bg-white/20 text-blue-200 border border-white/10 rounded transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
              onClick={() => setTargetMailbox(quickTargetMailbox)}
            >
              <span className="text-[10px]">↩</span> 여기로
            </button>
          )}
        </div>

        {filteredMessages.length === 0 ? (
          <div className="p-8 text-white/20 text-center italic text-sm">메시지가 없습니다.</div>
        ) : (
          <div className="lg:h-[650px] lg:overflow-y-auto custom-scrollbar bg-black/20">
            {filteredMessages.map((msg) => (
              <MessagePlate
                key={msg.id}
                message={msg}
                generalID={generalID}
                generalName={generalName}
                nationID={nationID}
                permissionLevel={permissionLevel}
                deleted={deletedMessages.has(msg.id)}
                onSetTarget={handleSetTarget}
                onDelete={handleDeleteMessage}
                onAccept={handleAcceptMessage}
                onDecline={handleDeclineMessage}
              />
            ))}

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 p-3 border-t border-white/5 bg-black/40 backdrop-blur-sm">
              <button
                className="lg:hidden px-4 py-2 bg-white/5 text-white/70 text-sm rounded border border-white/10 hover:bg-white/10 transition-colors"
                onClick={() => handleFoldMessages(type)}
              >
                접기
              </button>
              <button
                className="w-full px-4 py-2 bg-white/5 text-white/70 text-sm font-medium rounded border border-white/10 hover:bg-white/10 hover:text-white transition-all shadow-sm active:translate-y-0.5"
                onClick={() => handleLoadOldMessages(type)}
              >
                이전 메시지 불러오기
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`${className ?? ""} bg-[#1a1b23] border border-white/10 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5`}
    >
      {/* Input Form */}
      <div className="grid grid-cols-6 lg:grid-cols-12 gap-0 border-b border-white/10 bg-gradient-to-r from-[#2a2b36] to-[#1f2029]">
        {/* Mailbox Selector */}
        <div className="col-span-6 lg:col-span-2 border-r border-white/10 relative group">
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/30">
            ▼
          </div>
          <select
            value={targetMailbox}
            onChange={(e) => setTargetMailbox(Number(e.target.value))}
            className="w-full h-full px-3 py-3 bg-transparent text-white/90 text-sm appearance-none cursor-pointer hover:bg-white/5 transition-colors focus:outline-none focus:bg-white/10"
          >
            {mailboxList.map((group) => (
              <optgroup
                key={group.label}
                label={group.label}
                className="bg-gray-900 text-white"
                style={{
                  backgroundColor: group.color ?? "#000000",
                  color: group.color && isBrightColor(group.color) ? "#000000" : "#ffffff",
                }}
              >
                {group.options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    style={{
                      backgroundColor: option.color ?? "#000000",
                      color: option.color && isBrightColor(option.color) ? "#000000" : "#ffffff",
                    }}
                  >
                    {option.text}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Message Input */}
        <div className="col-span-6 lg:col-span-8 order-last lg:order-none relative">
          <input
            type="text"
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            maxLength={99}
            placeholder="메시지를 입력하세요... (최대 99자)"
            className="w-full h-full px-4 py-3 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none focus:bg-white/5 transition-colors"
          />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 transition-opacity duration-300 peer-focus:opacity-100"></div>
        </div>

        {/* Send Button */}
        <div className="col-span-6 lg:col-span-2">
          <button
            onClick={handleSendMessage}
            disabled={isSending}
            className="w-full h-full px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold tracking-wide shadow-lg shadow-blue-900/20 transition-all hover:shadow-blue-600/30 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSending ? (
                <>
                  <span className="animate-spin text-lg">↻</span> 전송중...
                </>
              ) : (
                <>
                  <span className="text-lg">✉</span> 서신전달
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
          </button>
        </div>
      </div>

      {/* Message Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 bg-[#1a1b23]">
        {renderMessageSection(
          "public",
          "전체 메시지",
          messagePublic,
          publicAnchorRef as React.RefObject<HTMLDivElement>,
          9999
        )}
        {renderMessageSection(
          "national",
          "국가 메시지",
          messageNational,
          nationalAnchorRef as React.RefObject<HTMLDivElement>,
          nationID + 9000
        )}
        {renderMessageSection(
          "private",
          "개인 메시지",
          messagePrivate,
          privateAnchorRef as React.RefObject<HTMLDivElement>
        )}
        {renderMessageSection(
          "diplomacy",
          "외교 메시지",
          messageDiplomacy,
          diplomacyAnchorRef as React.RefObject<HTMLDivElement>
        )}
      </div>
    </div>
  );
}
