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
      <div className={cn("my-2", className)}>
        {/* Category tabs - 6 columns (3x2 grid on mobile) */}
        <div className="grid grid-cols-3 gap-1 mb-2">
          {Array.from(categoryMap.entries()).map(([categoryKey, { deco }]) => (
            <button
              key={categoryKey}
              type="button"
              onClick={() => setChosenCategory(categoryKey)}
              className={cn(
                "px-2 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 backdrop-blur-sm",
                "border relative overflow-hidden",
                chosenCategory === categoryKey
                  ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                  : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-foreground hover:border-white/10"
              )}
            >
              {deco.altName ?? deco.name}
            </button>
          ))}
        </div>

        {/* Command grid - stacked layers with visibility toggle */}
        <div className="relative my-2" style={{ display: "grid", alignItems: "self-start" }}>
          {Array.from(categoryMap.entries()).map(([category, { values }]) => (
            <div
              key={category}
              className="grid grid-cols-2 gap-2"
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
          <div className="grid grid-cols-4 gap-2 mt-3 mb-1">
            <div className="col-start-4">
              <button
                type="button"
                onClick={() => close()}
                className="w-full px-3 py-2 text-sm font-medium bg-white/5 text-muted-foreground border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200"
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
        "relative rounded-xl overflow-hidden cursor-pointer backdrop-blur-md transition-all duration-200 group",
        "p-2 m-0 min-h-[3.5em] flex items-center justify-center",
        "border border-white/10 bg-card/40",
        "hover:-translate-y-0.5 hover:bg-card/60 hover:border-primary/50 hover:shadow-lg",
        "focus:outline-none focus:ring-1 focus:ring-primary/50",
        !command.possible &&
          "opacity-50 grayscale cursor-not-allowed hover:translate-y-0 hover:border-white/10 hover:shadow-none"
      )}
    >
      <div className="text-center w-full">
        {/* Main command name */}
        <p
          className={cn(
            "text-center my-0 text-sm font-bold tracking-wide",
            command.possible
              ? "text-gray-100 group-hover:text-primary transition-colors"
              : "text-red-500/70 line-through"
          )}
        >
          {command.simpleName}
          {/* Compensation indicator */}
          {command.compensation > 0 && (
            <span className="text-emerald-400 inline-block w-4 ml-1">▲</span>
          )}
          {command.compensation < 0 && (
            <span className="text-red-400 inline-block w-4 ml-1">▼</span>
          )}
          {command.compensation === 0 && <span className="inline-block w-4 ml-1" />}
        </p>
        {/* Subtitle/details */}
        {subtitle && (
          <small className="block text-center text-[10px] text-muted-foreground/80 mt-0.5 group-hover:text-muted-foreground transition-colors">
            {subtitle}
          </small>
        )}
      </div>
    </button>
  );
}

export default CommandSelectForm;
