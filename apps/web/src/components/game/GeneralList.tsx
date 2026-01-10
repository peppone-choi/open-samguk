"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

// ============================================================================
// Types (from legacy defs/API/Nation.ts)
// ============================================================================

export interface TurnObj {
  action: string;
  brief: string;
  arg?: Record<string, unknown>;
}

export interface GeneralListItemBase {
  no: number;
  name: string;
  nation: number;
  npc: number;
  injury: number;
  leadership: number;
  strength: number;
  intel: number;
  explevel: number;
  dedlevel: number;
  gold: number;
  rice: number;
  killturn: number;
  picture: string;
  imgsvr: 0 | 1;
  age: number;
  specialDomestic: string;
  specialWar: string;
  personal: string;
  belong: number;
  refreshScoreTotal: number | null;
  officerLevel: number;
  officerLevelText: string;
  lbonus: number;
  ownerName: string | null;
  honorText: string;
  dedLevelText: string;
  bill: number;
  reservedCommand: TurnObj[] | null;
  autorun_limit: number;
  nationID?: number;
  city: number;
  troop: number;
}

export interface GeneralListItemP1 extends GeneralListItemBase {
  refreshScore: number | null;
  specage: number;
  specage2: number;
  leadership_exp: number;
  strength_exp: number;
  intel_exp: number;
  dex1: number;
  dex2: number;
  dex3: number;
  dex4: number;
  dex5: number;
  experience: number;
  dedication: number;
  officer_level: number;
  officer_city: number;
  defence_train: number;
  crewtype: string;
  crew: number;
  train: number;
  atmos: number;
  turntime: string;
  recent_war: string;
  horse: string;
  weapon: string;
  book: string;
  item: string;
  warnum: number;
  killnum: number;
  deathnum: number;
  killcrew: number;
  deathcrew: number;
  firenum: number;
}

export type GeneralListItem =
  | (GeneralListItemBase & { st0: true; st1: false; st2: false; permission: 0 })
  | (GeneralListItemP1 & { st0: true; st1: true; st2: false; permission: 1 })
  | (GeneralListItemP1 & { st0: true; st1: true; st2: true; permission: 2 | 3 | 4 });

export interface GeneralListEnv {
  year: number;
  month: number;
  turntime: string;
  turnterm: number;
  killturn: number;
  autorun_user?: {
    limit_minutes: number;
    options: Record<string, number>;
  };
}

export interface GameIActionInfo {
  name: string;
  info?: string;
}

export interface GameConstStore {
  cityConst: Record<number, { name: string }>;
  iActionInfo: {
    crewtype: Record<string, GameIActionInfo>;
    personality: Record<string, GameIActionInfo>;
    specialDomestic: Record<string, GameIActionInfo>;
    specialWar: Record<string, GameIActionInfo>;
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

function getNPCColor(npcType: number): string | undefined {
  if (npcType === 6) return "#66cdaa"; // mediumaquamarine
  if (npcType === 5) return "#008b8b"; // darkcyan
  if (npcType === 4) return "#00bfff"; // deepskyblue
  if (npcType >= 2) return "#00ffff"; // cyan
  if (npcType === 1) return "#87ceeb"; // skyblue
  return undefined;
}

function formatRefreshScore(score: number | null): string {
  if (!score) return "안함";
  if (score < 50) return "안함";
  if (score < 100) return "무관심";
  if (score < 200) return "보통";
  if (score < 400) return "가끔";
  if (score < 800) return "자주";
  if (score < 1600) return "열심";
  if (score < 3200) return "중독";
  if (score < 6400) return "폐인";
  if (score < 12800) return "경고";
  return "헐...";
}

// Reserved for future use in defense training display
function _formatDefenceTrain(value: number): string {
  if (value >= 999) return "×";
  if (value >= 90) return "☆";
  if (value >= 80) return "◎";
  if (value >= 60) return "○";
  return "△";
}
void _formatDefenceTrain;

function getIconPath(imgsvr: 0 | 1, picture: string): string {
  // TODO: Configure proper paths
  if (!imgsvr) {
    return `/icons/${picture}`;
  }
  return `/d_pic/${picture}`;
}

// ============================================================================
// View Mode Presets
// ============================================================================

type ViewMode = "normal" | "war";

const VIEW_MODE_VISIBILITY: Record<ViewMode, VisibilityState> = {
  normal: {
    icon: true,
    name: true,
    stat: true,
    officerLevel: true,
    expDedLv: true,
    goldRice: true,
    city: false,
    troop: false,
    crewInfo: false,
    trainAtmos: false,
    specials: true,
    command: false,
    turntime: false,
    years: true,
    killturnRefresh: true,
    warResults: false,
  },
  war: {
    icon: false,
    name: true,
    stat: true,
    officerLevel: false,
    expDedLv: false,
    goldRice: true,
    city: true,
    troop: true,
    crewInfo: true,
    trainAtmos: true,
    specials: false,
    command: true,
    turntime: true,
    years: false,
    killturnRefresh: true,
    warResults: false,
  },
};

// ============================================================================
// Component Props
// ============================================================================

interface GeneralListProps {
  list: GeneralListItem[];
  troops: Record<number, string>;
  env: GeneralListEnv;
  gameConst: GameConstStore;
  height?: "static" | "fill" | number;
  onGeneralClick?: (generalId: number) => void;
  availableGeneralClick?: boolean;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function GeneralList({
  list,
  troops,
  env: _env,
  gameConst,
  height = "static",
  onGeneralClick,
  availableGeneralClick = true,
  className,
}: GeneralListProps) {
  // env reserved for future use (e.g., killturn display, turnterm calculations)
  void _env;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("normal");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    VIEW_MODE_VISIBILITY.normal
  );

  // Build general lookup map
  const generalById = useMemo(() => {
    const map = new Map<number, GeneralListItem>();
    for (const gen of list) {
      map.set(gen.no, gen);
    }
    return map;
  }, [list]);

  // Helper to get troop info
  const getTroopInfo = useCallback(
    (gen: GeneralListItem) => {
      if (!("st1" in gen) || !gen.st1) return null;
      const troopId = gen.troop;
      if (!(troopId in troops)) return null;
      const troopName = troops[troopId];
      const troopLeader = generalById.get(troopId);
      if (!troopLeader || !("st1" in troopLeader) || !troopLeader.st1) return null;
      return { name: troopName, leader: troopLeader };
    },
    [troops, generalById]
  );

  // Column helper
  const columnHelper = createColumnHelper<GeneralListItem>();

  // Column definitions
  const columns = useMemo(
    () => [
      // Icon
      columnHelper.accessor("picture", {
        id: "icon",
        header: "아이콘",
        size: 80,
        cell: ({ row }) => (
          <div
            className={`flex justify-center ${availableGeneralClick ? "cursor-pointer hover:opacity-80" : ""}`}
            onClick={() => availableGeneralClick && onGeneralClick?.(row.original.no)}
          >
            <img
              src={getIconPath(row.original.imgsvr, row.original.picture)}
              alt={row.original.name}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
        ),
        enableSorting: false,
      }),

      // Name
      columnHelper.accessor("name", {
        id: "name",
        header: "장수명",
        size: 120,
        cell: ({ row }) => (
          <span
            className={availableGeneralClick ? "cursor-pointer hover:underline" : ""}
            style={{ color: getNPCColor(row.original.npc) }}
            onClick={() => availableGeneralClick && onGeneralClick?.(row.original.no)}
          >
            {row.original.name}
          </span>
        ),
        sortingFn: (rowA, rowB) => {
          const npcDiff = rowA.original.npc - rowB.original.npc;
          if (npcDiff !== 0) return npcDiff;
          return rowA.original.name.localeCompare(rowB.original.name);
        },
      }),

      // Stats (통/무/지)
      columnHelper.display({
        id: "stat",
        header: "통|무|지",
        size: 88,
        cell: ({ row }) => (
          <span className="text-center">
            {row.original.leadership}|{row.original.strength}|{row.original.intel}
          </span>
        ),
      }),

      // Officer Level
      columnHelper.accessor("officerLevelText", {
        id: "officerLevel",
        header: "관직",
        size: 70,
        cell: ({ row }) => {
          const gen = row.original;
          const isCyan = gen.officerLevel >= 5;
          let text = gen.officerLevelText;
          if ("st1" in gen && gen.st1 && gen.officerLevel >= 2 && gen.officerLevel <= 4) {
            const cityName = gameConst.cityConst[gen.officer_city]?.name ?? "?";
            text = `${cityName}\n${gen.officerLevelText}`;
          }
          return (
            <span
              className="text-center whitespace-pre-line"
              style={{ color: isCyan ? "cyan" : undefined }}
            >
              {text}
            </span>
          );
        },
      }),

      // Exp/Ded Level
      columnHelper.display({
        id: "expDedLv",
        header: "명성/계급",
        size: 70,
        cell: ({ row }) => (
          <div className="text-center text-xs">
            <div>Lv {row.original.explevel}</div>
            <div>{row.original.dedLevelText}</div>
          </div>
        ),
      }),

      // Gold/Rice
      columnHelper.display({
        id: "goldRice",
        header: "금/쌀",
        size: 90,
        cell: ({ row }) => (
          <div className="text-right text-xs">
            <div>{row.original.gold.toLocaleString()} 금</div>
            <div>{row.original.rice.toLocaleString()} 쌀</div>
          </div>
        ),
      }),

      // City
      columnHelper.accessor("city", {
        id: "city",
        header: "도시",
        size: 60,
        cell: ({ row }) => {
          const gen = row.original;
          if (!("st1" in gen) || !gen.st1) return "?";
          return gameConst.cityConst[gen.city]?.name ?? "?";
        },
      }),

      // Troop
      columnHelper.display({
        id: "troop",
        header: "부대",
        size: 90,
        cell: ({ row }) => {
          const troopInfo = getTroopInfo(row.original);
          if (!troopInfo) return "-";
          const cityName =
            "st1" in troopInfo.leader && troopInfo.leader.st1
              ? (gameConst.cityConst[troopInfo.leader.city]?.name ?? "?")
              : "?";
          return (
            <div className="text-center text-xs">
              <div>{troopInfo.name}</div>
              <div>[{cityName}]</div>
            </div>
          );
        },
      }),

      // Crew Type & Crew
      columnHelper.display({
        id: "crewInfo",
        header: "병종/병력",
        size: 90,
        cell: ({ row }) => {
          const gen = row.original;
          if (!("st1" in gen) || !gen.st1) return "?";
          const crewTypeName = gameConst.iActionInfo.crewtype[gen.crewtype]?.name ?? gen.crewtype;
          return (
            <div className="text-center text-xs">
              <div>{crewTypeName}</div>
              <div>{gen.crew.toLocaleString()}명</div>
            </div>
          );
        },
      }),

      // Train/Atmos
      columnHelper.display({
        id: "trainAtmos",
        header: "훈/사",
        size: 60,
        cell: ({ row }) => {
          const gen = row.original;
          if (!("st1" in gen) || !gen.st1) return "?";
          return (
            <div className="text-center text-xs">
              <div>{gen.train}</div>
              <div>{gen.atmos}</div>
            </div>
          );
        },
      }),

      // Specials
      columnHelper.display({
        id: "specials",
        header: "특성",
        size: 80,
        cell: ({ row }) => {
          const gen = row.original;
          const personal = gameConst.iActionInfo.personality[gen.personal]?.name ?? "-";
          const domestic = gameConst.iActionInfo.specialDomestic[gen.specialDomestic]?.name ?? "-";
          const war = gameConst.iActionInfo.specialWar[gen.specialWar]?.name ?? "-";
          return (
            <div className="text-center text-xs">
              <div>{personal}</div>
              <div>
                {domestic}/{war}
              </div>
            </div>
          );
        },
      }),

      // Command
      columnHelper.display({
        id: "command",
        header: "명령",
        size: 100,
        cell: ({ row }) => {
          const gen = row.original;
          if (gen.npc >= 2) return <span className="text-xs">NPC 장수</span>;
          if (!gen.reservedCommand) return "-";
          return (
            <div className="text-xs leading-tight">
              {gen.reservedCommand.slice(0, 3).map((cmd, i) => (
                <div key={i} className="truncate">
                  {cmd.brief}
                </div>
              ))}
            </div>
          );
        },
      }),

      // Turntime
      columnHelper.accessor((row) => ("st1" in row && row.st1 ? row.turntime : null), {
        id: "turntime",
        header: "턴",
        size: 60,
        cell: ({ getValue }) => {
          const val = getValue();
          if (!val) return "?";
          return val.substring(14, 19);
        },
      }),

      // Years (Age/Belong)
      columnHelper.display({
        id: "years",
        header: "연령/사관",
        size: 60,
        cell: ({ row }) => (
          <div className="text-center text-xs">
            <div>{row.original.age}세</div>
            <div>{row.original.belong}년</div>
          </div>
        ),
      }),

      // Killturn & Refresh
      columnHelper.display({
        id: "killturnRefresh",
        header: "삭/벌",
        size: 80,
        cell: ({ row }) => (
          <div className="text-right text-xs">
            <div>{row.original.killturn.toLocaleString()}턴</div>
            <div>
              {(row.original.refreshScoreTotal ?? 0).toLocaleString()}점 (
              {formatRefreshScore(row.original.refreshScoreTotal)})
            </div>
          </div>
        ),
      }),

      // War Results
      columnHelper.display({
        id: "warResults",
        header: "전과",
        size: 90,
        cell: ({ row }) => {
          const gen = row.original;
          if (!("st1" in gen) || !gen.st1) return "?";
          const killRate = Math.round((gen.killcrew / Math.max(1, gen.deathcrew)) * 100);
          return (
            <div className="text-center text-xs">
              <div>
                {gen.warnum}전 {gen.killnum}승
              </div>
              <div>살상: {killRate}%</div>
            </div>
          );
        },
      }),
    ],
    [columnHelper, gameConst, getTroopInfo, availableGeneralClick, onGeneralClick]
  );

  // Table instance
  const table = useReactTable({
    data: list,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => String(row.no),
  });

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setColumnVisibility(VIEW_MODE_VISIBILITY[mode]);
  };

  // Height style
  const containerStyle: React.CSSProperties = {
    height:
      height === "fill"
        ? "100%"
        : height === "static"
          ? "auto"
          : typeof height === "number"
            ? `${height}px`
            : undefined,
  };

  return (
    <div
      className={`flex flex-col rounded-xl overflow-hidden glass ${className ?? ""}`}
      style={containerStyle}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 p-3 bg-card/60 backdrop-blur-md border-b border-white/10 items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* View Mode */}
          <div className="flex gap-1 p-1 bg-black/20 rounded-lg border border-white/5">
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${
                viewMode === "normal"
                  ? "bg-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10"
              }`}
              onClick={() => handleViewModeChange("normal")}
            >
              기본
            </button>
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${
                viewMode === "war"
                  ? "bg-primary text-primary-foreground shadow-glow-sm"
                  : "text-muted-foreground hover:text-foreground bg-white/5 hover:bg-white/10"
              }`}
              onClick={() => handleViewModeChange("war")}
            >
              전투
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary/70 transition-colors">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="장수 검색..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-black/40 border border-white/10 rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Column Toggle Dropdown */}
        <div className="relative group z-20">
          <button className="px-4 py-1.5 text-sm font-medium bg-white/5 text-foreground border border-white/10 rounded-lg hover:bg-white/10 hover:border-primary/30 transition-all flex items-center gap-2">
            <span className="text-muted-foreground">열 설정</span>
            <span className="text-[10px] opacity-50">▼</span>
          </button>
          <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-card/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl min-w-[180px] p-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-[60vh] overflow-y-auto">
              {table.getAllLeafColumns().map((column) => (
                <label
                  key={column.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg cursor-pointer text-sm text-foreground/80 transition-colors select-none"
                >
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                    className="rounded border-white/20 bg-black/40 text-primary focus:ring-primary/50 accent-primary"
                  />
                  {typeof column.columnDef.header === "string"
                    ? column.columnDef.header
                    : column.id}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse text-foreground/90">
          <thead className="sticky top-0 bg-card/80 backdrop-blur-sm z-10 shadow-sm border-b border-white/10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-2 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider relative group"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? "cursor-pointer select-none flex items-center justify-center gap-1 hover:text-primary transition-colors py-1 rounded hover:bg-white/5"
                            : "flex items-center justify-center py-1"
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span className="w-4 text-primary font-bold">
                          {{
                            asc: " ▲",
                            desc: " ▼",
                          }[header.column.getIsSorted() as string] ?? null}
                        </span>
                      </div>
                    )}
                    <div className="absolute right-0 top-1/4 bottom-1/4 w-[1px] bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={`
                  border-b border-white/[0.02] transition-colors duration-200
                  ${index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"}
                  hover:bg-white/5 group
                `}
                style={{ height: 68 }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-2 py-1 align-middle group-hover:text-white transition-colors"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {table.getRowModel().rows.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-white/[0.01]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <span className="text-3xl opacity-50">⚔️</span>
            </div>
            <div className="text-lg font-medium text-foreground/80">장수가 없습니다</div>
            <div className="text-sm opacity-50 mt-1">검색 조건을 변경해보세요</div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-card/40 border-t border-white/10 text-xs text-muted-foreground flex justify-between items-center backdrop-blur-sm">
        <div className="flex gap-4 items-center">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" />총{" "}
            <span className="text-foreground font-medium">
              {table.getFilteredRowModel().rows.length.toLocaleString()}
            </span>
            명
          </span>
          {Object.keys(sorting).length > 0 && (
            <span className="text-primary/70 bg-primary/10 px-2 py-0.5 rounded text-[10px] border border-primary/20">
              정렬됨
            </span>
          )}
        </div>
        <div className="opacity-50 font-mono text-[10px]">
          {viewMode === "normal" ? "STANDARD VIEW" : "WAR VIEW"}
        </div>
      </div>
    </div>
  );
}
