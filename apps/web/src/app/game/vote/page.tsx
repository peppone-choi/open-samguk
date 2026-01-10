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
    <div className="min-h-screen bg-background pb-20">
      <TopBackBar title="" type="close" reloadable onReload={handleReload} />

      <div className="w-full max-w-[1000px] mx-auto px-4 mt-4">
        <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
          {/* Toast */}
          {toastMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-center text-sm font-medium border backdrop-blur-md animate-in fade-in slide-in-from-top-2 ${
                toastMessage.variant === "success"
                  ? "bg-green-500/20 text-green-200 border-green-500/30"
                  : toastMessage.variant === "danger"
                    ? "bg-red-500/20 text-red-200 border-red-500/30"
                    : toastMessage.variant === "info"
                      ? "bg-blue-500/20 text-blue-200 border-blue-500/30"
                      : "bg-yellow-500/20 text-yellow-200 border-yellow-500/30"
              }`}
            >
              {toastMessage.message}
            </div>
          )}

          {/* Vote Title */}
          <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 p-6 rounded-xl text-center mb-8 border border-white/5 shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70 relative z-10">
              설문 조사
            </h1>
            <p className="text-primary mt-2 font-medium flex items-center justify-center gap-2 relative z-10">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
              {voteReward}금과 추첨으로 유니크템 증정!
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
            </p>
          </div>

          {/* Vote Detail */}
          {voteInfo && (
            <div className="space-y-8">
              {/* Vote Info Table */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="bg-white/5 text-muted-foreground text-right p-4 w-24 lg:w-32 font-medium">
                        설문 제목
                      </th>
                      <th className="p-4 text-left text-foreground bg-black/20">
                        {voteInfo.title}
                        {voteInfo.multipleOptions !== 1 && (
                          <span className="text-primary/80 ml-2 text-xs font-mono px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                            {maxSelectableOptions}개 선택 가능
                          </span>
                        )}
                      </th>
                    </tr>
                    <tr>
                      <th className="bg-white/5 text-muted-foreground text-right p-4 font-medium">
                        게시자
                      </th>
                      <th className="p-4 text-left text-foreground bg-black/20">
                        {voteInfo.opener ?? "[SYSTEM]"}
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-lg font-semibold text-foreground/90">투표 항목</h3>
                  <div className="text-xs text-muted-foreground">
                    총 투표수: <span className="text-primary font-mono">{voteTotal}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
                  <table className="w-full text-sm">
                    <tbody>
                      {voteInfo.options.map((option, idx) => {
                        const count = voteDistribution[idx] ?? 0;
                        const percent =
                          voteTotal > 0 ? ((count / voteTotal) * 100).toFixed(1) : "0.0";
                        const color = formatVoteColor(idx);
                        const isSelected =
                          voteInfo.multipleOptions === 1
                            ? mySinglePick === idx
                            : myMultiPick.includes(idx);

                        return (
                          <tr
                            key={idx}
                            className={`border-b border-white/5 last:border-0 transition-colors duration-200 ${
                              canVote ? "hover:bg-white/5" : ""
                            } ${isSelected ? "bg-primary/5" : ""}`}
                          >
                            {/* Selection or Index */}
                            {canVote ? (
                              <td className="p-4 text-center w-16">
                                {voteInfo.multipleOptions === 1 ? (
                                  <input
                                    type="radio"
                                    name="vote-option"
                                    checked={mySinglePick === idx}
                                    onChange={() => setMySinglePick(idx)}
                                    className="w-5 h-5 border-2 border-muted-foreground text-primary focus:ring-primary/50 focus:ring-offset-0 bg-transparent rounded-full cursor-pointer transition-all checked:border-primary"
                                  />
                                ) : (
                                  <input
                                    type="checkbox"
                                    checked={myMultiPick.includes(idx)}
                                    onChange={(e) => handleMultiPickChange(idx, e.target.checked)}
                                    className="w-5 h-5 border-2 border-muted-foreground text-primary rounded focus:ring-primary/50 focus:ring-offset-0 bg-transparent cursor-pointer transition-all checked:border-primary"
                                  />
                                )}
                              </td>
                            ) : (
                              <td className="p-4 w-16 text-center">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-sm mx-auto"
                                  style={{ backgroundColor: color }}
                                >
                                  {idx + 1}
                                </div>
                              </td>
                            )}

                            {/* Option Text with Count */}
                            <td className="p-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center z-10 relative">
                                  <label
                                    className={`cursor-pointer flex-1 font-medium ${
                                      isSelected ? "text-primary" : "text-foreground"
                                    }`}
                                    onClick={() => {
                                      if (!canVote) return;
                                      if (voteInfo.multipleOptions === 1) setMySinglePick(idx);
                                      else handleMultiPickChange(idx, !myMultiPick.includes(idx));
                                    }}
                                  >
                                    {option}
                                  </label>
                                  <div className="text-right font-mono text-xs">
                                    <span className="text-foreground font-semibold">{count}명</span>
                                    <span className="text-muted-foreground ml-2">({percent}%)</span>
                                  </div>
                                </div>

                                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out relative"
                                    style={{ width: `${percent}%`, backgroundColor: color }}
                                  >
                                    <div className="absolute inset-0 bg-white/20" />
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    <tfoot>
                      <tr className="bg-white/5">
                        <td colSpan={2} className="p-4">
                          <div className="flex justify-between items-center">
                            {canVote ? (
                              <Button
                                size="lg"
                                onClick={handleSubmitVote}
                                disabled={voteMutation.isPending}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                              >
                                {voteMutation.isPending ? "처리중..." : "투표하기"}
                              </Button>
                            ) : (
                              <span className="text-muted-foreground font-medium px-2">
                                투표 완료 / 마감
                              </span>
                            )}

                            <div className="text-sm font-mono bg-black/40 px-3 py-1.5 rounded-full border border-white/10 text-muted-foreground">
                              투표율: <span className="text-foreground font-bold">{voteTotal}</span>{" "}
                              / {userCnt}
                              <span className="ml-2 text-primary">
                                ({((voteTotal / Math.max(1, userCnt)) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold text-foreground/90 px-2">댓글</h3>
                <div className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
                  <form onSubmit={handleSubmitComment}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/5 text-muted-foreground border-b border-white/10">
                          <th className="p-3 w-12 text-center">#</th>
                          <th className="p-3 w-28 lg:w-48 text-left">작성자</th>
                          <th className="p-3 text-left">내용</th>
                          <th className="p-3 w-24 text-center">일시</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {comments.map((comment, idx) => (
                          <tr key={comment.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-3 text-center font-mono text-muted-foreground text-xs">
                              {idx + 1}
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col text-xs">
                                <span className="text-muted-foreground">{comment.nationName}</span>
                                <span className="text-primary/90 font-medium group-hover:text-primary transition-colors">
                                  {comment.generalName}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-foreground/90">{comment.text}</td>
                            <td className="p-3 text-center font-mono text-xs text-muted-foreground">
                              {comment.date?.substring(5, 16) ?? "-"}
                            </td>
                          </tr>
                        ))}
                        {comments.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-muted-foreground">
                              등록된 댓글이 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        {selectedGeneralId && (
                          <tr className="bg-white/5 border-t border-white/10">
                            <td colSpan={4} className="p-4">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                  value={myComment}
                                  onChange={(e) => setMyComment(e.target.value)}
                                  placeholder="댓글을 입력하세요..."
                                />
                                <Button
                                  type="submit"
                                  disabled={addCommentMutation.isPending}
                                  variant="outline"
                                  className="border-white/10 hover:bg-white/10 hover:text-primary"
                                >
                                  등록
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tfoot>
                    </table>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* No vote selected */}
          {!voteInfo && voteList.size === 0 && (
            <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                <span className="text-2xl opacity-50">?</span>
              </div>
              등록된 설문 조사가 없습니다.
            </div>
          )}
        </div>

        {/* Previous Votes List */}
        {voteList.size > 0 && (
          <div className="mt-8 bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-zinc-900/90 to-zinc-800/90 p-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-center text-foreground/90">이전 설문 조사</h2>
            </div>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
              {Array.from(voteList.entries()).map(([voteId, info]) => (
                <div
                  key={voteId}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-white/5 flex justify-between items-center group ${
                    currentVoteId === voteId
                      ? "bg-primary/10 border-l-2 border-primary"
                      : "border-l-2 border-transparent"
                  }`}
                  onClick={() => setCurrentVoteId(voteId)}
                >
                  <div className="flex-1">
                    <div
                      className={`font-medium group-hover:text-primary transition-colors ${
                        currentVoteId === voteId ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {info.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {info.startDate?.slice(0, 10)}
                    </div>
                  </div>
                  {info.endDate && (
                    <span className="text-xs font-mono px-2 py-1 rounded bg-black/40 text-muted-foreground border border-white/5">
                      종료됨
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Vote Panel (Admin) */}
        {isVoteAdmin && (
          <div className="mt-8 bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden p-6">
            <div
              className="text-primary font-bold cursor-pointer hover:text-primary/80 transition-colors flex items-center gap-2 mb-4"
              onClick={() => setShowNewVote(!showNewVote)}
            >
              <span>{showNewVote ? "▼" : "▶"}</span>새 설문 조사 열기
            </div>

            {showNewVote && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-3 text-sm font-medium text-muted-foreground">
                    설문 제목
                  </div>
                  <div className="md:col-span-9">
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={newVoteTitle}
                      onChange={(e) => setNewVoteTitle(e.target.value)}
                      placeholder="설문 제목을 입력하세요"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  <div className="md:col-span-3 text-sm font-medium text-muted-foreground">
                    설문 옵션
                    <p className="text-xs text-muted-foreground/60 mt-1">(줄바꿈으로 구분)</p>
                  </div>
                  <div className="md:col-span-9">
                    <textarea
                      className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px]"
                      rows={5}
                      value={newVoteOptions}
                      onChange={(e) => setNewVoteOptions(e.target.value)}
                      placeholder="옵션 1&#10;옵션 2&#10;옵션 3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-3 text-sm font-medium text-muted-foreground">
                    동시 응답 수 <span className="text-xs opacity-70">(0=모두)</span>
                  </div>
                  <div className="md:col-span-9">
                    <input
                      type="number"
                      className="w-24 px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      value={newVoteMultiple}
                      min={0}
                      onChange={(e) => setNewVoteMultiple(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                  <Button
                    onClick={handleSubmitNewVote}
                    disabled={createVoteMutation.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    설문 생성
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
