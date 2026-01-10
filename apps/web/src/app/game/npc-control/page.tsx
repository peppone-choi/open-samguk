"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";

type NationPolicy = {
  reqNationGold: number;
  reqNationRice: number;
  reqHumanWarUrgentGold: number;
  reqHumanWarUrgentRice: number;
  reqHumanWarRecommandGold: number;
  reqHumanWarRecommandRice: number;
  reqHumanDevelGold: number;
  reqHumanDevelRice: number;
  reqNPCWarGold: number;
  reqNPCWarRice: number;
  reqNPCDevelGold: number;
  reqNPCDevelRice: number;
  minimumResourceActionAmount: number;
  maximumResourceActionAmount: number;
  minWarCrew: number;
  minNPCRecruitCityPopulation: number;
  safeRecruitCityPopulationRatio: number;
  minNPCWarLeadership: number;
  properWarTrainAtmos: number;
  cureThreshold: number;
};

type NPCChiefActions =
  | "불가침제의"
  | "선전포고"
  | "천도"
  | "유저장긴급포상"
  | "부대전방발령"
  | "유저장구출발령"
  | "유저장후방발령"
  | "부대유저장후방발령"
  | "유저장전방발령"
  | "유저장포상"
  | "부대구출발령"
  | "부대후방발령"
  | "NPC긴급포상"
  | "NPC구출발령"
  | "NPC후방발령"
  | "NPC포상"
  | "NPC전방발령"
  | "유저장내정발령"
  | "NPC내정발령"
  | "NPC몰수";

type NPCGeneralActions =
  | "NPC사망대비"
  | "귀환"
  | "금쌀구매"
  | "출병"
  | "긴급내정"
  | "전투준비"
  | "전방워프"
  | "NPC헌납"
  | "징병"
  | "후방워프"
  | "전쟁내정"
  | "소집해제"
  | "일반내정"
  | "내정워프";

type SetterInfo = { setter: string | null; date: string | null };

const MOCK_DEFAULT_POLICY: NationPolicy = {
  reqNationGold: 50000,
  reqNationRice: 50000,
  reqHumanWarUrgentGold: 0,
  reqHumanWarUrgentRice: 0,
  reqHumanWarRecommandGold: 0,
  reqHumanWarRecommandRice: 0,
  reqHumanDevelGold: 3000,
  reqHumanDevelRice: 3000,
  reqNPCWarGold: 0,
  reqNPCWarRice: 0,
  reqNPCDevelGold: 600,
  reqNPCDevelRice: 500,
  minimumResourceActionAmount: 500,
  maximumResourceActionAmount: 10000,
  minWarCrew: 500,
  minNPCRecruitCityPopulation: 10000,
  safeRecruitCityPopulationRatio: 0.4,
  minNPCWarLeadership: 60,
  properWarTrainAtmos: 80,
  cureThreshold: 50,
};

const MOCK_ZERO_POLICY: NationPolicy = {
  ...MOCK_DEFAULT_POLICY,
  reqHumanWarUrgentGold: 60000,
  reqHumanWarUrgentRice: 36000,
  reqNPCWarGold: 32000,
  reqNPCWarRice: 19200,
  reqNPCDevelGold: 600,
};

const ALL_CHIEF_ACTIONS: NPCChiefActions[] = [
  "불가침제의",
  "선전포고",
  "천도",
  "유저장긴급포상",
  "부대전방발령",
  "유저장구출발령",
  "유저장후방발령",
  "부대유저장후방발령",
  "유저장전방발령",
  "유저장포상",
  "부대구출발령",
  "부대후방발령",
  "NPC긴급포상",
  "NPC구출발령",
  "NPC후방발령",
  "NPC포상",
  "NPC전방발령",
  "유저장내정발령",
  "NPC내정발령",
  "NPC몰수",
];

const ALL_GENERAL_ACTIONS: NPCGeneralActions[] = [
  "NPC사망대비",
  "귀환",
  "금쌀구매",
  "출병",
  "긴급내정",
  "전투준비",
  "전방워프",
  "NPC헌납",
  "징병",
  "후방워프",
  "전쟁내정",
  "소집해제",
  "일반내정",
  "내정워프",
];

const DEFAULT_CHIEF_PRIORITY: NPCChiefActions[] = [
  "유저장긴급포상",
  "유저장구출발령",
  "유저장후방발령",
  "유저장전방발령",
  "유저장포상",
  "NPC긴급포상",
  "NPC구출발령",
  "NPC후방발령",
  "NPC포상",
  "NPC전방발령",
  "유저장내정발령",
  "NPC내정발령",
  "NPC몰수",
];

const DEFAULT_GENERAL_PRIORITY: NPCGeneralActions[] = [
  "NPC사망대비",
  "귀환",
  "금쌀구매",
  "출병",
  "긴급내정",
  "전투준비",
  "전방워프",
  "NPC헌납",
  "징병",
  "후방워프",
  "전쟁내정",
  "소집해제",
  "일반내정",
  "내정워프",
];

const MOCK_LAST_SETTERS: Record<string, SetterInfo> = {
  policy: { setter: null, date: null },
  nation: { setter: null, date: null },
  general: { setter: null, date: null },
};

const NPC_PRIORITY_HELP_TEXTS: Record<string, string> = {
  불가침제의:
    "군주가 NPC이고, 타국에서 원조를 받았을 때, 세입 대비 원조량에 따라 불가침제의를 합니다.",
  선전포고: "군주가 NPC이고, 전쟁중이 아닐 때, 주변국중 하나를 골라 선포합니다.",
  천도: "인구가 많은 곳을 찾아 천도를 시도합니다.",
  유저장긴급포상: "금/쌀이 부족한 유저전투장에게 긴급하게 포상합니다.",
  부대전방발령: "(작동하지 않음) 전투 부대를 접경으로 발령합니다.",
  유저장구출발령: "아군 영토에 있지 않은 유저장을 아군 영토로 발령합니다.",
  유저장후방발령: "유저전투장 중에 병력이 부족한 경우 후방으로 발령합니다.",
  부대유저장후방발령: "접경 부대의 유저전투장 중 병력이 부족한 경우 후방으로 발령합니다.",
  유저장전방발령: "후방에 있는 유저장이 병력이 있으면 전방으로 이동합니다.",
  유저장포상: "금/쌀이 부족한 유저장에게 포상합니다.",
  부대구출발령: "전투/후방 부대가 아닌 부대가 아군 영토에 없을 때 전방으로 발령합니다.",
  부대후방발령: "(작동하지 않음) 후방 부대 도시의 인구가 부족하면 다른 도시로 발령합니다.",
  NPC긴급포상: "금/쌀이 부족한 NPC전투장에게 긴급하게 포상합니다.",
  NPC구출발령: "아군 영토에 있지 않은 NPC장을 아군 영토로 발령합니다.",
  NPC후방발령: "NPC전투장 중에 병력이 부족한 경우 후방으로 발령합니다.",
  NPC포상: "금/쌀이 부족한 NPC에게 포상합니다.",
  NPC전방발령: "후방에 있는 NPC장이 병력이 있으면 전방으로 이동합니다.",
  유저장내정발령: "내정중인 유저장이 위치한 도시의 내정률이 95% 이상이면 다른 도시로 이동합니다.",
  NPC내정발령: "내정중인 NPC장이 위치한 도시의 내정률이 95% 이상이면 다른 도시로 이동합니다.",
  NPC몰수: "국고가 부족하다면 NPC에게서 몰수합니다.",
  NPC사망대비: "NPC의 사망까지 5턴 이내인 경우, 헌납합니다.",
  귀환: "아국 도시에 있지 않다면 귀환합니다.",
  금쌀구매: "전쟁 중에 금쌀의 비율이 크게 차이난다면 금쌀을 거래합니다.",
  출병: "충분한 병력과 훈련/사기를 가지고 있는 경우 출병합니다.",
  긴급내정: "전쟁중에 민심이 70 미만이면 주민선정과 정착장려를 수행합니다.",
  전투준비: "병력은 있지만 훈련/사기가 부족한 경우 훈련과 사기진작을 수행합니다.",
  전방워프: "전투장이 충분한 병력을 가지고 있다면 전방으로 이동합니다.",
  NPC헌납: "국고가 부족한데 NPC가 충분한 금쌀을 가지고 있다면 일부를 헌납합니다.",
  징병: "전쟁 중 병력을 소진하였다면 재 징병합니다.",
  후방워프: "전쟁 중 병력을 소진하였는데 도시의 인구가 부족하면 후방으로 이동합니다.",
  전쟁내정: "전쟁 중 수행하는 내정입니다. 정착장려, 기술연구 확률이 높습니다.",
  소집해제: "전쟁 중이 아닌 데 병력이 남아있는 경우, 소집해제합니다.",
  일반내정: "도시에서 내정을 수행합니다.",
  내정워프: "도시에서 더이상 내정을 수행할 수 없으면 다른 도시로 이동합니다.",
};

interface NumberInputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  description?: React.ReactNode;
  isPercentage?: boolean;
}

function NumberInputField({
  label,
  value,
  onChange,
  step = 100,
  min,
  max,
  description,
  isPercentage = false,
}: NumberInputFieldProps) {
  const displayValue = isPercentage ? Math.round(value * 100) : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = Number(e.target.value);
    if (isPercentage) newValue = newValue / 100;
    if (min !== undefined && newValue < min) newValue = min;
    if (max !== undefined && newValue > max) newValue = max;
    onChange(newValue);
  };

  return (
    <div className="group flex flex-col justify-between gap-2 p-4 rounded-xl bg-card/40 border border-white/5 hover:bg-card/60 hover:border-primary/20 transition-all duration-300">
      <div className="flex justify-between items-center gap-4">
        <label className="text-sm font-medium text-muted-foreground group-hover:text-primary/90 transition-colors flex-1">
          {label}
        </label>
        <input
          type="number"
          className="w-28 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-right text-sm font-mono text-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/30"
          value={displayValue}
          step={isPercentage ? 0.5 : step}
          onChange={handleChange}
        />
      </div>
      {description && (
        <div className="text-right text-xs text-muted-foreground/50 leading-relaxed">
          {description}
        </div>
      )}
    </div>
  );
}

function SortableItem({
  id,
  index,
  showIndex = false,
}: {
  id: string;
  index?: number;
  showIndex?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-grab active:cursor-grabbing transition-all group",
        isDragging
          ? "bg-primary/20 backdrop-blur-md border border-primary/50 shadow-glow ring-1 ring-primary/50 opacity-90 scale-105"
          : "bg-card/60 backdrop-blur-sm border border-white/5 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg"
      )}
      title={NPC_PRIORITY_HELP_TEXTS[id]}
      {...attributes}
      {...listeners}
    >
      <span className="text-muted-foreground/40 group-hover:text-primary/70 transition-colors select-none text-lg leading-none">
        ≡
      </span>
      {showIndex && index !== undefined && (
        <span className="text-primary/80 font-mono text-xs font-bold w-5 flex-shrink-0 select-none">
          {index + 1}.
        </span>
      )}
      <span className="truncate flex-1 select-none font-medium text-foreground/90">{id}</span>
    </div>
  );
}

function DroppableColumn({
  id,
  title,
  items,
  showIndex = false,
  emptyMessage = "(없음)",
  variant = "default",
}: {
  id: string;
  title: string;
  items: string[];
  showIndex?: boolean;
  emptyMessage?: string;
  variant?: "default" | "active" | "inactive";
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div className="flex flex-col h-full">
      <div
        className={clsx(
          "text-center py-2 text-xs font-bold tracking-widest uppercase rounded-t-lg border-x border-t transition-colors",
          variant === "active"
            ? "bg-primary/10 border-primary/20 text-primary"
            : "bg-secondary/50 border-white/5 text-muted-foreground"
        )}
      >
        {title}
      </div>
      <div
        ref={setNodeRef}
        className={clsx(
          "flex-1 space-y-2 min-h-[300px] max-h-[500px] overflow-y-auto p-2 rounded-b-lg border border-white/10 transition-colors scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
          isOver ? "bg-primary/5 ring-1 ring-primary/30" : "bg-black/20"
        )}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground/30 italic">
              {emptyMessage}
            </div>
          ) : (
            items.map((item, index) => (
              <SortableItem key={item} id={item} index={index} showIndex={showIndex} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

function DndPriorityList<T extends string>({
  title,
  lastSetter,
  description,
  activeItems,
  inactiveItems,
  onItemsChange,
  onReset,
  onRollback,
  onSubmit,
  groupId,
}: {
  title: string;
  lastSetter: SetterInfo;
  description: string;
  activeItems: T[];
  inactiveItems: T[];
  onItemsChange: (active: T[], inactive: T[]) => void;
  onReset: () => void;
  onRollback: () => void;
  onSubmit: () => void;
  groupId: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const inactiveColumnId = `${groupId}-inactive`;
  const activeColumnId = `${groupId}-active`;

  const findContainer = (id: string) =>
    activeItems.includes(id as T) ? "active" : inactiveItems.includes(id as T) ? "inactive" : null;

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const aCont = findContainer(active.id as string);
    const oCont =
      over.id === inactiveColumnId
        ? "inactive"
        : over.id === activeColumnId
          ? "active"
          : findContainer(over.id as string);
    if (!aCont || !oCont || aCont === oCont) return;
    const activeItem = active.id as T;
    if (aCont === "inactive" && oCont === "active") {
      const idx =
        over.id === activeColumnId ? activeItems.length : activeItems.indexOf(over.id as T);
      const newA = [...activeItems];
      newA.splice(idx >= 0 ? idx : activeItems.length, 0, activeItem);
      onItemsChange(
        newA,
        inactiveItems.filter((i) => i !== activeItem)
      );
    } else {
      onItemsChange(
        activeItems.filter((i) => i !== activeItem),
        [...inactiveItems, activeItem]
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const aCont = findContainer(active.id as string);
    const oCont =
      over.id === inactiveColumnId
        ? "inactive"
        : over.id === activeColumnId
          ? "active"
          : findContainer(over.id as string);
    if (aCont === oCont && active.id !== over.id) {
      if (aCont === "active")
        onItemsChange(
          arrayMove(
            activeItems,
            activeItems.indexOf(active.id as T),
            over.id === activeColumnId ? activeItems.length - 1 : activeItems.indexOf(over.id as T)
          ),
          inactiveItems
        );
      else
        onItemsChange(
          activeItems,
          arrayMove(
            inactiveItems,
            inactiveItems.indexOf(active.id as T),
            over.id === inactiveColumnId
              ? inactiveItems.length - 1
              : inactiveItems.indexOf(over.id as T)
          )
        );
    }
  };

  return (
    <div className="premium-card p-0 flex flex-col h-full">
      <div className="p-5 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-primary tracking-tight">{title}</h3>
          <div className="text-xs font-mono text-muted-foreground/60 bg-black/20 px-2 py-1 rounded">
            Last: {lastSetter.setter ?? "-"}
          </div>
        </div>
        <p className="text-xs text-muted-foreground/70">{description}</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 gap-4 p-4 flex-1">
          <DroppableColumn
            id={inactiveColumnId}
            title="Disabled"
            items={inactiveItems}
            variant="inactive"
          />
          <DroppableColumn
            id={activeColumnId}
            title="Active Priority"
            items={activeItems}
            showIndex
            variant="active"
          />
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="bg-primary/20 backdrop-blur-md px-3 py-2.5 rounded-lg text-sm ring-1 ring-primary border border-primary/50 shadow-glow font-medium text-foreground">
              {activeId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="border-white/10 bg-transparent hover:bg-white/5 hover:text-white"
        >
          Reset
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRollback}
          className="bg-secondary/80 hover:bg-secondary text-secondary-foreground"
        >
          Undo
        </Button>
        <Button
          size="sm"
          onClick={onSubmit}
          className="bg-primary text-primary-foreground font-bold shadow-glow-sm hover:shadow-glow hover:bg-primary/90"
        >
          Save Priority
        </Button>
      </div>
    </div>
  );
}

export default function NPCControlPage() {
  const { selectedGeneral, selectedGeneralId: generalId } = useGeneral();
  const nationId = selectedGeneral?.nationId;

  const {
    data: npcData,
    isLoading,
    refetch,
  } = trpc.getNPCControl.useQuery({ nationId: nationId ?? 0 }, { enabled: !!nationId });
  const updateMutation = trpc.updateNPCControl.useMutation();

  const [nationPolicy, setNationPolicy] = useState<NationPolicy>(MOCK_DEFAULT_POLICY);
  const policyStack = useRef<NationPolicy[]>([]);
  const [chiefActive, setChiefActive] = useState<NPCChiefActions[]>([]);
  const [chiefInactive, setChiefInactive] = useState<NPCChiefActions[]>([]);
  const chiefStack = useRef<NPCChiefActions[][]>([]);
  const [generalActive, setGeneralActive] = useState<NPCGeneralActions[]>([]);
  const [generalInactive, setGeneralInactive] = useState<NPCGeneralActions[]>([]);
  const generalStack = useRef<NPCGeneralActions[][]>([]);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "danger" | "info";
  } | null>(null);

  const showToast = useCallback((msg: string, variant: "success" | "danger" | "info") => {
    setToast({ message: msg, variant });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o));

  useEffect(() => {
    if (npcData) {
      setNationPolicy(npcData.policies as any);
      if (policyStack.current.length === 0) policyStack.current = [clone(npcData.policies as any)];
      const cA = (npcData.chiefPriorityList || []) as NPCChiefActions[];
      setChiefActive(cA);
      setChiefInactive(ALL_CHIEF_ACTIONS.filter((a) => !cA.includes(a)));
      if (chiefStack.current.length === 0) chiefStack.current = [clone(cA)];
      const gA = (npcData.generalPriorityList || []) as NPCGeneralActions[];
      setGeneralActive(gA);
      setGeneralInactive(ALL_GENERAL_ACTIONS.filter((a) => !gA.includes(a)));
      if (generalStack.current.length === 0) generalStack.current = [clone(gA)];
    }
  }, [npcData]);

  const lastSetters = npcData?.lastSetters || MOCK_LAST_SETTERS;

  const calcVal = (k: keyof NationPolicy) =>
    nationPolicy[k] === 0 ? MOCK_ZERO_POLICY[k] : nationPolicy[k];

  const submit = async (
    type: "nationPolicy" | "nationPriority" | "generalPriority",
    payload: any
  ) => {
    if (!nationId || !generalId) return;
    if (!confirm("저장할까요?")) return;
    try {
      await updateMutation.mutateAsync({
        nationId,
        generalId,
        type,
        data: payload,
      });
      if (type === "nationPolicy") policyStack.current.push(clone(payload));
      else if (type === "nationPriority") chiefStack.current.push(clone(payload));
      else generalStack.current.push(clone(payload));
      showToast("Settings saved successfully.", "success");
      refetch();
    } catch (e: any) {
      showToast(`Error: ${e.message || e}`, "danger");
    }
  };

  if (isLoading || !selectedGeneral)
    return (
      <div className="min-h-screen bg-background pb-20">
        <TopBackBar title="NPC Policy" type="close" />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <div className="text-muted-foreground animate-pulse font-medium tracking-widest uppercase text-sm">
            Loading System Data...
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBackBar title="NPC Policy" type="close" />

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={clsx(
              "px-6 py-3 rounded-full shadow-glow-lg border backdrop-blur-md text-sm font-bold flex items-center gap-2",
              toast.variant === "success"
                ? "bg-green-950/80 border-green-500/50 text-green-400"
                : toast.variant === "danger"
                  ? "bg-red-950/80 border-red-500/50 text-red-400"
                  : "bg-blue-950/80 border-blue-500/50 text-blue-400"
            )}
          >
            <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary tracking-tight drop-shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            NPC Control Protocol
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Configure automated behavior logic and resource management policies for non-player
            characters.
          </p>
        </div>

        <div className="premium-card">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-white/5 to-transparent">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_#eab308]" />
                Nation Resource Policy
              </h2>
              <p className="text-sm text-muted-foreground mt-1 ml-4.5">
                Set thresholds for automatic rewards, confiscation, and tributes.
              </p>
            </div>
            <div className="text-xs font-mono text-muted-foreground/60 bg-black/40 px-3 py-1.5 rounded border border-white/5">
              Last Update:{" "}
              <span className="text-primary/80">{lastSetters.policy.setter ?? "-"}</span>
            </div>
          </div>

          <div className="p-6 bg-black/10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <NumberInputField
                label="Nation Rec. Gold"
                value={nationPolicy.reqNationGold}
                onChange={(v) => setNationPolicy((p) => ({ ...p, reqNationGold: v }))}
                description="Threshold for rewards/confiscation"
              />
              <NumberInputField
                label="Nation Rec. Rice"
                value={nationPolicy.reqNationRice}
                onChange={(v) => setNationPolicy((p) => ({ ...p, reqNationRice: v }))}
                description="Threshold for rewards/confiscation"
              />
              <NumberInputField
                label="User War Urgent Gold"
                value={nationPolicy.reqHumanWarUrgentGold}
                onChange={(v) => setNationPolicy((p) => ({ ...p, reqHumanWarUrgentGold: v }))}
                description={<>0 = Default ({MOCK_ZERO_POLICY.reqHumanWarUrgentGold})</>}
              />
              <NumberInputField
                label="User War Urgent Rice"
                value={nationPolicy.reqHumanWarUrgentRice}
                onChange={(v) => setNationPolicy((p) => ({ ...p, reqHumanWarUrgentRice: v }))}
                description={<>0 = Default ({MOCK_ZERO_POLICY.reqHumanWarUrgentRice})</>}
              />
              <NumberInputField
                label="User War Rec. Gold"
                value={nationPolicy.reqHumanWarRecommandGold}
                onChange={(v) => setNationPolicy((p) => ({ ...p, reqHumanWarRecommandGold: v }))}
                description={<>0 = 2x Urgent ({calcVal("reqHumanWarUrgentGold") * 2})</>}
              />
              <NumberInputField
                label="User War Rec. Rice"
                value={nationPolicy.reqHumanWarRecommandRice}
                onChange={(v) => setNationPolicy((p) => ({ ...p, reqHumanWarRecommandRice: v }))}
                description={<>0 = 2x Urgent ({calcVal("reqHumanWarUrgentRice") * 2})</>}
              />
              <NumberInputField
                label="User Civil Rec. Gold"
                value={nationPolicy.reqHumanDevelGold}
                onChange={(v) => setNationPolicy((p) => ({ ...p, reqHumanDevelGold: v }))}
                description="Gold reward for civil officers"
              />
              <NumberInputField
                label="User Civil Rec. Rice"
                value={nationPolicy.reqHumanDevelRice}
                onChange={(v) => setNationPolicy((p) => ({ ...p, reqHumanDevelRice: v }))}
                description="Rice reward for civil officers"
              />
              <NumberInputField
                label="NPC War Rec. Gold"
                value={nationPolicy.reqNPCWarGold}
                onChange={(v) => setNationPolicy((p) => ({ ...p, reqNPCWarGold: v }))}
                description={<>0 = Default ({MOCK_ZERO_POLICY.reqNPCWarGold})</>}
              />
              <NumberInputField
                label="NPC War Rec. Rice"
                value={nationPolicy.reqNPCWarRice}
                onChange={(v) => setNationPolicy((p) => ({ ...p, reqNPCWarRice: v }))}
                description={<>0 = Default ({MOCK_ZERO_POLICY.reqNPCWarRice})</>}
              />
              <NumberInputField
                label="NPC Civil Rec. Gold"
                value={nationPolicy.reqNPCDevelGold}
                onChange={(v) => setNationPolicy((p) => ({ ...p, reqNPCDevelGold: v }))}
                description={<>0 = Default ({MOCK_ZERO_POLICY.reqNPCDevelGold})</>}
              />
              <NumberInputField
                label="NPC Civil Rec. Rice"
                value={nationPolicy.reqNPCDevelRice}
                onChange={(v) => setNationPolicy((p) => ({ ...p, reqNPCDevelRice: v }))}
                description="Rice reward for NPC civil officers"
              />
              <NumberInputField
                label="Action Min Amount"
                value={nationPolicy.minimumResourceActionAmount}
                onChange={(v) => setNationPolicy((p) => ({ ...p, minimumResourceActionAmount: v }))}
                min={100}
                description="Minimum amount to perform action"
              />
              <NumberInputField
                label="Action Max Amount"
                value={nationPolicy.maximumResourceActionAmount}
                onChange={(v) => setNationPolicy((p) => ({ ...p, maximumResourceActionAmount: v }))}
                min={100}
                description="Cap amount for actions"
              />
              <NumberInputField
                label="Min War Crew"
                value={nationPolicy.minWarCrew}
                onChange={(v) => setNationPolicy((p) => ({ ...p, minWarCrew: v }))}
                step={50}
                description="Recruit if below this"
              />
              <NumberInputField
                label="NPC Min Recruit Pop"
                value={nationPolicy.minNPCRecruitCityPopulation}
                onChange={(v) => setNationPolicy((p) => ({ ...p, minNPCRecruitCityPopulation: v }))}
                description="Warp if city pop too low"
              />
              <NumberInputField
                label="Safe Recruit Ratio (%)"
                value={nationPolicy.safeRecruitCityPopulationRatio}
                onChange={(v) =>
                  setNationPolicy((p) => ({ ...p, safeRecruitCityPopulationRatio: v }))
                }
                min={0}
                max={1}
                isPercentage
                description="Threshold for safe recruitment"
              />
              <NumberInputField
                label="NPC War Leadership"
                value={nationPolicy.minNPCWarLeadership}
                onChange={(v) => setNationPolicy((p) => ({ ...p, minNPCWarLeadership: v }))}
                step={5}
                description="Min leadership for war role"
              />
              <NumberInputField
                label="Training Target"
                value={nationPolicy.properWarTrainAtmos}
                onChange={(v) => setNationPolicy((p) => ({ ...p, properWarTrainAtmos: v }))}
                step={5}
                min={20}
                max={100}
                description="Target for training/morale"
              />
              <NumberInputField
                label="Healing Threshold"
                value={nationPolicy.cureThreshold}
                onChange={(v) => setNationPolicy((p) => ({ ...p, cureThreshold: v }))}
                step={5}
                min={10}
                max={100}
                description="Heal if injury exceeds this"
              />
            </div>
          </div>

          <div className="p-4 bg-black/20 border-t border-white/10 flex justify-end gap-3 rounded-b-xl">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Reset to default values?")) setNationPolicy(MOCK_DEFAULT_POLICY);
              }}
              className="border-white/10 bg-transparent hover:bg-white/5 hover:text-white"
            >
              Default
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (confirm("Revert to previous?") && policyStack.current.length > 1) {
                  policyStack.current.pop();
                  setNationPolicy(clone(policyStack.current[policyStack.current.length - 1]));
                }
              }}
              className="bg-secondary/80 hover:bg-secondary text-secondary-foreground"
            >
              Undo
            </Button>
            <Button
              onClick={() => submit("nationPolicy", nationPolicy)}
              className="bg-primary text-primary-foreground font-bold shadow-glow-sm hover:shadow-glow hover:bg-primary/90"
            >
              Save Policy
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <DndPriorityList
            title="Chief Turn Priority"
            lastSetter={lastSetters.nation}
            description="Drag to reorder the priority of actions taken during the Chief's turn phase."
            activeItems={chiefActive}
            inactiveItems={chiefInactive}
            onItemsChange={(a, i) => {
              setChiefActive(a);
              setChiefInactive(i);
            }}
            onReset={() => setChiefActive(DEFAULT_CHIEF_PRIORITY)}
            onRollback={() => {
              if (chiefStack.current.length > 1) {
                chiefStack.current.pop();
                const l = chiefStack.current[chiefStack.current.length - 1];
                setChiefActive(l);
                setChiefInactive(ALL_CHIEF_ACTIONS.filter((x) => !l.includes(x)));
              }
            }}
            onSubmit={() => submit("nationPriority", chiefActive)}
            groupId="chief"
          />
          <DndPriorityList
            title="General Turn Priority"
            lastSetter={lastSetters.general}
            description="Drag to reorder the priority of actions taken during the General's turn phase."
            activeItems={generalActive}
            inactiveItems={generalInactive}
            onItemsChange={(a, i) => {
              setGeneralActive(a);
              setGeneralInactive(i);
            }}
            onReset={() => setGeneralActive(DEFAULT_GENERAL_PRIORITY)}
            onRollback={() => {
              if (generalStack.current.length > 1) {
                generalStack.current.pop();
                const l = generalStack.current[generalStack.current.length - 1];
                setGeneralActive(l);
                setGeneralInactive(ALL_GENERAL_ACTIONS.filter((x) => !l.includes(x)));
              }
            }}
            onSubmit={() => submit("generalPriority", generalActive)}
            groupId="general"
          />
        </div>
      </div>
    </div>
  );
}
