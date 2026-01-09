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
      <div className={cn("bg-gray-900 relative", className)}>
        {/* Header */}
        <div className="bg-gray-800 m-0 p-1 text-center">
          <h4 className="m-0 text-base font-semibold">명령 목록</h4>
        </div>

        {/* Top Controls */}
        <div className="grid grid-cols-3 gap-1 p-1">
          <button
            type="button"
            className="px-2 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            onClick={toggleEditMode}
            disabled={!editable}
          >
            {isEditMode ? "일반 모드로" : "고급 모드로"}
          </button>

          <div className="bg-blue-600/50 text-center flex items-center justify-center text-sm rounded">
            {serverTime ? formatTimeHHMM(serverTime) : "--:--"}
          </div>

          <div className="relative">
            <select
              className="w-full px-2 py-1.5 text-sm bg-gray-600 text-white rounded"
              onChange={(e) => handleRepeat(Number(e.target.value))}
              disabled={!editable}
              defaultValue=""
            >
              <option value="" disabled>
                반복
              </option>
              {Array.from({ length: maxPushTurn }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}턴
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Edit Mode Controls */}
        {isEditMode && (
          <div className="grid grid-cols-4 gap-1 p-1">
            {/* Range Selection */}
            <select
              className="px-2 py-1.5 text-sm bg-gray-700 text-white rounded"
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
                범위
              </option>
              <option value="clear">해제</option>
              <option value="all">모든턴</option>
              <option value="odd">홀수턴</option>
              <option value="even">짝수턴</option>
            </select>

            {/* Operations */}
            <select
              className="px-2 py-1.5 text-sm bg-gray-700 text-white rounded"
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
                선택한 턴을
              </option>
              <option value="cut">잘라내기</option>
              <option value="copy">복사하기</option>
              <option value="paste">붙여넣기</option>
              <option value="erase">비우기</option>
            </select>

            {/* Command Select Button */}
            <button
              type="button"
              className="col-span-2 px-2 py-1.5 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-700"
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
            className="absolute bg-gray-800 w-full z-10"
            style={{ top: `${basicModeRowHeight * currentQuickReserveTarget + 110}px` }}
          >
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
        )}

        {/* Turn Grid */}
        <div
          className="w-full"
          style={{
            display: "grid",
            gridTemplateColumns: gridColumns,
          }}
        >
          {/* Turn Index Column */}
          <div style={rowGridStyle}>
            {reservedCommandList.slice(0, viewMaxTurn).map((_, turnIdx) => (
              <div key={turnIdx} className="flex items-center justify-center">
                {isEditMode ? (
                  <button
                    type="button"
                    className={cn(
                      "w-full h-full text-xs font-medium rounded",
                      selectedTurnList.has(turnIdx)
                        ? "bg-cyan-600 text-white"
                        : selectedTurnList.size === 0 && prevSelectedTurnList.has(turnIdx)
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white"
                    )}
                    onClick={() => toggleTurn(turnIdx)}
                  >
                    {turnIdx + 1}
                  </button>
                ) : (
                  <div className="w-full h-full bg-black flex items-center justify-center text-xs">
                    {turnIdx + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Year/Month Column */}
          <div style={rowGridStyle}>
            {reservedCommandList.slice(0, viewMaxTurn).map((turn, turnIdx) => (
              <div
                key={turnIdx}
                className={cn(
                  "flex items-center justify-center text-xs whitespace-nowrap overflow-hidden",
                  isEditMode && "hover:underline cursor-pointer"
                )}
                style={{
                  fontSize: `${Math.min(14, (75 / (`${turn.year ?? 1}`.length + 8)) * 1.8)}px`,
                }}
                onClick={isEditMode ? () => selectTurn(turnIdx) : undefined}
              >
                {turn.year ? `${turn.year}年` : ""}
                {turn.month ? `${turn.month}月` : ""}
              </div>
            ))}
          </div>

          {/* Time Column */}
          <div style={rowGridStyle}>
            {reservedCommandList.slice(0, viewMaxTurn).map((turn, turnIdx) => (
              <div
                key={turnIdx}
                className="bg-black flex items-center justify-center text-xs whitespace-nowrap overflow-hidden"
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
                  "flex items-center justify-center text-sm whitespace-nowrap px-1",
                  turnIdx % 2 === 0 ? "bg-gray-700" : "bg-gray-800"
                )}
                style={turn.style}
                title={turn.tooltip}
              >
                <span
                  className="inline-block whitespace-nowrap text-ellipsis overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: turn.brief }}
                />
              </div>
            ))}
          </div>

          {/* Action Button Column (Normal Mode Only) */}
          {!isEditMode && (
            <div style={rowGridStyle}>
              {reservedCommandList.slice(0, viewMaxTurn).map((_, turnIdx) => (
                <div key={turnIdx} className="flex items-center justify-center">
                  <button
                    type="button"
                    className={cn(
                      "w-full h-full text-xs",
                      turnIdx % 2 === 0 ? "bg-gray-600" : "bg-gray-700",
                      "hover:bg-gray-500"
                    )}
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
        <div className="grid grid-cols-3 gap-1 p-1">
          <select
            className="px-2 py-1.5 text-sm bg-gray-600 text-white rounded"
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val) void handlePush(-val);
              e.target.value = "";
            }}
            disabled={!editable}
            defaultValue=""
          >
            <option value="" disabled>
              당기기
            </option>
            {Array.from({ length: maxPushTurn }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}턴
              </option>
            ))}
          </select>

          <select
            className="px-2 py-1.5 text-sm bg-gray-600 text-white rounded"
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val) void handlePush(val);
              e.target.value = "";
            }}
            disabled={!editable}
            defaultValue=""
          >
            <option value="" disabled>
              미루기
            </option>
            {Array.from({ length: maxPushTurn }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}턴
              </option>
            ))}
          </select>

          <button
            type="button"
            className="px-2 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            onClick={toggleViewMaxTurn}
          >
            {viewMaxTurn === 14 ? "펼치기" : "접기"}
          </button>
        </div>
      </div>
    );
  }
);

export default ReservedCommandPanel;
