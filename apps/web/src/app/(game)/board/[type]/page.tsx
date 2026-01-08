"use client";

import React from "react";
import { useParams } from "next/navigation";

export default function BoardPage() {
  const params = useParams();
  const boardType = params.type;

  const boardNames: Record<string, string> = {
    meeting: "회의실",
    secret: "기밀실",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{boardNames[boardType as string] || "게시판"}</h1>
        <p className="text-muted-foreground mt-2">게시글을 작성하고 소통하세요</p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground text-center py-12">게시판 기능이 여기에 구현됩니다.</p>
      </div>
    </div>
  );
}
