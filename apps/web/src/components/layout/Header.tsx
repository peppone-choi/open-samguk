"use client";

import React from "react";
import { Menu } from "lucide-react";

interface HeaderProps {
  gameTime?: { year: number; month: number };
  onMenuToggle?: () => void;
}

export function Header({ gameTime, onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <button
          onClick={onMenuToggle}
          className="mr-4 p-2 rounded-md hover:bg-accent lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-primary m-0">삼국지 모의전투</h1>
        </div>

        <div className="flex-1" />

        {gameTime && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">현재:</span>
            <span className="font-semibold text-primary">
              {gameTime.year}년 {gameTime.month}월
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
