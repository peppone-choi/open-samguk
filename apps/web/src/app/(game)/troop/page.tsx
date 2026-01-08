"use client";

import React, { useState } from "react";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CREW_TYPES: Record<number, string> = {
  0: "없음",
  1: "보병",
  2: "궁병",
  3: "기병",
  4: "근위병",
  5: "수군",
};

interface TroopMember {
  no: number;
  name: string;
  officerLevel: number;
  cityId: number;
  crew: number;
  crewType: number;
}

interface TroopInfo {
  id: number;
  name: string;
  nationId: number;
  leader: TroopMember | null;
  members: TroopMember[];
  memberCount: number;
}

export default function TroopPage() {
  const nationId = 1;
  const currentGeneralId = 1;

  const troopsQuery = trpc.getTroops.useQuery({ nationId });
  const createTroopMutation = trpc.createTroop.useMutation({
    onSuccess: () => {
      troopsQuery.refetch();
      setNewTroopName("");
    },
  });
  const joinTroopMutation = trpc.joinTroop.useMutation({
    onSuccess: () => troopsQuery.refetch(),
  });
  const exitTroopMutation = trpc.exitTroop.useMutation({
    onSuccess: () => troopsQuery.refetch(),
  });

  const [newTroopName, setNewTroopName] = useState("");
  const [expandedTroop, setExpandedTroop] = useState<number | null>(null);

  const troops = (troopsQuery.data || []) as TroopInfo[];
  const totalMembers = troops.reduce((sum, t) => sum + t.memberCount, 0);

  const handleCreateTroop = () => {
    if (!newTroopName.trim()) return;
    createTroopMutation.mutate({
      generalId: currentGeneralId,
      name: newTroopName.trim(),
    });
  };

  const handleJoinTroop = (troopLeaderId: number) => {
    if (confirm("이 부대에 가입하시겠습니까?")) {
      joinTroopMutation.mutate({
        generalId: currentGeneralId,
        troopLeaderId,
      });
    }
  };

  const handleExitTroop = () => {
    if (confirm("부대에서 탈퇴하시겠습니까?")) {
      exitTroopMutation.mutate({ generalId: currentGeneralId });
    }
  };

  if (troopsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">부대 편성</h1>
        <p className="text-muted-foreground mt-2">부대를 생성하고 장수를 배치합니다</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-primary">{troops.length}</div>
            <div className="text-xs text-muted-foreground">부대 수</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{totalMembers}</div>
            <div className="text-xs text-muted-foreground">총 편성 인원</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {troops.length > 0 ? Math.round((totalMembers / troops.length) * 10) / 10 : 0}
            </div>
            <div className="text-xs text-muted-foreground">평균 인원</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>부대 창설</CardTitle>
          <CardDescription>새로운 부대를 만들어 부대장이 됩니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="부대 이름"
              value={newTroopName}
              onChange={(e) => setNewTroopName(e.target.value)}
              maxLength={20}
            />
            <Button
              onClick={handleCreateTroop}
              disabled={!newTroopName.trim() || createTroopMutation.isPending}
            >
              {createTroopMutation.isPending ? "생성 중..." : "부대 창설"}
            </Button>
          </div>
          {createTroopMutation.error && (
            <p className="text-destructive text-sm mt-2">{createTroopMutation.error.message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>부대 목록</CardTitle>
          <CardDescription>세력 내 모든 부대</CardDescription>
        </CardHeader>
        <CardContent>
          {troops.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">편성된 부대가 없습니다</div>
          ) : (
            <div className="space-y-4">
              {troops.map((troop) => (
                <div key={troop.id} className="border rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedTroop(expandedTroop === troop.id ? null : troop.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">{troop.name}</div>
                        <div className="text-sm text-muted-foreground">
                          부대장: {troop.leader?.name || "없음"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{troop.memberCount}명</div>
                        <div className="text-xs text-muted-foreground">부대원</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinTroop(troop.id);
                        }}
                        disabled={joinTroopMutation.isPending}
                      >
                        가입
                      </Button>
                    </div>
                  </div>

                  {expandedTroop === troop.id && (
                    <div className="p-4 border-t">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2 font-medium text-muted-foreground">
                              이름
                            </th>
                            <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                              병력
                            </th>
                            <th className="text-center py-2 px-2 font-medium text-muted-foreground">
                              병종
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {troop.members.map((member) => (
                            <tr
                              key={member.no}
                              className="border-b last:border-0 hover:bg-muted/30"
                            >
                              <td className="py-2 px-2">
                                <Link
                                  href={`/general/${member.no}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {member.name}
                                  {member.no === troop.id && (
                                    <span className="ml-1 text-xs text-primary">(부대장)</span>
                                  )}
                                </Link>
                              </td>
                              <td className="text-center py-2 px-2">
                                {member.crew.toLocaleString()}
                              </td>
                              <td className="text-center py-2 px-2 text-muted-foreground">
                                {CREW_TYPES[member.crewType] || "없음"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>내 부대</CardTitle>
          <CardDescription>현재 소속된 부대</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="text-muted-foreground">
              부대 소속 정보는 장수 상세 페이지에서 확인하세요
            </div>
            <Button
              variant="outline"
              onClick={handleExitTroop}
              disabled={exitTroopMutation.isPending}
            >
              {exitTroopMutation.isPending ? "처리 중..." : "부대 탈퇴"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
