"use client";

/**
 * CommandArgForms - Modal-based command argument selectors
 * Ported from legacy/hwe/ts/processing/*.vue
 *
 * Components:
 * - SelectCityModal - City dropdown selector
 * - SelectNationModal - Nation dropdown selector
 * - SelectGeneralModal - General dropdown selector
 * - SelectAmountInput - Amount input with increment buttons
 * - SelectColorModal - Color picker for nation founding
 */

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
} from "react";
import { cn, getKoreanInitials } from "@/lib/utils";

// ============================================================================
// Shared Types
// ============================================================================

export interface SelectOption<T = number> {
  value: T;
  title: string;
  simpleName: string;
  searchText?: string;
  info?: string;
  notAvailable?: boolean;
}

export interface CityOption extends SelectOption<number> {
  nationId?: number;
}

export interface NationOption extends SelectOption<number> {
  color?: string;
}

export interface GeneralOption extends SelectOption<number> {
  nationId: number;
  leadership: number;
  strength: number;
  intel: number;
  npc?: number;
}

// ============================================================================
// Modal Container
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        aria-label="Close modal"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />
      {/* Modal Content */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// ============================================================================
// Searchable Select Base
// ============================================================================

interface SearchableSelectProps<T extends SelectOption> {
  options: T[];
  value: number;
  onChange: (value: number, option: T) => void;
  placeholder?: string;
  searchable?: boolean;
  renderOption?: (option: T) => ReactNode;
  maxHeight?: number;
}

function SearchableSelect<T extends SelectOption>({
  options,
  value,
  onChange,
  placeholder = "선택",
  searchable = true,
  renderOption,
  maxHeight = 300,
}: SearchableSelectProps<T>) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const lower = search.toLowerCase();
    return options.filter(
      (opt) =>
        opt.title.toLowerCase().includes(lower) ||
        opt.simpleName.toLowerCase().includes(lower) ||
        opt.searchText?.toLowerCase().includes(lower)
    );
  }, [options, search]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const handleSelect = useCallback(
    (option: T) => {
      onChange(option.value, option);
      setIsOpen(false);
      setSearch("");
    },
    [onChange]
  );

  return (
    <div className="relative">
      {/* Selected Value Display / Search Input */}
      <div
        className={cn(
          "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md",
          "text-white cursor-pointer flex items-center justify-between",
          isOpen && "border-cyan-500"
        )}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? "text-white" : "text-gray-400"}>
          {selectedOption?.simpleName ?? placeholder}
        </span>
        <span className="text-gray-400">▼</span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-600">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="검색..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto" style={{ maxHeight }}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-gray-400 text-sm">결과가 없습니다</div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "px-3 py-2 cursor-pointer transition-colors text-sm",
                    option.value === value
                      ? "bg-cyan-600 text-white"
                      : "hover:bg-gray-600 text-white",
                    option.notAvailable && "text-red-400"
                  )}
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={option.value === value}
                >
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <span>
                      {option.title}
                      {option.info && <span className="text-gray-400 ml-1">({option.info})</span>}
                      {option.notAvailable && <span className="text-red-400 ml-1">(불가)</span>}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SelectCityModal
// ============================================================================

export interface SelectCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: Map<number, { name: string; info?: string; notAvailable?: boolean }>;
  value: number;
  onChange: (cityId: number) => void;
  onConfirm?: (cityId: number) => void;
}

export function SelectCityModal({
  isOpen,
  onClose,
  cities,
  value,
  onChange,
  onConfirm,
}: SelectCityModalProps) {
  const options = useMemo(() => {
    const result: CityOption[] = [];
    for (const [id, city] of cities.entries()) {
      result.push({
        value: id,
        title: city.name,
        simpleName: city.name,
        info: city.info,
        notAvailable: city.notAvailable,
        searchText: `${city.name} ${getKoreanInitials(city.name)}`,
      });
    }
    return result;
  }, [cities]);

  const handleConfirm = useCallback(() => {
    onConfirm?.(value);
    onClose();
  }, [value, onConfirm, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="도시 선택">
      <div className="space-y-4">
        <SearchableSelect
          options={options}
          value={value}
          onChange={(v) => onChange(v)}
          placeholder="도시 선택"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            확인
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// SelectNationModal
// ============================================================================

export interface SelectNationModalProps {
  isOpen: boolean;
  onClose: () => void;
  nations: Map<number, { name: string; color?: string; info?: string; notAvailable?: boolean }>;
  value: number;
  onChange: (nationId: number) => void;
  onConfirm?: (nationId: number) => void;
}

export function SelectNationModal({
  isOpen,
  onClose,
  nations,
  value,
  onChange,
  onConfirm,
}: SelectNationModalProps) {
  const options = useMemo(() => {
    const result: NationOption[] = [];
    for (const [id, nation] of nations.entries()) {
      result.push({
        value: id,
        title: nation.name,
        simpleName: nation.name,
        color: nation.color,
        info: nation.info,
        notAvailable: nation.notAvailable,
        searchText: `${nation.name} ${getKoreanInitials(nation.name)}`,
      });
    }
    return result;
  }, [nations]);

  const handleConfirm = useCallback(() => {
    onConfirm?.(value);
    onClose();
  }, [value, onConfirm, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="국가 선택">
      <div className="space-y-4">
        <SearchableSelect
          options={options}
          value={value}
          onChange={(v) => onChange(v)}
          placeholder="국가 선택"
          renderOption={(option) => (
            <div className="flex items-center gap-2">
              {option.color && (
                <span className="w-4 h-4 rounded" style={{ backgroundColor: option.color }} />
              )}
              <span>
                {option.title}
                {option.info && <span className="text-gray-400 ml-1">({option.info})</span>}
                {option.notAvailable && <span className="text-red-400 ml-1">(불가)</span>}
              </span>
            </div>
          )}
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            확인
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// SelectGeneralModal
// ============================================================================

export interface GeneralItem {
  no: number;
  name: string;
  nationId: number;
  leadership: number;
  strength: number;
  intel: number;
  npc?: number;
  troopId?: number;
}

export interface SelectGeneralModalProps {
  isOpen: boolean;
  onClose: () => void;
  generals: GeneralItem[];
  nations?: Map<number, { name: string; color: string }>;
  value: number;
  onChange: (generalId: number) => void;
  onConfirm?: (generalId: number) => void;
  textHelper?: (general: GeneralItem) => string;
  groupByNation?: boolean;
}

export function SelectGeneralModal({
  isOpen,
  onClose,
  generals,
  nations,
  value,
  onChange,
  onConfirm,
  textHelper,
  groupByNation = false,
}: SelectGeneralModalProps) {
  const options = useMemo(() => {
    return generals.map((gen) => ({
      value: gen.no,
      title: textHelper
        ? textHelper(gen)
        : `${gen.name} (${gen.leadership}/${gen.strength}/${gen.intel})`,
      simpleName: gen.name,
      nationId: gen.nationId,
      leadership: gen.leadership,
      strength: gen.strength,
      intel: gen.intel,
      npc: gen.npc,
      searchText: `${gen.name} ${getKoreanInitials(gen.name)}`,
    }));
  }, [generals, textHelper]);

  // Group by nation if requested
  const groupedOptions = useMemo(() => {
    if (!groupByNation || !nations) return null;

    const groups = new Map<number, GeneralOption[]>();
    for (const opt of options) {
      const nationId = opt.nationId ?? 0;
      if (!groups.has(nationId)) {
        groups.set(nationId, []);
      }
      groups.get(nationId)!.push(opt);
    }
    return groups;
  }, [options, groupByNation, nations]);

  const handleConfirm = useCallback(() => {
    onConfirm?.(value);
    onClose();
  }, [value, onConfirm, onClose]);

  const getNPCColor = (npc?: number): string | null => {
    if (!npc) return null;
    if (npc >= 5) return "#ffff00"; // Yellow for high NPC
    if (npc >= 2) return "#00ffff"; // Cyan for mid NPC
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="장수 선택">
      <div className="space-y-4">
        {groupedOptions ? (
          <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 400 }}>
            {Array.from(groupedOptions.entries()).map(([nationId, opts]) => {
              const nation = nations?.get(nationId);
              return (
                <div key={nationId}>
                  {/* Nation Header */}
                  <div
                    className="px-3 py-1.5 text-sm font-medium"
                    style={{
                      backgroundColor: nation?.color ?? "#333",
                      color: "#fff",
                    }}
                  >
                    {nation?.name ?? "무소속"}
                  </div>
                  {/* Generals */}
                  {opts.map((opt) => (
                    <div
                      key={opt.value}
                      className={cn(
                        "px-3 py-2 cursor-pointer transition-colors text-sm",
                        opt.value === value
                          ? "bg-cyan-600 text-white"
                          : "hover:bg-gray-600 text-white"
                      )}
                      onClick={() => onChange(opt.value)}
                      role="option"
                      aria-selected={opt.value === value}
                    >
                      <span style={{ color: getNPCColor(opt.npc) ?? undefined }}>{opt.title}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <SearchableSelect
            options={options}
            value={value}
            onChange={(v) => onChange(v)}
            placeholder="장수 선택"
            renderOption={(option) => (
              <span style={{ color: getNPCColor(option.npc) ?? undefined }}>{option.title}</span>
            )}
          />
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            확인
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// SelectAmountInput
// ============================================================================

export interface SelectAmountInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  amountGuide?: number[];
  className?: string;
}

export function SelectAmountInput({
  value,
  onChange,
  min = 0,
  max = 100000,
  step = 1,
  amountGuide = [1000, 2000, 5000, 10000],
  className,
}: SelectAmountInputProps) {
  const [showGuide, setShowGuide] = useState(false);

  const handleChange = useCallback(
    (delta: number) => {
      const newValue = Math.max(min, Math.min(max, value + delta));
      onChange(newValue);
    },
    [value, min, max, onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Math.max(min, Math.min(max, Number(e.target.value) || 0));
      onChange(newValue);
    },
    [min, max, onChange]
  );

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Decrement buttons */}
      {max > 20000 && (
        <button
          type="button"
          onClick={() => handleChange(-10000)}
          className="px-2 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          -만
        </button>
      )}
      {max > 2000 && (
        <button
          type="button"
          onClick={() => handleChange(-1000)}
          className="px-2 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          -천
        </button>
      )}
      {max > 200 && (
        <button
          type="button"
          onClick={() => handleChange(-100)}
          className="px-2 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          -백
        </button>
      )}

      {/* Input */}
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        className="flex-1 px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white text-right text-sm focus:outline-none focus:border-cyan-500"
      />

      {/* Amount Guide Dropdown */}
      {amountGuide && amountGuide.length > 0 && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="px-2 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ▼
          </button>
          {showGuide && (
            <div className="absolute right-0 mt-1 bg-gray-700 border border-gray-600 rounded shadow-lg z-10 min-w-[80px]">
              {amountGuide.map((guide) => (
                <button
                  key={guide}
                  type="button"
                  onClick={() => {
                    onChange(guide);
                    setShowGuide(false);
                  }}
                  className="block w-full px-3 py-1.5 text-right text-sm text-white hover:bg-gray-600"
                >
                  {guide.toLocaleString()}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Increment buttons */}
      {max > 200 && (
        <button
          type="button"
          onClick={() => handleChange(100)}
          className="px-2 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          +백
        </button>
      )}
      {max > 2000 && (
        <button
          type="button"
          onClick={() => handleChange(1000)}
          className="px-2 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          +천
        </button>
      )}
      {max >= 10000 && (
        <button
          type="button"
          onClick={() => handleChange(10000)}
          className="px-2 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          +만
        </button>
      )}
    </div>
  );
}

// ============================================================================
// SelectAmountModal
// ============================================================================

export interface SelectAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: number;
  onChange: (value: number) => void;
  onConfirm?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  amountGuide?: number[];
  title?: string;
  label?: string;
}

export function SelectAmountModal({
  isOpen,
  onClose,
  value,
  onChange,
  onConfirm,
  min = 0,
  max = 100000,
  step = 1,
  amountGuide,
  title = "수량 입력",
  label,
}: SelectAmountModalProps) {
  const handleConfirm = useCallback(() => {
    onConfirm?.(value);
    onClose();
  }, [value, onConfirm, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {label && <label className="block text-sm text-gray-300">{label}</label>}
        <SelectAmountInput
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          amountGuide={amountGuide}
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            확인
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// SelectColorModal
// ============================================================================

// Standard nation colors
const DEFAULT_NATION_COLORS = [
  "#FF0000",
  "#FF8000",
  "#FFFF00",
  "#80FF00",
  "#00FF00",
  "#00FF80",
  "#00FFFF",
  "#0080FF",
  "#0000FF",
  "#8000FF",
  "#FF00FF",
  "#FF0080",
  "#800000",
  "#808000",
  "#008000",
  "#008080",
  "#000080",
  "#800080",
  "#C0C0C0",
  "#808080",
];

export interface SelectColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  colors?: string[];
  value: number;
  onChange: (colorIndex: number) => void;
  onConfirm?: (colorIndex: number) => void;
}

export function SelectColorModal({
  isOpen,
  onClose,
  colors = DEFAULT_NATION_COLORS,
  value,
  onChange,
  onConfirm,
}: SelectColorModalProps) {
  const handleConfirm = useCallback(() => {
    onConfirm?.(value);
    onClose();
  }, [value, onConfirm, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="색상 선택">
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color, index) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(index)}
              className={cn(
                "w-full aspect-square rounded-md border-2 transition-all",
                value === index
                  ? "border-white scale-110 shadow-lg"
                  : "border-transparent hover:border-gray-400"
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">선택된 색상:</span>
          <div
            className="w-8 h-8 rounded border border-gray-600"
            style={{ backgroundColor: colors[value] }}
          />
          <span className="text-sm text-white">{colors[value]}</span>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
          >
            확인
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// CommandArgFormModal - Unified modal for all command arguments
// ============================================================================

export type CommandArgType =
  | "city"
  | "nation"
  | "general"
  | "amount"
  | "color"
  | "destCity"
  | "srcGeneral"
  | "destGeneral";

export interface CommandArgConfig {
  type: CommandArgType;
  label?: string;
  // City options
  cities?: Map<number, { name: string; info?: string; notAvailable?: boolean }>;
  // Nation options
  nations?: Map<number, { name: string; color?: string; info?: string; notAvailable?: boolean }>;
  // General options
  generals?: GeneralItem[];
  groupByNation?: boolean;
  // Amount options
  min?: number;
  max?: number;
  step?: number;
  amountGuide?: number[];
  // Color options
  colors?: string[];
}

export interface CommandArgFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CommandArgConfig;
  value: number;
  onChange: (value: number) => void;
  onConfirm?: (value: number) => void;
}

export function CommandArgFormModal({
  isOpen,
  onClose,
  config,
  value,
  onChange,
  onConfirm,
}: CommandArgFormModalProps) {
  const getTitle = () => {
    switch (config.type) {
      case "city":
      case "destCity":
        return "도시 선택";
      case "nation":
        return "국가 선택";
      case "general":
      case "srcGeneral":
      case "destGeneral":
        return "장수 선택";
      case "amount":
        return config.label ?? "수량 입력";
      case "color":
        return "색상 선택";
      default:
        return "선택";
    }
  };

  switch (config.type) {
    case "city":
    case "destCity":
      return (
        <SelectCityModal
          isOpen={isOpen}
          onClose={onClose}
          cities={config.cities ?? new Map()}
          value={value}
          onChange={onChange}
          onConfirm={onConfirm}
        />
      );

    case "nation":
      return (
        <SelectNationModal
          isOpen={isOpen}
          onClose={onClose}
          nations={config.nations ?? new Map()}
          value={value}
          onChange={onChange}
          onConfirm={onConfirm}
        />
      );

    case "general":
    case "srcGeneral":
    case "destGeneral":
      return (
        <SelectGeneralModal
          isOpen={isOpen}
          onClose={onClose}
          generals={config.generals ?? []}
          nations={config.nations as Map<number, { name: string; color: string }> | undefined}
          value={value}
          onChange={onChange}
          onConfirm={onConfirm}
          groupByNation={config.groupByNation}
        />
      );

    case "amount":
      return (
        <SelectAmountModal
          isOpen={isOpen}
          onClose={onClose}
          value={value}
          onChange={onChange}
          onConfirm={onConfirm}
          min={config.min}
          max={config.max}
          step={config.step}
          amountGuide={config.amountGuide}
          title={getTitle()}
          label={config.label}
        />
      );

    case "color":
      return (
        <SelectColorModal
          isOpen={isOpen}
          onClose={onClose}
          colors={config.colors}
          value={value}
          onChange={onChange}
          onConfirm={onConfirm}
        />
      );

    default:
      return null;
  }
}

export default {
  SelectCityModal,
  SelectNationModal,
  SelectGeneralModal,
  SelectAmountInput,
  SelectAmountModal,
  SelectColorModal,
  CommandArgFormModal,
};
