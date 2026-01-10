"use client";

import React from "react";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ConnectedUsers: React.FC = () => {
  const { data: users, isLoading } = trpc.getConnectedGenerals.useQuery({ seconds: 600 });

  if (isLoading) return <div className="text-sm text-muted-foreground">로딩 중...</div>;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">실시간 접속자 ({users?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {users?.map(
            (user: {
              no: number;
              name: string;
              nation: { name: string; color: string } | null;
            }) => (
              <Badge
                key={user.no}
                variant="outline"
                className="px-2 py-1 flex items-center gap-1.5"
              >
                <span
                  className="w-2 h-2 rounded-full bg-green-500"
                  style={user.nation?.color ? { backgroundColor: user.nation.color } : {}}
                />
                {user.name}
                <span className="text-[10px] text-muted-foreground">
                  ({user.nation?.name || "무소속"})
                </span>
              </Badge>
            )
          )}
          {(!users || users.length === 0) && (
            <div className="text-xs text-muted-foreground py-2">접속 중인 장수가 없습니다.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
