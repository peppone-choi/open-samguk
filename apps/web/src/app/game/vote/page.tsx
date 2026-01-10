"use client";

/**
 * PageVote - 투표/설문 조사
 * Ported from legacy/hwe/ts/PageVote.vue
 *
 * Features:
 * - Vote with single/multiple selection
 * - Vote results with percentages
 * - Comments section
 * - Previous votes list
 * - New vote creation (admin)
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";

// ============================================================================
// Types
// ============================================================================

interface VoteInfo {
  id: number;
  title: string;
  multipleOptions: number; // 0 = all, 1 = single, N = N options
  endDate?: string | null;
  startDate: string;
  opener?: string;
  options: string[];
}

interface VoteResult {
  selection: number[];
  count: number;
}

interface VoteComment {
  id: number;
  nationName: string;
  generalName: string;
  text: string;
  date: string | null;
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatVoteColor(idx: number): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ];
  return colors[idx % colors.length];
}

function isBrightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function VotePage() {
  const { selectedGeneralId } = useGeneral();
  const [currentVoteId, setCurrentVoteId] = useState<number | null>(null);

  const [mySinglePick, setMySinglePick] = useState(0);
  const [myMultiPick, setMyMultiPick] = useState<number[]>([]);
  const [myComment, setMyComment] = useState("");

  const [isVoteAdmin] = useState(false); // Would come from server
  const [showNewVote, setShowNewVote] = useState(false);
  const [newVoteTitle, setNewVoteTitle] = useState("");
  const [newVoteOptions, setNewVoteOptions] = useState("");
  const [newVoteMultiple, setNewVoteMultiple] = useState(1);

  const [toastMessage, setToastMessage] = useState<{
    message: string;
    variant: "success" | "danger" | "warning" | "info";
  } | null>(null);

  // Fetch vote list
  const { data: voteListData, refetch: refetchVoteList } = trpc.getVoteList.useQuery();

  // Fetch vote detail
  const { data: voteDetailData, refetch: refetchVoteDetail } = trpc.getVoteDetail.useQuery(
    { voteId: currentVoteId ?? 0, generalId: selectedGeneralId ?? undefined },
    { enabled: currentVoteId !== null }
  );

  // Vote mutation
  const voteMutation = trpc.vote.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        showToast(
          data.reward ? `설문을 마쳤습니다. (${data.reward}금 보상)` : "설문을 마쳤습니다.",
          "success"
        );
        refetchVoteDetail();
      } else {
        showToast(data.message || "투표 실패", "danger");
      }
    },
    onError: (error) => {
      showToast(error.message || "투표 실패", "danger");
    },
  });

  // Add comment mutation
  const addCommentMutation = trpc.addVoteComment.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        showToast("댓글을 달았습니다.", "success");
        setMyComment("");
        refetchVoteDetail();
      } else {
        showToast(data.message || "댓글 작성 실패", "danger");
      }
    },
    onError: (error) => {
      showToast(error.message || "댓글 작성 실패", "danger");
    },
  });

  // Create vote mutation (admin)
  const createVoteMutation = trpc.createVote.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        showToast("설문 조사가 생성되었습니다.", "success");
        setNewVoteTitle("");
        setNewVoteOptions("");
        setNewVoteMultiple(1);
        setShowNewVote(false);
        refetchVoteList();
      } else {
        showToast(data.message || "설문 조사 생성 실패", "danger");
      }
    },
    onError: (error) => {
      showToast(error.message || "설문 조사 생성 실패", "danger");
    },
  });

  // Convert vote list to Map for easier iteration
  const voteList = useMemo(() => {
    if (!voteListData?.votes) return new Map<number, VoteInfo>();
    const map = new Map<number, VoteInfo>();
    // Sort by ID descending (newest first)
    const sortedIds = Object.keys(voteListData.votes)
      .map(Number)
      .sort((a, b) => b - a);
    for (const id of sortedIds) {
      map.set(id, voteListData.votes[id] as VoteInfo);
    }
    return map;
  }, [voteListData]);

  // Set initial vote ID when list loads
  useEffect(() => {
    if (voteList.size > 0 && currentVoteId === null) {
      const firstId = voteList.keys().next().value ?? null;
      setCurrentVoteId(firstId);
    }
  }, [voteList, currentVoteId]);

  // Reset picks when vote changes
  useEffect(() => {
    setMySinglePick(0);
    setMyMultiPick([]);
  }, [currentVoteId]);

  // Current vote info and detail
  const voteInfo = voteDetailData?.voteInfo as VoteInfo | null | undefined;
  const votes = (voteDetailData?.votes ?? []) as VoteResult[];
  const comments = (voteDetailData?.comments ?? []) as VoteComment[];
  const myVote = voteDetailData?.myVote as number[] | null | undefined;
  const userCnt = voteDetailData?.userCount ?? 0;

  // Calculate vote distribution
  const { voteTotal, voteDistribution } = useMemo(() => {
    if (!voteInfo) return { voteTotal: 0, voteDistribution: {} as Record<number, number> };

    const dist: Record<number, number> = {};
    for (let i = 0; i < voteInfo.options.length; i++) {
      dist[i] = 0;
    }

    let total = 0;
    for (const vote of votes) {
      total += vote.count;
      for (const idx of vote.selection) {
        dist[idx] = (dist[idx] ?? 0) + vote.count;
      }
    }

    return { voteTotal: total, voteDistribution: dist };
  }, [voteInfo, votes]);

  // Can user vote?
  const canVote = useMemo(() => {
    if (!voteInfo) return false;
    if (myVote) return false;
    if (!selectedGeneralId) return false;
    if (voteInfo.endDate) {
      const now = new Date().toISOString().slice(0, 10);
      if (now > voteInfo.endDate.slice(0, 10)) return false;
    }
    return true;
  }, [voteInfo, myVote, selectedGeneralId]);

  // Show toast
  const showToast = useCallback(
    (message: string, variant: "success" | "danger" | "warning" | "info") => {
      setToastMessage({ message, variant });
      setTimeout(() => setToastMessage(null), 3000);
    },
    []
  );

  // Handle reload
  const handleReload = useCallback(() => {
    refetchVoteList();
    if (currentVoteId !== null) {
      refetchVoteDetail();
    }
  }, [refetchVoteList, refetchVoteDetail, currentVoteId]);

  // Handle multi-pick with limit
  const handleMultiPickChange = useCallback(
    (idx: number, checked: boolean) => {
      if (!voteInfo) return;
      const maxOptions =
        voteInfo.multipleOptions === 0 ? voteInfo.options.length : voteInfo.multipleOptions;

      if (checked) {
        if (myMultiPick.length >= maxOptions) {
          showToast(`${maxOptions}개까지만 선택할 수 있습니다.`, "warning");
          return;
        }
        setMyMultiPick((prev) => [...prev, idx]);
      } else {
        setMyMultiPick((prev) => prev.filter((i) => i !== idx));
      }
    },
    [voteInfo, myMultiPick.length, showToast]
  );

  // Submit vote
  const handleSubmitVote = useCallback(() => {
    if (!voteInfo || !selectedGeneralId) return;
    const selection = voteInfo.multipleOptions !== 1 ? myMultiPick : [mySinglePick];

    if (selection.length === 0) {
      showToast("선택한 항목이 없습니다.", "danger");
      return;
    }

    voteMutation.mutate({
      voteId: voteInfo.id,
      generalId: selectedGeneralId,
      selection,
    });
  }, [voteInfo, selectedGeneralId, myMultiPick, mySinglePick, showToast, voteMutation]);

  // Submit comment
  const handleSubmitComment = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!voteInfo || !selectedGeneralId || !myComment.trim()) return;

      addCommentMutation.mutate({
        voteId: voteInfo.id,
        generalId: selectedGeneralId,
        text: myComment.trim(),
      });
    },
    [voteInfo, selectedGeneralId, myComment, addCommentMutation]
  );

  // Submit new vote (admin)
  const handleSubmitNewVote = useCallback(() => {
    const options = newVoteOptions.split("\n").filter((o) => o.trim());
    if (!newVoteTitle.trim() || options.length === 0) {
      showToast("제목과 옵션을 입력해주세요.", "danger");
      return;
    }

    createVoteMutation.mutate({
      opener: "관리자", // Would come from auth context
      title: newVoteTitle.trim(),
      options: options.map((o) => o.trim()),
      multipleOptions: newVoteMultiple,
    });
  }, [newVoteTitle, newVoteOptions, newVoteMultiple, showToast, createVoteMutation]);

  const maxSelectableOptions =
    voteInfo?.multipleOptions === 0 ? voteInfo?.options.length : (voteInfo?.multipleOptions ?? 1);

  // Get vote reward from game env (default 500)
  const voteReward = 500; // This would come from gameEnv

  return (
    <>
      <TopBackBar title="" type="close" reloadable onReload={handleReload} />

      <div className="w-full max-w-[1000px] mx-auto border border-gray-600">
        {/* Toast */}
        {toastMessage && (
          <div
            className={`p-2 text-center text-sm ${
              toastMessage.variant === "success"
                ? "bg-green-800"
                : toastMessage.variant === "danger"
                  ? "bg-red-800"
                  : toastMessage.variant === "info"
                    ? "bg-blue-800"
                    : "bg-yellow-800"
            }`}
          >
            {toastMessage.message}
          </div>
        )}

        {/* Vote Title */}
        <div className="bg2 text-center p-3 text-xl font-bold">
          설문 조사({voteReward}금과 추첨으로 유니크템 증정!)
        </div>

        {/* Vote Detail */}
        {voteInfo && (
          <>
            {/* Vote Info Table */}
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="bg1 text-right p-2 w-24 lg:w-32">설문 제목</th>
                  <th className="p-2 text-left">
                    {voteInfo.title}
                    {voteInfo.multipleOptions !== 1 && (
                      <span className="text-gray-400 ml-2">
                        ({maxSelectableOptions}개 선택 가능)
                      </span>
                    )}
                  </th>
                </tr>
                <tr>
                  <th className="bg1 text-right p-2">게시자</th>
                  <th className="p-2 text-left">{voteInfo.opener ?? "[SYSTEM]"}</th>
                </tr>
              </thead>

              <tbody>
                {voteInfo.options.map((option, idx) => {
                  const count = voteDistribution[idx] ?? 0;
                  const percent = voteTotal > 0 ? ((count / voteTotal) * 100).toFixed(1) : "0.0";
                  const color = formatVoteColor(idx);
                  const textColor = isBrightColor(color) ? "#000" : "#fff";

                  return (
                    <tr key={idx} className="border-t border-gray-700">
                      {/* Selection or Index */}
                      {canVote ? (
                        <td className="p-2 text-center">
                          {voteInfo.multipleOptions === 1 ? (
                            <input
                              type="radio"
                              name="vote-option"
                              checked={mySinglePick === idx}
                              onChange={() => setMySinglePick(idx)}
                              className="form-radio"
                            />
                          ) : (
                            <input
                              type="checkbox"
                              checked={myMultiPick.includes(idx)}
                              onChange={(e) => handleMultiPickChange(idx, e.target.checked)}
                              className="form-checkbox"
                            />
                          )}
                        </td>
                      ) : (
                        <td
                          className="p-2 text-right font-mono w-12"
                          style={{ backgroundColor: color, color: textColor }}
                        >
                          {idx + 1}.
                        </td>
                      )}

                      {/* Option Text with Count */}
                      <td className="p-2">
                        <div className="flex justify-between items-center">
                          <label className="cursor-pointer flex-1">{option}</label>
                          <div className="text-right font-mono text-gray-400">
                            <span>{count}명</span>
                            <span className="ml-2">({percent}%)</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr className="border-t border-gray-600">
                  {canVote ? (
                    <>
                      <td className="p-2 text-center">투표</td>
                      <td className="p-2">
                        <div className="flex justify-between items-center">
                          <Button
                            size="sm"
                            onClick={handleSubmitVote}
                            disabled={voteMutation.isPending}
                          >
                            투표
                          </Button>
                          <span className="text-gray-400">
                            투표율: {voteTotal} / {userCnt} (
                            {((voteTotal / Math.max(1, userCnt)) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2 text-center">결산</td>
                      <td className="p-2">
                        투표율: {voteTotal} / {userCnt} (
                        {((voteTotal / Math.max(1, userCnt)) * 100).toFixed(1)}%)
                      </td>
                    </>
                  )}
                </tr>
              </tfoot>
            </table>

            {/* Comments Section */}
            <form onSubmit={handleSubmitComment}>
              <table className="w-full text-sm mt-4">
                <thead>
                  <tr className="bg1 text-center">
                    <th className="p-2 w-8">#</th>
                    <th className="p-2 w-28 lg:w-64">
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        <span>국가명</span>
                        <span>장수명</span>
                      </div>
                    </th>
                    <th className="p-2">댓글</th>
                    <th className="p-2 w-20 lg:w-24">일시</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment, idx) => (
                    <tr key={comment.id} className="border-t border-gray-700">
                      <td className="p-2 text-right font-mono">{idx + 1}.</td>
                      <td className="p-2 text-center">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                          <span>{comment.nationName}</span>
                          <span>{comment.generalName}</span>
                        </div>
                      </td>
                      <td className="p-2">{comment.text}</td>
                      <td className="p-2 text-center font-mono text-xs">
                        {comment.date?.substring(5, 16) ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {selectedGeneralId && (
                    <tr className="border-t border-gray-600">
                      <td></td>
                      <td className="p-2">
                        <Button type="submit" size="sm" disabled={addCommentMutation.isPending}>
                          댓글 달기
                        </Button>
                      </td>
                      <td colSpan={2} className="p-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white text-sm"
                          value={myComment}
                          onChange={(e) => setMyComment(e.target.value)}
                          placeholder="댓글을 입력하세요"
                        />
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </form>
          </>
        )}

        {/* No vote selected */}
        {!voteInfo && voteList.size === 0 && (
          <div className="p-8 text-center text-gray-400">등록된 설문 조사가 없습니다.</div>
        )}

        {/* Previous Votes List */}
        {voteList.size > 0 && (
          <>
            <div className="bg2 text-center p-2 mt-4 text-lg font-semibold">이전 설문 조사</div>
            <div className="divide-y divide-gray-700">
              {Array.from(voteList.entries()).map(([voteId, info]) => (
                <div
                  key={voteId}
                  className={`p-2 cursor-pointer hover:bg-zinc-700 ${currentVoteId === voteId ? "bg-zinc-700" : ""}`}
                  onClick={() => setCurrentVoteId(voteId)}
                >
                  <span className="text-cyan-300 hover:underline">{info.title}</span>
                  <span className="text-gray-400 ml-2">({info.startDate?.slice(0, 10)})</span>
                  {info.endDate && <span className="text-gray-500 ml-2">[마감]</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* New Vote Panel (Admin) */}
        {isVoteAdmin && (
          <div className="p-2 mt-4 border-t border-gray-600">
            <div
              className="text-cyan-300 cursor-pointer hover:underline"
              onClick={() => setShowNewVote(!showNewVote)}
            >
              새 설문 조사 열기
            </div>

            {showNewVote && (
              <div className="mt-2 space-y-2">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">설문 제목</div>
                  <div className="col-span-9">
                    <input
                      type="text"
                      className="w-full px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white"
                      value={newVoteTitle}
                      onChange={(e) => setNewVoteTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-3">
                    설문 대상
                    <br />
                    <span className="text-gray-400 text-xs">(엔터로 구분)</span>
                  </div>
                  <div className="col-span-9">
                    <textarea
                      className="w-full px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white"
                      rows={5}
                      value={newVoteOptions}
                      onChange={(e) => setNewVoteOptions(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">동시 응답 수 (0=모두)</div>
                  <div className="col-span-9">
                    <input
                      type="number"
                      className="w-24 px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white"
                      value={newVoteMultiple}
                      min={0}
                      onChange={(e) => setNewVoteMultiple(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSubmitNewVote} disabled={createVoteMutation.isPending}>
                    제출
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
