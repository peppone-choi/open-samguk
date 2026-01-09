"use client";

/**
 * PageNPCControl - NPC 정책
 * Ported from legacy/hwe/ts/PageNPCControl.vue
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
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
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ============================================================================
// Types
// ============================================================================

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

// ============================================================================
// Constants
// ============================================================================

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

// ============================================================================
// Sub Components - Number Input
// ============================================================================

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
    <div className="p-2 border-b border-gray-700">
      <div className="flex justify-between items-center gap-2">
        <label className="text-sm flex-1">{label}</label>
        <input
          type="number"
          className="w-28 px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white text-right text-sm"
          value={displayValue}
          step={isPercentage ? 0.5 : step}
          onChange={handleChange}
        />
      </div>
      {description && <div className="text-right text-xs text-gray-400 mt-1">{description}</div>}
    </div>
  );
}

// ============================================================================
// Sub Components - Drag & Drop
// ============================================================================

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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 bg-zinc-800 px-2 py-1.5 rounded text-xs cursor-grab active:cursor-grabbing ${isDragging ? "ring-2 ring-blue-500" : ""}`}
      title={NPC_PRIORITY_HELP_TEXTS[id]}
      {...attributes}
      {...listeners}
    >
      <span className="text-gray-500 select-none">☰</span>
      {showIndex && index !== undefined && (
        <span className="text-gray-500 w-4 flex-shrink-0 select-none">{index + 1}.</span>
      )}
      <span className="truncate flex-1 select-none">{id}</span>
    </div>
  );
}

function DroppableColumn({
  id,
  title,
  items,
  showIndex = false,
  emptyMessage = "(없음)",
}: {
  id: string;
  title: string;
  items: string[];
  showIndex?: boolean;
  emptyMessage?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div>
      <div className="bg2 text-center py-1 text-sm border border-gray-500 mb-1">{title}</div>
      <div
        ref={setNodeRef}
        className={`space-y-1 min-h-[200px] max-h-80 overflow-y-auto p-1 rounded transition-colors ${isOver ? "bg-zinc-700/50 ring-2 ring-blue-500/50" : ""}`}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.length === 0 ? (
            <div className="text-center text-xs text-gray-500 py-4">{emptyMessage}</div>
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
    <div>
      <div className="bg1 text-center py-1 border-y border-gray-600">{title}</div>
      <div className="text-right px-3 text-xs text-gray-400 py-1">
        최근 설정: {lastSetter.setter ?? "-없음-"} ({lastSetter.date ?? "설정 기록 없음"})
      </div>
      <div className="px-3 text-xs text-gray-400 mb-2">{description}</div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 gap-2 px-2">
          <DroppableColumn id={inactiveColumnId} title="비활성" items={inactiveItems} />
          <DroppableColumn id={activeColumnId} title="활성" items={activeItems} showIndex />
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="bg-zinc-700 px-2 py-1.5 rounded text-xs ring-2 ring-blue-500 shadow-lg">
              {activeId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <div className="flex justify-end gap-2 p-2 pt-3">
        <Button variant="outline" size="sm" onClick={onReset}>
          초깃값으로
        </Button>
        <Button variant="secondary" size="sm" onClick={onRollback}>
          이전값으로
        </Button>
        <Button size="sm" onClick={onSubmit}>
          설정
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

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
      showToast("반영되었습니다.", "success");
      refetch();
    } catch (e: any) {
      showToast(`실패: ${e.message || e}`, "danger");
    }
  };

  if (isLoading || !selectedGeneral)
    return (
      <div className="bg0 min-h-screen">
        <TopBackBar title="NPC 정책" type="close" />
        <div className="p-20 text-center text-gray-500 font-bold tracking-widest animate-pulse">
          상태 정보 로딩 중...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg0">
      <TopBackBar title="NPC 정책" type="close" />
      <div className="max-w-[1000px] mx-auto border border-gray-600">
        {toast && (
          <div
            className={`p-2 text-center text-sm font-bold animate-in fade-in slide-in-from-top duration-300 ${toast.variant === "success" ? "bg-green-900/80 text-green-200" : toast.variant === "danger" ? "bg-red-900/80 text-red-200" : "bg-blue-900/80 text-blue-200"}`}
          >
            {toast.message}
          </div>
        )}
        <div className="bg-zinc-800/80 text-center py-2 border-b border-zinc-700 font-bold text-sm tracking-widest uppercase">
          국가 정책 설정
        </div>
        <div className="text-right px-3 text-xs text-gray-400 py-1">
          최근 설정: {lastSetters.policy.setter ?? "-"} ({lastSetters.policy.date ?? "-"})
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <NumberInputField
            label="국가 권장 금"
            value={nationPolicy.reqNationGold}
            onChange={(v) => setNationPolicy((p) => ({ ...p, reqNationGold: v }))}
            description="이보다 많으면 포상, 적으면 몰수/헌납합니다."
          />
          <NumberInputField
            label="국가 권장 쌀"
            value={nationPolicy.reqNationRice}
            onChange={(v) => setNationPolicy((p) => ({ ...p, reqNationRice: v }))}
            description="이보다 많으면 포상, 적으면 몰수/헌납합니다."
          />
          <NumberInputField
            label="유저전투장 긴급포상 금"
            value={nationPolicy.reqHumanWarUrgentGold}
            onChange={(v) => setNationPolicy((p) => ({ ...p, reqHumanWarUrgentGold: v }))}
            description={<>0이면 기본값 {MOCK_ZERO_POLICY.reqHumanWarUrgentGold}</>}
          />
          <NumberInputField
            label="유저전투장 긴급포상 쌀"
            value={nationPolicy.reqHumanWarUrgentRice}
            onChange={(v) => setNationPolicy((p) => ({ ...p, reqHumanWarUrgentRice: v }))}
            description={<>0이면 기본값 {MOCK_ZERO_POLICY.reqHumanWarUrgentRice}</>}
          />
          <NumberInputField
            label="유저전투장 권장 금"
            value={nationPolicy.reqHumanWarRecommandGold}
            onChange={(v) => setNationPolicy((p) => ({ ...p, reqHumanWarRecommandGold: v }))}
            description={<>0이면 긴급포상의 2배 ({calcVal("reqHumanWarUrgentGold") * 2})</>}
          />
          <NumberInputField
            label="유저전투장 권장 쌀"
            value={nationPolicy.reqHumanWarRecommandRice}
            onChange={(v) => setNationPolicy((p) => ({ ...p, reqHumanWarRecommandRice: v }))}
            description={<>0이면 긴급포상의 2배 ({calcVal("reqHumanWarUrgentRice") * 2})</>}
          />
          <NumberInputField
            label="유저내정장 권장 금"
            value={nationPolicy.reqHumanDevelGold}
            onChange={(v) => setNationPolicy((p) => ({ ...p, reqHumanDevelGold: v }))}
            description="유저내정장에게 주는 금입니다."
          />
          <NumberInputField
            label="유저내정장 권장 쌀"
            value={nationPolicy.reqHumanDevelRice}
            onChange={(v) => setNationPolicy((p) => ({ ...p, reqHumanDevelRice: v }))}
            description="유저내정장에게 주는 쌀입니다."
          />
          <NumberInputField
            label="NPC전투장 권장 금"
            value={nationPolicy.reqNPCWarGold}
            onChange={(v) => setNationPolicy((p) => ({ ...p, reqNPCWarGold: v }))}
            description={<>0이면 기본값 {MOCK_ZERO_POLICY.reqNPCWarGold}</>}
          />
          <NumberInputField
            label="NPC전투장 권장 쌀"
            value={nationPolicy.reqNPCWarRice}
            onChange={(v) => setNationPolicy((p) => ({ ...p, reqNPCWarRice: v }))}
            description={<>0이면 기본값 {MOCK_ZERO_POLICY.reqNPCWarRice}</>}
          />
          <NumberInputField
            label="NPC내정장 권장 금"
            value={nationPolicy.reqNPCDevelGold}
            onChange={(v) => setNationPolicy((p) => ({ ...p, reqNPCDevelGold: v }))}
            description={<>0이면 기본값 {MOCK_ZERO_POLICY.reqNPCDevelGold}</>}
          />
          <NumberInputField
            label="NPC내정장 권장 쌀"
            value={nationPolicy.reqNPCDevelRice}
            onChange={(v) => setNationPolicy((p) => ({ ...p, reqNPCDevelRice: v }))}
            description="NPC내정장에게 주는 쌀입니다."
          />
          <NumberInputField
            label="포상/몰수/헌납 최소 단위"
            value={nationPolicy.minimumResourceActionAmount}
            onChange={(v) => setNationPolicy((p) => ({ ...p, minimumResourceActionAmount: v }))}
            min={100}
            description="연산결과가 이보다 적으면 수행하지 않습니다."
          />
          <NumberInputField
            label="포상/몰수/헌납 최대 단위"
            value={nationPolicy.maximumResourceActionAmount}
            onChange={(v) => setNationPolicy((p) => ({ ...p, maximumResourceActionAmount: v }))}
            min={100}
            description="연산결과가 이보다 크면 이 값에 맞춥니다."
          />
          <NumberInputField
            label="최소 전투 가능 병력 수"
            value={nationPolicy.minWarCrew}
            onChange={(v) => setNationPolicy((p) => ({ ...p, minWarCrew: v }))}
            step={50}
            description="이보다 적으면 징병을 시도합니다."
          />
          <NumberInputField
            label="NPC 최소 징병 인구"
            value={nationPolicy.minNPCRecruitCityPopulation}
            onChange={(v) => setNationPolicy((p) => ({ ...p, minNPCRecruitCityPopulation: v }))}
            description="인구가 이보다 낮으면 NPC는 후방으로 워프합니다."
          />
          <NumberInputField
            label="제자리 징병 허용 인구율(%)"
            value={nationPolicy.safeRecruitCityPopulationRatio}
            onChange={(v) => setNationPolicy((p) => ({ ...p, safeRecruitCityPopulationRatio: v }))}
            min={0}
            max={1}
            isPercentage
            description="후방 발령, 후방 워프의 기준입니다."
          />
          <NumberInputField
            label="NPC 전투 참여 통솔"
            value={nationPolicy.minNPCWarLeadership}
            onChange={(v) => setNationPolicy((p) => ({ ...p, minNPCWarLeadership: v }))}
            step={5}
            description="이보다 높으면 NPC전투장으로 분류됩니다."
          />
          <NumberInputField
            label="훈련/사기진작 목표"
            value={nationPolicy.properWarTrainAtmos}
            onChange={(v) => setNationPolicy((p) => ({ ...p, properWarTrainAtmos: v }))}
            step={5}
            min={20}
            max={100}
            description="이보다 높으면 출병합니다."
          />
          <NumberInputField
            label="요양 기준"
            value={nationPolicy.cureThreshold}
            onChange={(v) => setNationPolicy((p) => ({ ...p, cureThreshold: v }))}
            step={5}
            min={10}
            max={100}
            description="이보다 많이 부상 입으면 요양합니다."
          />
        </div>
        <div className="flex justify-end gap-2 p-2 border-b border-gray-600">
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("되돌릴까요?")) setNationPolicy(MOCK_DEFAULT_POLICY);
            }}
          >
            초깃값으로
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (confirm("되돌릴까요?") && policyStack.current.length > 1) {
                policyStack.current.pop();
                setNationPolicy(clone(policyStack.current[policyStack.current.length - 1]));
              }
            }}
          >
            이전값으로
          </Button>
          <Button onClick={() => submit("nationPolicy", nationPolicy)}>설정</Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <DndPriorityList
            title="NPC 사령턴 우선순위"
            lastSetter={lastSetters.nation}
            description="드래그하여 순서를 변경하세요."
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
            title="NPC 일반턴 우선순위"
            lastSetter={lastSetters.general}
            description="드래그하여 순서를 변경하세요."
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
