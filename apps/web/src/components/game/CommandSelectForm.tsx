"use client";

/**
 * CommandSelectForm - Command selection grid with category tabs
 * Ported from legacy/hwe/ts/components/CommandSelectForm.vue
 *
 * Features:
 * - Category tabs (내정, 군사, 외교, 인사, 계략, 특수)
 * - Command grid with 2-column layout
 * - Visual indicators for possible/impossible commands
 * - Compensation indicators (▲/▼)
 */

import { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface CommandItem {
  /** Command identifier (e.g., "che_내정_장비_정비") */
  value: string;
  /** Full command title with details */
  title: string;
  /** Additional info/description */
  info: string;
  /** Compensation value: positive = benefit, negative = penalty, 0 = neutral */
  compensation: number;
  /** Short display name */
  simpleName: string;
  /** Whether the command can be executed */
  possible: boolean;
  /** Whether the command requires additional arguments */
  reqArg: boolean;
  /** Optional search text for filtering */
  searchText?: string;
}

export interface CommandCategory {
  category: string;
  values: CommandItem[];
}

interface CategoryDecoration {
  name: string;
  altName?: string;
}

export interface CommandSelectFormProps {
  /** Command list grouped by category */
  commandList: CommandCategory[];
  /** Optional category info for display customization */
  categoryInfo?: Record<string, Omit<CategoryDecoration, "name">>;
  /** Whether to hide the close button */
  hideClose?: boolean;
  /** Currently active category */
  activatedCategory?: string;
  /** Callback when category changes */
  onCategoryChange?: (category: string) => void;
  /** Callback when a command is selected */
  onCommandSelect?: (commandValue: string, command: CommandItem) => void;
  /** Callback when form is closed */
  onClose?: (commandValue?: string) => void;
  /** Additional class name */
  className?: string;
}

export interface CommandSelectFormRef {
  show: () => void;
  close: (category?: string) => void;
  toggle: () => void;
}

// ============================================================================
// Component
// ============================================================================

export const CommandSelectForm = forwardRef<CommandSelectFormRef, CommandSelectFormProps>(
  function CommandSelectForm(
    {
      commandList,
      categoryInfo = {},
      hideClose = true,
      activatedCategory = "",
      onCategoryChange,
      onCommandSelect,
      onClose,
      className,
    },
    ref
  ) {
    const [showForm, setShowForm] = useState(false);
    const [chosenCategory, setChosenCategory] = useState<string>("-");

    // Build category map with decorations
    const categoryMap = useMemo(() => {
      const map = new Map<string, { deco: CategoryDecoration; values: CommandItem[] }>();
      for (const { category, values } of commandList) {
        const itemInfo = categoryInfo[category];
        const deco: CategoryDecoration = itemInfo
          ? { name: category, ...itemInfo }
          : { name: category };
        map.set(category, { deco, values });
      }
      return map;
    }, [commandList, categoryInfo]);

    // Get category list
    const categories = useMemo(() => Array.from(categoryMap.keys()), [categoryMap]);

    // Initialize chosen category
    useEffect(() => {
      if (categories.length === 0) {
        setChosenCategory("");
      } else if (!categories.includes(activatedCategory)) {
        setChosenCategory(commandList[0]?.category ?? "");
      } else {
        setChosenCategory(activatedCategory);
      }
    }, [activatedCategory, categories, commandList]);

    // Notify parent when category changes
    useEffect(() => {
      if (chosenCategory && chosenCategory !== activatedCategory) {
        onCategoryChange?.(chosenCategory);
      }
    }, [chosenCategory, activatedCategory, onCategoryChange]);

    // Expose imperative methods
    const show = useCallback(() => setShowForm(true), []);
    const close = useCallback(
      (commandValue?: string) => {
        setShowForm(false);
        onClose?.(commandValue);
      },
      [onClose]
    );
    const toggle = useCallback(() => {
      setShowForm((prev) => {
        if (prev) {
          onClose?.();
        }
        return !prev;
      });
    }, [onClose]);

    useImperativeHandle(ref, () => ({ show, close, toggle }), [show, close, toggle]);

    // Handle command click
    const handleCommandClick = useCallback(
      (command: CommandItem) => {
        onCommandSelect?.(command.value, command);
        close(command.value);
      },
      [onCommandSelect, close]
    );

    if (!showForm) {
      return null;
    }

    return (
      <div className={cn("my-1", className)}>
        {/* Category tabs - 6 columns (3x2 grid on mobile) */}
        <div className="grid grid-cols-3 gap-1 mb-1">
          {Array.from(categoryMap.entries()).map(([categoryKey, { deco }]) => (
            <button
              key={categoryKey}
              type="button"
              onClick={() => setChosenCategory(categoryKey)}
              className={cn(
                "px-2 py-1.5 text-sm font-medium rounded transition-colors",
                "border border-transparent",
                chosenCategory === categoryKey
                  ? "bg-green-600 text-white border-green-700"
                  : "bg-green-500/80 text-white hover:bg-green-600"
              )}
            >
              {deco.altName ?? deco.name}
            </button>
          ))}
        </div>

        {/* Command grid - stacked layers with visibility toggle */}
        <div className="relative my-1" style={{ display: "grid", alignItems: "self-start" }}>
          {Array.from(categoryMap.entries()).map(([category, { values }]) => (
            <div
              key={category}
              className="grid grid-cols-2 gap-1"
              style={{
                visibility: category === chosenCategory ? "visible" : "hidden",
                gridRow: "1",
                gridColumn: "1",
              }}
            >
              {values.map((command) => (
                <CommandButton
                  key={command.value}
                  command={command}
                  onClick={() => handleCommandClick(command)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Close button */}
        {!hideClose && (
          <div className="grid grid-cols-4 gap-1 mt-1 mb-1">
            <div className="col-start-4">
              <button
                type="button"
                onClick={() => close()}
                className="w-full px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

// ============================================================================
// CommandButton Sub-component
// ============================================================================

interface CommandButtonProps {
  command: CommandItem;
  onClick: () => void;
}

function CommandButton({ command, onClick }: CommandButtonProps) {
  // Extract subtitle from title (part after simpleName)
  const subtitle = useMemo(() => {
    if (command.title.startsWith(command.simpleName)) {
      return command.title.substring(command.simpleName.length);
    }
    return command.title;
  }, [command.title, command.simpleName]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border border-gray-500 rounded-lg overflow-hidden cursor-pointer",
        "p-0.5 m-0 min-h-[2.8em] flex items-center justify-center",
        "hover:bg-gray-700/50 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-green-500/50"
      )}
    >
      <div className="text-center">
        {/* Main command name */}
        <p
          className={cn(
            "text-center my-0 text-sm",
            !command.possible && "text-red-500 line-through"
          )}
        >
          {command.simpleName}
          {/* Compensation indicator */}
          {command.compensation > 0 && (
            <span className="text-cyan-400 inline-block w-4 ml-0.5">▲</span>
          )}
          {command.compensation < 0 && (
            <span className="text-red-500 inline-block w-4 ml-0.5">▼</span>
          )}
          {command.compensation === 0 && <span className="inline-block w-4 ml-0.5" />}
        </p>
        {/* Subtitle/details */}
        {subtitle && <small className="block text-center text-xs text-gray-400">{subtitle}</small>}
      </div>
    </button>
  );
}

export default CommandSelectForm;
