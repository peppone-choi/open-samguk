"use client";

/**
 * PageBoard - 게시판 (회의실/기밀실)
 * Ported from legacy/hwe/ts/PageBoard.vue
 *
 * Features:
 * - New article form (제목/내용)
 * - Article list with author info and icons
 * - Comment system under each article
 * - Two board types: meeting (회의실), secret (기밀실)
 */

import React, { useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { TopBackBar } from "@/components/game";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useGeneral } from "@/contexts/GeneralContext";

// ============================================================================
// Types (matching backend response)
// ============================================================================

interface BoardComment {
  no: number;
  date: Date | string;
  author: string;
  text: string;
  generalId: number;
}

// Used for typing board list items from API
type BoardListItem = {
  no: number;
  date: Date | string;
  author: string;
  authorIcon: string | null;
  title: string;
  generalId: number;
  commentCount: number;
};

// Re-export to satisfy linter (unused but kept for documentation)
export type { BoardListItem };

// ============================================================================
// Utility Functions
// ============================================================================

function cutDateTime(dateTime: string | Date): string {
  // Extract "MM-DD HH:MM" from date
  const d = typeof dateTime === "string" ? dateTime : dateTime.toISOString();
  return d.slice(5, 16).replace("T", " ");
}

// ============================================================================
// BoardComment Component
// ============================================================================

interface BoardCommentProps {
  comment: BoardComment;
}

function BoardCommentItem({ comment }: BoardCommentProps) {
  return (
    <div className="grid grid-cols-[80px_1fr_80px] lg:grid-cols-[80px_1fr_100px] border-b border-gray-700 text-sm">
      {/* Author Name */}
      <div className="bg-zinc-700 p-1 text-center flex items-center justify-center">
        {comment.author}
      </div>

      {/* Comment Text */}
      <div className="p-2 whitespace-pre-wrap break-words">{comment.text}</div>

      {/* Date */}
      <div className="p-1 text-center text-xs text-gray-400 flex items-center justify-center font-mono">
        {cutDateTime(comment.date)}
      </div>
    </div>
  );
}

// ============================================================================
// BoardArticle Component
// ============================================================================

interface BoardArticleProps {
  boardNo: number;
  generalId: number;
  nationId: number;
  onCommentSubmit: () => void;
}

function BoardArticle({ boardNo, generalId, nationId, onCommentSubmit }: BoardArticleProps) {
  const [newCommentText, setNewCommentText] = useState("");

  // Fetch board detail with comments
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
      <div className="bg0 border border-gray-600 mb-2 p-4 text-center text-gray-400">
        로딩 중...
      </div>
    );
  }

  const article = boardDetailData.board;

  return (
    <div className="bg0 border border-gray-600 mb-2">
      {/* Article Header - Author, Title, Date */}
      <div className="bg1 grid grid-cols-[80px_1fr_80px] lg:grid-cols-[80px_1fr_100px]">
        {/* Author Name */}
        <div className="text-center p-1 font-semibold">{article.author}</div>

        {/* Title */}
        <div className="text-center p-1 font-semibold truncate">{article.title}</div>

        {/* Date */}
        <div className="text-center p-1 text-xs text-gray-300 font-mono">
          {cutDateTime(article.date)}
        </div>
      </div>

      {/* Article Body - Icon + Text */}
      <div className="grid grid-cols-[80px_1fr] lg:grid-cols-[80px_1fr] border-b border-gray-600">
        {/* Author Icon */}
        <div className="p-2 flex items-start justify-center">
          <img
            className="w-16 h-16 object-contain"
            src={article.authorIcon || "/d_pic/icons/default.png"}
            alt={article.author}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/d_pic/icons/default.png";
            }}
          />
        </div>

        {/* Article Text */}
        <div className="p-2 whitespace-pre-wrap break-words text-sm">{article.text}</div>
      </div>

      {/* Comments List */}
      {article.comments.length > 0 && (
        <div className="border-b border-gray-600">
          {article.comments.map((comment: BoardComment) => (
            <BoardCommentItem key={comment.no} comment={comment} />
          ))}
        </div>
      )}

      {/* New Comment Form */}
      <div className="grid grid-cols-[80px_1fr_60px] lg:grid-cols-[80px_1fr_80px]">
        {/* Label */}
        <div className="bg2 p-1 text-center text-sm flex items-center justify-center">
          댓글 달기
        </div>

        {/* Input */}
        <div className="p-1">
          <input
            type="text"
            className="w-full px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white text-sm"
            placeholder="새 댓글 내용"
            maxLength={250}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyUp={handleKeyUp}
            disabled={addCommentMutation.isPending}
          />
        </div>

        {/* Submit Button */}
        <div className="p-1">
          <Button
            size="sm"
            className="w-full h-full"
            onClick={handleSubmitComment}
            disabled={addCommentMutation.isPending}
          >
            {addCommentMutation.isPending ? "..." : "등록"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

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

  // Fetch board list
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

  // Create board mutation
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

    // Auto-resize textarea
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

      <div className="w-full max-w-[1000px] mx-auto border border-gray-600">
        {/* New Article Form */}
        <div className="bg0">
          <div className="bg2 text-center p-2 font-semibold">새 게시물 작성</div>

          {/* Title Row */}
          <div className="grid grid-cols-[80px_1fr] lg:grid-cols-[80px_1fr]">
            <div className="bg1 text-center p-2 flex items-center justify-center">제목</div>
            <div className="p-1">
              <input
                type="text"
                className="w-full px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white"
                placeholder="제목"
                maxLength={250}
                value={newArticle.title}
                onChange={(e) => setNewArticle((prev) => ({ ...prev, title: e.target.value }))}
                disabled={createBoardMutation.isPending}
              />
            </div>
          </div>

          {/* Content Row */}
          <div className="grid grid-cols-[80px_1fr] lg:grid-cols-[80px_1fr]">
            <div className="bg1 text-center p-2 flex items-start justify-center">내용</div>
            <div className="p-1">
              <textarea
                ref={textareaRef}
                className="w-full px-2 py-1 bg-zinc-700 border border-gray-600 rounded text-white min-h-[80px] resize-none"
                placeholder="내용"
                value={newArticle.text}
                onChange={handleTextareaInput}
                disabled={createBoardMutation.isPending}
              />
            </div>
          </div>

          {/* Submit Button Row */}
          <div className="grid grid-cols-[1fr_100px] lg:grid-cols-[1fr_120px] p-2">
            <div />
            <Button onClick={handleSubmitArticle} disabled={createBoardMutation.isPending}>
              {createBoardMutation.isPending ? "등록 중..." : "등록"}
            </Button>
          </div>
        </div>

        {/* Articles List */}
        <div className="p-2">
          {isLoading ? (
            <div className="text-center text-gray-400 py-8">로딩 중...</div>
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
            <div className="text-center text-gray-400 py-8">게시물이 없습니다.</div>
          )}
        </div>
      </div>
    </>
  );
}
