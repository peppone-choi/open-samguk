"use client";

import React, { useState } from "react";
import { Header } from "./Header";
import { Navigation } from "./Navigation";

interface GameLayoutProps {
  children: React.ReactNode;
  gameTime?: { year: number; month: number };
}

export function GameLayout({ children, gameTime }: GameLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header gameTime={gameTime} onMenuToggle={() => setIsNavOpen(!isNavOpen)} />
      <Navigation isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <main className="lg:pl-64">
        <div className="container max-w-screen-2xl p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
