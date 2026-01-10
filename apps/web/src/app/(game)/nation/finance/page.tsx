"use client";

/**
 * PageNationStratFinan - 내무부 (Nation Strategy & Finance)
 * Ported from legacy/hwe/ts/PageNationStratFinan.vue
 *
 * Features:
 * - Diplomacy relations table with other nations
 * - Nation notice & scout message editor
 * - Budget overview (gold & rice)
 * - Policy settings (rate, bill, secretLimit, blockWar, blockScout)
 */

import React, { useState, useEffect } from "react";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

type DiplomacyState = 0 | 1 | 2 | 7; // 0=war, 1=declared, 2=neutral, 7=non-aggression

interface DiplomacyStateInfo {
  name: string;
  color?: string;
}

interface NationDiplomacy {
  state: DiplomacyState;
  term: number | null;
}

interface NationItem {
  nation: number;
  name: string;
  color: string;
  power: number;
  gennum: number;
  cityCnt: number;
  diplomacy: NationDiplomacy;
}

// ============================================================================
// Constants
// ============================================================================

const DIPLOMACY_STATE_INFO: Record<DiplomacyState, DiplomacyStateInfo> = {
  0: { name: "교전", color: "red" },
  1: { name: "선포", color: "magenta" },
  2: { name: "통상", color: undefined },
  7: { name: "불가침", color: "limegreen" },
};

// ============================================================================
// Utility Functions
// ============================================================================

function isBrightColor(color: string): boolean {
  if (!color) return false;
  const hex = color.replace("#", "");
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 140;
}

function parseYearMonth(ym: number): [number, number] {
  const year = Math.floor(ym / 12);
  const month = (ym % 12) + 1;
  return [year, month];
}

function joinYearMonth(year: number, month: number): number {
  return year * 12 + (month - 1);
}

// ============================================================================
// Sub Components
// ============================================================================

interface DiplomacyTableProps {
  nations: NationItem[];
  nationID: number;
  year: number;
  month: number;
}

function DiplomacyTable({ nations, nationID, year, month }: DiplomacyTableProps) {
  return (
    <div className="overflow-x-auto">
      {/* Header */}
      <div className="grid grid-cols-7 bg1 text-center text-sm font-medium py-1 border-b border-gray-600 min-w-[600px]">
        <div>국가명</div>
        <div>국력</div>
        <div>장수</div>
        <div>속령</div>
        <div>상태</div>
        <div>기간</div>
        <div>종료 시점</div>
      </div>
      {/* Rows */}
      {nations.map((nation) => {
        const isSelf = nation.nation === nationID;
        const endYearMonth = joinYearMonth(year, month) + (nation.diplomacy.term ?? 0);
        const [endYear, endMonth] = parseYearMonth(endYearMonth);
        const stateInfo =
          DIPLOMACY_STATE_INFO[nation.diplomacy.state as DiplomacyState] || DIPLOMACY_STATE_INFO[2];

        return (
          <div
            key={nation.nation}
            className="grid grid-cols-7 text-center text-sm py-1 border-b border-gray-700 items-center min-w-[600px]"
          >
            <div
              className="px-2 py-0.5 mx-1 rounded"
              style={{
                backgroundColor: nation.color,
                color: isBrightColor(nation.color) ? "#000" : "#fff",
              }}
            >
              {nation.name}
            </div>
            <div>{nation.power.toLocaleString()}</div>
            <div>{nation.gennum.toLocaleString()}</div>
            <div>{nation.cityCnt.toLocaleString()}</div>
            {isSelf ? (
              <>
                <div>-</div>
                <div>-</div>
                <div>-</div>
              </>
            ) : (
              <>
                <div style={{ color: stateInfo.color }}>{stateInfo.name}</div>
                <div>
                  {nation.diplomacy.term === null || nation.diplomacy.term === 0
                    ? "-"
                    : `${nation.diplomacy.term}개월`}
                </div>
                <div>
                  {nation.diplomacy.term === null || nation.diplomacy.term === 0
                    ? "-"
                    : `${endYear}년 ${endMonth}월`}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface NoticeEditorProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  hint?: string;
}

function NoticeEditor({
  title,
  value,
  onChange,
  editable,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  hint,
}: NoticeEditorProps) {
  return (
    <div className="mb-4">
      <div className="bg1 flex justify-between items-center px-3 py-2">
        <div className="font-medium">{title}</div>
        <div className="flex gap-2">
          {editable && !isEditing && (
            <Button size="sm" variant="outline" onClick={onEdit}>
              {title} 수정
            </Button>
          )}
          {editable && isEditing && (
            <>
              <Button size="sm" onClick={onSave}>
                저장
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                취소
              </Button>
            </>
          )}
        </div>
      </div>
      {hint && (
        <div className="text-xs text-gray-400 border-b border-gray-600 px-3 py-1">{hint}</div>
      )}
      <div className="bg2 p-3 min-h-[80px]">
        {isEditing ? (
          <textarea
            value={value.replace(/<[^>]*>/g, "")} // Strip HTML for simple textarea to edit
            onChange={(e) => onChange(`<p>${e.target.value}</p>`)}
            className="w-full min-h-[80px] bg-zinc-700 border border-gray-600 rounded p-2 text-white resize-y"
            placeholder={`${title}을 입력하세요...`}
          />
        ) : (
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        )}
      </div>
    </div>
  );
}

interface BudgetSectionProps {
  title: string;
  current: number;
  incomeItems: { label: string; value: number }[];
  totalIncome: number;
  outcome: number;
}

function BudgetSection({ title, current, incomeItems, totalIncome, outcome }: BudgetSectionProps) {
  const forecast = Math.floor(current + totalIncome - outcome);
  const diff = totalIncome - outcome;

  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 gap-0">
        <div className="bg2 text-center py-1 font-medium">{title}</div>
        <div className="grid grid-cols-2 border-b border-gray-700">
          <div className="bg1 text-right pr-2 py-1">현 재</div>
          <div className="py-1 pl-2">{current.toLocaleString()}</div>
        </div>
        {incomeItems.map((item, idx) => (
          <div key={idx} className="grid grid-cols-2 border-b border-gray-700">
            <div className="bg1 text-right pr-2 py-1">{item.label}</div>
            <div className="py-1 pl-2">{Math.floor(item.value).toLocaleString()}</div>
          </div>
        ))}
        <div className="grid grid-cols-2 border-b border-gray-700">
          <div className="bg1 text-right pr-2 py-1">수입/지출</div>
          <div className="py-1 pl-2">
            +{Math.floor(totalIncome).toLocaleString()} / {Math.floor(-outcome).toLocaleString()}
          </div>
        </div>
        <div className="grid grid-cols-2 border-b border-gray-700">
          <div className="bg1 text-right pr-2 py-1">국고 예산</div>
          <div className="py-1 pl-2">
            {forecast.toLocaleString()} ({diff >= 0 ? "+" : ""}
            {Math.floor(diff).toLocaleString()})
          </div>
        </div>
      </div>
    </div>
  );
}

interface PolicyInputProps {
  label: string;
  range: string;
  value: number;
  onChange: (value: number) => void;
  onSave: () => void;
  onCancel: () => void;
  unit: string;
  min: number;
  max: number;
  editable: boolean;
}

function PolicyInput({
  label,
  range,
  value,
  onChange,
  onSave,
  onCancel,
  unit,
  min,
  max,
  editable,
}: PolicyInputProps) {
  return (
    <div className="grid grid-cols-2 border-b border-gray-700">
      <div className="bg1 flex items-center justify-end pr-2 py-2">
        <span>
          {label} <span className="text-xs text-gray-400">({range})</span>
        </span>
      </div>
      <div className="flex items-center gap-2 py-1 px-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          className="w-20 px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white text-right"
          disabled={!editable}
        />
        <span className="text-gray-400">{unit}</span>
        {editable && (
          <>
            <Button size="sm" onClick={onSave} className="bg-blue-600 hover:bg-blue-500">
              변경
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              취소
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

function ToggleSwitch({ label, checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-blue-600" : "bg-gray-600"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function NationFinancePage() {
  const { selectedGeneralId, selectedGeneral } = useGeneral();

  const nationId = selectedGeneral?.nationId;

  // Query Data
  const { data, isLoading, refetch } = trpc.getNationStrategyInfo.useQuery(
    { nationId: nationId ?? 0, generalId: selectedGeneralId ?? 0 },
    { enabled: !!nationId && !!selectedGeneralId }
  );

  // Mutations
  const updateConfig = trpc.updateNationConfig.useMutation();
  const setNotice = trpc.setNationNotice.useMutation();
  const setBlockWar = trpc.setBlockWar.useMutation();
  const setBlockScout = trpc.setBlockScout.useMutation();
  const setScoutMsgMutation = trpc.setScoutMsg.useMutation();

  // Editor states
  const [nationMsg, setNationMsg] = useState("");
  const [scoutMsg, setScoutMsg] = useState("");
  const [isEditingNationMsg, setIsEditingNationMsg] = useState(false);
  const [isEditingScoutMsg, setIsEditingScoutMsg] = useState(false);

  // Policy states
  const [policyRate, setPolicyRate] = useState(0);
  const [policyBill, setPolicyBill] = useState(0);
  const [policySecretLimit, setPolicySecretLimit] = useState(0);

  // Sync state with query data
  useEffect(() => {
    if (data) {
      setNationMsg(data.nationMsg || "");
      setScoutMsg(data.scoutMsg || "");
      setPolicyRate(data.policy.rate);
      setPolicyBill(data.policy.bill);
      setPolicySecretLimit(data.policy.secretLimit);
    }
  }, [data]);

  // Handlers
  const handleSaveNationMsg = async () => {
    try {
      await setNotice.mutateAsync({ nationId: nationId!, notice: nationMsg });
      toast.success("국가 방침을 변경했습니다.");
      setIsEditingNationMsg(false);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "오류가 발생했습니다.");
    }
  };

  const handleCancelNationMsg = () => {
    setNationMsg(data?.nationMsg || "");
    setIsEditingNationMsg(false);
  };

  const handleSaveScoutMsg = async () => {
    try {
      await setScoutMsgMutation.mutateAsync({
        nationId: nationId!,
        generalId: selectedGeneralId!,
        message: scoutMsg,
      });
      toast.success("임관 권유문을 변경했습니다.");
      setIsEditingScoutMsg(false);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "오류가 발생했습니다.");
    }
  };

  const handleCancelScoutMsg = () => {
    setScoutMsg(data?.scoutMsg || "");
    setIsEditingScoutMsg(false);
  };

  const handleSaveRate = async () => {
    try {
      await updateConfig.mutateAsync({ nationId: nationId!, data: { rate: policyRate } });
      toast.success("세율을 변경했습니다.");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "오류가 발생했습니다.");
    }
  };

  const handleCancelRate = () => {
    setPolicyRate(data?.policy.rate || 0);
  };

  const handleSaveBill = async () => {
    try {
      await updateConfig.mutateAsync({ nationId: nationId!, data: { bill: policyBill } });
      toast.success("지급률을 변경했습니다.");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "오류가 발생했습니다.");
    }
  };

  const handleCancelBill = () => {
    setPolicyBill(data?.policy.bill || 0);
  };

  const handleSaveSecretLimit = async () => {
    try {
      await updateConfig.mutateAsync({
        nationId: nationId!,
        data: { secretLimit: policySecretLimit },
      });
      toast.success("기밀 권한을 변경했습니다.");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "오류가 발생했습니다.");
    }
  };

  const handleCancelSecretLimit = () => {
    setPolicySecretLimit(data?.policy.secretLimit || 0);
  };

  const handleToggleBlockWar = async (value: boolean) => {
    try {
      await setBlockWar.mutateAsync({
        nationId: nationId!,
        generalId: selectedGeneralId!,
        block: value,
      });
      toast.success("전쟁 금지 설정을 변경했습니다.");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "오류가 발생했습니다.");
    }
  };

  const handleToggleBlockScout = async (value: boolean) => {
    try {
      await setBlockScout.mutateAsync({
        nationId: nationId!,
        generalId: selectedGeneralId!,
        block: value,
      });
      toast.success("임관 금지 설정을 변경했습니다.");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "오류가 발생했습니다.");
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const incomeGoldCity = (data.income.gold.city * policyRate) / 100;
  const incomeGold = incomeGoldCity + data.income.gold.war;
  const incomeRiceCity = (data.income.rice.city * policyRate) / 100;
  const incomeRiceWall = (data.income.rice.wall * policyRate) / 100;
  const incomeRice = incomeRiceCity + incomeRiceWall;
  const outcomeByBill = (data.outcome * policyBill) / 100;

  return (
    <div className="min-h-screen bg0">
      <TopBackBar title="내무부" />

      <div className="max-w-[1000px] mx-auto px-2 pb-4">
        {/* Diplomacy Section */}
        <div className="mt-4 border border-gray-600">
          <div className="text-center py-1 text-lg border-b border-gray-600 bg-blue-900/50">
            외교관계
          </div>
          <DiplomacyTable
            nations={data.nationsList as unknown as NationItem[]}
            nationID={data.nationID}
            year={data.year}
            month={data.month}
          />
        </div>

        {/* Notice Section */}
        <div className="mt-6 border border-gray-600">
          <div className="text-center py-1 text-lg border-b border-gray-600 bg-green-900/50">
            국가 방침 &amp; 임관 권유 메시지
          </div>
          <NoticeEditor
            title="국가 방침"
            value={nationMsg}
            onChange={setNationMsg}
            editable={data.editable}
            isEditing={isEditingNationMsg}
            onEdit={() => setIsEditingNationMsg(true)}
            onSave={handleSaveNationMsg}
            onCancel={handleCancelNationMsg}
          />
          <NoticeEditor
            title="임관 권유"
            value={scoutMsg}
            onChange={setScoutMsg}
            editable={data.editable}
            isEditing={isEditingScoutMsg}
            onEdit={() => setIsEditingScoutMsg(true)}
            onSave={handleSaveScoutMsg}
            onCancel={handleCancelScoutMsg}
            hint="870px x 200px를 넘어서는 내용은 표시되지 않습니다."
          />
        </div>

        {/* Budget & Policy Section */}
        <div className="mt-6 border border-gray-600">
          <div className="text-center py-1 text-lg border-b border-gray-600 bg-amber-900/50">
            예산 &amp; 정책
          </div>

          {/* Budget Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <BudgetSection
              title="자금 예산"
              current={data.gold}
              incomeItems={[
                { label: "단기수입", value: data.income.gold.war },
                { label: "세 금", value: incomeGoldCity },
              ]}
              totalIncome={incomeGold}
              outcome={outcomeByBill}
            />
            <BudgetSection
              title="군량 예산"
              current={data.rice}
              incomeItems={[
                { label: "둔전수입", value: incomeRiceWall },
                { label: "세 금", value: incomeRiceCity },
              ]}
              totalIncome={incomeRice}
              outcome={outcomeByBill}
            />
          </div>

          {/* Policy Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-gray-700">
            <PolicyInput
              label="세율"
              range="5 ~ 30%"
              value={policyRate}
              onChange={setPolicyRate}
              onSave={handleSaveRate}
              onCancel={handleCancelRate}
              unit="%"
              min={5}
              max={30}
              editable={data.editable}
            />
            <PolicyInput
              label="지급률"
              range="20 ~ 200%"
              value={policyBill}
              onChange={setPolicyBill}
              onSave={handleSaveBill}
              onCancel={handleCancelBill}
              unit="%"
              min={20}
              max={200}
              editable={data.editable}
            />
            <PolicyInput
              label="기밀 권한"
              range="1 ~ 99년"
              value={policySecretLimit}
              onChange={setPolicySecretLimit}
              onSave={handleSaveSecretLimit}
              onCancel={handleCancelSecretLimit}
              unit="년"
              min={1}
              max={99}
              editable={data.editable}
            />
            <div className="grid grid-cols-2 border-b border-gray-700">
              <div className="bg1 flex items-center justify-end pr-2 py-2">
                <span>전쟁 금지 설정</span>
              </div>
              <div className="flex items-center py-1 px-2 text-sm">
                {data.warSettingCnt.remain}회 (월 +{data.warSettingCnt.inc}회, 최대
                {data.warSettingCnt.max}회)
              </div>
            </div>
          </div>

          {/* Toggle Settings */}
          <div className="flex justify-end gap-8 p-4 bg1/50">
            <ToggleSwitch
              label="전쟁 금지"
              checked={data.policy.blockWar}
              onChange={handleToggleBlockWar}
              disabled={!data.editable || data.officerLevel < 12}
            />
            <ToggleSwitch
              label="임관 금지"
              checked={data.policy.blockScout}
              onChange={handleToggleBlockScout}
              disabled={!data.editable}
            />
          </div>
        </div>

        {/* Additional Settings Placeholder */}
        <div className="mt-6 text-center text-gray-400 py-4 border border-gray-700 bg-zinc-800/50">
          추가 설정 (준비 중)
        </div>
      </div>
    </div>
  );
}
