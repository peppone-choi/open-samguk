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
        className={`${type === "public" || type === "private" ? "lg:border-r lg:border-gray-600" : ""}`}
      >
        <div ref={anchorRef} className="relative -top-[68px] invisible" />
        <div className="flex items-center justify-between bg-gray-900 border border-gray-700 px-2 py-1">
          <span className="text-white font-medium">{title}</span>
          {quickTargetMailbox !== undefined && (
            <button
              className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-500"
              onClick={() => setTargetMailbox(quickTargetMailbox)}
            >
              ↩ 여기로
            </button>
          )}
        </div>

        {filteredMessages.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">메시지가 없습니다.</div>
        ) : (
          <div className="lg:h-[650px] lg:overflow-y-auto">
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

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1 p-1">
              <button
                className="lg:hidden px-3 py-1.5 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                onClick={() => handleFoldMessages(type)}
              >
                접기
              </button>
              <button
                className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-500"
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
    <div className={`${className ?? ""}`}>
      {/* Input Form */}
      <div className="grid grid-cols-6 lg:grid-cols-12 gap-0 bg-gray-900">
        {/* Mailbox Selector */}
        <div className="col-span-6 lg:col-span-2">
          <select
            value={targetMailbox}
            onChange={(e) => setTargetMailbox(Number(e.target.value))}
            className="w-full h-full px-2 py-2 bg-gray-800 text-white border border-gray-700 text-sm"
          >
            {mailboxList.map((group) => (
              <optgroup
                key={group.label}
                label={group.label}
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
        <div className="col-span-6 lg:col-span-8 order-last lg:order-none">
          <input
            type="text"
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            maxLength={99}
            placeholder="메시지를 입력하세요..."
            className="w-full h-full px-3 py-2 bg-gray-800 text-white border border-gray-700 text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Send Button */}
        <div className="col-span-6 lg:col-span-2">
          <button
            onClick={handleSendMessage}
            disabled={isSending}
            className="w-full h-full px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? "전송중..." : "서신전달&갱신"}
          </button>
        </div>
      </div>

      {/* Message Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
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
