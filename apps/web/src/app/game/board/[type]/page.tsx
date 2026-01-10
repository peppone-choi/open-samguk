"use client";

import React, { useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";

interface BoardComment {
  no: number;
  date: Date | string;
  author: string;
  text: string;
  generalId: number;
}

type BoardListItem = {
  no: number;
  date: Date | string;
  author: string;
  authorIcon: string | null;
  title: string;
  generalId: number;
  commentCount: number;
};

export type { BoardListItem };

function cutDateTime(dateTime: string | Date): string {
  const d = typeof dateTime === "string" ? dateTime : dateTime.toISOString();
  return d.slice(5, 16).replace("T", " ");
}

interface BoardCommentProps {
  comment: BoardComment;
}

function BoardCommentItem({ comment }: BoardCommentProps) {
  return (
    <div className="group flex flex-col sm:flex-row gap-2 sm:gap-4 p-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors text-sm">
      <div className="shrink-0 w-20">
        <div className="font-bold text-primary/90 truncate">{comment.author}</div>
        <div className="text-xs text-muted-foreground font-mono mt-0.5">
          {cutDateTime(comment.date)}
        </div>
      </div>

      <div className="grow whitespace-pre-wrap break-words text-foreground/90">{comment.text}</div>
    </div>
  );
}

interface BoardArticleProps {
  boardNo: number;
  generalId: number;
  nationId: number;
  onCommentSubmit: () => void;
}

function BoardArticle({ boardNo, generalId, nationId, onCommentSubmit }: BoardArticleProps) {
  const [newCommentText, setNewCommentText] = useState("");

  const { data: boardDetailData, isLoading } = trpc.getBoardDetail.useQuery(
    { boardId: boardNo },
    { enabled: !!boardNo }
  );

  const addCommentMutation = trpc.addBoardComment.useMutation({
    onSuccess: () => {
      setNewCommentText("");
      onCommentSubmit();
    },
    onError: (error) => {
      alert(`댓글 등록 실패: ${error.message}`);
    },
  });

  const handleSubmitComment = useCallback(async () => {
    const text = newCommentText.trim();
    if (!text) return;
    if (!generalId || !nationId) {
      alert("장수 정보가 없습니다.");
      return;
    }

    addCommentMutation.mutate({
      boardId: boardNo,
      generalId,
      nationId,
      text,
    });
  }, [boardNo, generalId, nationId, newCommentText, addCommentMutation]);

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSubmitComment();
      }
    },
    [handleSubmitComment]
  );

  if (isLoading || !boardDetailData?.board) {
    return (
      <div className="bg-card/30 backdrop-blur-sm border border-white/5 rounded-xl p-8 text-center text-muted-foreground animate-pulse">
        로딩 중...
      </div>
    );
  }

  const article = boardDetailData.board;

  return (
    <div className="group relative bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden mb-6 transition-all hover:border-primary/20 hover:shadow-primary/5">
      <div className="bg-gradient-to-r from-white/5 to-transparent border-b border-white/10 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="font-bold text-lg text-primary truncate min-w-0">{article.title}</div>
          </div>
          <div className="text-xs text-muted-foreground font-mono shrink-0 bg-black/20 px-2 py-1 rounded">
            {cutDateTime(article.date)}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex gap-5">
          <div className="shrink-0 flex flex-col items-center gap-2 w-20">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/40">
              <img
                className="w-full h-full object-cover"
                src={article.authorIcon || "/d_pic/icons/default.png"}
                alt={article.author}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/d_pic/icons/default.png";
                }}
              />
            </div>
            <div className="text-xs font-semibold text-center text-foreground/80 break-all">
              {article.author}
            </div>
          </div>

          <div className="grow min-w-0">
            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90 font-medium">
              {article.text}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black/20 border-t border-white/5">
        {article.comments.length > 0 && (
          <div className="border-b border-white/5">
            {article.comments.map((comment: BoardComment) => (
              <BoardCommentItem key={comment.no} comment={comment} />
            ))}
          </div>
        )}

        <div className="p-3 bg-black/10">
          <div className="flex gap-2">
            <input
              type="text"
              className="grow px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              placeholder="댓글을 입력하세요..."
              maxLength={250}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onKeyUp={handleKeyUp}
              disabled={addCommentMutation.isPending}
            />
            <Button
              size="sm"
              className="shrink-0 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
              onClick={handleSubmitComment}
              disabled={addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? "..." : "등록"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BoardPage() {
  const params = useParams();
  const boardType = params.type as string;
  const isSecretBoard = boardType === "secret";

  const { selectedGeneralId, selectedGeneral } = useGeneral();
  const generalId = selectedGeneralId ?? 0;
  const nationId = selectedGeneral?.nationId ?? 0;

  const [newArticle, setNewArticle] = useState({ title: "", text: "" });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const title = isSecretBoard ? "기밀실" : "회의실";
  const apiType = isSecretBoard ? "secret" : "nation";

  const {
    data: boardListData,
    isLoading,
    refetch,
  } = trpc.getBoardList.useQuery(
    {
      nationId,
      type: apiType as "public" | "nation" | "secret",
      limit: 50,
    },
    { enabled: !!nationId }
  );

  const createBoardMutation = trpc.createBoard.useMutation({
    onSuccess: () => {
      setNewArticle({ title: "", text: "" });
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      refetch();
    },
    onError: (error) => {
      alert(`게시글 등록 실패: ${error.message}`);
    },
  });

  const handleSubmitArticle = useCallback(async () => {
    const { title: articleTitle, text } = newArticle;
    if (!articleTitle.trim() && !text.trim()) {
      return;
    }
    if (!generalId || !nationId) {
      alert("장수 정보가 없습니다.");
      return;
    }

    createBoardMutation.mutate({
      nationId,
      generalId,
      title: articleTitle.trim() || "(제목 없음)",
      text: text.trim() || "(내용 없음)",
      type: apiType as "public" | "nation" | "secret",
    });
  }, [newArticle, generalId, nationId, apiType, createBoardMutation]);

  const handleTextareaInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewArticle((prev) => ({ ...prev, text: e.target.value }));

    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  const handleReload = useCallback(() => {
    refetch();
  }, [refetch]);

  const boards: BoardListItem[] = (boardListData?.boards ?? []) as BoardListItem[];

  return (
    <>
      <TopBackBar title={title} type="close" reloadable onReload={handleReload} />

      <div className="w-full max-w-[1000px] mx-auto p-4 space-y-8 pb-20">
        <div className="bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
            새 게시물 작성
          </h2>

          <div className="space-y-4 relative z-10">
            <input
              type="text"
              className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all shadow-inner"
              placeholder="제목을 입력하세요"
              maxLength={250}
              value={newArticle.title}
              onChange={(e) => setNewArticle((prev) => ({ ...prev, title: e.target.value }))}
              disabled={createBoardMutation.isPending}
            />

            <textarea
              ref={textareaRef}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground min-h-[100px] resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all shadow-inner"
              placeholder="내용을 입력하세요..."
              value={newArticle.text}
              onChange={handleTextareaInput}
              disabled={createBoardMutation.isPending}
            />

            <div className="flex justify-end">
              <Button
                onClick={handleSubmitArticle}
                disabled={createBoardMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all"
              >
                {createBoardMutation.isPending ? "등록 중..." : "게시글 등록"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
              <div className="w-10 h-10 border-2 border-primary/50 border-t-transparent rounded-full animate-spin" />
              <div className="text-muted-foreground text-sm font-mono">
                데이터를 불러오는 중입니다...
              </div>
            </div>
          ) : boards.length > 0 ? (
            boards.map((board: BoardListItem) => (
              <BoardArticle
                key={board.no}
                boardNo={board.no}
                generalId={generalId}
                nationId={nationId}
                onCommentSubmit={handleReload}
              />
            ))
          ) : (
            <div className="bg-card/30 backdrop-blur-sm border border-white/5 rounded-2xl p-12 text-center">
              <div className="text-muted-foreground mb-2 text-lg">게시물이 없습니다</div>
              <div className="text-sm text-muted-foreground/50">첫 번째 게시물을 작성해보세요.</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
