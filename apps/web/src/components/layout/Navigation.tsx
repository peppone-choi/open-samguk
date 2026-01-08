"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Building2,
  Swords,
  ScrollText,
  Crown,
  Gavel,
  Vote,
  Handshake,
  Gift,
  Bot,
  Flag,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "대시보드", href: "/game", icon: Home },
  { label: "장수 생성", href: "/game/join", icon: Users },
  { label: "장수 목록", href: "/game/nation/generals", icon: Crown },
  { label: "내무부", href: "/game/nation/finance", icon: Coins },
  { label: "사령부", href: "/game/chief", icon: Flag },
  { label: "부대 편성", href: "/game/troop", icon: Swords },
  { label: "외교", href: "/game/diplomacy", icon: Handshake },
  { label: "경매장", href: "/game/auction", icon: Gavel },
  { label: "투표", href: "/game/vote", icon: Vote },
  { label: "베팅", href: "/game/betting", icon: Gift },
  { label: "NPC 정책", href: "/game/npc-control", icon: Bot },
  { label: "유산 관리", href: "/game/inherit", icon: Gift },
  { label: "연감", href: "/game/history", icon: ScrollText },
  { label: "게시판", href: "/game/board/free", icon: Building2 },
];

interface NavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Navigation({ isOpen, onClose }: NavigationProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}

      <nav
        className={cn(
          "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-64 border-r border-border bg-background transition-transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
