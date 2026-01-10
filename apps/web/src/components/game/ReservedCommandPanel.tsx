"use client";

/**
 * ReservedCommandPanel - Turn-based command reservation panel
 * Ported from legacy/hwe/ts/PartialReservedCommand.vue
 *
 * Features:
 * - Turn-based command grid (14 turns collapsed, 35 expanded)
 * - Normal mode: Simple turn selection with quick edit
 * - Edit mode: Advanced operations (drag select, cut/copy/paste)
 * - Command repeat, push, pull functionality
 * - Integration with CommandSelectForm
 */

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { cn } from "@/lib/utils";
import {
  CommandSelectForm,
  type CommandItem,
  type CommandCategory,
  type CommandSelectFormRef,
} from "./CommandSelectForm";

// ============================================================================
// Types
// ============================================================================

export interface TurnObj {
  action: string;
  brief: string;
  arg?: Record<string, unknown>;
}

export interface ReservedTurnObj extends TurnObj {
  year?: number;
  month?: number;
  time?: string;
  tooltip?: string;
  style?: React.CSSProperties;
}

export interface ReservedCommandPanelProps {
  /** Maximum turns (default: 35) */
  maxTurn?: number;
  /** Maximum push/pull turns (default: 10) */
  maxPushTurn?: number;
  /** Initial reserved command list */
  initialTurns?: ReservedTurnObj[];
  /** Command list for selection */
  commandList: CommandCategory[];
  /** Current server time */
  serverTime?: Date;
  /** Callback when command is reserved */
  onReserveCommand?: (
    turnList: number[],
    action: string,
    arg?: Record<string, unknown>
  ) => Promise<boolean>;
  /** Callback when bulk commands are reserved */
  onReserveBulkCommand?: (
    commands: Array<{ turnList: number[]; action: TurnObj }>
  ) => Promise<boolean>;
  /** Callback to repeat commands */
  onRepeatCommand?: (amount: number) => Promise<void>;
  /** Callback to push/pull commands */
  onPushCommand?: (amount: number) => Promise<void>;
  /** Callback to reload command list */
  onReloadCommands?: () => Promise<void>;
  /** Callback when command needs additional arguments (redirect) */
  onCommandNeedsArg?: (commandName: string, turnList: number[]) => void;
  /** Whether the commands are editable */
  editable?: boolean;
  className?: string;
}

export interface ReservedCommandPanelRef {
  updateCommandTable: () => void;
  reloadCommandList: () => void;
}

// ============================================================================
// Utility functions
// ============================================================================

function formatTimeHHMM(date: Date): string {
  return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// ============================================================================
// Component
// ============================================================================

export const ReservedCommandPanel = forwardRef<ReservedCommandPanelRef, ReservedCommandPanelProps>(
  function ReservedCommandPanel(
    {
      maxTurn = 35,
      maxPushTurn = 10,
      initialTurns = [],
      commandList,
      serverTime,
      onReserveCommand,
      onReserveBulkCommand,
      onRepeatCommand,
      onPushCommand,
      onReloadCommands,
      onCommandNeedsArg,
      editable = true,
      className,
    },
    ref
  ) {
    // ========================================================================
    // State
    // ========================================================================

    const [isEditMode, setIsEditMode] = useState(false);
    const [reservedCommandList, setReservedCommandList] = useState<ReservedTurnObj[]>(initialTurns);
    const [selectedTurnList, setSelectedTurnList] = useState<Set<number>>(new Set());
    const [prevSelectedTurnList, setPrevSelectedTurnList] = useState<Set<number>>(new Set());
    const [viewMaxTurn, setViewMaxTurn] = useState(14);
    const [activatedCategory, setActivatedCategory] = useState("");
    const [currentQuickReserveTarget, setCurrentQuickReserveTarget] = useState(-1);
    const [clipboard, setClipboard] = useState<Array<[number[], TurnObj]> | undefined>();

    // Refs for CommandSelectForm
    const commandSelectFormRef = useRef<CommandSelectFormRef>(null);
    const quickReserveFormRef = useRef<CommandSelectFormRef>(null);

    // Commands that require arguments
    const reqArgCommands = useMemo(() => {
      const set = new Set<string>();
      for (const category of commandList) {
        for (const command of category.values) {
          if (command.reqArg) {
            set.add(command.value);
          }
        }
      }
      return set;
    }, [commandList]);

    // Update initial turns when prop changes
    useEffect(() => {
      setReservedCommandList(initialTurns);
    }, [initialTurns]);

    // ========================================================================
    // Exposed Methods
    // ========================================================================

    const updateCommandTable = useCallback(() => {
      // This would typically fetch new command list from API
      // For now it's a no-op as commandList comes from props
    }, []);

    const reloadCommandList = useCallback(async () => {
      await onReloadCommands?.();
    }, [onReloadCommands]);

    useImperativeHandle(
      ref,
      () => ({
        updateCommandTable,
        reloadCommandList,
      }),
      [updateCommandTable, reloadCommandList]
    );

    // ========================================================================
    // Turn Selection Helpers
    // ========================================================================

    const getSelectedTurnList = useCallback((): number[] => {
      if (selectedTurnList.size === 0) {
        return Array.from(prevSelectedTurnList).sort((a, b) => a - b);
      }
      return Array.from(selectedTurnList).sort((a, b) => a - b);
    }, [selectedTurnList, prevSelectedTurnList]);

    const toggleTurn = useCallback((turnIdx: number) => {
      setSelectedTurnList((prev) => {
        const next = new Set(prev);
        if (next.has(turnIdx)) {
          next.delete(turnIdx);
        } else {
          next.add(turnIdx);
        }
        return next;
      });
    }, []);

    const selectTurn = useCallback((turnIdx: number) => {
      setSelectedTurnList(new Set([turnIdx]));
    }, []);

    const selectAll = useCallback(() => {
      setSelectedTurnList(new Set(Array.from({ length: maxTurn }, (_, i) => i)));
    }, [maxTurn]);

    const clearSelection = useCallback(() => {
      setPrevSelectedTurnList(selectedTurnList);
      setSelectedTurnList(new Set());
    }, [selectedTurnList]);

    const selectStep = useCallback(
      (offset: number, step: number) => {
        const newSelection = new Set<number>();
        for (let i = offset; i < maxTurn; i += step) {
          newSelection.add(i);
        }
        setSelectedTurnList(newSelection);
      },
      [maxTurn]
    );

    // ========================================================================
    // Command Actions
    // ========================================================================

    const emptyTurnObj: TurnObj = { action: "휴식", brief: "휴식", arg: {} };

    const reserveCommand = useCallback(
      async (commandName: string) => {
        const turnList = getSelectedTurnList();
        if (turnList.length === 0) return;

        // Check if command needs arguments
        if (reqArgCommands.has(commandName)) {
          onCommandNeedsArg?.(commandName, turnList);
          return;
        }

        const success = await onReserveCommand?.(turnList, commandName);
        if (success) {
          clearSelection();
          await reloadCommandList();
        }
      },
      [
        getSelectedTurnList,
        reqArgCommands,
        onCommandNeedsArg,
        onReserveCommand,
        clearSelection,
        reloadCommandList,
      ]
    );

    const handleCommandSelect = useCallback(
      (_value: string, command: CommandItem) => {
        void reserveCommand(command.value);
      },
      [reserveCommand]
    );

    const handleQuickReserveCommand = useCallback(
      (_value: string, command: CommandItem) => {
        // Select only the quick reserve target turn
        setSelectedTurnList(new Set([currentQuickReserveTarget]));
        void reserveCommand(command.value);
        quickReserveFormRef.current?.close();
        setCurrentQuickReserveTarget(-1);
      },
      [currentQuickReserveTarget, reserveCommand]
    );

    // ========================================================================
    // Edit Mode Operations
    // ========================================================================

    const extractQueryActions = useCallback((): Array<[number[], TurnObj]> => {
      const turnList = getSelectedTurnList();
      if (turnList.length === 0) return [];

      const actionGroups = new Map<string, { turnList: number[]; action: TurnObj }>();

      for (const turnIdx of turnList) {
        const turn = reservedCommandList[turnIdx];
        if (!turn) continue;

        const key = `${turn.action}|${JSON.stringify(turn.arg || {})}`;
        const group = actionGroups.get(key);
        if (group) {
          group.turnList.push(turnIdx);
        } else {
          actionGroups.set(key, {
            turnList: [turnIdx],
            action: { action: turn.action, brief: turn.brief, arg: turn.arg },
          });
        }
      }

      return Array.from(actionGroups.values()).map((g) => [g.turnList, g.action]);
    }, [getSelectedTurnList, reservedCommandList]);

    const clipboardCopy = useCallback(() => {
      const actions = extractQueryActions();
      setClipboard(actions);
      clearSelection();
    }, [extractQueryActions, clearSelection]);

    const clipboardCut = useCallback(async () => {
      clipboardCopy();
      const turnList = getSelectedTurnList();
      await onReserveBulkCommand?.([{ turnList, action: emptyTurnObj }]);
      await reloadCommandList();
    }, [clipboardCopy, getSelectedTurnList, onReserveBulkCommand, reloadCommandList]);

    const clipboardPaste = useCallback(async () => {
      if (!clipboard || clipboard.length === 0) return;

      const targetTurns = getSelectedTurnList();
      if (targetTurns.length === 0) return;

      // Amplify clipboard actions to target turns
      const commands: Array<{ turnList: number[]; action: TurnObj }> = [];
      const srcMinTurn = Math.min(...clipboard.flatMap(([turns]) => turns));

      for (const [srcTurns, action] of clipboard) {
        const destTurns = srcTurns
          .map((t) => {
            const offset = t - srcMinTurn;
            return targetTurns[0] + offset;
          })
          .filter((t) => t < maxTurn);

        if (destTurns.length > 0) {
          commands.push({ turnList: destTurns, action });
        }
      }

      await onReserveBulkCommand?.(commands);
      clearSelection();
      await reloadCommandList();
    }, [
      clipboard,
      getSelectedTurnList,
      maxTurn,
      onReserveBulkCommand,
      clearSelection,
      reloadCommandList,
    ]);

    const eraseSelectedTurns = useCallback(async () => {
      const turnList = getSelectedTurnList();
      if (turnList.length === 0) return;

      await onReserveBulkCommand?.([{ turnList, action: emptyTurnObj }]);
      clearSelection();
      await reloadCommandList();
    }, [getSelectedTurnList, onReserveBulkCommand, clearSelection, reloadCommandList]);

    // ========================================================================
    // Push/Pull/Repeat Operations
    // ========================================================================

    const handleRepeat = useCallback(
      async (amount: number) => {
        await onRepeatCommand?.(amount);
        await reloadCommandList();
      },
      [onRepeatCommand, reloadCommandList]
    );

    const handlePush = useCallback(
      async (amount: number) => {
        await onPushCommand?.(amount);
        await reloadCommandList();
      },
      [onPushCommand, reloadCommandList]
    );

    // ========================================================================
    // UI Helpers
    // ========================================================================

    const toggleEditMode = useCallback(() => {
      setIsEditMode((prev) => {
        if (prev) {
          // Switching from edit to normal mode
          quickReserveFormRef.current?.close();
        } else {
          // Switching from normal to edit mode
          commandSelectFormRef.current?.close();
          setCurrentQuickReserveTarget(-1);
        }
        return !prev;
      });
    }, []);

    const toggleViewMaxTurn = useCallback(() => {
      setViewMaxTurn((prev) => (prev === 14 ? maxTurn : 14));
    }, [maxTurn]);

    const toggleQuickReserveForm = useCallback(
      (turnIdx: number) => {
        if (turnIdx === currentQuickReserveTarget) {
          quickReserveFormRef.current?.toggle();
          return;
        }
        setCurrentQuickReserveTarget(turnIdx);
        quickReserveFormRef.current?.show();
      },
      [currentQuickReserveTarget]
    );

    // ========================================================================
    // Grid Style
    // ========================================================================

    const editModeRowHeight = 29.35;
    const basicModeRowHeight = 34.4;
    const rowHeight = isEditMode ? editModeRowHeight : basicModeRowHeight;

    const rowGridStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateRows: `repeat(${viewMaxTurn}, ${rowHeight}px)`,
    };

    // Grid columns
    const gridColumns = isEditMode
      ? "minmax(30px, 1fr) minmax(75px, 2.5fr) minmax(40px, 1fr) 5fr"
      : "minmax(20px, 0.8fr) minmax(75px, 2.4fr) minmax(40px, 0.9fr) 4.8fr minmax(28px, 0.8fr)";

    // ========================================================================
    // Render
    // ========================================================================

    return (
      <div
        className={cn(
          "relative bg-[#1a1b23] border border-white/10 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/5",
          className
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 p-2 text-center relative shadow-md z-10">
          <h4 className="m-0 text-sm font-bold text-white/90 tracking-wider flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse"></span>
            명령 예약 관리
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse"></span>
          </h4>
        </div>

        {/* Top Controls */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-white/5 backdrop-blur-sm border-b border-white/5">
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded transition-all duration-200 border ${
              isEditMode
                ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
            onClick={toggleEditMode}
            disabled={!editable}
          >
            {isEditMode ? "⚡ 고급 모드 ON" : "⚙ 일반 모드"}
          </button>

          <div className="bg-black/40 border border-white/5 text-center flex items-center justify-center text-xs font-mono text-cyan-400 rounded shadow-inner">
            {serverTime ? formatTimeHHMM(serverTime) : "--:--"}
          </div>

          <div className="relative group">
            <select
              className="w-full h-full px-2 py-1.5 text-xs bg-black/40 text-white/90 border border-white/10 rounded appearance-none cursor-pointer hover:border-white/20 transition-colors focus:outline-none focus:border-cyan-500/50"
              onChange={(e) => handleRepeat(Number(e.target.value))}
              disabled={!editable}
              defaultValue=""
            >
              <option value="" disabled>
                ↺ 명령 반복
              </option>
              {Array.from({ length: maxPushTurn }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}턴 반복
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-white/30 text-[10px]">
              ▼
            </div>
          </div>
        </div>

        {/* Edit Mode Controls */}
        {isEditMode && (
          <div className="grid grid-cols-4 gap-2 p-3 bg-cyan-950/30 border-b border-cyan-500/20 backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
            {/* Range Selection */}
            <div className="relative">
              <select
                className="w-full px-2 py-1.5 text-xs bg-black/40 text-cyan-100 border border-cyan-500/30 rounded appearance-none cursor-pointer hover:bg-black/50 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "clear") clearSelection();
                  else if (val === "all") selectAll();
                  else if (val === "odd") selectStep(0, 2);
                  else if (val === "even") selectStep(1, 2);
                  e.target.value = "";
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  선택 범위
                </option>
                <option value="clear">선택 해제</option>
                <option value="all">모든 턴</option>
                <option value="odd">홀수 턴</option>
                <option value="even">짝수 턴</option>
              </select>
            </div>

            {/* Operations */}
            <div className="relative">
              <select
                className="w-full px-2 py-1.5 text-xs bg-black/40 text-cyan-100 border border-cyan-500/30 rounded appearance-none cursor-pointer hover:bg-black/50 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "cut") void clipboardCut();
                  else if (val === "copy") clipboardCopy();
                  else if (val === "paste") void clipboardPaste();
                  else if (val === "erase") void eraseSelectedTurns();
                  e.target.value = "";
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  작업 수행
                </option>
                <option value="cut">✂ 잘라내기</option>
                <option value="copy">📋 복사하기</option>
                <option value="paste">📌 붙여넣기</option>
                <option value="erase">❌ 비우기</option>
              </select>
            </div>

            {/* Command Select Button */}
            <button
              type="button"
              className="col-span-2 px-3 py-1.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded shadow-lg shadow-cyan-900/20 transition-all active:translate-y-0.5"
              disabled={!editable || commandList.length === 0}
              onClick={() => commandSelectFormRef.current?.toggle()}
            >
              명령 선택 ▾
            </button>
          </div>
        )}

        {/* Command Select Form (Edit Mode) */}
        <CommandSelectForm
          ref={commandSelectFormRef}
          commandList={commandList}
          activatedCategory={activatedCategory}
          onCategoryChange={setActivatedCategory}
          onCommandSelect={handleCommandSelect}
        />

        {/* Quick Reserve Form (Normal Mode) - Positioned absolutely */}
        {!isEditMode && currentQuickReserveTarget >= 0 && (
          <div
            className="absolute left-0 right-0 z-50 px-2 animate-in fade-in zoom-in-95 duration-200"
            style={{ top: `${basicModeRowHeight * currentQuickReserveTarget + 120}px` }}
          >
            <div className="bg-[#1a1b23] border border-white/20 rounded-lg shadow-2xl p-1 ring-1 ring-black/50">
              <CommandSelectForm
                ref={quickReserveFormRef}
                commandList={commandList}
                hideClose={false}
                activatedCategory={activatedCategory}
                onCategoryChange={setActivatedCategory}
                onCommandSelect={handleQuickReserveCommand}
                onClose={() => setCurrentQuickReserveTarget(-1)}
              />
            </div>
          </div>
        )}

        {/* Turn Grid */}
        <div
          className="w-full bg-black/20"
          style={{
            display: "grid",
            gridTemplateColumns: gridColumns,
          }}
        >
          {/* Turn Index Column */}
          <div style={rowGridStyle} className="bg-black/10 border-r border-white/5">
            {reservedCommandList.slice(0, viewMaxTurn).map((_, turnIdx) => (
              <div
                key={turnIdx}
                className="flex items-center justify-center border-b border-white/5"
              >
                {isEditMode ? (
                  <button
                    type="button"
                    className={cn(
                      "w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full transition-all duration-200",
                      selectedTurnList.has(turnIdx)
                        ? "bg-cyan-500 text-white shadow-[0_0_8px_rgba(6,182,212,0.5)] scale-110"
                        : selectedTurnList.size === 0 && prevSelectedTurnList.has(turnIdx)
                          ? "bg-emerald-600 text-white opacity-70"
                          : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
                    )}
                    onClick={() => toggleTurn(turnIdx)}
                  >
                    {turnIdx + 1}
                  </button>
                ) : (
                  <div className="w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-white/5 text-white/40 font-mono">
                    {turnIdx + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Year/Month Column */}
          <div style={rowGridStyle} className="border-r border-white/5">
            {reservedCommandList.slice(0, viewMaxTurn).map((turn, turnIdx) => (
              <div
                key={turnIdx}
                className={cn(
                  "flex items-center justify-center text-xs whitespace-nowrap overflow-hidden border-b border-white/5 transition-colors",
                  isEditMode
                    ? "hover:bg-cyan-500/10 cursor-pointer text-cyan-200/80"
                    : "text-white/60",
                  turnIdx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                )}
                style={{
                  fontSize: `${Math.min(12, (75 / (`${turn.year ?? 1}`.length + 8)) * 1.8)}px`,
                }}
                onClick={isEditMode ? () => selectTurn(turnIdx) : undefined}
              >
                {turn.year ? `${turn.year}年` : ""}
                {turn.month ? `${turn.month}月` : ""}
              </div>
            ))}
          </div>

          {/* Time Column */}
          <div style={rowGridStyle} className="border-r border-white/5">
            {reservedCommandList.slice(0, viewMaxTurn).map((turn, turnIdx) => (
              <div
                key={turnIdx}
                className={cn(
                  "flex items-center justify-center text-[10px] font-mono whitespace-nowrap overflow-hidden border-b border-white/5 text-white/30",
                  turnIdx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                )}
              >
                {turn.time}
              </div>
            ))}
          </div>

          {/* Command Brief Column */}
          <div style={rowGridStyle}>
            {reservedCommandList.slice(0, viewMaxTurn).map((turn, turnIdx) => (
              <div
                key={turnIdx}
                className={cn(
                  "flex items-center justify-center text-xs whitespace-nowrap px-2 border-b border-white/5 transition-all duration-200",
                  turnIdx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent",
                  isEditMode && selectedTurnList.has(turnIdx)
                    ? "bg-cyan-500/10 text-cyan-200"
                    : "text-white/80"
                )}
                style={turn.style}
                title={turn.tooltip}
              >
                <span
                  className="inline-block whitespace-nowrap text-ellipsis overflow-hidden drop-shadow-sm"
                  dangerouslySetInnerHTML={{ __html: turn.brief }}
                />
              </div>
            ))}
          </div>

          {/* Action Button Column (Normal Mode Only) */}
          {!isEditMode && (
            <div style={rowGridStyle} className="border-l border-white/5">
              {reservedCommandList.slice(0, viewMaxTurn).map((_, turnIdx) => (
                <div
                  key={turnIdx}
                  className={cn(
                    "flex items-center justify-center border-b border-white/5",
                    turnIdx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                  )}
                >
                  <button
                    type="button"
                    className="w-full h-full text-white/30 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all text-xs"
                    disabled={!editable || commandList.length === 0}
                    onClick={() => toggleQuickReserveForm(turnIdx)}
                  >
                    ✎
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-white/5 backdrop-blur-sm border-t border-white/5">
          <div className="relative group">
            <select
              className="w-full h-full px-2 py-1.5 text-xs bg-black/40 text-white/70 border border-white/10 rounded appearance-none cursor-pointer hover:border-white/20 hover:text-white transition-colors focus:outline-none"
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val) void handlePush(-val);
                e.target.value = "";
              }}
              disabled={!editable}
              defaultValue=""
            >
              <option value="" disabled>
                ▲ 당기기
              </option>
              {Array.from({ length: maxPushTurn }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}턴 위로
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-white/30 text-[10px]">
              ▼
            </div>
          </div>

          <div className="relative group">
            <select
              className="w-full h-full px-2 py-1.5 text-xs bg-black/40 text-white/70 border border-white/10 rounded appearance-none cursor-pointer hover:border-white/20 hover:text-white transition-colors focus:outline-none"
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val) void handlePush(val);
                e.target.value = "";
              }}
              disabled={!editable}
              defaultValue=""
            >
              <option value="" disabled>
                ▼ 미루기
              </option>
              {Array.from({ length: maxPushTurn }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}턴 아래로
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-white/30 text-[10px]">
              ▼
            </div>
          </div>

          <button
            type="button"
            className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded transition-all active:scale-95"
            onClick={toggleViewMaxTurn}
          >
            {viewMaxTurn === 14 ? "▼ 더보기" : "▲ 접기"}
          </button>
        </div>
      </div>
    );
  }
);

export default ReservedCommandPanel;
